/**
 * Shared catalog filter options.
 *
 * Extracted so the Listings filter panel and the header search dialog can
 * offer the exact same set of choices without duplicating the lists.
 */

/** Property types offered in the filter. */
export const TYPES = [
  "apartment",
  "villa",
  "chalet",
  "penthouse",
  "duplex",
  "studio",
  "townhouse",
];

/**
 * The destinations we cover — the only areas offered in the filter. Off-plan
 * (primary-sale) destinations are offered even before a unit is listed: a
 * destination with no listing yet shows without a count and routes primary
 * searches to the request desk.
 */
export const AREAS = [
  "New Cairo",
  "Ain Sokhna",
  "North Coast",
  "6th October",
  "New Heliopolis",
  "The New Capital",
  "Mostakbal City",
];

/** Primary-sale developers the desk can forward a request to. */
export const PRIMARY_DEVELOPERS = [
  "Mountain View",
  "Palm Hills Developments",
  "SODIC",
  "Emaar Misr",
  "La Vista Developments",
  "Madinet Masr",
  "City Edge Developments",
  "Tatweer Misr",
  "Lake View",
  "ORA Developers",
  "Saada",
  "PRE Developments",
  "Modon Developments",
  "Hassan Allam Properties",
  "Katameya",
  "Nouvara",
  "Garana",
  "Marakez",
  "The Waterway Developments",
  "Azad (Tameer)",
  "Il Cazar",
  "Mayan",
  "Sky AD Developments",
  "Al Ahly Sabbour",
  "Landmark (LMD)",
];

export const DELIVERY_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
  { value: "2y", label: "2 years" },
  { value: "3y", label: "3 years" },
  { value: "4y", label: "4 years" },
] as const;

export const FINISH_OPTIONS = [
  { value: "core-shell", label: "Core & Shell / Unfinished" },
  { value: "semi-finished", label: "Semi-Finished" },
  { value: "fully-finished", label: "Fully Finished" },
  { value: "finished-furnished", label: "Finished-Furnished" },
] as const;

/**
 * The purpose toggle on /listings: Primary Sale, Resale and Rent — Primary
 * Sale is the default when the URL carries no purpose. Mirrors the Convex
 * listings.purpose union.
 */
export type Purpose = "primary" | "resale" | "rent";

/** "Emaar Misr" → "emaar-misr" — the URL form for /developer/{slug} pages. */
export function developerSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Reverse lookup: slug → developer name, or "" when no developer matches. */
export function developerFromSlug(slug: string): string {
  return PRIMARY_DEVELOPERS.find((d) => developerSlug(d) === slug) ?? "";
}
