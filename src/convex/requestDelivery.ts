"use node";

import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { normalizeEgyptianPhone } from "./phone";

/** What the request page gets back: the stored lead plus the handoff result. */
type SubmitResult = {
  requestId: Id<"propertyRequests">;
  delivered: boolean;
  reason?: string;
};

/**
 * Hands a primary-sale request to the team's WhatsApp — server side.
 *
 * The customer only fills a form (name + their WhatsApp number + the
 * requirements they picked on the desk). This action composes the message and
 * delivers it to the number saved in the studio, so the customer never opens
 * WhatsApp and never has to confirm a send.
 *
 * Delivery needs a WhatsApp-capable sender. Twilio is wired here: set
 * TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER (the
 * WhatsApp-enabled sender) in the project's Keys tab. Without them the lead is
 * still stored and shown in the studio — it just has to be sent by hand.
 */

const deliveryValidator = v.union(
  v.literal("immediate"),
  v.literal("6m"),
  v.literal("12m"),
  v.literal("2y"),
  v.literal("3y"),
  v.literal("4y"),
);

const finishValidator = v.union(
  v.literal("core-shell"),
  v.literal("semi-finished"),
  v.literal("fully-finished"),
  v.literal("finished-furnished"),
);

const DELIVERY_LABELS: Record<string, string> = {
  immediate: "Immediate",
  "6m": "Within 6 months",
  "12m": "Within 12 months",
  "2y": "Within 2 years",
  "3y": "Within 3 years",
  "4y": "Within 4 years",
};

const FINISH_LABELS: Record<string, string> = {
  "core-shell": "Core & shell",
  "semi-finished": "Semi-finished",
  "fully-finished": "Fully finished",
  "finished-furnished": "Finished & furnished",
};

/** A repeat submit from the same number inside this window is not sent twice. */
const DOUBLE_SUBMIT_WINDOW_MS = 60_000;

/** The site's default WhatsApp line (0100 953 3599 in international digits).
 *  Used when the editor hasn't saved their own number in the studio yet. */
const DEFAULT_TEAM_WHATSAPP = "201009533599";

function capitalize(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

/** The message the team receives. Built server-side from validated values. */
function buildMessage(lead: {
  firstName: string;
  lastName: string;
  phone: string;
  area?: string;
  type?: string;
  bedrooms?: number;
  delivery?: string;
  developer?: string;
  finish?: string;
  keyword?: string;
}): string {
  const lines = [
    "🏠 New primary-sale request — Ask Real Estate",
    "",
    `Name: ${lead.firstName} ${lead.lastName}`,
    `Their WhatsApp: +${lead.phone}`,
    "",
    `Area: ${lead.area || "Any"}`,
    `Type: ${lead.type ? capitalize(lead.type) : "Any"}`,
    `Bedrooms: ${lead.bedrooms ? `${lead.bedrooms}+` : "Any"}`,
    `Delivery: ${lead.delivery ? (DELIVERY_LABELS[lead.delivery] ?? lead.delivery) : "Any"}`,
    `Developer: ${lead.developer || "Any"}`,
    `Finish: ${lead.finish ? (FINISH_LABELS[lead.finish] ?? lead.finish) : "Any"}`,
  ];
  if (lead.keyword) lines.push(`Keyword: ${lead.keyword}`);
  lines.push("", "Reply to them on WhatsApp with matching options and prices.");
  return lines.join("\n");
}

/** Pull Twilio's own explanation out of an error response, when there is one. */
function twilioError(body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string };
    if (parsed?.message) return parsed.message;
  } catch {
    // not JSON — fall through to the raw text
  }
  return body.slice(0, 200) || "Twilio rejected the message.";
}

export const submitRequest = action({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    area: v.optional(v.string()),
    type: v.optional(v.string()),
    bedrooms: v.optional(v.number()),
    delivery: v.optional(deliveryValidator),
    developer: v.optional(v.string()),
    finish: v.optional(finishValidator),
    keyword: v.optional(v.string()),
  },
  returns: v.object({
    requestId: v.id("propertyRequests"),
    delivered: v.boolean(),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<SubmitResult> => {
    const firstName = args.firstName.trim();
    const lastName = args.lastName.trim();
    if (!firstName || !lastName) {
      throw new Error("Please enter your first and last name.");
    }
    if (firstName.length > 60 || lastName.length > 60) {
      throw new Error("That name looks too long — please shorten it.");
    }

    const phone = normalizeEgyptianPhone(args.phone);
    if (!phone) {
      throw new Error(
        "That WhatsApp number doesn't look right — try 01012345678 or +201012345678.",
      );
    }

    const lead = {
      firstName,
      lastName,
      phone,
      area: args.area?.trim() || undefined,
      type: args.type?.trim() || undefined,
      bedrooms: args.bedrooms || undefined,
      delivery: args.delivery,
      developer: args.developer?.trim() || undefined,
      finish: args.finish,
      keyword: args.keyword?.trim() || undefined,
    };

    // Double submits (impatient taps, or back-and-resubmit) reuse the lead that
    // already went out instead of messaging the team twice.
    const previous: { id: Id<"propertyRequests">; creationTime: number } | null =
      await ctx.runQuery(internal.requests.newestForPhone, { phone });
    if (
      previous &&
      Date.now() - previous.creationTime < DOUBLE_SUBMIT_WINDOW_MS
    ) {
      return {
        requestId: previous.id,
        delivered: true,
        reason: "duplicate",
      };
    }

    const message = buildMessage(lead);
    const requestId: Id<"propertyRequests"> = await ctx.runMutation(
      internal.requests.create,
      { ...lead, message },
    );

    const finishFailed = async (reason: string): Promise<SubmitResult> => {
      await ctx.runMutation(internal.requests.markDelivery, {
        id: requestId,
        status: "failed",
        error: reason.slice(0, 300),
      });
      return { requestId, delivered: false, reason };
    };

    const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const token = process.env.TWILIO_AUTH_TOKEN?.trim();
    const sender = process.env.TWILIO_PHONE_NUMBER?.trim();
    if (!sid || !token || !sender) {
      return await finishFailed(
        "WhatsApp sending isn't connected yet — add the Twilio keys in the Keys tab.",
      );
    }

    // The recipient is the WhatsApp number the site editor connected in the
    // studio's "Connected socials" card. Until they save one, fall back to the
    // site's default line so requests still reach the team.
    const settings = await ctx.runQuery(api.siteSettings.getPublic);
    const teamNumber =
      (settings.whatsappNumber &&
        normalizeEgyptianPhone(settings.whatsappNumber)) ||
      normalizeEgyptianPhone(DEFAULT_TEAM_WHATSAPP);
    if (!teamNumber) {
      return await finishFailed(
        "No team WhatsApp number is saved in the studio yet.",
      );
    }

    const senderDigits = sender.replace(/^whatsapp:/i, "").replace(/\D/g, "");
    if (!senderDigits) {
      return await finishFailed("The configured WhatsApp sender looks invalid.");
    }

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: `whatsapp:+${senderDigits}`,
            To: `whatsapp:+${teamNumber}`,
            Body: message,
          }).toString(),
        },
      );

      if (!response.ok) {
        throw new Error(twilioError(await response.text()));
      }

      await ctx.runMutation(internal.requests.markDelivery, {
        id: requestId,
        status: "sent",
      });
      return { requestId, delivered: true };
    } catch (error) {
      return await finishFailed(
        error instanceof Error ? error.message : "WhatsApp delivery failed.",
      );
    }
  },
});
