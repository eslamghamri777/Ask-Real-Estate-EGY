import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      phone: v.optional(v.string()), // contact phone, collected at sign-up

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // add other tables here

    inquiries: defineTable({
      listingId: v.id("listings"),
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      message: v.string(),
    }).index("by_listing", ["listingId"]),

    /** Singleton site configuration (social links, WhatsApp). */
    siteSettings: defineTable({
      facebookUrl: v.optional(v.string()),
      instagramUrl: v.optional(v.string()),
      whatsappNumber: v.optional(v.string()),
    }),

    listings: defineTable({
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      /** "primary" = direct from developer, "resale" = existing owner, "rent" */
      purpose: v.union(
        v.literal("primary"),
        v.literal("resale"),
        v.literal("rent"),
      ),
      /** apartment | villa | penthouse | duplex | studio | townhouse */
      type: v.string(),
      area: v.string(),
      /** price in EGP — per month when purpose is "rent" */
      price: v.number(),
      bedrooms: v.number(),
      bathrooms: v.number(),
      areaSqm: v.number(),
      /** legacy/deprecated — new uploads go to storage; kept for old seeds */
      photos: v.array(v.string()),
      /** Convex storage IDs for creator uploads; resolved to URLs for the public site */
      photoIds: v.optional(v.array(v.id("_storage"))),
      amenities: v.array(v.string()),
      featured: v.optional(v.boolean()),
    })
      .index("by_slug", ["slug"])
      .index("by_purpose", ["purpose"])
      .index("by_area", ["area"])
      .index("by_featured", ["featured"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
