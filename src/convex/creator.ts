import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { deliveryTimeValidator, finishValidator } from "./listings";

/**
 * Creator access.
 *
 * Creator rights (role "admin") are granted ONLY to the designated creator
 * email stored in the deployment's CREATOR_EMAIL environment variable
 * (Eslamghamri777@gmail.com). When that account signs in, ensureCreatorForEmail
 * promotes it automatically; every other email stays a regular customer —
 * they never see edit controls and the server rejects any edit attempts.
 */

/** Returns the user's id when they hold creator rights, otherwise null. */
export async function requireCreator(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  return user?.role === "admin" ? userId : null;
}

/** Whether the current user has creator rights. */
export const isCreator = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db.get(userId);
    return user?.role === "admin";
  },
});

/**
 * Grants creator rights automatically when the signed-in account is the
 * designated creator email (CREATOR_EMAIL env var). Called when /creator is
 * opened — signing in with the creator email + password is enough.
 */
export const ensureCreatorForEmail = mutation({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    if (!user) return false;
    if (user.role === "admin") return true;

    const expected = (process.env.CREATOR_EMAIL ?? "").trim().toLowerCase();
    if (!expected || !user.email) return false;
    if (user.email.trim().toLowerCase() !== expected) return false;

    await ctx.db.patch(userId, { role: "admin" });
    return true;
  },
});

/** Step 1 of an upload: mint a short-lived URL the browser POSTs the file to. */
export const generatePhotoUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const creator = await requireCreator(ctx);
    if (!creator) throw new Error("Creator access required.");
    return await ctx.storage.generateUploadUrl();
  },
});

const postFields = {
  title: v.string(),
  description: v.string(),
  purpose: v.union(v.literal("primary"), v.literal("resale"), v.literal("rent")),
  type: v.string(),
  area: v.string(),
  bedrooms: v.number(),
  bathrooms: v.number(),
  areaSqm: v.number(),
  amenities: v.array(v.string()),
  featured: v.boolean(),
  deliveryTime: v.optional(deliveryTimeValidator),
  finish: v.optional(finishValidator),
  photoIds: v.array(v.id("_storage")),
};

/** Publish a new property post. Prices stay internal (stored as 0, never shown). */
export const createPost = mutation({
  args: postFields,
  returns: v.id("listings"),
  handler: async (ctx, args) => {
    const creator = await requireCreator(ctx);
    if (!creator) throw new Error("Creator access required.");

    if (args.photoIds.length === 0) {
      throw new Error("Add at least one photo before publishing.");
    }
    if (args.title.trim().length < 4) {
      throw new Error("Please give the post a longer title.");
    }

    const slug = args.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (!slug) throw new Error("The title must produce a valid web link.");

    const existing = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) throw new Error("A post with a similar title already exists.");

    return await ctx.db.insert("listings", {
      ...args,
      title: args.title.trim(),
      description: args.description.trim(),
      area: args.area.trim(),
      type: args.type.trim().toLowerCase(),
      slug,
      photos: [], // legacy field — uploads live in storage via photoIds
      price: 0, // internal only — pricing is shared privately, never published
      deliveryTime: args.deliveryTime,
      finish: args.finish,
    });
  },
});

/**
 * Edit an existing post. `photoIds` is the full desired list of uploaded
 * photos — any storage file no longer referenced is deleted. The slug (web
 * address) never changes, so shared links keep working.
 */
export const editPost = mutation({
  args: {
    id: v.id("listings"),
    title: v.string(),
    description: v.string(),
    purpose: v.union(v.literal("primary"), v.literal("resale"), v.literal("rent")),
    type: v.string(),
    area: v.string(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    areaSqm: v.number(),
    amenities: v.array(v.string()),
    featured: v.boolean(),
    deliveryTime: v.optional(deliveryTimeValidator),
    finish: v.optional(finishValidator),
    photoIds: v.array(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const creator = await requireCreator(ctx);
    if (!creator) throw new Error("Creator access required.");

    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post not found.");

    if (args.photoIds.length === 0 && (post.photos?.length ?? 0) === 0) {
      throw new Error("Add at least one photo before saving.");
    }
    if (args.title.trim().length < 4) {
      throw new Error("Please give the post a longer title.");
    }

    // Delete storage files for photos the creator removed.
    const keep = new Set(args.photoIds.map((id) => id));
    for (const photoId of post.photoIds ?? []) {
      if (!keep.has(photoId)) {
        await ctx.storage.delete(photoId);
      }
    }

    await ctx.db.patch(args.id, {
      title: args.title.trim(),
      description: args.description.trim(),
      purpose: args.purpose,
      type: args.type.trim().toLowerCase(),
      area: args.area.trim(),
      bedrooms: args.bedrooms,
      bathrooms: args.bathrooms,
      areaSqm: args.areaSqm,
      amenities: args.amenities,
      featured: args.featured,
      deliveryTime: args.deliveryTime,
      finish: args.finish,
      photoIds: args.photoIds,
    });
    return null;
  },
});

/** Delete a post along with its uploaded photos and its inquiries. */
export const deletePost = mutation({
  args: { id: v.id("listings") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const creator = await requireCreator(ctx);
    if (!creator) throw new Error("Creator access required.");

    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post not found.");

    for (const photoId of post.photoIds ?? []) {
      await ctx.storage.delete(photoId);
    }

    const inquiries = await ctx.db
      .query("inquiries")
      .withIndex("by_listing", (q) => q.eq("listingId", args.id))
      .collect();
    for (const inquiry of inquiries) {
      await ctx.db.delete(inquiry._id);
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

/** Feature or unfeature a post (featured posts appear on the home page). */
export const setFeatured = mutation({
  args: { id: v.id("listings"), featured: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const creator = await requireCreator(ctx);
    if (!creator) throw new Error("Creator access required.");
    await ctx.db.patch(args.id, { featured: args.featured });
    return null;
  },
});

/** Creator-only overview of every published post. */
export const myPosts = query({
  args: {},
  handler: async (ctx) => {
    const creator = await requireCreator(ctx);
    if (!creator) return [];

    const posts = await ctx.db
      .query("listings")
      .withIndex("by_slug")
      .collect();
    posts.sort((a, b) => b._creationTime - a._creationTime);

    return await Promise.all(
      posts.map(async (post) => {
        const uploaded = post.photoIds?.length
          ? await Promise.all(
              post.photoIds.map(async (id) => ({
                storageId: id,
                url: await ctx.storage.getUrl(id),
              })),
            )
          : [];
        // Uploaded photos (with storage ids, editable); legacy seed posts
        // expose their URL photos as fixed entries.
        const photos =
          uploaded.length > 0
            ? uploaded.flatMap((p) =>
                p.url ? [{ storageId: p.storageId, url: p.url }] : [],
              )
            : post.photos.map((url) => ({ url }));

        return {
          _id: post._id,
          _creationTime: post._creationTime,
          slug: post.slug,
          title: post.title,
          description: post.description,
          purpose: post.purpose,
          type: post.type,
          area: post.area,
          bedrooms: post.bedrooms,
          bathrooms: post.bathrooms,
          areaSqm: post.areaSqm,
          amenities: post.amenities,
          featured: post.featured ?? false,
          deliveryTime: post.deliveryTime ?? null,
          finish: post.finish ?? null,
          photos,
          cover: photos[0]?.url ?? null,
        };
      }),
    );
  },
});
