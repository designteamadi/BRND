"use client";
import { useState } from "react";
import { motion } from "motion/react";
import type {
  ColorPalette,
  TypePairing,
  Persona,
  MediaChannel,
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
  description?: string;
  mockupImages: (string | undefined)[];
  mockupPrompts: string[];
  patternIdea?: string;
  headlines?: string[];
  cta?: string;
  channelIdeas?: Partial<Record<MediaChannel, string>>;
  logoDataUrl?: string;
  /** Optional concept thumbnails generated during step 6 — used in the moodboard strip */
  conceptThumbnails?: (string | undefined)[];
  /** Called when user clicks regenerate on a mockup tile */
  onRegenMockup?: (idx: number) => Promise<void>;
};

/**
 * The full visual brand book — a "bento" of ~14 designed tiles that mirrors
 * the complexity of a proper brand identity reference (logo system, color
 * system, typography spec, iconography, persona, applications, moodboard).
 *
 * Designed defensively: every field access uses optional chaining + safe
 * fallbacks so a malformed AI response can never crash the page.
 */
export default function Bento(props: Props) {
  const {
    kind,
    name,
    archetypeLabel,
    toneLabel,
    palette,
    type,
    persona,
    tagline,
    story,
    description,
    mockupImages,
    headlines,
    cta,
    channelIdeas,
    patternIdea,
    logoDataUrl,
    conceptThumbnails,
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

  // ---------- Safe defaults ----------
  const hexes = palette?.hexes ?? [];
  const [c0, c1, c2, c3] = [
    hexes[0] || "#0a0a0a",
    hexes[1] || "#c8ff3e",
    hexes[2] || "#f5f0e8",
    hexes[3] || "#ff3e8e",
  ];
  const personaName = persona?.name ?? "—";
  const personaDescription = persona?.description ?? "";
  const personaTraits = Array.isArray(persona?.traits) ? persona!.traits : [];
  const displayFont = type?.display ?? "serif";
  const bodyFont = type?.body ?? "sans-serif";

  // Up to 4 brand principles, derived from the tone keywords. Pads with
  // sensible defaults if the user picked fewer than 4 tone words.
  const toneList = (toneLabel || "")
    .split(/,\s*/)
    .filter(Boolean);
  const defaults = ["considered", "deliberate", "honest", "specific"];
  const principles: { word: string; descriptor: string; tint: string }[] = [
    { word: toneList[0] ?? defaults[0], descriptor: "How we move.", tint: c1 },
    { word: toneList[1] ?? defaults[1], descriptor: "How we think.", tint: "#ff6b35" },
    { word: toneList[2] ?? defaults[2], descriptor: "How we speak.", tint: c3 },
    { word: toneList[3] ?? defaults[3], descriptor: "How we ship.", tint: "#f4f0e6" },
  ];

  const tileMotion = (i: number) => ({
    initial: { opacity: 0, y: 18, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: 0.6,
      delay: 0.04 + i * 0.05,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  });

  const gfDisplay = displayFont.replace(/\s+/g, "+");
  const gfBody = bodyFont.replace(/\s+/g, "+");

  // Up to 6 visible concept thumbnails for the moodboard strip
  const moodImages = (conceptThumbnails ?? []).filter(Boolean) as string[];

  return (
    <>
      {/* Pull in the brand's actual display + body fonts so the type
          specimen renders in the chosen typography. */}
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${gfDisplay}:wght@400;500;700&family=${gfBody}:wght@400;500;600&display=swap`}
      />

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(6, 1fr)",
          gridAutoRows: "minmax(140px, auto)",
        }}
      >
        {/* ============ 01 / HERO LOCKUP ============ */}
        <motion.div
          {...tileMotion(0)}
          className="rounded-lg p-8 md:p-10 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: c0,
            color: c2,
            gridColumn: "span 4",
            gridRow: "span 2",
            minHeight: "320px",
          }}
        >
          {/* Soft pattern in the background */}
          <svg
            aria-hidden
            className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="heroPattern"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="1" fill={c1} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroPattern)" />
          </svg>

          <div className="relative z-10 flex items-start justify-between">
            <p
              className="font-mono text-[10px] tracking-[0.22em] uppercase"
              style={{ color: c2, opacity: 0.55 }}
            >
              {kind} system · v0.1
            </p>
            <div className="flex items-center gap-3">
              {/* For campaigns, show the parent brand's uploaded logo as a
                  small "for {brand}" badge in the corner. The big typography
                  below IS the campaign's own typographic identity. */}
              {kind === "campaign" && logoDataUrl && (
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-[9px] tracking-[0.22em] uppercase"
                    style={{ color: c2, opacity: 0.5 }}
                  >
                    for
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoDataUrl}
                    alt="Parent brand"
                    className="h-7 w-auto object-contain"
                    style={{ maxWidth: 80 }}
                  />
                </div>
              )}
              <span
                className="font-mono text-[10px] tracking-[0.22em] uppercase"
                style={{ color: c1 }}
              >
                ● ready
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-baseline gap-5 md:gap-7">
            {/* For brands: show ONLY the user/generated logo image. If
                no logo exists, render nothing here — the typography below
                stands alone as the wordmark. No triangle fallback ever.
                For campaigns: the campaign name set in display type IS
                the typography logo — no inline mark. */}
            {kind === "brand" && logoDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoDataUrl}
                alt={`${name} logo`}
                className="h-16 md:h-20 w-auto object-contain shrink-0"
                style={{ maxWidth: 96 }}
              />
            )}
            <h2
              className="text-6xl md:text-8xl tracking-tightest leading-none"
              style={{
                fontFamily: `'${displayFont}', serif`,
                color: c2,
                fontWeight: kind === "campaign" ? 700 : 400,
                letterSpacing: kind === "campaign" ? "-0.02em" : undefined,
              }}
            >
              {name}
              <span style={{ color: c1 }}>.</span>
            </h2>
          </div>

          <div className="relative z-10 max-w-2xl">
            {tagline && (
              <p
                className="text-xl md:text-2xl mb-3 leading-snug"
                style={{
                  fontFamily: `'${displayFont}', serif`,
                  fontStyle: "italic",
                  color: c2,
                }}
              >
                {tagline}
              </p>
            )}
            {(description || story) && (
              <p
                className="text-sm md:text-base leading-relaxed opacity-80 max-w-xl"
                style={{ fontFamily: `'${bodyFont}', sans-serif`, color: c2 }}
              >
                {(description || story || "").slice(0, 180)}
                {(description || story || "").length > 180 && "…"}
              </p>
            )}
          </div>
        </motion.div>

        {/* ============ 02 / BRAND ESSENCE ============ */}
        <motion.div
          {...tileMotion(1)}
          className="rounded-lg p-6 md:p-7 flex flex-col"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 2",
            gridRow: "span 2",
            minHeight: "320px",
          }}
        >
          <p className="eyebrow mb-5">02 / brand essence</p>
          <div className="flex-1 space-y-5">
            {principles.map((p, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className="shrink-0 w-9 h-9 rounded flex items-center justify-center"
                  style={{ background: `${p.tint}15`, border: `1px solid ${p.tint}40` }}
                >
                  <PrincipleIcon idx={i} color={p.tint} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-bone text-base font-medium capitalize leading-tight"
                    style={{ fontFamily: `'${bodyFont}', sans-serif` }}
                  >
                    {p.word}.
                  </p>
                  <p className="text-ash text-xs leading-snug mt-0.5">
                    {p.descriptor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ============ 03 / LOGO VARIATIONS ============ */}
        <motion.div
          {...tileMotion(2)}
          className="rounded-lg p-6 md:p-7"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 6",
            gridRow: "span 1",
            minHeight: "200px",
          }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <p className="eyebrow">
              03 / {kind === "campaign" ? "wordmark system · 4 lockup variants" : "logo system · 4 lockup variants"}
            </p>
            <p className="font-mono text-[10px] tracking-widest uppercase text-ash">
              {kind === "campaign"
                ? "campaign typography lockup"
                : "clear space = 1× cap-height of mark"}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-[140px]">
            {kind === "campaign" || !logoDataUrl ? (
              <>
                {/* Campaign always uses typography wordmark variants.
                    Brand also falls back to wordmark variants if logo
                    image generation failed — never the triangle mark. */}
                <WordmarkVariant
                  background={c0}
                  textColor={c2}
                  accent={c1}
                  text={name}
                  font={displayFont}
                  label="primary · dark"
                />
                <WordmarkVariant
                  background={c2}
                  textColor={c0}
                  accent={c3}
                  text={name}
                  font={displayFont}
                  label="inverted · light"
                />
                <WordmarkVariant
                  background={c1}
                  textColor={c0}
                  accent={c0}
                  text={name}
                  font={displayFont}
                  label="accent"
                />
                <WordmarkVariant
                  background="transparent"
                  textColor={c2}
                  accent={c2}
                  text={name}
                  font={displayFont}
                  label="monochrome"
                  outline
                />
              </>
            ) : (
              <>
                <LogoVariant background={c0} accent={c1} logo={logoDataUrl} label="primary · dark" />
                <LogoVariant background={c2} accent={c0} logo={logoDataUrl} label="inverted · light" />
                <LogoVariant background={c1} accent={c0} logo={logoDataUrl} label="accent" textColor={c0} />
                <LogoVariant background="transparent" accent={c2} logo={logoDataUrl} label="monochrome" outline />
              </>
            )}
          </div>
        </motion.div>

        {/* ============ 04 / COLOR SYSTEM ============ */}
        <motion.div
          {...tileMotion(3)}
          className="rounded-lg overflow-hidden flex flex-col"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 2",
            gridRow: "span 2",
            minHeight: "320px",
          }}
        >
          <div className="p-6 pb-3">
            <p className="eyebrow">04 / color system</p>
            <p
              className="text-bone text-lg leading-tight mt-1"
              style={{ fontFamily: `'${displayFont}', serif` }}
            >
              {palette?.name ?? "—"}
            </p>
            {palette?.rationale && (
              <p className="text-ash text-xs leading-relaxed mt-1.5 line-clamp-2">
                {palette.rationale}
              </p>
            )}
          </div>
          <div className="flex-1 grid grid-cols-2 grid-rows-2">
            <ColorCell hex={c0} role="base" />
            <ColorCell hex={c1} role="accent" />
            <ColorCell hex={c2} role="surface" />
            <ColorCell hex={c3} role="pop" />
          </div>
        </motion.div>

        {/* ============ 05 / TYPOGRAPHY SPECIMEN ============ */}
        <motion.div
          {...tileMotion(4)}
          className="rounded-lg p-6 flex flex-col"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 2",
            gridRow: "span 2",
            minHeight: "320px",
          }}
        >
          <p className="eyebrow mb-4">05 / typography</p>
          <div className="flex items-start gap-6 mb-4">
            <p
              className="text-[88px] leading-none tracking-tightest text-bone"
              style={{ fontFamily: `'${displayFont}', serif` }}
            >
              Aa
            </p>
            <div className="flex-1 pt-2">
              <p
                className="text-bone text-xl leading-tight mb-1"
                style={{ fontFamily: `'${displayFont}', serif` }}
              >
                {displayFont}
              </p>
              <p
                className="text-ash text-xs leading-relaxed"
                style={{ fontFamily: `'${bodyFont}', sans-serif` }}
              >
                Display · headlines, titles, marquee moments.
              </p>
              <div className="mt-4 pt-3 border-t border-steel">
                <p
                  className="text-bone text-base leading-tight"
                  style={{ fontFamily: `'${bodyFont}', sans-serif`, fontWeight: 500 }}
                >
                  {bodyFont}
                </p>
                <p
                  className="text-ash text-xs leading-relaxed mt-0.5"
                  style={{ fontFamily: `'${bodyFont}', sans-serif` }}
                >
                  Body · paragraphs, UI, captions.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-3 border-t border-steel">
            <p
              className="text-ash text-[11px] leading-relaxed tracking-tight"
              style={{ fontFamily: `'${bodyFont}', sans-serif` }}
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
              <br />
              abcdefghijklmnopqrstuvwxyz
              <br />
              0123456789 !?@#$%&*()
            </p>
          </div>
        </motion.div>

        {/* ============ 06 / HERO APPLICATION (mockup 0) ============
            The headline mockup — first thing the user reads. For brand
            this is the defining product/brand application. For campaign
            it's the hero visual that anchors the launch. */}
        <motion.div
          {...tileMotion(6)}
          className="rounded-lg overflow-hidden relative group"
          style={{
            gridColumn: "span 3",
            gridRow: "span 3",
            background: c3,
            minHeight: "560px",
          }}
        >
          <MockupTile
            image={mockupImages[0]}
            regenerating={regenIdx === 0}
            onRegen={onRegenMockup ? () => handleRegen(0) : undefined}
          />
          <div className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-none">
            <p
              className="font-mono text-[10px] tracking-[0.22em] uppercase mix-blend-difference"
              style={{ color: c2 }}
            >
              06 / {kind === "campaign" ? "hero campaign visual" : "hero application"}
            </p>
            <p
              className="text-3xl md:text-4xl leading-none mix-blend-difference max-w-[80%]"
              style={{
                fontFamily: `'${displayFont}', serif`,
                color: c2,
              }}
            >
              {headlines?.[0] ?? tagline ?? "Made with intent."}
            </p>
          </div>
        </motion.div>

        {/* ============ 08 / PERSONA CARD ============ */}
        <motion.div
          {...tileMotion(7)}
          className="rounded-lg p-6 flex flex-col border"
          style={{
            background: "#0d0d0e",
            borderColor: c1,
            gridColumn: "span 3",
            gridRow: "span 2",
            minHeight: "320px",
          }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <p className="eyebrow">07 / persona</p>
            <p className="font-mono text-[10px] tracking-widest uppercase text-ash">
              {archetypeLabel}
            </p>
          </div>
          <p
            className="text-4xl md:text-5xl leading-none tracking-tightest mb-3"
            style={{ fontFamily: `'${displayFont}', serif`, color: c2 }}
          >
            {personaName}
          </p>
          <p
            className="text-sm leading-relaxed flex-1 text-ash"
            style={{ fontFamily: `'${bodyFont}', sans-serif` }}
          >
            {personaDescription}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {personaTraits.slice(0, 6).map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded"
                style={{ background: `${c1}1a`, color: c1, border: `1px solid ${c1}40` }}
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ============ 09 / PATTERN (next to hero mockup) ============ */}
        {/* ============ 08 / SIGNATURE PATTERN (brand only) ============
            The campaign book doesn't need a brand pattern — it shows
            applied campaign design, not brand-system primitives. */}
        {kind === "brand" && (
          <motion.div
            {...tileMotion(8)}
            className="rounded-lg overflow-hidden relative"
            style={{
              background: c1,
              gridColumn: "span 3",
              gridRow: "span 1",
              minHeight: "140px",
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 600 140"
              preserveAspectRatio="xMidYMid slice"
              style={{ display: "block" }}
            >
              <defs>
                <pattern
                  id="brandPattern"
                  x="0"
                  y="0"
                  width="28"
                  height="28"
                  patternUnits="userSpaceOnUse"
                >
                  <polygon
                    points="14,4 24,22 4,22"
                    fill="none"
                    stroke={c0}
                    strokeWidth="1.5"
                  />
                </pattern>
              </defs>
              <rect width="600" height="140" fill="url(#brandPattern)" />
            </svg>
            <div className="absolute inset-0 flex flex-col justify-between p-5">
              <p
                className="font-mono text-[10px] tracking-[0.22em] uppercase"
                style={{ color: contrast(c1) }}
              >
                08 / signature pattern
              </p>
              <p
                className="text-sm md:text-base max-w-md leading-snug"
                style={{
                  color: contrast(c1),
                  fontFamily: `'${bodyFont}', sans-serif`,
                  fontWeight: 500,
                }}
              >
                {patternIdea
                  ? patternIdea.slice(0, 110) + (patternIdea.length > 110 ? "…" : "")
                  : "A signature mark, used as background, frame, and cropping device."}
              </p>
            </div>
          </motion.div>
        )}

        {/* ============ APPLIED-DESIGN MOCKUP GALLERY ============
            Five mockup tiles after the hero (slot 0). Each tile is sized
            to fit its image's aspect ratio (set during finalize via the
            MOCKUP_ASPECTS array in /brand and /campaign):
              brand:     [HERO 9:16] · SOCIAL 1:1 · POSTER 2:3 · OOH 16:9 · COLLATERAL 4:3 · PHOTOGRAPHY 1:1
              campaign:  [HERO 9:16] · SOCIAL 1:1 · STORY 9:16 · POSTER 2:3 · PHOTO 1:1 · OOH 16:9
            The slot array drives both the visual layout (grid span) AND
            the descriptive label, so adding/removing categories is one edit. */}
        {(kind === "campaign"
          ? [
              { idx: 1, label: "social post",       cols: 3, rows: 2, bg: "#1a1f28", inverted: false },
              { idx: 2, label: "story · reel",      cols: 3, rows: 3, bg: c2,        inverted: true },
              { idx: 3, label: "campaign poster",   cols: 6, rows: 3, bg: c1,        inverted: false },
              { idx: 4, label: "photo moodboard",   cols: 3, rows: 2, bg: "#0d0d0e", inverted: false },
              { idx: 5, label: "ooh · billboard",   cols: 6, rows: 2, bg: "#1a1f28", inverted: false },
            ]
          : [
              { idx: 1, label: "social",            cols: 3, rows: 2, bg: "#1a1f28", inverted: false },
              { idx: 2, label: "poster",            cols: 3, rows: 3, bg: c2,        inverted: true },
              { idx: 3, label: "ooh · billboard",   cols: 6, rows: 2, bg: c1,        inverted: false },
              { idx: 4, label: "brand collateral",  cols: 3, rows: 2, bg: "#0d0d0e", inverted: false },
              { idx: 5, label: "photography",       cols: 3, rows: 2, bg: "#1a1f28", inverted: false },
            ]
        ).map((slot, motionOffset) => (
          <motion.div
            key={`mockup-${slot.idx}`}
            {...tileMotion(9 + motionOffset)}
            className="rounded-lg overflow-hidden relative group"
            style={{
              background: slot.bg,
              gridColumn: `span ${slot.cols}`,
              gridRow: `span ${slot.rows}`,
              minHeight: slot.rows === 3 ? "420px" : slot.rows === 2 ? "280px" : "140px",
            }}
          >
            <MockupTile
              image={mockupImages[slot.idx]}
              regenerating={regenIdx === slot.idx}
              onRegen={onRegenMockup ? () => handleRegen(slot.idx) : undefined}
            />
            <p
              className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.22em] uppercase mix-blend-difference pointer-events-none"
              style={{ color: slot.inverted ? c0 : c2 }}
            >
              {String(slot.idx + 7).padStart(2, "0")} / applied · {slot.label}
            </p>
          </motion.div>
        ))}

        {/* ============ 12 / HEADLINES (campaign only) ============ */}
        {headlines && headlines.length > 0 && (
          <motion.div
            {...tileMotion(11)}
            className="rounded-lg p-6"
            style={{
              background: c1,
              color: contrast(c1),
              gridColumn: "span 4",
              gridRow: "span 2",
              minHeight: "240px",
            }}
          >
            <p
              className="font-mono text-[10px] tracking-[0.22em] uppercase mb-4 opacity-70"
              style={{ color: contrast(c1) }}
            >
              12 / messaging · headlines
            </p>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
              style={{ fontFamily: `'${displayFont}', serif` }}
            >
              {headlines.slice(0, 4).map((h, i) => (
                <p
                  key={i}
                  className="text-xl md:text-2xl leading-tight"
                  style={{ color: contrast(c1) }}
                >
                  <span className="opacity-50 mr-2 text-base">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {h}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* ============ 13 / CTA STRIP (campaign only) ============ */}
        {cta && (
          <motion.div
            {...tileMotion(12)}
            className="rounded-lg p-6 flex flex-col justify-between"
            style={{
              background: c3,
              color: contrast(c3),
              gridColumn: "span 2",
              gridRow: "span 2",
              minHeight: "240px",
            }}
          >
            <p
              className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-70"
              style={{ color: contrast(c3) }}
            >
              13 / call to action
            </p>
            <p
              className="text-3xl md:text-4xl tracking-tightest leading-none"
              style={{
                fontFamily: `'${displayFont}', serif`,
                color: contrast(c3),
              }}
            >
              {cta}
            </p>
            <p
              className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-50"
              style={{ color: contrast(c3) }}
            >
              primary cta · use on accent
            </p>
          </motion.div>
        )}

        {/* ============ 14 / CHANNEL IDEAS (campaign only) ============ */}
        {channelIdeas &&
          Object.entries(channelIdeas).filter(([, v]) => v && v.length > 0)
            .length > 0 && (
            <motion.div
              {...tileMotion(13)}
              className="rounded-lg p-6"
              style={{
                background: "#0d0d0e",
                border: "1px solid #1f2128",
                gridColumn: "span 6",
                gridRow: "span 2",
                minHeight: "220px",
              }}
            >
              <p className="eyebrow mb-5">14 / channels · activation ideas</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                {Object.entries(channelIdeas)
                  .filter(([, v]) => v && v.length > 0)
                  .slice(0, 6)
                  .map(([ch, idea]) => (
                    <div key={ch} className="border-t border-steel pt-3">
                      <p
                        className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2"
                        style={{ color: c1 }}
                      >
                        {ch}
                      </p>
                      <p className="text-sm leading-snug text-ash">{idea}</p>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

        {/* ============ 15 / DETAILS BAR ============ */}
        <motion.div
          {...tileMotion(14)}
          className="rounded-lg p-6 flex flex-wrap items-center justify-between gap-y-4"
          style={{
            background: c0,
            color: c2,
            gridColumn: "span 6",
            gridRow: "span 1",
            minHeight: "120px",
          }}
        >
          <DetailBlock label="archetypes" value={archetypeLabel} color={c2} accent={c1} />
          <DetailBlock label="tone" value={toneLabel || "—"} color={c2} accent={c1} />
          <DetailBlock
            label="display type"
            value={displayFont}
            color={c2}
            accent={c1}
          />
          <DetailBlock
            label="body type"
            value={bodyFont}
            color={c2}
            accent={c1}
          />
          <DetailBlock
            label="palette"
            value={palette?.name ?? "—"}
            color={c2}
            accent={c1}
          />
        </motion.div>

        {/* ============ 16 / MOODBOARD STRIP ============ */}
        <motion.div
          {...tileMotion(15)}
          className="rounded-lg overflow-hidden p-6"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 6",
            gridRow: "span 1",
            minHeight: "180px",
          }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <p className="eyebrow">16 / moodboard · directions considered</p>
            <p className="font-mono text-[10px] tracking-widest uppercase text-ash">
              reference, not final
            </p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 h-[90px]">
            {/* Concept thumbnails from step 6 (up to 3) */}
            {moodImages.slice(0, 3).map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`mood-img-${i}`}
                src={img}
                alt={`Mood ${i + 1}`}
                className="w-full h-full object-cover border border-steel"
              />
            ))}
            {/* Palette-derived gradient swatches to fill remaining slots */}
            {Array.from({ length: Math.max(0, 6 - moodImages.length) }).map(
              (_, i) => (
                <div
                  key={`mood-swatch-${i}`}
                  className="border border-steel"
                  style={{
                    background:
                      i === 0
                        ? `linear-gradient(135deg, ${c1}, ${c3})`
                        : i === 1
                        ? `linear-gradient(180deg, ${c0}, ${c2})`
                        : i === 2
                        ? c1
                        : i === 3
                        ? `linear-gradient(45deg, ${c3}, ${c1})`
                        : i === 4
                        ? c3
                        : `repeating-linear-gradient(45deg, ${c0}, ${c0} 6px, ${c2} 6px, ${c2} 8px)`,
                  }}
                />
              )
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ============================================================
// Sub-components
// ============================================================

function MockupTile({
  image,
  regenerating,
  onRegen,
}: {
  image?: string;
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
            Nano Banana 2
          </span>
        </div>
      )}
      {onRegen && !regenerating && (
        <button
          type="button"
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

function LogoVariant({
  background,
  accent,
  logo,
  label,
  textColor,
  outline,
}: {
  background: string;
  accent: string;
  logo?: string;
  label: string;
  textColor?: string;
  outline?: boolean;
}) {
  return (
    <div
      className="flex flex-col p-3 rounded relative"
      style={{
        background,
        border: outline ? `1px dashed ${accent}80` : `1px solid #1f2128`,
      }}
    >
      <div className="flex-1 flex items-center justify-center min-h-0">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt="Logo variant"
            className="max-w-[80%] max-h-full object-contain"
            style={
              outline
                ? { filter: "grayscale(1) invert(1) contrast(1.2)", opacity: 0.85 }
                : background === "transparent"
                ? { filter: "grayscale(1)" }
                : undefined
            }
          />
        ) : (
          <span
            className="font-mono text-[10px] tracking-widest uppercase"
            style={{ color: accent, opacity: 0.5 }}
          >
            no logo
          </span>
        )}
      </div>
      <p
        className="font-mono text-[9px] tracking-widest uppercase mt-2 text-center"
        style={{ color: textColor || (background === "transparent" ? "#6b6b73" : "#6b6b73") }}
      >
        {label}
      </p>
    </div>
  );
}

/**
 * Campaign-specific lockup: the campaign name set in the display font is the
 * campaign's "typography logo". This renders it on different surface
 * treatments — the campaign-equivalent of a brand's logo variation system.
 */
function WordmarkVariant({
  background,
  textColor,
  accent,
  text,
  font,
  label,
  outline,
}: {
  background: string;
  textColor: string;
  accent: string;
  text: string;
  font: string;
  label: string;
  outline?: boolean;
}) {
  // Auto-shrink long names so they fit the variant card width.
  const len = (text || "").length;
  const size = len > 14 ? 18 : len > 9 ? 22 : 28;
  return (
    <div
      className="flex flex-col p-3 rounded relative"
      style={{
        background: background === "transparent" ? "#0a0a0a" : background,
        border: outline ? `1px dashed ${accent}80` : `1px solid #1f2128`,
      }}
    >
      <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <span
          className="leading-none tracking-tightest text-center"
          style={{
            fontFamily: `'${font}', serif`,
            color: textColor,
            fontSize: size,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          {text}
          <span style={{ color: accent }}>.</span>
        </span>
      </div>
      <p
        className="font-mono text-[9px] tracking-widest uppercase mt-2 text-center"
        style={{ color: outline ? "#6b6b73" : "#6b6b73" }}
      >
        {label}
      </p>
    </div>
  );
}

function ColorCell({ hex, role }: { hex: string; role: string }) {
  const text = contrast(hex);
  return (
    <div
      className="flex flex-col justify-between p-3"
      style={{ background: hex, color: text }}
    >
      <p
        className="font-mono text-[9px] tracking-widest uppercase opacity-70"
        style={{ color: text }}
      >
        {role}
      </p>
      <p
        className="font-mono text-[10px] tracking-widest uppercase"
        style={{ color: text }}
      >
        {hex.toUpperCase()}
      </p>
    </div>
  );
}

function DetailBlock({
  label,
  value,
  color,
  accent,
}: {
  label: string;
  value: string;
  color: string;
  accent: string;
}) {
  return (
    <div className="min-w-[140px]">
      <p
        className="font-mono text-[9px] tracking-[0.22em] uppercase mb-1"
        style={{ color: accent }}
      >
        {label}
      </p>
      <p
        className="text-sm leading-tight max-w-[200px] truncate"
        style={{ color, opacity: 0.92 }}
      >
        {value || "—"}
      </p>
    </div>
  );
}

// ---------- Iconography ----------


// ---------- Principle icons (essence) ----------

function PrincipleIcon({ idx, color }: { idx: number; color: string }) {
  const sw = 1.8;
  if (idx === 0)
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={sw} strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  if (idx === 1)
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="3" fill={color} fillOpacity="0.85" />
      </svg>
    );
  if (idx === 2)
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={sw} strokeLinejoin="round">
        <path d="M12 2 C 14 7 19 11 19 16 a 7 7 0 0 1 -14 0 c 0 -5 5 -9 7 -14 z" />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={sw} strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ---------- Contrast utility ----------

function contrast(hex: string): string {
  const c = (hex || "").replace("#", "");
  if (c.length !== 6) return "#f4f0e6";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#0a0a0a" : "#f4f0e6";
}
