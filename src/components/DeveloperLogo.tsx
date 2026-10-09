import { useState, type ReactNode } from "react";

import { developerBrand, type DeveloperMotif } from "@/lib/developerBrand";
import { developerPhoto } from "@/lib/developerPhotos";
import { cn } from "@/lib/utils";

/**
 * The motif art drawn behind each developer's monogram. Everything is drawn on
 * a 24×24 grid and inherits `currentColor`, so one set of shapes paints every
 * tile, in any size.
 */
const MOTIFS: Record<DeveloperMotif, ReactNode> = {
  peak: <path d="M2 20 9 6l4 6.5 3.5-8L22 20Z" fill="currentColor" />,
  palm: (
    <g fill="currentColor">
      <rect x="11" y="10" width="2" height="11" rx="1" />
      <path d="M12 11C9.2 11 7.1 9.5 6.2 6.3c3 .4 5 1.8 5.8 4.7Z" />
      <path d="M12 11c2.8 0 4.9-1.5 5.8-4.7-3 .4-5 1.8-5.8 4.7Z" />
      <path d="M12 11.5c.2-2.9 1.5-5.1 3.9-6.8-.9 2.5-1 4.6-.4 6.8Z" />
      <path d="M12 11.5c-.2-2.9-1.5-5.1-3.9-6.8.9 2.5 1 4.6.4 6.8Z" />
    </g>
  ),
  wave: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 10c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0" />
      <path d="M1 17c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0" />
    </g>
  ),
  arch: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 21v-7.5a7 7 0 0 1 14 0V21" />
      <path d="M12 21v-6.5" />
      <path d="M2.5 21h19" />
    </g>
  ),
  tower: (
    <g fill="currentColor">
      <rect x="3.5" y="11" width="6.5" height="10" rx="1" />
      <rect x="12.5" y="4" width="7.5" height="17" rx="1" />
      <rect x="15" y="7" width="1.2" height="1.2" rx="0.4" fill="#fff" opacity="0.75" />
      <rect x="18" y="7" width="1.2" height="1.2" rx="0.4" fill="#fff" opacity="0.75" />
    </g>
  ),
  sun: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
      <path d="M12 2.4v2.4M12 19.2v2.4M2.4 12h2.4M19.2 12h2.4M5.1 5.1l1.7 1.7M17.2 17.2l1.7 1.7M18.9 5.1l-1.7 1.7M6.8 17.2l-1.7 1.7" />
    </g>
  ),
  leaf: (
    <g fill="currentColor">
      <path d="M20.5 3.5C10.6 3.5 3.8 8.4 3.8 15.3c0 2.8 1.9 5 4.9 5 8.4 0 11.8-8.1 11.8-16.8Z" />
      <path
        d="M6 20.5c1.4-4.4 4.1-8 8.3-10.6"
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </g>
  ),
  diamond: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" />
      <path d="M12 8.4 15.6 12 12 15.6 8.4 12Z" fill="currentColor" stroke="none" />
    </g>
  ),
};

const SIZES = {
  sm: "size-8 rounded-[0.6rem] text-[11px]",
  md: "size-10 rounded-[0.75rem] text-[13px]",
  lg: "size-14 rounded-2xl text-lg",
  xl: "size-20 rounded-[1.35rem] text-3xl",
} as const;

export type DeveloperLogoSize = keyof typeof SIZES;

/**
 * Logos are fitted with `object-contain` (never cover-cropped) inside a
 * neutral, brand-tinted backdrop, so the whole supplied artwork — wordmark,
 * tagline, symbol — always shows completely, however tightly or loosely the
 * source file is framed. Padding lives in the backdrop padding, not the
 * image, so the image itself can use the full tile bounds.
 */
const LOGO_IMAGE_FIT = "object-contain p-[9%]" as const;

/**
 * A developer's mark: monogram on a branded gradient tile, with its motif
 * faintly drawn behind. Sized from `sm` (menu rows) to `xl` (page heroes).
 */
export function DeveloperLogo({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: DeveloperLogoSize;
  className?: string;
}) {
  const brand = developerBrand(name);

  // A developer with a supplied mark shows the real logo image instead of the
  // generated monogram tile; if that image fails to load, the monogram returns
  // (the <img> swaps out on error, never a broken icon in its place).
  const logoUrl = developerPhoto(name)?.logoUrl;
  const [logoBroken, setLogoBroken] = useState(false);
  const showLogoImage = Boolean(logoUrl) && !logoBroken;

  if (showLogoImage) {
    return (
      <img
        src={logoUrl ?? undefined}
        alt={`${name} logo`}
        title={name}
        onError={() => setLogoBroken(true)}
        className={cn(
          "shrink-0 rounded-[1.35rem] bg-card ring-1 ring-black/10",
          LOGO_IMAGE_FIT,
          SIZES[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={`${name} mark`}
      title={name}
      className={cn(
        "clay-sheen relative inline-flex shrink-0 items-center justify-center overflow-hidden font-display text-white ring-1 ring-black/10",
        SIZES[size],
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${brand.from}, ${brand.to})`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute -right-[10%] -bottom-[24%] size-[105%] text-white/25"
      >
        {MOTIFS[brand.motif]}
      </svg>
      <span className="relative tracking-tight drop-shadow-[0_1px_2px_rgb(0_0_0/0.35)]">
        {brand.initials}
      </span>
    </span>
  );
}
