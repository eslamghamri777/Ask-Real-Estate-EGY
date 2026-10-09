/**
 * Real imagery per developer, keyed by developer name.
 *
 * Files live in `public/developers/` and are referenced by URL, so adding a
 * picture is a two-line change: drop the file in, add the developer here.
 * Anything not listed keeps the generated artwork from DeveloperScene, and a
 * listed image that fails to load falls back to that artwork too — a missing
 * file can never leave a broken frame on the page.
 *
 * `kind` matters for honesty: a photograph is published as the project's own
 * picture, while a rendering (CGI or AI-generated) keeps the
 * "Artist's impression" label so nobody mistakes it for a photograph of a real
 * building. Only list images we may publish.
 *
 * Currently the pool covers Mountain View, Palm Hills, SODIC, Emaar Misr,
 * La Vista Developments, Madinet Masr, City Edge Developments, Tatweer
 * Misr, Lake View, ORA Developers, Saada, PRE Developments, Modon
 * Developments, Hassan Allam Properties, Kattameya and Nouvara; the rest of
 * the developers still use the generated
 * artwork until their media lands here. The moment a configured file is
 * missing from `public/developers/` the generated artwork covers the frame
 * and the hero falls back automatically — a missing file can never leave a
 * broken frame.
 */

export type DeveloperPhoto = {
  url: string;
  kind: "photograph" | "rendering";
  /** Optional mark image; it replaces the generated monogram tile. */
  logoUrl?: string;
};

const PHOTOS: Record<string, DeveloperPhoto> = {
  "Mountain View": {
    url: "/developers/mountain-view.jpg",
    kind: "rendering",
    logoUrl: "/developers/mountain-view-logo.jpg",
  },
  "Palm Hills Developments": {
    url: "/developers/palm-hills.jpg",
    kind: "rendering",
    logoUrl: "/developers/palm-hills-logo.jpg",
  },
  SODIC: {
    url: "/developers/sodic.jpg",
    kind: "rendering",
    logoUrl: "/developers/sodic-logo.jpg",
  },
  "Emaar Misr": {
    url: "/developers/emaar-misr.jpg",
    kind: "rendering",
    logoUrl: "/developers/emaar-misr-logo.jpg",
  },
  "La Vista Developments": {
    url: "/developers/la-vista.jpg",
    kind: "rendering",
    logoUrl: "/developers/la-vista-logo.webp",
  },
  "Madinet Masr": {
    url: "/developers/madinet-masr.webp",
    kind: "rendering",
    logoUrl: "/developers/madinet-masr-logo.jpg",
  },
  "City Edge Developments": {
    url: "/developers/city-edge.webp",
    kind: "rendering",
    logoUrl: "/developers/city-edge-logo.jpg",
  },
  "Tatweer Misr": {
    url: "/developers/tatweer-misr.jpg",
    kind: "rendering",
    logoUrl: "/developers/tatweer-misr-logo.jpg",
  },
  "Lake View": {
    url: "/developers/lake-view.jpg",
    kind: "rendering",
    logoUrl: "/developers/lake-view-logo.jpg",
  },
  "ORA Developers": {
    url: "/developers/ora.jpg",
    kind: "rendering",
    logoUrl: "/developers/ora-logo.jpg",
  },
  Saada: {
    url: "/developers/saada.jpg",
    kind: "rendering",
    logoUrl: "/developers/saada-logo.webp",
  },
  "PRE Developments": {
    url: "/developers/pre.webp",
    kind: "rendering",
    logoUrl: "/developers/pre-logo.png",
  },
  "Modon Developments": {
    url: "/developers/modon.jpg",
    kind: "rendering",
    logoUrl: "/developers/modon-logo.webp",
  },
  "Hassan Allam Properties": {
    url: "/developers/hassan-allam.jpg",
    kind: "rendering",
    logoUrl: "/developers/hassan-allam-logo.png",
  },
  Kattameya: {
    url: "/developers/kattameya.jpg",
    kind: "rendering",
    logoUrl: "/developers/kattameya-logo.webp",
  },
  Nouvara: {
    url: "/developers/nouvara.avif",
    kind: "rendering",
    logoUrl: "/developers/nouvara-logo.webp",
  },
};

/** The image for a developer, or null when we only have generated artwork. */
export function developerPhoto(name: string): DeveloperPhoto | null {
  return PHOTOS[name] ?? null;
}

/** Whether an image is configured (before any load failure). */
export function hasDeveloperPhoto(name: string): boolean {
  return Boolean(PHOTOS[name]);
}

/**
 * Whether a picture still needs the "Artist's impression" label. Only a real
 * photograph, actually on screen, speaks for itself — artwork and renderings
 * (and an image that failed to load, leaving artwork in its place) stay
 * labelled.
 */
export function needsImpressionLabel(
  photo: DeveloperPhoto | null,
  showingImage: boolean,
): boolean {
  return !(showingImage && photo?.kind === "photograph");
}
