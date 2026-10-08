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
 * A developer can carry several images; DeveloperScene then cycles between
 * them (or the page picks deterministically) instead of one static banner.
 */

export type DeveloperPhoto = {
  url: string;
  kind: "photograph" | "rendering";
};

/** Official Mountain View 1.1 marketing renders, served from their own site. */
const MOUNTAIN_VIEW: DeveloperPhoto[] = [
  { url: "/developers/mountain-view-1.webp", kind: "rendering" },
  { url: "/developers/mountain-view-2.webp", kind: "rendering" },
  { url: "/developers/mountain-view-3.webp", kind: "rendering" },
  { url: "/developers/mountain-view-4.webp", kind: "rendering" },
];

const PHOTOS: Record<string, DeveloperPhoto[]> = {
  "Mountain View": MOUNTAIN_VIEW,
};

/** Every image available for a developer (first is the default). */
export function developerPhotos(name: string): DeveloperPhoto[] {
  return PHOTOS[name] ?? [];
}

/** The default image for a developer, or null when we only have artwork. */
export function developerPhoto(name: string): DeveloperPhoto | null {
  return developerPhotos(name)[0] ?? null;
}

/** The nth image for a developer, wrapping to the first when out of range. */
export function developerPhotoAt(name: string, n: number): DeveloperPhoto | null {
  const set = developerPhotos(name);
  if (set.length === 0) return null;
  return set[((n % set.length) + set.length) % set.length];
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
