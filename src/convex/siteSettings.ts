import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCreator } from "./creator";

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
  if (parsed.username || parsed.password || parsed.pathname.match(/@/)) {
    throw new Error("Links containing credentials are not allowed.");
  }
  return `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/+$/, "")}`;
}

/** Keep digits only; Egyptian numbers stored in international form (20…). */
function normalizeWhatsAppNumber(number: string): string | undefined {
  const digits = number.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.length < 10 || digits.length > 15) {
    throw new Error("That phone number doesn't look right — include the country code.");
  }
  // 01xxxxxxxxx → 201xxxxxxxxx
  if (digits.length === 11 && digits.startsWith("01")) return `20${digits}`;
  return digits;
}

/** Public read — safe fields only; never throws. */
export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("siteSettings").first();
    return {
      facebookUrl: row?.facebookUrl ?? null,
      instagramUrl: row?.instagramUrl ?? null,
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
      whatsappNumber: row?.whatsappNumber ?? "",
    };
  },
});

/** Save social links. Empty values clear the link. */
export const saveSocials = mutation({
  args: {
    facebookUrl: v.string(),
    instagramUrl: v.string(),
    whatsappNumber: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const creator = await requireCreator(ctx);
    if (!creator) throw new Error("Creator access required.");

    const facebookUrl = normalizeProfileUrl(args.facebookUrl);
    const instagramUrl = normalizeProfileUrl(args.instagramUrl);
    const whatsappNumber = normalizeWhatsAppNumber(args.whatsappNumber);

    const row = await ctx.db.query("siteSettings").first();
    const patch = { facebookUrl, instagramUrl, whatsappNumber };
    if (row) {
      await ctx.db.patch(row._id, patch);
    } else {
      await ctx.db.insert("siteSettings", patch);
    }
    return null;
  },
});
