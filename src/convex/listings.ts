import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";

export const deliveryTimeValidator = v.optional(
  v.union(
    v.literal("immediate"),
    v.literal("6m"),
    v.literal("12m"),
    v.literal("2y"),
    v.literal("3y"),
    v.literal("4y"),
  ),
);

/**
 * Public shape of a listing sent to the client. Deliberately omits `price`:
 * pricing is shared privately when a customer messages the team — it is never
 * rendered on the site nor exposed through the API.
 *
 * Photos: creator uploads are stored in Convex storage (`photoIds`) and
 * resolved to URLs here; older seeded listings keep direct URLs in `photos`.
 */
async function publicListing(ctx: QueryCtx, l: Doc<"listings">) {
  const uploadedUrls = l.photoIds?.length
    ? (
        await Promise.all(
          l.photoIds.map((id) => ctx.storage.getUrl(id)),
        )
      ).filter((url): url is string => url !== null)
    : [];

  const photos = uploadedUrls.length > 0 ? uploadedUrls : l.photos;

  return {
    _id: l._id,
    _creationTime: l._creationTime,
    slug: l.slug,
    title: l.title,
    description: l.description,
    purpose: l.purpose,
    type: l.type,
    area: l.area,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    areaSqm: l.areaSqm,
    photos,
    amenities: l.amenities,
    featured: l.featured,
    deliveryTime: l.deliveryTime ?? null,
  };
}

/** Paginated browse with filters — the heart of the catalog. */
export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    purpose: v.optional(
      v.union(v.literal("primary"), v.literal("resale"), v.literal("rent")),
    ),
    area: v.optional(v.string()),
    type: v.optional(v.string()),
    bedrooms: v.optional(v.number()),
    delivery: deliveryTimeValidator,
    q: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const db = ctx.db.query("listings");
    const { purpose, area } = args;

    let page;
    if (purpose) {
      page = await db
        .withIndex("by_purpose", (q) => q.eq("purpose", purpose))
        .order("desc")
        .paginate(args.paginationOpts);
    } else if (area) {
      page = await db
        .withIndex("by_area", (q) => q.eq("area", area))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      page = await db.withIndex("by_slug").order("desc").paginate(args.paginationOpts);
    }

    let results = page.page;

    // post-filter the page in memory — fine for v1 dataset sizes
    if (args.area && args.purpose) {
      results = results.filter((l) => l.area === args.area);
    }
    if (args.type) {
      const t = args.type.toLowerCase();
      results = results.filter((l) => l.type.toLowerCase() === t);
    }
    if (args.bedrooms) {
      results = results.filter((l) => l.bedrooms >= args.bedrooms!);
    }
    if (args.delivery) {
      results = results.filter((l) => l.deliveryTime === args.delivery);
    }
    if (args.q) {
      const q = args.q.toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.area.toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q),
      );
    }

    const mapped = await Promise.all(results.map((l) => publicListing(ctx, l)));
    return { ...page, page: mapped };
  },
});

export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const listing = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return listing ? publicListing(ctx, listing) : null;
  },
});

export const featured = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("listings")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .take(6);
    return await Promise.all(rows.map((l) => publicListing(ctx, l)));
  },
});

export const areas = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("listings").collect();
    const counts = new Map<string, { count: number; photo: string }>();
    for (const l of all) {
      if (!counts.has(l.area)) {
        const cover = l.photoIds?.length
          ? await ctx.storage.getUrl(l.photoIds[0])
          : (l.photos[0] ?? "");
        counts.set(l.area, { count: 1, photo: cover ?? "" });
      } else {
        counts.get(l.area)!.count += 1;
      }
    }
    return Array.from(counts.entries())
      .map(([name, { count, photo }]) => ({ name, count, photo }))
      .sort((a, b) => b.count - a.count);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("listings").collect();
    return {
      total: all.length,
      forSale: all.filter((l) => l.purpose !== "rent").length,
      forRent: all.filter((l) => l.purpose === "rent").length,
    };
  },
});

export const related = query({
  args: { slug: v.string(), area: v.string() },
  handler: async (ctx, args) => {
    const inArea = await ctx.db
      .query("listings")
      .withIndex("by_area", (q) => q.eq("area", args.area))
      .collect();
    const picks = inArea.filter((l) => l.slug !== args.slug).slice(0, 3);
    return await Promise.all(picks.map((l) => publicListing(ctx, l)));
  },
});
