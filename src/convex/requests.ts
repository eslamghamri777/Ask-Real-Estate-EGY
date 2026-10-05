import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { requireCreator } from "./creator";

/**
 * Primary-sale requests — the request desk's leads.
 *
 * The customer sets their requirements on /listings, then hands over a first
 * name, last name and WhatsApp number on /request. `create` stores the lead and
 * the `submitRequest` action (requestDelivery.ts) pushes the compiled text to
 * the team's WhatsApp, so the customer never opens WhatsApp themselves.
 */

const deliveryValidator = v.optional(
  v.union(
    v.literal("immediate"),
    v.literal("6m"),
    v.literal("12m"),
    v.literal("2y"),
    v.literal("3y"),
    v.literal("4y"),
  ),
);

const finishValidator = v.optional(
  v.union(
    v.literal("core-shell"),
    v.literal("semi-finished"),
    v.literal("fully-finished"),
    v.literal("finished-furnished"),
  ),
);

/** Store a lead. Starts as "pending" — the send decides sent/failed. */
export const create = internalMutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    area: v.optional(v.string()),
    type: v.optional(v.string()),
    bedrooms: v.optional(v.number()),
    delivery: deliveryValidator,
    developer: v.optional(v.string()),
    finish: finishValidator,
    keyword: v.optional(v.string()),
    message: v.string(),
  },
  returns: v.id("propertyRequests"),
  handler: async (ctx, args) =>
    await ctx.db.insert("propertyRequests", {
      ...args,
      deliveryStatus: "pending",
    }),
});

/** Record the WhatsApp handoff outcome for a stored lead. */
export const markDelivery = internalMutation({
  args: {
    id: v.id("propertyRequests"),
    status: v.union(v.literal("sent"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      deliveryStatus: args.status,
      deliveryError: args.error,
    });
    return null;
  },
});

/** Newest lead for a number — used to swallow accidental double submits. */
export const newestForPhone = internalQuery({
  args: { phone: v.string() },
  returns: v.union(
    v.null(),
    v.object({ id: v.id("propertyRequests"), creationTime: v.number() }),
  ),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("propertyRequests")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .order("desc")
      .first();
    return row ? { id: row._id, creationTime: row._creationTime } : null;
  },
});

/**
 * Studio list — creator only. The team already receives each request on
 * WhatsApp; this is the record behind it, and the manual fallback if a send
 * ever fails.
 */
export const recent = query({
  args: {},
  handler: async (ctx) => {
    const creator = await requireCreator(ctx);
    if (!creator) return [];
    return await ctx.db.query("propertyRequests").order("desc").take(40);
  },
});
