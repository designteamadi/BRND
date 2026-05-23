"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import Bento from "@/components/Bento";
import { useBRND } from "@/lib/store";
import { archetypeByKey } from "@/lib/archetypes";
import { languageNative } from "@/lib/languages";
import {
  downloadBrandPlaybook,
  downloadCampaignPlaybook,
} from "@/lib/playbook";
import type { MediaChannel } from "@/lib/types";

type Tab = "summary" | "visuals" | "brandbook" | "export";

export default function ResultPage() {
  const router = useRouter();
  const {
    generatedBrand,
    generatedCampaign,
    mode,
    reset,
    updateBrandMockup,
    updateCampaignMockup,
  } = useBRND();
  const [tab, setTab] = useState<Tab>("visuals");
  const [hydrated, setHydrated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!generatedBrand && !generatedCampaign) {
      router.replace("/");
    }
  }, [hydrated, generatedBrand, generatedCampaign, router]);

  if (!hydrated) return null;

  const g = generatedBrand;
  const c = generatedCampaign;
  const isCampaign = mode === "campaign" && c;
  if (!g && !c) return null;

  // Common derived — with defensive fallbacks for partially-malformed
  // generated data so the page never blanks out on a missing field.
  const name = isCampaign ? c!.input.brandName : g!.input.businessName;
  const archetypes = isCampaign ? c!.input.archetypes : g!.input.archetypes;
  const tone = isCampaign ? c!.input.toneKeywords : g!.input.toneKeywords;
  const palette = (isCampaign ? c!.selectedPalette : g!.selectedPalette) ?? {
    name: "—",
    hexes: ["#0a0a0a", "#c8ff3e", "#f5f0e8", "#ff3e8e"],
    rationale: "",
  };
  const type = (isCampaign ? c!.selectedType : g!.selectedType) ?? {
    display: "serif",
    body: "sans-serif",
    rationale: "",
  };
  const persona = (isCampaign ? c!.persona : g!.persona) ?? {
    name: name,
    description: "",
    traits: [],
  };
  const safeHexes =
    Array.isArray(palette.hexes) && palette.hexes.length >= 3
      ? palette.hexes
      : ["#0a0a0a", "#c8ff3e", "#f5f0e8", "#ff3e8e"];
  const mockups = isCampaign ? c!.mockupImages ?? [] : g!.mockupImages ?? [];
  const mockupPrompts = isCampaign
    ? c!.mockupPrompts ?? []
    : g!.mockupPrompts ?? [];
  const logoForComposite = isCampaign
    ? c!.input.logoDataUrl
    : g!.logoImageDataUrl;
  const tagline = g?.tagline;
  const story = g?.story;
  const patternIdea = g?.patternIdea;
  const headlines = c?.headlines;
  const cta = c?.cta;
  const channelIdeas = c?.channelIdeas;
  const language = isCampaign
    ? c!.input.outputLanguage
    : g!.input.outputLanguage;

  const archLabel = archetypes
    .map((a) => archetypeByKey(a).name)
    .join(" + ");

  const handleRegenMockup = async (idx: number) => {
    const prompt = mockupPrompts[idx];
    if (!prompt) return;
    const body = {
      prompt: logoForComposite
        ? `${prompt}\n\nIMPORTANT: Apply the brand logo from the provided image naturally onto the visible product/surface in this scene — preserve its proportions; match lighting and perspective.`
        : prompt,
      aspectRatio: idx === 0 ? ("9:16" as const) : ("1:1" as const),
      inputImages: logoForComposite ? [logoForComposite] : undefined,
    };
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const { dataUrl } = await res.json();
      if (dataUrl) {
        if (isCampaign) updateCampaignMockup(idx, dataUrl);
        else updateBrandMockup(idx, dataUrl);
      }
    } catch (err) {
      console.error("regen failed", err);
    }
  };

  const handleDownloadPlaybook = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      if (isCampaign && c) {
        await downloadCampaignPlaybook(c);
      } else if (g) {
        await downloadBrandPlaybook(g);
      }
    } catch (err) {
      console.error(err);
      setDownloadError(
        err instanceof Error ? err.message : "Couldn't build the playbook."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Top bar */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-steel/40 sticky top-0 bg-noir/85 backdrop-blur-md z-30">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.22em] uppercase link-underline"
        >
          BRND
        </Link>
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-ash">
          {isCampaign ? "Campaign" : "Brand"} · {languageNative(language)} · output
        </div>
        <button
          onClick={() => {
            reset();
            router.push("/");
          }}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-ash hover:text-bone transition-colors"
        >
          Start over →
        </button>
      </header>

      {/* Title block */}
      <section className="px-8 pt-16 pb-10 max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow mb-6"
        >
          <span className="text-spark">●</span> Ready ·{" "}
          {isCampaign ? "Campaign" : "Brand"} build complete
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="display text-6xl md:text-8xl mb-4"
        >
          Your {isCampaign ? "campaign" : "brand"} is ready,
          <br />
          <span className="text-spark italic">{name}.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-ash text-lg max-w-2xl"
        >
          {archLabel} · tone: {tone.join(", ") || "—"} · palette:{" "}
          {palette.name}
        </motion.p>

        {/* Top-level download CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <button
            onClick={handleDownloadPlaybook}
            disabled={downloading}
            className="btn"
          >
            {downloading
              ? "Building playbook…"
              : `Download ${isCampaign ? "campaign" : "brand"} playbook ↓`}
          </button>
          <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-ash">
            PDF + all assets · ZIP
          </span>
          {downloadError && (
            <span className="font-mono text-[11px] tracking-widest uppercase text-magenta">
              · {downloadError}
            </span>
          )}
        </motion.div>
      </section>

      {/* Tabs */}
      <section className="px-8 max-w-7xl mx-auto">
        <nav className="tabnav">
          <button
            aria-current={tab === "summary"}
            onClick={() => setTab("summary")}
          >
            Summary
          </button>
          <button
            aria-current={tab === "visuals"}
            onClick={() => setTab("visuals")}
          >
            Visuals
          </button>
          <button
            aria-current={tab === "brandbook"}
            onClick={() => setTab("brandbook")}
          >
            Brand book
          </button>
          <button
            aria-current={tab === "export"}
            onClick={() => setTab("export")}
          >
            Export
          </button>
        </nav>
      </section>

      {/* Content */}
      <section className="px-8 max-w-7xl mx-auto mt-8">
        {tab === "visuals" && (
          <Bento
            kind={isCampaign ? "campaign" : "brand"}
            name={name}
            archetypeLabel={archLabel}
            toneLabel={tone.join(", ") || "—"}
            palette={palette}
            type={type}
            persona={persona}
            tagline={tagline}
            story={story}
            mockupImages={mockups}
            mockupPrompts={mockupPrompts}
            patternIdea={patternIdea}
            headlines={headlines}
            cta={cta}
            logoDataUrl={logoForComposite}
            onRegenMockup={handleRegenMockup}
          />
        )}

        {tab === "summary" && (
          <div className="grid md:grid-cols-2 gap-10 stagger">
            <DetailBlock label="Name" value={name} />
            <DetailBlock label="Language" value={languageNative(language)} />
            <DetailBlock label="Archetypes" value={archLabel} />
            <DetailBlock label="Tone" value={tone.join(" · ") || "—"} />
            <DetailBlock
              label="Palette"
              value={`${palette.name} — ${palette.rationale}`}
            />
            <DetailBlock
              label="Typography"
              value={`${type.display} / ${type.body} — ${type.rationale}`}
            />
            <DetailBlock
              label="Persona"
              value={`${persona.name} — ${persona.description}`}
            />
            {tagline && <DetailBlock label="Tagline" value={tagline} />}
            {story && <DetailBlock label="Story" value={story} />}
            {patternIdea && <DetailBlock label="Pattern" value={patternIdea} />}
            {cta && <DetailBlock label="Campaign CTA" value={cta} />}
            {headlines && headlines.length > 0 && (
              <DetailBlock
                label="Headlines"
                value={headlines.map((h) => `· ${h}`).join("\n")}
              />
            )}
            {channelIdeas && (
              <DetailBlock
                label="Channel ideas"
                value={Object.entries(channelIdeas)
                  .filter(([, v]) => v && v.length > 0)
                  .map(
                    ([k, v]) =>
                      `${(k as MediaChannel).toUpperCase()} — ${v}`
                  )
                  .join("\n\n")}
              />
            )}
          </div>
        )}

        {tab === "brandbook" && (
          <div className="space-y-8 max-w-3xl">
            <p className="text-ash leading-relaxed">
              A one-glance summary. The full multi-page version with every
              applied visual is in the playbook ZIP.
            </p>
            <div
              className="p-10 rounded-lg"
              style={{
                background: safeHexes[0],
                color: safeHexes[2],
              }}
            >
              <p
                className="eyebrow mb-6"
                style={{ color: safeHexes[1] }}
              >
                {name} · brand book v0.1
              </p>
              <p
                className="text-6xl tracking-tightest mb-6"
                style={{
                  fontFamily: `'${type.display}', serif`,
                  color: safeHexes[2],
                }}
              >
                {tagline ?? cta ?? name}
              </p>
              <p
                className="leading-relaxed max-w-xl"
                style={{
                  fontFamily: `'${type.body}', sans-serif`,
                  color: safeHexes[2],
                  opacity: 0.85,
                }}
              >
                {story ?? persona.description}
              </p>
              <div className="flex gap-2 mt-8">
                {safeHexes.map((h) => (
                  <div
                    key={h}
                    className="w-10 h-10"
                    style={{
                      background: h,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleDownloadPlaybook}
              disabled={downloading}
              className="btn"
            >
              {downloading ? "Building…" : "Download full playbook ↓"}
            </button>
          </div>
        )}

        {tab === "export" && (
          <div className="max-w-2xl space-y-8">
            <div>
              <p className="eyebrow mb-3">Complete playbook</p>
              <p className="text-ash leading-relaxed mb-4">
                PDF + every visual asset + color tokens (CSS & JSON) + typography
                reference + the raw data dump for re-importing later.
              </p>
              <button
                onClick={handleDownloadPlaybook}
                disabled={downloading}
                className="btn"
              >
                {downloading ? "Building…" : "Download playbook ZIP ↓"}
              </button>
            </div>

            <div className="border-t border-steel pt-8">
              <p className="eyebrow mb-3">Raw data only</p>
              <p className="text-ash leading-relaxed mb-4">
                Just the JSON — useful for re-importing into BRND later or
                feeding into other tooling.
              </p>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  const payload = isCampaign ? c! : g!;
                  const blob = new Blob(
                    [JSON.stringify(payload, null, 2)],
                    { type: "application/json" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}-${
                    isCampaign ? "campaign" : "brand"
                  }.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download JSON ↓
              </button>
            </div>

            <div className="border-t border-steel pt-8">
              <p className="eyebrow mb-3">Print this page</p>
              <p className="text-ash leading-relaxed mb-4">
                For a quick paper copy of the on-screen layout.
              </p>
              <button
                className="btn btn-ghost"
                onClick={() => window.print()}
              >
                Print ↗
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="px-8 mt-16 pt-8 border-t border-steel/40 max-w-7xl mx-auto flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ash">
          {mockups.filter(Boolean).length + 1} assets · hover any mockup to
          regenerate
        </p>
        <Link
          href={isCampaign ? "/campaign" : "/brand"}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-spark hover:text-bone transition-colors"
        >
          ← Refine inputs
        </Link>
      </footer>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-steel pt-5">
      <p className="eyebrow mb-3">{label}</p>
      <p className="text-bone leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  );
}
