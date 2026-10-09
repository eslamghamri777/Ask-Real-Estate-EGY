/**
 * Targeted verification for the Garana removal from the developers list.
 * Renders the real components via react-dom/server.
 */
import { describe, expect, it } from "bun:test";
import { readFileSync, existsSync } from "fs";
import { renderToStaticMarkup } from "react-dom/server";
import {
  developerPhoto,
  hasDeveloperPhoto,
  needsImpressionLabel,
} from "@/lib/developerPhotos";
import { developerBrand } from "@/lib/developerBrand";
import { PRIMARY_DEVELOPERS } from "@/lib/filters";
import { DeveloperLogo } from "@/components/DeveloperLogo";
import { DeveloperScene } from "@/components/DeveloperScene";

const html = (el: React.ReactElement) => renderToStaticMarkup(el);

describe("Garana removal from the developers list", () => {
  it("Garana is gone from the filter dropdown", () => {
    expect(PRIMARY_DEVELOPERS).not.toContain("Garana");
    expect(PRIMARY_DEVELOPERS).toContain("Kattameya");
    expect(PRIMARY_DEVELOPERS).toContain("Nouvara");
    expect(PRIMARY_DEVELOPERS).toContain("Hassan Allam Properties");
  });

  it("developerBrand no longer knows Garana", () => {
    expect(developerBrand("Garana")).toBeUndefined();
    expect(developerBrand("Nouvara")).toBeTruthy();
    expect(developerBrand("Kattameya").initials).toBe("KA");
  });

  it("Garana keeps a generated artwork page instead of a configured photo", () => {
    // No thumbnail was dropped for Garana, so its page must still render the
    // generated artwork scene rather than a broken image frame.
    const markup = html(<DeveloperScene name="Garana" badge className="h-64" />);
    expect(markup).not.toContain("<img");
    expect(markup).toContain("Artist&#x27;s impression");
  });

  it("the monogram tile falls back to generated artwork for Garana", () => {
    const mark = html(<DeveloperLogo name="Garana" />);
    expect(mark).toContain('aria-label="Garana mark"');
    expect(mark).not.toContain("<img");
  });
});
