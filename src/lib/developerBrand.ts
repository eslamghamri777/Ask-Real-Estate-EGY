/**
 * Per-developer brand marks.
 *
 * We can't ship the developers' real (trademarked) artwork, so every developer
 * gets a generated mark instead: a monogram on a branded gradient tile, with a
 * shared set of architectural motifs picked to suit that developer (Mountain
 * View peaks, Palm Hills palms, Lake View waves…).
 *
 * Keeping the map in one place means the Primary Sale dropdown, a developer's
 * own page and the "other developers" strip all render the same mark, and a
 * developer added to PRIMARY_DEVELOPERS still gets a sensible mark from the
 * fallback below.
 */

export type DeveloperMotif =
  | "peak"
  | "palm"
  | "wave"
  | "arch"
  | "tower"
  | "sun"
  | "leaf"
  | "diamond";

type BrandMark = {
  /** 1–3 letters shown on the tile. Every mark in this map is unique. */
  initials: string;
  /** Hue (0–360) for the tile gradient — spread so no two tiles look alike. */
  hue: number;
  motif: DeveloperMotif;
};

const BRANDS: Record<string, BrandMark> = {
  "Mountain View": { initials: "MV", hue: 150, motif: "peak" },
  "Palm Hills Developments": { initials: "PH", hue: 170, motif: "palm" },
  SODIC: { initials: "SO", hue: 218, motif: "tower" },
  "Emaar Misr": { initials: "EM", hue: 196, motif: "arch" },
  "La Vista Developments": { initials: "LAV", hue: 268, motif: "wave" },
  "Madinet Masr": { initials: "MM", hue: 22, motif: "sun" },
  "City Edge Developments": { initials: "CE", hue: 232, motif: "tower" },
  "Tatweer Misr": { initials: "TM", hue: 178, motif: "arch" },
  "Lake View": { initials: "LKV", hue: 188, motif: "wave" },
  "ORA Developers": { initials: "ORA", hue: 42, motif: "diamond" },
  Saada: { initials: "SA", hue: 96, motif: "leaf" },
  "PRE Developments": { initials: "PRE", hue: 244, motif: "peak" },
  "Modon Developments": { initials: "MD", hue: 206, motif: "tower" },
  "Hassan Allam Properties": { initials: "HA", hue: 158, motif: "arch" },
  Kattameya: { initials: "KA", hue: 292, motif: "leaf" },
  Nouvara: { initials: "NO", hue: 330, motif: "sun" },
  Garana: { initials: "GA", hue: 6, motif: "leaf" },
  Marakez: { initials: "MA", hue: 34, motif: "palm" },
  "The Waterway Developments": { initials: "WA", hue: 200, motif: "wave" },
  "Azad (Tameer)": { initials: "AZ", hue: 254, motif: "tower" },
  "Il Cazar": { initials: "IC", hue: 312, motif: "arch" },
  Mayan: { initials: "MY", hue: 122, motif: "wave" },
  "Sky AD Developments": { initials: "SKY", hue: 284, motif: "sun" },
  "Al Ahly Sabbour": { initials: "AAS", hue: 112, motif: "peak" },
  "Landmark (LMD)": { initials: "LMD", hue: 348, motif: "diamond" },
};

const MOTIFS: DeveloperMotif[] = [
  "peak",
  "arch",
  "tower",
  "leaf",
  "wave",
  "sun",
  "palm",
  "diamond",
];

/**
 * Stable per-developer seed — the same name always gets the same mark and the
 * same generated scene, so pages don't shuffle between renders.
 */
export function developerSeed(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) % 100000;
  }
  return h;
}

/** First letters of the significant words — "Al Ahly Sabbour" → "AAS". */
function initialsFor(name: string): string {
  const words = name
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !["Developments", "Development", "Properties", "For", "The"].includes(w));
  const letters = words.slice(0, 3).map((w) => w[0].toUpperCase());
  return letters.join("") || name.slice(0, 2).toUpperCase();
}

export type DeveloperBrand = BrandMark & { from: string; to: string };

/** The mark for a developer, including the tile gradient endpoints. */
export function developerBrand(name: string): DeveloperBrand {
  const seed = developerSeed(name);
  const mark: BrandMark = BRANDS[name] ?? {
    initials: initialsFor(name),
    hue: seed % 360,
    motif: MOTIFS[seed % MOTIFS.length],
  };

  return {
    ...mark,
    from: `hsl(${mark.hue} 62% 29%)`,
    to: `hsl(${mark.hue} 70% 46%)`,
  };
}
