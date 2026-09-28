import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** A customer asks about a specific property. Always signed in — no anonymous spam. */
export const send = mutation({
  args: {
    listingId: v.id("listings"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Please sign in to send a message.");
    }

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("This property is no longer listed.");
    }

    const trimmed = args.message.trim();
    if (trimmed.length === 0) {
      throw new Error("Please write a short message before sending.");
    }
    if (trimmed.length > 2000) {
      throw new Error("Please keep your message under 2,000 characters.");
    }

    await ctx.db.insert("inquiries", {
      listingId: args.listingId,
      name: args.name.trim(),
      email: args.email.trim(),
      phone: args.phone?.trim() || undefined,
      message: trimmed,
    });
  },
});

/** Conversation thread for a listing (the inquiry trail shown on the detail page). */
export const forListing = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) =>
    await ctx.db
      .query("inquiries")
      .withIndex("by_listing", (q) => q.eq("listingId", args.listingId))
      .order("desc")
      .take(20),
});
