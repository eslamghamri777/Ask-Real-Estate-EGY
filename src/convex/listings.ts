import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

/** Paginated browse with filters — the heart of v1. */
export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    purpose: v.optional(v.union(v.literal("sale"), v.literal("rent"))),
    area: v.optional(v.string()),
    type: v.optional(v.string()),
    bedrooms: v.optional(v.number()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
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
    if (args.minPrice) {
      results = results.filter((l) => l.price >= args.minPrice!);
    }
    if (args.maxPrice) {
      results = results.filter((l) => l.price <= args.maxPrice!);
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

    return { ...page, page: results };
  },
});

export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) =>
    await ctx.db.query("listings").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique(),
});

export const featured = query({
  args: {},
  handler: async (ctx) =>
    await ctx.db
      .query("listings")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .take(6),
});

export const areas = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("listings").collect();
    const counts = new Map<string, { count: number; photo: string }>();
    for (const l of all) {
      const entry = counts.get(l.area);
      if (entry) {
        entry.count += 1;
      } else {
        counts.set(l.area, { count: 1, photo: l.photos[0] ?? "" });
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
      forSale: all.filter((l) => l.purpose === "sale").length,
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
    return inArea.filter((l) => l.slug !== args.slug).slice(0, 3);
  },
});
