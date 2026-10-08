# Developer photos

Drop a developer's project photography in this folder, then list it in
`src/lib/developerPhotos.ts` (one line per developer). The file name must match
that entry — anything in `public/` is served from the site root, so
`public/developers/mountain-view.jpg` is reachable at `/developers/mountain-view.jpg`.

```ts
// src/lib/developerPhotos.ts
const PHOTOS: Record<string, string> = {
  "Mountain View": "/developers/mountain-view.jpg",
};
```

Notes:

- JPG at roughly 1600px wide is plenty: the image is used as a hero banner and
  as a thumbnail, always cover-fitted.
- Only publish photos we have the right to use — developer-supplied renders or
  our own photography.
- A developer with no photo here keeps the generated artwork, and a photo that
  fails to load falls back to that artwork, so a missing file can never leave a
  broken frame on the page.
