/**
 * Real project photography, keyed by developer name.
 *
 * Files live in `public/developers/` and are referenced by URL, so adding a
 * photo is a two-line change: drop `public/developers/<slug>.jpg` in and add
 * the developer here. Anything not listed keeps the generated artwork from
 * DeveloperScene, and a listed photo that fails to load falls back to that
 * artwork too — a missing file can never leave a broken image on the page.
 *
 * Only list photos we actually have the right to publish: developer-provided
 * renders or our own photography.
 */
const PHOTOS: Record<string, string> = {
  "Mountain View": "/developers/mountain-view.jpg",
};

/** The photo for a developer, or null when we only have generated artwork. */
export function developerPhoto(name: string): string | null {
  return PHOTOS[name] ?? null;
}

/** Whether a real photo is configured (before any load failure). */
export function hasDeveloperPhoto(name: string): boolean {
  return Boolean(PHOTOS[name]);
}
