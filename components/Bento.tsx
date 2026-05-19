"use client";
import { useState } from "react";
import { motion } from "motion/react";
import type {
  ColorPalette,
  TypePairing,
  Persona,
} from "@/lib/types";

type Props = {
  kind: "brand" | "campaign";
  name: string;
  archetypeLabel: string;
  toneLabel: string;
  palette: ColorPalette;
  type: TypePairing;
  persona: Persona;
  tagline?: string;
  story?: string;
  mockupImages: (string | undefined)[];
  mockupPrompts: string[];
  patternIdea?: string;
  headlines?: string[];
  cta?: string;
  logoDataUrl?: string;
  /** Called when user clicks regenerate on a mockup tile */
  onRegenMockup?: (idx: number) => Promise<void>;
};

export default function Bento(props: Props) {
  const {
    name,
    archetypeLabel,
    toneLabel,
    palette,
    type,
    persona,
    tagline,
    mockupImages,
    headlines,
    cta,
    patternIdea,
    onRegenMockup,
  } = props;

  const [regenIdx, setRegenIdx] = useState<number | null>(null);

  const handleRegen = async (i: number) => {
    if (!onRegenMockup) return;
    setRegenIdx(i);
    try {
      await onRegenMockup(i);
    } finally {
      setRegenIdx(null);
    }
  };

  const [c0, c1, c2, c3] = [
    palette.hexes[0] || "#0a0a0a",
    palette.hexes[1] || "#c8ff3e",
    palette.hexes[2] || "#f5f0e8",
    palette.hexes[3] || "#ff3e8e",
  ];

  const tileMotion = (i: number) => ({
    initial: { opacity: 0, y: 18, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: 0.6,
      delay: 0.05 + i * 0.07,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  });

  const gfDisplay = type.display.replace(/\s+/g, "+");
  const gfBody = type.body.replace(/\s+/g, "+");

  return (
    <>
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${gfDisplay}:wght@400;500;700&family=${gfBody}:wght@400;500&display=swap`}
      />

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(6, 1fr)",
          gridAutoRows: "minmax(120px, auto)",
        }}
      >
        {/* Tile 1: Hero lockup */}
        <motion.div
          {...tileMotion(0)}
          className="rounded-lg p-8 flex flex-col justify-between min-h-[280px]"
          style={{
            background: c0,
            color: c2,
            gridColumn: "span 4",
            gridRow: "span 2",
          }}
        >
          <p
            className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-60"
            style={{ color: c2 }}
          >
            01 / lockup
          </p>
          <div className="flex items-baseline gap-5">
            <Mark color={c1} />
            <span
              className="text-7xl md:text-8xl tracking-tightest"
              style={{ fontFamily: `'${type.display}', serif`, color: c2 }}
            >
              {name}
              <span style={{ color: c1 }}>.</span>
            </span>
          </div>
          {tagline && (
            <p
              className="text-base md:text-lg max-w-md leading-snug opacity-80"
              style={{ fontFamily: `'${type.body}', sans-serif`, color: c2 }}
            >
              {tagline}
            </p>
          )}
        </motion.div>

        {/* Tile 2: Hero mockup image (tall, regenerable) */}
        <motion.div
          {...tileMotion(1)}
          className="rounded-lg overflow-hidden relative group"
          style={{
            gridColumn: "span 2",
            gridRow: "span 4",
            background: c3,
            minHeight: "560px",
          }}
        >
          <MockupTile
            image={mockupImages[0]}
            contrast={c2}
            regenerating={regenIdx === 0}
            onRegen={onRegenMockup ? () => handleRegen(0) : undefined}
          />
          <div className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-none">
            <p
              className="font-mono text-[10px] tracking-[0.18em] uppercase mix-blend-difference"
              style={{ color: c2 }}
            >
              hero mockup
            </p>
            <p
              className="text-3xl md:text-4xl leading-none mix-blend-difference"
              style={{
                fontFamily: `'${type.display}', serif`,
                color: c2,
              }}
            >
              {headlines?.[0] ?? tagline ?? "Made for now."}
            </p>
          </div>
        </motion.div>

        {/* Tile 3: Color stack */}
        <motion.div
          {...tileMotion(2)}
          className="rounded-lg overflow-hidden flex flex-col"
          style={{ gridColumn: "span 2", gridRow: "span 2" }}
        >
          {palette.hexes.map((h) => (
            <div
              key={h}
              className="flex-1 flex items-end p-3"
              style={{ background: h, minHeight: "50px" }}
            >
              <span
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: contrast(h) }}
              >
                {h}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Tile 4: Typography */}
        <motion.div
          {...tileMotion(3)}
          className="rounded-lg p-6 flex flex-col"
          style={{
            background: "#11161d",
            gridColumn: "span 3",
            gridRow: "span 2",
            minHeight: "240px",
          }}
        >
          <p className="eyebrow mb-4">02 / type system</p>
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-ash mb-1">
                display · {type.display}
              </p>
              <p
                className="text-5xl leading-none text-bone tracking-tightest"
                style={{ fontFamily: `'${type.display}', serif` }}
              >
                Aa Rr 0–9
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-ash mb-1">
                body · {type.body}
              </p>
              <p
                className="text-sm text-ash leading-relaxed"
                style={{ fontFamily: `'${type.body}', sans-serif` }}
              >
                {persona.description.slice(0, 110)}…
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tile 5: Pattern */}
        <motion.div
          {...tileMotion(4)}
          className="rounded-lg overflow-hidden relative"
          style={{
            background: c1,
            gridColumn: "span 1",
            gridRow: "span 2",
            minHeight: "240px",
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 80 240"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="pk"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <polygon
                  points="10,3 18,17 2,17"
                  fill="none"
                  stroke={c0}
                  strokeWidth="1.3"
                />
              </pattern>
            </defs>
            <rect width="80" height="240" fill="url(#pk)" />
          </svg>
          <p
            className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest"
            style={{ color: contrast(c1) }}
          >
            pattern
          </p>
        </motion.div>

        {/* Tile 6: Second mockup (regenerable) */}
        <motion.div
          {...tileMotion(5)}
          className="rounded-lg overflow-hidden relative group"
          style={{
            background: "#1a1f28",
            gridColumn: "span 2",
            gridRow: "span 2",
            minHeight: "240px",
          }}
        >
          <MockupTile
            image={mockupImages[1]}
            contrast="#f4f0e6"
            regenerating={regenIdx === 1}
            onRegen={onRegenMockup ? () => handleRegen(1) : undefined}
          />
          <p className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.18em] uppercase text-bone/80 mix-blend-difference pointer-events-none">
            applied
          </p>
        </motion.div>

        {/* Tile 7: Persona card */}
        <motion.div
          {...tileMotion(6)}
          className="rounded-lg p-6 flex flex-col border"
          style={{
            background: "#11161d",
            borderColor: c1,
            gridColumn: "span 3",
            gridRow: "span 2",
            minHeight: "240px",
          }}
        >
          <p className="eyebrow mb-3">03 / persona</p>
          <p
            className="text-3xl mb-3 leading-tight"
            style={{ fontFamily: `'${type.display}', serif`, color: c2 }}
          >
            {persona.name}
          </p>
          <p
            className="text-sm leading-relaxed flex-1 text-ash"
            style={{ fontFamily: `'${type.body}', sans-serif` }}
          >
            {persona.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {persona.traits.slice(0, 5).map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded"
                style={{ background: `${c1}25`, color: c1 }}
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Tile 8: Third mockup (regenerable) */}
        <motion.div
          {...tileMotion(7)}
          className="rounded-lg overflow-hidden relative group"
          style={{
            background: c2,
            gridColumn: "span 3",
            gridRow: "span 2",
            minHeight: "240px",
          }}
        >
          <MockupTile
            image={mockupImages[2]}
            contrast={c0}
            regenerating={regenIdx === 2}
            onRegen={onRegenMockup ? () => handleRegen(2) : undefined}
          />
          <p
            className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.18em] uppercase mix-blend-difference pointer-events-none"
            style={{ color: c0 }}
          >
            in context
          </p>
        </motion.div>

        {/* Tile 9: Headlines (campaigns only) */}
        {headlines && headlines.length > 0 && (
          <motion.div
            {...tileMotion(8)}
            className="rounded-lg p-6"
            style={{
              background: c1,
              color: contrast(c1),
              gridColumn: "span 3",
              gridRow: "span 1",
              minHeight: "120px",
            }}
          >
            <p
              className="font-mono text-[10px] tracking-[0.18em] uppercase mb-3 opacity-70"
              style={{ color: contrast(c1) }}
            >
              headlines
            </p>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
              style={{ fontFamily: `'${type.body}', sans-serif` }}
            >
              {headlines.slice(0, 4).map((h, i) => (
                <p
                  key={i}
                  className="text-sm leading-tight font-medium"
                  style={{ color: contrast(c1) }}
                >
                  · {h}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tile 10: Details */}
        <motion.div
          {...tileMotion(9)}
          className="rounded-lg p-6 flex flex-col justify-between"
          style={{
            background: c0,
            color: c2,
            gridColumn: "span 3",
            gridRow: "span 1",
            minHeight: "120px",
          }}
        >
          <p
            className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-60"
            style={{ color: c2 }}
          >
            04 / details
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p
                className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-1"
                style={{ color: c2 }}
              >
                archetypes
              </p>
              <p
                className="text-lg"
                style={{ fontFamily: `'${type.display}', serif`, color: c2 }}
              >
                {archetypeLabel}
              </p>
            </div>
            <div className="text-right">
              <p
                className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-1"
                style={{ color: c2 }}
              >
                tone
              </p>
              <p
                className="text-sm opacity-80"
                style={{ fontFamily: `'${type.body}', sans-serif`, color: c2 }}
              >
                {toneLabel}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tile 11: CTA strip */}
        {cta && (
          <motion.div
            {...tileMotion(10)}
            className="rounded-lg p-6 flex items-center justify-between"
            style={{
              background: c3,
              color: contrast(c3),
              gridColumn: "span 6",
              gridRow: "span 1",
              minHeight: "100px",
            }}
          >
            <p
              className="text-3xl md:text-4xl tracking-tightest"
              style={{ fontFamily: `'${type.display}', serif` }}
            >
              {cta}
            </p>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: contrast(c3) }}
            >
              campaign cta
            </span>
          </motion.div>
        )}

        {/* Pattern note */}
        {patternIdea && (
          <motion.div
            {...tileMotion(11)}
            className="rounded-lg p-6"
            style={{
              background: "#0d0d0e",
              border: "1px solid #1f2128",
              gridColumn: "span 6",
              gridRow: "span 1",
              minHeight: "100px",
            }}
          >
            <p className="eyebrow mb-2">pattern note</p>
            <p
              className="text-bone leading-relaxed"
              style={{ fontFamily: `'${type.body}', sans-serif` }}
            >
              {patternIdea}
            </p>
          </motion.div>
        )}
      </div>
    </>
  );
}

function MockupTile({
  image,
  contrast: contrastColor,
  regenerating,
  onRegen,
}: {
  image?: string;
  contrast: string;
  regenerating?: boolean;
  onRegen?: () => void;
}) {
  return (
    <>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt="Mockup"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-ash">
          generating…
        </div>
      )}
      {regenerating && (
        <div className="absolute inset-0 bg-noir/85 flex flex-col items-center justify-center z-10">
          <span className="font-mono text-[11px] tracking-widest uppercase text-spark animate-pulse mb-1">
            regenerating
          </span>
          <span className="font-mono text-[9px] tracking-widest uppercase text-ash">
            Nano Banana
          </span>
        </div>
      )}
      {onRegen && !regenerating && (
        <button
          onClick={onRegen}
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-noir/85 hover:bg-noir text-bone font-mono text-[10px] tracking-widest uppercase px-3 py-2 z-20 backdrop-blur"
          aria-label="Regenerate this image"
        >
          ↻ regen
        </button>
      )}
    </>
  );
}

function Mark({ color }: { color: string }) {
  return (
    <svg width="64" height="64" viewBox="0 0 40 40" aria-hidden="true">
      <polygon points="20,5 36,33 4,33" fill="none" stroke={color} strokeWidth="2.5" />
      <polygon points="20,16 28,30 12,30" fill={color} />
    </svg>
  );
}

function contrast(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#f4f0e6";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#0a0a0a" : "#f4f0e6";
}
