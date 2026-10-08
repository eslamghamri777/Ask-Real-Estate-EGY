import { developerBrand, type DeveloperMotif } from "@/lib/developerBrand";

/**
 * Which setting a developer's page artwork uses.
 *
 * Kept out of the component module so the artwork file exports components only
 * (React Fast Refresh stays intact) and the policy is testable on its own.
 */
export type SceneVariant =
  | "skyline"
  | "coast"
  | "oasis"
  | "peaks"
  /** Masterplan: white villas, blue roofs, lawns, walkway, water, flowers. */
  | "compound";

/** Default setting, inferred from the developer's mark. */
const VARIANT_BY_MOTIF: Record<DeveloperMotif, SceneVariant> = {
  peak: "peaks",
  palm: "oasis",
  wave: "coast",
  leaf: "oasis",
  sun: "skyline",
  arch: "skyline",
  tower: "skyline",
  diamond: "skyline",
};

/**
 * Per-developer overrides, for pages whose artwork should read as a specific
 * kind of project rather than whatever their mark's motif implies.
 */
const VARIANT_OVERRIDE: Record<string, SceneVariant> = {
  // Mountain View sells garden compounds, so their page shows a masterplan:
  // white villas with blue roofs, lawns, a walkway and water.
  "Mountain View": "compound",
};

/** The setting a developer's page uses (explicit prop → override → motif). */
export function developerSceneVariant(
  name: string,
  variant?: SceneVariant,
): SceneVariant {
  return (
    variant ??
    VARIANT_OVERRIDE[name] ??
    VARIANT_BY_MOTIF[developerBrand(name).motif]
  );
}
