import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

/**
 * Creator access.
 *
 * A signed-in user becomes a "creator" by redeeming the access code stored in
 * the deployment's CREATOR_ACCESS_CODE environment variable. Creators (role
 * "admin") can publish property posts with uploaded photos from /creator.
 * The code itself is never sent to the client — only a boolean "is it set".
 */

/** Returns the user's id when they hold creator rights, otherwise null. */
async function requireCreator(ctx: QueryCtx | MutationCtx): Promise<string | null> {
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

/** Whether a creator access code is configured (kept private from the client). */
export const hasAccessCode = query({
  args: {},
  returns: v.boolean(),
  handler: async () => Boolean(process.env.CREATOR_ACCESS_CODE),
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

/** Redeem the creator access code. Returns true when the code was correct. */
export const redeemAccessCode = mutation({
  args: { code: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in first, then enter the access code.");

    const expected = process.env.CREATOR_ACCESS_CODE;
    if (!expected) throw new Error("No access code is configured on the server.");

    if (args.code.trim() !== expected) return false;

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
  purpose: v.union(v.literal("sale"), v.literal("rent")),
  type: v.string(),
  area: v.string(),
  bedrooms: v.number(),
  bathrooms: v.number(),
  areaSqm: v.number(),
  amenities: v.array(v.string()),
  featured: v.boolean(),
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
    });
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
      .order("desc")
      .collect();

    return await Promise.all(
      posts.map(async (post) => ({
        _id: post._id,
        slug: post.slug,
        title: post.title,
        purpose: post.purpose,
        type: post.type,
        area: post.area,
        featured: post.featured ?? false,
        cover: post.photoIds?.length
          ? await ctx.storage.getUrl(post.photoIds[0])
          : (post.photos[0] ?? null),
      })),
    );
  },
});
