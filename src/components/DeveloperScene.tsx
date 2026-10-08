import { useState, type ReactNode } from "react";

import { developerBrand, developerSeed } from "@/lib/developerBrand";
import { developerPhoto } from "@/lib/developerPhotos";
import { developerSceneVariant, type SceneVariant } from "@/lib/developerScenes";
import { cn } from "@/lib/utils";

/**
 * Generated artwork for each developer's page.
 *
 * Every developer gets its own picture rather than a stock photo: a scene is
 * drawn from the developer's brand hue plus a per-developer seed, so no two
 * pages look the same and nothing is pulled from the network. The motif of the
 * developer's mark picks the setting — compound for Mountain View, peaks for
 * PRE and Al Ahly Sabbour, coast for Lake View and The Waterway, oasis for
 * Palm Hills and Marakez, a skyline for the city developers.
 */


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

/* ---------- The compound scene ---------- */

/** Fixed, natural palette — a masterplan reads as a place, not as a brand. */
const PALETTE = {
  wallFar: "#edf3fa",
  wall: "#ffffff",
  wallShade: "#dbe6f1",
  roof: "#3574b8",
  roofFar: "#6a9ed0",
  roofLine: "#1f4f88",
  window: "#a9c8e2",
  lawnFar: "#8cc44f",
  lawn: "#57a02c",
  lawnDark: "#3d7d20",
  path: "#eadfc4",
  pathEdge: "#d3c39d",
  trunk: "#7b5636",
  tree: "#2f7a35",
  treeLight: "#4fa341",
  bloom: "#dd3f96",
  bloomLight: "#f2a0c8",
  water: "#93c2d8",
};

const FIGURES = ["#2b4a7a", "#b8455f", "#2f7a5a", "#8a6a34"];

/** A gabled villa: white walls, blue pitched roof, two rows of windows. */
function villa(
  x: number,
  baseY: number,
  width: number,
  height: number,
  key: string,
  far = false,
): ReactNode {
  const top = baseY - height;
  const roofHeight = 18 + (Math.round(width) % 4) * 7;
  const windowFill = far ? "#cfe0ef" : PALETTE.window;

  return (
    <g key={key}>
      <rect x={x} y={top} width={width} height={height} fill={far ? PALETTE.wallFar : PALETTE.wall} />
      <path
        d={`M ${x - 7} ${top} L ${x + width / 2} ${top - roofHeight} L ${x + width + 7} ${top} Z`}
        fill={far ? PALETTE.roofFar : PALETTE.roof}
      />
      {[0, 1].map((row) =>
        [0, 1].map((col) => (
          <rect
            key={`w${row}${col}`}
            x={x + width * (0.18 + col * 0.46)}
            y={top + height * (0.22 + row * 0.42)}
            width={width * 0.18}
            height={height * 0.19}
            fill={windowFill}
          />
        )),
      )}
      {!far && (
        <rect
          x={x + 4}
          y={top + height * 0.6}
          width={width - 8}
          height={3}
          fill={PALETTE.wallShade}
        />
      )}
    </g>
  );
}

/** A broad-crowned shade tree. */
function tree(x: number, baseY: number, scale: number, key: string, far = false): ReactNode {
  const canopy = far ? PALETTE.treeLight : PALETTE.tree;
  return (
    <g key={key} transform={`translate(${x} ${baseY}) scale(${scale})`}>
      <rect x="-3" y="-42" width="6" height="42" fill={PALETTE.trunk} />
      <circle cx="0" cy="-56" r="26" fill={canopy} />
      <circle cx="-21" cy="-44" r="18" fill={canopy} />
      <circle cx="21" cy="-44" r="18" fill={canopy} />
      <circle cx="0" cy="-78" r="17" fill={far ? PALETTE.tree : PALETTE.treeLight} />
    </g>
  );
}

/** A tiny resident, walking the lawn path. */
function figure(x: number, baseY: number, scale: number, fill: string, key: string): ReactNode {
  return (
    <g key={key} transform={`translate(${x} ${baseY}) scale(${scale})`} fill={fill}>
      <circle cx="0" cy="-35" r="6" />
      <rect x="-6" y="-28" width="12" height="18" rx="4" />
      <rect x="-5" y="-11" width="4" height="11" />
      <rect x="1" y="-11" width="4" height="11" />
    </g>
  );
}

/**
 * A masterplan garden: villas with blue pitched roofs either side of a clipped
 * lawn, a walkway running into the distance, water, trees and flowering beds.
 */
function compoundArt(random: () => number): ReactNode {
  const farVillas = Array.from({ length: 7 }, (_, i) =>
    villa(-50 + i * 182 + random() * 26, 252, 118 + random() * 34, 58 + random() * 24, `fv${i}`, true),
  );

  const farTrees = Array.from({ length: 5 }, (_, i) =>
    tree(120 + i * 236 + random() * 60, 262, 0.5 + random() * 0.18, `ft${i}`, true),
  );

  // Villas down both sides, leaving the middle for the garden and walkway.
  const nearVillas = [
    villa(-40 + random() * 30, 336, 190 + random() * 50, 126 + random() * 34, "nv0"),
    villa(250 + random() * 40, 342, 150 + random() * 40, 112 + random() * 26, "nv1"),
    villa(860 + random() * 40, 340, 156 + random() * 44, 118 + random() * 28, "nv2"),
    villa(1120 + random() * 30, 336, 190 + random() * 40, 130 + random() * 30, "nv3"),
  ];

  const blooms = Array.from({ length: 15 }, (_, i) => {
    const x = 30 + i * 78 + random() * 22;
    const y = 352 + random() * 42;
    return (
      <g key={`bl${i}`}>
        <circle cx={x} cy={y} r={10 + random() * 6} fill={PALETTE.bloom} opacity="0.9" />
        <circle cx={x + 17} cy={y + 7} r={7 + random() * 5} fill={PALETTE.bloomLight} opacity="0.85" />
        <circle cx={x - 15} cy={y + 9} r={6 + random() * 4} fill={PALETTE.tree} opacity="0.65" />
      </g>
    );
  });

  return (
    <>
      <ellipse cx="960" cy="150" rx="260" ry="140" fill="#fff" opacity="0.4" />
      <g>{farVillas}</g>
      <g>{farTrees}</g>

      {/* lawns, far to near */}
      <path
        d={`M 0 ${H} L 0 288 C 260 276, 520 282, 780 268 C 960 258, 1100 250, ${W} 246 L ${W} ${H} Z`}
        fill={PALETTE.lawnFar}
      />
      <g>{nearVillas}</g>
      <path
        d={`M 0 ${H} L 0 344 C 260 330, 620 336, 900 322 C 1020 316, 1120 312, ${W} 306 L ${W} ${H} Z`}
        fill={PALETTE.lawn}
      />
      <path
        d={`M 0 ${H} L 0 384 C 300 372, 700 376, ${W} 364 L ${W} ${H} Z`}
        fill={PALETTE.lawnDark}
        opacity="0.5"
      />

      {/* water with a stone rim, lower left */}
      <path d="M 0 386 C 70 364, 140 356, 210 354 L 210 400 L 0 400 Z" fill={PALETTE.water} />
      <path
        d="M 0 386 C 70 364, 140 356, 210 354"
        fill="none"
        stroke={PALETTE.pathEdge}
        strokeWidth="6"
      />

      {/* the walkway running into the distance */}
      <path
        d={`M -10 ${H} C 180 366, 300 344, 470 326 C 640 308, 820 302, ${W} 318 L ${W} ${H} Z`}
        fill={PALETTE.path}
      />
      <path
        d={`M -10 ${H} C 180 366, 300 344, 470 326 C 640 308, 820 302, ${W} 318`}
        fill="none"
        stroke={PALETTE.pathEdge}
        strokeWidth="4"
      />
      <path
        d={`M -10 392 C 200 356, 320 334, 480 316 C 650 298, 830 292, ${W} 306`}
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeDasharray="14 20"
        opacity="0.4"
      />

      <g>{blooms}</g>

      <g>
        {tree(170 + random() * 40, 330, 1.1, "nt0")}
        {tree(560 + random() * 50, 344, 1.3, "nt1")}
        {tree(1010 + random() * 50, 336, 1.05, "nt2")}
      </g>

      {/* bench, then the residents */}
      <g transform="translate(268 352)">
        <rect x="0" y="-24" width="46" height="7" rx="3" fill={PALETTE.roofLine} />
        <rect x="0" y="-14" width="46" height="7" rx="3" fill={PALETTE.roof} />
        <rect x="4" y="-4" width="4" height="10" fill="#6b7b88" />
        <rect x="38" y="-4" width="4" height="10" fill="#6b7b88" />
      </g>
      <g>
        {figure(352, 368, 1, FIGURES[0], "pp0")}
        {figure(382, 370, 0.7, FIGURES[1], "pp1")}
        {figure(408, 368, 1.02, FIGURES[2], "pp2")}
        {figure(880, 374, 1.04, FIGURES[3], "pp3")}
        {figure(918, 372, 0.98, FIGURES[0], "pp4")}
      </g>
    </>
  );
}

export function DeveloperScene({
  name,
  variant,
  badge = false,
  className,
}: {
  name: string;
  variant?: SceneVariant;
  /** Label the generated artwork as an impression (used on the page hero). */
  badge?: boolean;
  className?: string;
}) {
  const { hue } = developerBrand(name);
  const scene = developerSceneVariant(name, variant);
  const random = rng(developerSeed(name));

  // A real photo takes over when one is configured; if it fails to load we
  // fall straight back to the generated artwork rather than a broken frame.
  const photo = developerPhoto(name);
  const [photoBroken, setPhotoBroken] = useState(false);
  const showPhoto = Boolean(photo) && !photoBroken;

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

  if (scene === "compound") {
    art = compoundArt(random);
  } else if (scene === "peaks") {
    // A ridge line drawn as path data — `<polygon points>` only accepts
    // coordinate pairs, so command letters there silently drop the shape.
    const ridge = (startY: number, low: number, high: number, step: number) => {
      let x = 0;
      let d = `M 0 ${H} L 0 ${Math.round(startY)}`;
      while (x < W) {
        x += step * (1 + random() * 0.9);
        d += ` L ${Math.round(x)} ${Math.round(low + random() * (high - low))}`;
      }
      return `${d} L ${W} ${H} Z`;
    };

    art = (
      <>
        <path d={ridge(250, 150, 245, 140)} fill={far} />
        <path d={ridge(330, 250, 325, 170)} fill={near} />
        <path
          d={`M 0 ${H} L 0 352 L ${W} 342 L ${W} ${H} Z`}
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

  // The compound artwork carries its own warm sky, so it ignores the brand
  // gradient and the generic sun discs.
  const isCompound = scene === "compound";

  if (showPhoto) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <img
          src={photo ?? undefined}
          alt={`${name} development`}
          loading="lazy"
          decoding="async"
          onError={() => setPhotoBroken(true)}
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundImage: isCompound
          ? "linear-gradient(to bottom, #b9dcf1, #f8ecd9)"
          : `linear-gradient(to bottom, hsl(${hue} 76% 95%), hsl(${hue} 52% 76%))`,
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        className="absolute inset-0 size-full"
      >
        {!isCompound && (
          <>
            <circle cx={sunX} cy={sunY} r="96" fill="#fff" opacity="0.22" />
            <circle cx={sunX} cy={sunY} r="46" fill="#fff" opacity="0.7" />
          </>
        )}
        {art}
      </svg>
      {badge && (
        <span className="absolute top-3 right-3 rounded-full bg-card/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground backdrop-blur-sm">
          Artist's impression
        </span>
      )}
    </div>
  );
}
