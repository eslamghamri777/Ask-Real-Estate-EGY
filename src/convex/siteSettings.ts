import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCreator } from "./creator";
import { normalizeEgyptianPhone } from "./phone";

/**
 * Site-wide settings singleton (social links). Editable only by the creator
 * account; readable by everyone so the footer and contact sections can show
 * the connected profiles.
 */

/** Keep only scheme + host of a pasted profile link, and require https. */
function normalizeProfileUrl(url: string): string | undefined {
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("That link doesn't look like a valid web address.");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only http(s) web links are supported.");
  }
  // Block user:pass@host links by inspecting the URL userinfo. Profile URLs
  // like tiktok.com/@YourPage have "@" in the *path* — that's not a
  // credential, so it must be allowed.
  if (parsed.username || parsed.password) {
    throw new Error("Links containing credentials are not allowed.");
  }
  return `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/+$/, "")}`;
}

/** Egyptian numbers are stored in international form (20…) — same rule the
 *  request desk applies to the customer's own WhatsApp number. */
function normalizeWhatsAppNumber(number: string): string | undefined {
  if (!number.trim()) return undefined;
  const normalized = normalizeEgyptianPhone(number);
  if (!normalized) {
    throw new Error("That phone number doesn't look right — include the country code.");
  }
  return normalized;
}

/** Public read — safe fields only; never throws. */
export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("siteSettings").first();
    return {
      facebookUrl: row?.facebookUrl ?? null,
      instagramUrl: row?.instagramUrl ?? null,
      tiktokUrl: row?.tiktokUrl ?? null,
      whatsappNumber: row?.whatsappNumber ?? null,
    };
  },
});

/** Creator-only read for the edit form. */
export const getForEdit = query({
  args: {},
  handler: async (ctx) => {
    const creator = await requireCreator(ctx);
    if (!creator) return null;
    const row = await ctx.db.query("siteSettings").first();
    return {
      facebookUrl: row?.facebookUrl ?? "",
      instagramUrl: row?.instagramUrl ?? "",
      tiktokUrl: row?.tiktokUrl ?? "",
      whatsappNumber: row?.whatsappNumber ?? "",
    };
  },
});

/** Save social links. Empty values clear the link. */
export const saveSocials = mutation({
  args: {
    facebookUrl: v.string(),
    instagramUrl: v.string(),
    tiktokUrl: v.string(),
    whatsappNumber: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const creator = await requireCreator(ctx);
    if (!creator) throw new Error("Creator access required.");

    const facebookUrl = normalizeProfileUrl(args.facebookUrl);
    const instagramUrl = normalizeProfileUrl(args.instagramUrl);
    const tiktokUrl = normalizeProfileUrl(args.tiktokUrl);
    const whatsappNumber = normalizeWhatsAppNumber(args.whatsappNumber);

    const row = await ctx.db.query("siteSettings").first();
    const patch = { facebookUrl, instagramUrl, tiktokUrl, whatsappNumber };
    if (row) {
      await ctx.db.patch(row._id, patch);
    } else {
      await ctx.db.insert("siteSettings", patch);
    }
    return null;
  },
});
