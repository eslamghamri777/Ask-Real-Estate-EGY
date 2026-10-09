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
 * Currently the pool has one image: Mountain View's marketing render of a
 * villa (supplied by the developer). The moment its file lands at
 * `public/developers/mountain-view.jpg` the page hero shows it; until then
 * the generated artwork covers the frame and the hero falls back
 * automatically — a missing file can never leave a broken frame.
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
