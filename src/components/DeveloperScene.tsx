import type { ReactNode } from "react";

import {
  developerBrand,
  developerSeed,
  type DeveloperMotif,
} from "@/lib/developerBrand";
import { cn } from "@/lib/utils";

/**
 * Generated artwork for each developer's page.
 *
 * Every developer gets its own picture rather than a stock photo: a scene is
 * drawn from the developer's brand hue plus a per-developer seed, so no two
 * pages look the same and nothing is pulled from the network. The motif of the
 * developer's mark picks the setting — peaks for Mountain View, coast for Lake
 * View and The Waterway, oasis for Palm Hills and Marakez, a skyline for the
 * city developers.
 */

export type SceneVariant = "skyline" | "coast" | "oasis" | "peaks";

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

/** Small deterministic PRNG (Lehmer) so a developer's scene is stable. */
function rng(seed: number): () => number {
  let state = (seed % 2147483646) + 1;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

const W = 1200;
const H = 400;

type Box = { x: number; y: number; w: number; windows: [number, number][] };

/** A row of buildings, tallest nearest the viewer. */
function buildings(
  random: () => number,
  minHeight: number,
  maxHeight: number,
  startX = -40,
): Box[] {
  const out: Box[] = [];
  let x = startX;
  while (x < W + 40) {
    const w = 60 + Math.round(random() * 90);
    const height = minHeight + Math.round(random() * (maxHeight - minHeight));
    const y = H - height;
    const windows: [number, number][] = [];
    const cols = Math.max(1, Math.floor(w / 34));
    const rows = Math.max(1, Math.floor(height / 46));
    for (let c = 0; c < cols; c += 1) {
      for (let r = 0; r < rows; r += 1) {
        if (random() > 0.45) {
          windows.push([x + 12 + c * 34, y + 18 + r * 46]);
        }
      }
    }
    out.push({ x, y, w, windows });
    x += w + 10 + Math.round(random() * 28);
  }
  return out;
}

function boxes(list: Box[], fill: string, withWindows = false): ReactNode {
  return (
    <g fill={fill}>
      {list.map((b, i) => (
        <rect key={`b${i}`} x={b.x} y={b.y} width={b.w} height={H - b.y} />
      ))}
      {withWindows && (
        <g fill="#fff" opacity="0.42">
          {list.flatMap((b, i) =>
            b.windows.map(([wx, wy], j) => (
              <rect key={`w${i}-${j}`} x={wx} y={wy} width="9" height="14" />
            )),
          )}
        </g>
      )}
    </g>
  );
}

/** A date palm silhouette — used on the coast and oasis scenes. */
function palm(x: number, baseY: number, scale: number, fill: string, key: string) {
  return (
    <g key={key} transform={`translate(${x} ${baseY}) scale(${scale})`} fill={fill}>
      <path d="M-3 0C-2-38-3-68-6-92L6-92C3-68 2-38 3 0Z" />
      <path d="M0-92C-24-106-46-102-60-84C-40-90-20-89 0-80Z" />
      <path d="M0-92C24-106 46-102 60-84C40-90 20-89 0-80Z" />
      <path d="M0-94C-8-118-24-130-46-134C-26-118-14-108-4-90Z" />
      <path d="M0-94C8-118 24-130 46-134C26-118 14-108 4-90Z" />
    </g>
  );
}

export function DeveloperScene({
  name,
  variant,
  className,
}: {
  name: string;
  variant?: SceneVariant;
  className?: string;
}) {
  const { hue, motif } = developerBrand(name);
  const scene = variant ?? VARIANT_BY_MOTIF[motif];
  const random = rng(developerSeed(name));

  const ink = (lightness: number, saturation = 44) =>
    `hsl(${hue} ${saturation}% ${lightness}%)`;
  const haze = ink(64, 26);
  const far = ink(52, 34);
  const mid = ink(38, 40);
  const near = ink(24, 46);
  const water = ink(44, 58);

  const sunX = 200 + Math.round(random() * 800);
  const sunY = 78 + Math.round(random() * 34);
  const palms = [60, 210, 960, 1110].map((base, i) => ({
    key: `p${i}`,
    x: base + Math.round(random() * 40),
    scale: 0.7 + random() * 0.45,
  }));

  let art: ReactNode;

  if (scene === "peaks") {
    const farRidge = `0 ${H} L 0 ${250 + random() * 40}`;
    const nearRidge = `0 ${H} L 0 ${330 + random() * 20}`;
    let fx = 0;
    let nx = 0;
    let farPoints = farRidge;
    let nearPoints = nearRidge;
    while (fx < W) {
      fx += 140 + random() * 120;
      farPoints += ` L ${Math.round(fx)} ${Math.round(150 + random() * 90)}`;
    }
    while (nx < W) {
      nx += 170 + random() * 150;
      nearPoints += ` L ${Math.round(nx)} ${Math.round(250 + random() * 70)}`;
    }
    art = (
      <>
        <polygon points={`${farPoints} L ${W} ${H} Z`} fill={far} />
        <polygon points={`${nearPoints} L ${W} ${H} Z`} fill={near} />
        <polygon
          points={`0 ${H} L 0 352 L ${W} 342 L ${W} ${H} Z`}
          fill={mid}
          opacity="0.85"
        />
      </>
    );
  } else if (scene === "coast") {
    const waves: ReactNode[] = [];
    for (let i = 0; i < 5; i += 1) {
      const y = 292 + i * 22;
      const amp = 6 + random() * 6;
      waves.push(
        <path
          key={`wv${i}`}
          d={`M -20 ${y} q 80 -${amp} 160 0 t 160 0 t 160 0 t 160 0 t 160 0 t 160 0 t 160 0`}
        />,
      );
    }
    art = (
      <>
        {boxes(buildings(random, 90, 200, -60), haze)}
        <rect x="0" y="268" width={W} height={H - 268} fill={water} />
        <rect x="0" y="268" width={W} height="8" fill={ink(62, 60)} opacity="0.6" />
        <ellipse cx={sunX} cy="300" rx="86" ry="14" fill="#fff" opacity="0.25" />
        <g
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        >
          {waves}
        </g>
        <g>{palms.map((p) => palm(p.x, 280, p.scale, near, p.key))}</g>
      </>
    );
  } else if (scene === "oasis") {
    const dune = (y: number, drift: number) =>
      `M 0 ${y} C ${300 + drift} ${y - 40}, ${560 - drift} ${y + 26}, ${W} ${y - 14} L ${W} ${H} L 0 ${H} Z`;
    art = (
      <>
        <path d={dune(268, random() * 90)} fill={mid} opacity="0.9" />
        <path d={dune(318, random() * 120)} fill={near} />
        <g>{palms.map((p) => palm(p.x, 330, p.scale + 0.2, near, p.key))}</g>
        <g>{palm(480, 322, 0.6, near, "pc")}</g>
      </>
    );
  } else {
    art = (
      <>
        <rect x="0" y="322" width={W} height={H - 322} fill={haze} opacity="0.7" />
        {boxes(buildings(random, 70, 150, -80), haze)}
        {boxes(buildings(random, 110, 230, -40), far)}
        {boxes(buildings(random, 150, 300, -20), near, true)}
      </>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundImage: `linear-gradient(to bottom, hsl(${hue} 76% 95%), hsl(${hue} 52% 76%))`,
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        className="absolute inset-0 size-full"
      >
        <circle cx={sunX} cy={sunY} r="96" fill="#fff" opacity="0.22" />
        <circle cx={sunX} cy={sunY} r="46" fill="#fff" opacity="0.7" />
        {art}
      </svg>
    </div>
  );
}
