"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepShell from "@/components/StepShell";
import ArchetypePicker from "@/components/ArchetypePicker";
import TonePicker from "@/components/TonePicker";
import LogoStylePicker from "@/components/LogoStylePicker";
import LanguagePicker from "@/components/LanguagePicker";
import PalettePicker from "@/components/PalettePicker";
import TypePicker from "@/components/TypePicker";
import { useBRND } from "@/lib/store";
import { archetypeByKey } from "@/lib/archetypes";
import type {
  ColorPalette,
  TypePairing,
  Persona,
  GeneratedBrand,
} from "@/lib/types";

const TOTAL = 8;

type Suggestions = {
  palettes: ColorPalette[];
  typography: TypePairing[];
  taglines: string[];
  story: string;
  patternIdea: string;
  conceptThumbnailPrompts: string[];
  mockupPrompts: string[];
};

export default function BrandFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<TypePairing | null>(null);

  const {
    brand,
    setBrand,
    toggleBrandArchetype,
    toggleBrandTone,
    setLogoStyle,
    setBrandLanguage,
    setMode,
    setGeneratedBrand,
  } = useBRND();

  const next = () => setStep((s) => Math.min(TOTAL, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  // Fetch text reasoning on the way into step 6 (palette)
  const fetchSuggestions = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "brand-suggestions", input: brand }),
      });
      const { data } = (await res.json()) as { data: Suggestions };
      setSuggestions(data);
      setSelectedPalette(data.palettes?.[0] ?? null);
      setSelectedType(data.typography?.[0] ?? null);
    } finally {
      setBusy(false);
    }
  };

  // Once suggestions land, kick off concept thumbnail generation in parallel
  useEffect(() => {
    if (!suggestions || !suggestions.conceptThumbnailPrompts) return;
    if (suggestions.palettes.every((p) => p.conceptImageDataUrl)) return;

    setThumbnailsLoading(true);
    const prompts = suggestions.conceptThumbnailPrompts.slice(0, 3);

    Promise.all(
      prompts.map((p) =>
        fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: p, aspectRatio: "4:5" }),
        })
          .then((r) => r.json())
          .catch(() => ({ dataUrl: undefined }))
      )
    )
      .then((results) => {
        setSuggestions((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            palettes: prev.palettes.map((p, i) => ({
              ...p,
              conceptImageDataUrl:
                results[i]?.dataUrl ?? p.conceptImageDataUrl,
            })),
          };
        });
      })
      .finally(() => setThumbnailsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions?.conceptThumbnailPrompts?.join("|")]);

  const finalize = async () => {
    if (!selectedPalette || !selectedType || !suggestions) return;
    setBusy(true);
    setMode("brand");
    try {
      // 1. Persona
      const personaRes = await fetch("/api/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "brand-persona",
          input: brand,
          palette: selectedPalette,
        }),
      });
      const personaJson = await personaRes.json();
      const persona = personaJson.data as Persona;

      // 2. Logo
      const logoPrompt = `Studio brand logo for "${brand.businessName}". Style: ${brand.logoStyle}. ${brand.logoPrompt}. Clean, modern, on a plain background, suitable as a brand mark. Premium feel.`;
      const logoRes = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: logoPrompt, aspectRatio: "1:1" }),
      }).then((r) => r.json());

      // 3. Mockups in parallel — with logo compositing once logo exists
      const mockupPrompts = (suggestions.mockupPrompts || []).slice(0, 3);
      const logoForComposite = logoRes?.dataUrl;
      const imgResults = await Promise.all(
        mockupPrompts.map((p, i) =>
          fetch("/api/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: logoForComposite
                ? `${p}\n\nIMPORTANT: Apply the brand logo from the provided image naturally onto the visible product/surface/sign in this scene — preserve its proportions; match the lighting and perspective.`
                : p,
              aspectRatio: i === 0 ? "9:16" : "1:1",
              inputImages: logoForComposite ? [logoForComposite] : undefined,
            }),
          }).then((r) => r.json())
        )
      );

      const generated: GeneratedBrand = {
        input: brand,
        logoImageDataUrl: logoRes?.dataUrl,
        logoPrompt,
        palettes: suggestions.palettes,
        selectedPalette,
        typography: suggestions.typography,
        selectedType,
        persona,
        tagline: suggestions.taglines?.[0] ?? "",
        story: suggestions.story ?? "",
        patternIdea: suggestions.patternIdea ?? "",
        mockupPrompts,
        mockupImages: imgResults.map((r) => r?.dataUrl),
      };
      setGeneratedBrand(generated);
      router.push("/result");
    } finally {
      setBusy(false);
    }
  };

  // ---------- step 1 — language ----------
  if (step === 1) {
    return (
      <StepShell
        flowLabel="Brand"
        step={1}
        total={TOTAL}
        eyebrow="01 — language"
        title={
          <>
            What language should
            <br />
            the <span className="italic text-spark">copy</span> be in?
          </>
        }
        subtitle="Taglines, headlines, story, persona — everything written, generated in your language."
        onNext={next}
      >
        <LanguagePicker value={brand.outputLanguage} onChange={setBrandLanguage} />
      </StepShell>
    );
  }

  // ---------- step 2 — basics ----------
  if (step === 2) {
    const valid =
      brand.businessName.trim() &&
      brand.industry.trim() &&
      brand.description.trim();
    return (
      <StepShell
        flowLabel="Brand"
        step={2}
        total={TOTAL}
        eyebrow="02 — business basics"
        title={
          <>
            What are we
            <br />
            <span className="italic text-spark">building?</span>
          </>
        }
        subtitle="Plain words beat clever ones — the model reasons better from honest inputs."
        nextDisabled={!valid}
        onNext={next}
        onBack={back}
      >
        <div className="space-y-10 max-w-2xl">
          <div>
            <p className="eyebrow mb-3">Business name</p>
            <input
              className="field"
              value={brand.businessName}
              onChange={(e) => setBrand({ businessName: e.target.value })}
              placeholder="Roam"
              autoFocus
            />
          </div>
          <div>
            <p className="eyebrow mb-3">Industry</p>
            <input
              className="field field-sm"
              value={brand.industry}
              onChange={(e) => setBrand({ industry: e.target.value })}
              placeholder="Outdoor gear · Hospitality · Fintech · …"
            />
          </div>
          <div>
            <p className="eyebrow mb-3">What does the business do?</p>
            <textarea
              className="field field-sm"
              value={brand.description}
              onChange={(e) => setBrand({ description: e.target.value })}
              placeholder="One or two sentences. What you make, who it's for."
              rows={3}
            />
          </div>
        </div>
      </StepShell>
    );
  }

  // ---------- step 3 — audience & mission ----------
  if (step === 3) {
    const valid = brand.targetAudience.trim() && brand.mission.trim();
    return (
      <StepShell
        flowLabel="Brand"
        step={3}
        total={TOTAL}
        eyebrow="03 — audience & mission"
        title={
          <>
            Who is it
            <br />
            <span className="italic text-spark">for?</span>
          </>
        }
        subtitle="Specifics over demographics."
        nextDisabled={!valid}
        onNext={next}
        onBack={back}
      >
        <div className="space-y-10 max-w-2xl">
          <div>
            <p className="eyebrow mb-3">Target audience</p>
            <textarea
              className="field field-sm"
              value={brand.targetAudience}
              onChange={(e) => setBrand({ targetAudience: e.target.value })}
              placeholder="Be specific. What do they already love, hate, want?"
              rows={3}
            />
          </div>
          <div>
            <p className="eyebrow mb-3">Mission — why does this exist?</p>
            <textarea
              className="field field-sm"
              value={brand.mission}
              onChange={(e) => setBrand({ mission: e.target.value })}
              placeholder="The thing the world is missing that this fixes."
              rows={3}
            />
          </div>
        </div>
      </StepShell>
    );
  }

  // ---------- step 4 — archetype & tone ----------
  if (step === 4) {
    return (
      <StepShell
        flowLabel="Brand"
        step={4}
        total={TOTAL}
        eyebrow="04 — archetype & voice"
        title={
          <>
            How does it
            <br />
            <span className="italic text-spark">speak?</span>
          </>
        }
        subtitle="Pick your archetype mix (one or two), then add tone words."
        nextDisabled={brand.archetypes.length === 0}
        onNext={next}
        onBack={back}
      >
        <div className="space-y-12">
          <ArchetypePicker
            selected={brand.archetypes}
            onToggle={toggleBrandArchetype}
          />
          <div className="border-t border-steel pt-8">
            <TonePicker
              selected={brand.toneKeywords}
              onToggle={toggleBrandTone}
            />
          </div>
        </div>
      </StepShell>
    );
  }

  // ---------- step 5 — logo ----------
  if (step === 5) {
    const valid = brand.logoPrompt.trim().length > 5;
    return (
      <StepShell
        flowLabel="Brand"
        step={5}
        total={TOTAL}
        eyebrow="05 — logo direction"
        title={
          <>
            What should the
            <br />
            <span className="italic text-spark">mark</span> look like?
          </>
        }
        subtitle="Pick a logo type, then describe the feeling. Nano Banana takes it from there."
        nextDisabled={!valid}
        onNext={async () => {
          await fetchSuggestions();
          next();
        }}
        onBack={back}
        busy={busy}
        nextLabel={busy ? "Reasoning…" : "Continue"}
      >
        <div className="space-y-10">
          <LogoStylePicker
            selected={brand.logoStyle}
            onSelect={setLogoStyle}
          />
          <div>
            <p className="eyebrow mb-3">Describe the look</p>
            <textarea
              className="field field-sm"
              value={brand.logoPrompt}
              onChange={(e) => setBrand({ logoPrompt: e.target.value })}
              placeholder="Sharp, minimal, a single geometric peak. No serifs. Charcoal on bone."
              rows={3}
            />
          </div>
        </div>
      </StepShell>
    );
  }

  // ---------- step 6 — palette + concept thumbnails ----------
  if (step === 6) {
    return (
      <StepShell
        flowLabel="Brand"
        step={6}
        total={TOTAL}
        eyebrow="06 — direction & palette"
        title={
          <>
            Three directions,
            <br />
            <span className="italic text-spark">pick one.</span>
          </>
        }
        subtitle={
          suggestions
            ? "Each direction comes with a generated concept thumbnail so you can see the mood before committing."
            : "Generating directions…"
        }
        nextDisabled={!selectedPalette}
        onNext={next}
        onBack={back}
      >
        {suggestions ? (
          <PalettePicker
            options={suggestions.palettes}
            selected={selectedPalette ?? undefined}
            onSelect={setSelectedPalette}
            thumbnailsLoading={thumbnailsLoading}
          />
        ) : (
          <div className="text-ash font-mono text-sm">Loading…</div>
        )}
      </StepShell>
    );
  }

  // ---------- step 7 — typography ----------
  if (step === 7) {
    return (
      <StepShell
        flowLabel="Brand"
        step={7}
        total={TOTAL}
        eyebrow="07 — typography"
        title={
          <>
            Pair the
            <br />
            <span className="italic text-spark">letters.</span>
          </>
        }
        subtitle="Display + body. Currently-available Google Fonts only."
        nextDisabled={!selectedType}
        onNext={next}
        onBack={back}
      >
        {suggestions ? (
          <TypePicker
            options={suggestions.typography}
            selected={selectedType ?? undefined}
            onSelect={setSelectedType}
          />
        ) : (
          <div className="text-ash font-mono text-sm">Loading…</div>
        )}
      </StepShell>
    );
  }

  // ---------- step 8 — review & generate ----------
  const archLabel = brand.archetypes
    .map((a) => archetypeByKey(a).name)
    .join(" + ");
  return (
    <StepShell
      flowLabel="Brand"
      step={8}
      total={TOTAL}
      eyebrow="08 — review & generate"
      title={
        <>
          Ready to
          <br />
          <span className="italic text-spark">build.</span>
        </>
      }
      subtitle="We'll generate the logo first, then composite it onto your mockups so the brand applies consistently."
      onNext={finalize}
      onBack={back}
      nextLabel={busy ? "Generating bento…" : "Generate bento →"}
      busy={busy}
    >
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
        <SummaryRow label="Language" value={brand.outputLanguage.toUpperCase()} />
        <SummaryRow label="Name" value={brand.businessName} />
        <SummaryRow label="Industry" value={brand.industry} />
        <SummaryRow label="Audience" value={brand.targetAudience} />
        <SummaryRow label="Mission" value={brand.mission} />
        <SummaryRow label="Archetypes" value={archLabel} />
        <SummaryRow
          label="Tone"
          value={brand.toneKeywords.join(", ") || "—"}
        />
        <SummaryRow label="Logo style" value={brand.logoStyle} />
        <SummaryRow
          label="Palette"
          value={selectedPalette?.name ?? "—"}
          swatches={selectedPalette?.hexes}
        />
        <SummaryRow
          label="Type"
          value={
            selectedType
              ? `${selectedType.display} / ${selectedType.body}`
              : "—"
          }
        />
      </div>
    </StepShell>
  );
}

function SummaryRow({
  label,
  value,
  swatches,
}: {
  label: string;
  value: string;
  swatches?: string[];
}) {
  return (
    <div className="border-t border-steel pt-4">
      <p className="eyebrow mb-2">{label}</p>
      <p className="text-bone text-lg leading-snug">{value || "—"}</p>
      {swatches && (
        <div className="flex gap-1 mt-3">
          {swatches.map((h) => (
            <div
              key={h}
              className="w-8 h-8 border border-steel"
              style={{ background: h }}
              title={h}
            />
          ))}
        </div>
      )}
    </div>
  );
}
