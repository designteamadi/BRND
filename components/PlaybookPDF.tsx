"use client";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import type {
  GeneratedBrand,
  GeneratedCampaign,
  ColorPalette,
  TypePairing,
  Persona,
  MediaChannel,
} from "@/lib/types";
import { archetypeByKey } from "@/lib/archetypes";

// Register a serif + sans for the PDF — Google Fonts URLs
Font.register({
  family: "Instrument Serif",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/instrumentserif/v4/jizDREVItHgc8qDIbSTKq4XKVjGV1bm-jvgjhA.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/instrumentserif/v4/jizGREVItHgc8qDIbSTKq4XKVjPdL1xkv4HQjBg.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7.ttf",
      fontWeight: 500,
    },
  ],
});

const COLORS = {
  noir: "#070707",
  ink: "#0d0d0e",
  steel: "#1f2128",
  ash: "#6b6b73",
  bone: "#f4f0e6",
  spark: "#c8ff3e",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.noir,
    color: COLORS.bone,
    fontFamily: "Inter",
    padding: 56,
    fontSize: 10,
  },
  pageWhite: {
    backgroundColor: COLORS.bone,
    color: COLORS.noir,
    fontFamily: "Inter",
    padding: 56,
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLORS.ash,
    marginBottom: 40,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLORS.ash,
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLORS.ash,
    marginBottom: 14,
  },
  eyebrowAccent: {
    color: COLORS.spark,
  },
  hero: {
    fontFamily: "Instrument Serif",
    fontSize: 72,
    lineHeight: 0.95,
    marginBottom: 14,
  },
  heroItalic: {
    fontFamily: "Instrument Serif",
    fontStyle: "italic",
    color: COLORS.spark,
  },
  sectionTitle: {
    fontFamily: "Instrument Serif",
    fontSize: 38,
    lineHeight: 1,
    marginBottom: 26,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.55,
    color: COLORS.bone,
    marginBottom: 12,
  },
  bodyMuted: {
    fontSize: 10,
    lineHeight: 1.55,
    color: COLORS.ash,
  },
  caption: {
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: COLORS.ash,
    marginTop: 6,
  },
  divider: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.steel,
    marginVertical: 18,
  },
  row: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  swatchRow: { flexDirection: "row", marginVertical: 14 },
  swatch: { flex: 1, height: 90, justifyContent: "flex-end", padding: 8 },
  swatchHex: { fontSize: 8, letterSpacing: 1, textTransform: "uppercase" },
  bigImage: { width: "100%", height: 420, objectFit: "cover" },
  squareImage: { width: "100%", height: 240, objectFit: "cover" },
  tag: {
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLORS.spark,
    borderWidth: 0.5,
    borderColor: COLORS.spark,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
});

// Helpers
const contrastOn = (hex: string): string => {
  const c = (hex || "").replace("#", "");
  if (c.length !== 6) return "#f4f0e6";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#0a0a0a" : "#f4f0e6";
};

type CommonProps = {
  name: string;
  archetypes: string;
  tone: string;
  palette: ColorPalette;
  type: TypePairing;
  persona: Persona;
  mockupImages: (string | undefined)[];
  logoImageDataUrl?: string;
  language: string;
};

type BrandPlaybookProps = CommonProps & {
  kind: "brand";
  industry: string;
  description: string;
  audience: string;
  mission: string;
  tagline: string;
  story: string;
  patternIdea: string;
};

type CampaignPlaybookProps = CommonProps & {
  kind: "campaign";
  brandDescription: string;
  campaignName: string;
  campaignPurpose: string;
  campaignStory: string;
  targetMarket: string;
  channels: MediaChannel[];
  headlines: string[];
  cta: string;
  channelIdeas: Record<MediaChannel, string>;
};

export function BrandPlaybook(props: BrandPlaybookProps) {
  return (
    <Document
      title={`${props.name} — Brand Playbook`}
      author="BRND"
      subject="Brand Playbook"
    >
      {/* Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>BRND / brand playbook</Text>
          <Text>v0.1 · {props.language}</Text>
        </View>
        <View style={{ marginTop: 80 }}>
          <Text style={styles.eyebrow}>— ready ●</Text>
          <Text style={styles.hero}>
            {props.name}
            <Text style={styles.heroItalic}>.</Text>
          </Text>
          {props.tagline ? (
            <Text style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 28, marginTop: 14, color: COLORS.ash }}>
              {props.tagline}
            </Text>
          ) : null}
        </View>
        <View style={{ position: "absolute", bottom: 56, left: 56, right: 56 }}>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>archetypes</Text>
              <Text style={styles.body}>{props.archetypes}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>industry</Text>
              <Text style={styles.body}>{props.industry || "—"}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>palette</Text>
              <Text style={styles.body}>{props.palette.name}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Essence */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{props.name} / essence</Text>
          <Text>01</Text>
        </View>
        <Text style={styles.sectionTitle}>Essence.</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>what we do</Text>
            <Text style={styles.body}>{props.description}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>who it's for</Text>
            <Text style={styles.body}>{props.audience}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.eyebrow}>mission</Text>
        <Text style={styles.body}>{props.mission}</Text>
        <View style={styles.divider} />
        <Text style={styles.eyebrow}>tone</Text>
        <Text style={styles.body}>{props.tone}</Text>
        <View style={styles.divider} />
        <Text style={styles.eyebrow}>story</Text>
        <Text style={styles.body}>{props.story}</Text>
        <View style={styles.footer}>
          <Text>{props.name}</Text>
          <Text>brand playbook · 01</Text>
        </View>
      </Page>

      {/* Logo */}
      {props.logoImageDataUrl && (
        <Page size="A4" style={styles.pageWhite}>
          <View style={[styles.header, { color: COLORS.ash }]}>
            <Text>{props.name} / lockup</Text>
            <Text>02</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: COLORS.noir }]}>The mark.</Text>
          <View style={{ alignItems: "center", justifyContent: "center", height: 380, marginTop: 30 }}>
            <Image src={props.logoImageDataUrl} style={{ maxWidth: "60%", maxHeight: "100%", objectFit: "contain" }} />
          </View>
          <Text style={{ fontSize: 9, color: COLORS.ash, textAlign: "center", marginTop: 20 }}>
            Logo style: {props.industry ? props.industry + " · " : ""}generated by Nano Banana
          </Text>
          <View style={[styles.footer, { color: COLORS.ash }]}>
            <Text>{props.name}</Text>
            <Text>brand playbook · 02</Text>
          </View>
        </Page>
      )}

      {/* Colors */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{props.name} / colors</Text>
          <Text>03</Text>
        </View>
        <Text style={styles.sectionTitle}>{props.palette.name}.</Text>
        <Text style={[styles.body, { marginBottom: 30 }]}>{props.palette.rationale}</Text>
        <View style={styles.swatchRow}>
          {props.palette.hexes.map((h) => (
            <View key={h} style={[styles.swatch, { backgroundColor: h }]}>
              <Text style={[styles.swatchHex, { color: contrastOn(h) }]}>{h}</Text>
            </View>
          ))}
        </View>
        <View style={styles.divider} />
        <Text style={styles.eyebrow}>usage</Text>
        <Text style={styles.body}>
          Reserve {props.palette.hexes[1]} as the signature accent — use sparingly, with conviction. {props.palette.hexes[0]} carries the foundational surfaces; {props.palette.hexes[2]} earns the negative space; {props.palette.hexes[3]} is a punctuation, not a paragraph.
        </Text>
        <View style={styles.footer}>
          <Text>{props.name}</Text>
          <Text>brand playbook · 03</Text>
        </View>
      </Page>

      {/* Type */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{props.name} / type</Text>
          <Text>04</Text>
        </View>
        <Text style={styles.sectionTitle}>Type system.</Text>
        <Text style={[styles.body, { marginBottom: 30 }]}>{props.type.rationale}</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>display · {props.type.display}</Text>
            <Text style={{ fontFamily: "Instrument Serif", fontSize: 80, lineHeight: 0.95, marginTop: 8 }}>Aa Rr</Text>
            <Text style={{ fontFamily: "Instrument Serif", fontSize: 40, lineHeight: 1.05, marginTop: 4 }}>0–9 ! ?</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>body · {props.type.body}</Text>
            <Text style={{ fontFamily: "Inter", fontSize: 11, lineHeight: 1.6, marginTop: 8 }}>
              {props.story.slice(0, 480)}…
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text>{props.name}</Text>
          <Text>brand playbook · 04</Text>
        </View>
      </Page>

      {/* Persona */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{props.name} / persona</Text>
          <Text>05</Text>
        </View>
        <Text style={styles.sectionTitle}>{props.persona.name}.</Text>
        <Text style={styles.body}>{props.persona.description}</Text>
        <View style={styles.tagsWrap}>
          {props.persona.traits.map((t) => (
            <Text key={t} style={styles.tag}>
              {t}
            </Text>
          ))}
        </View>
        <View style={styles.divider} />
        <Text style={styles.eyebrow}>signature pattern</Text>
        <Text style={styles.body}>{props.patternIdea}</Text>
        <View style={styles.footer}>
          <Text>{props.name}</Text>
          <Text>brand playbook · 05</Text>
        </View>
      </Page>

      {/* Mockups */}
      {props.mockupImages.filter(Boolean).map((img, i) => (
        <Page key={i} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text>{props.name} / mockup {String(i + 1).padStart(2, "0")}</Text>
            <Text>0{6 + i}</Text>
          </View>
          <Text style={styles.sectionTitle}>In context.</Text>
          {img && <Image src={img} style={styles.bigImage} />}
          <View style={styles.footer}>
            <Text>{props.name}</Text>
            <Text>brand playbook · 0{6 + i}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}

export function CampaignPlaybook(props: CampaignPlaybookProps) {
  return (
    <Document
      title={`${props.name} — Campaign Playbook`}
      author="BRND"
      subject="Campaign Playbook"
    >
      {/* Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>BRND / campaign playbook</Text>
          <Text>v0.1 · {props.language}</Text>
        </View>
        <View style={{ marginTop: 80 }}>
          <Text style={styles.eyebrow}>— campaign ●</Text>
          <Text style={styles.hero}>
            {props.campaignName}
            <Text style={styles.heroItalic}>.</Text>
          </Text>
          <Text style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 22, marginTop: 14, color: COLORS.ash }}>
            for {props.name}
          </Text>
        </View>
        <View style={{ position: "absolute", bottom: 56, left: 56, right: 56 }}>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>archetypes</Text>
              <Text style={styles.body}>{props.archetypes}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>palette</Text>
              <Text style={styles.body}>{props.palette.name}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>channels</Text>
              <Text style={styles.body}>{props.channels.join(" · ")}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Brief */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{props.campaignName} / brief</Text>
          <Text>01</Text>
        </View>
        <Text style={styles.sectionTitle}>The brief.</Text>
        <Text style={styles.eyebrow}>brand</Text>
        <Text style={styles.body}>{props.brandDescription}</Text>
        <View style={styles.divider} />
        <Text style={styles.eyebrow}>purpose</Text>
        <Text style={styles.body}>{props.campaignPurpose}</Text>
        <View style={styles.divider} />
        <Text style={styles.eyebrow}>story</Text>
        <Text style={styles.body}>{props.campaignStory}</Text>
        <View style={styles.divider} />
        <Text style={styles.eyebrow}>target</Text>
        <Text style={styles.body}>{props.targetMarket}</Text>
        <View style={styles.footer}>
          <Text>{props.campaignName}</Text>
          <Text>campaign playbook · 01</Text>
        </View>
      </Page>

      {/* Voice */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{props.campaignName} / voice</Text>
          <Text>02</Text>
        </View>
        <Text style={styles.sectionTitle}>Voice.</Text>
        <Text style={[styles.eyebrow, styles.eyebrowAccent]}>{props.persona.name}</Text>
        <Text style={styles.body}>{props.persona.description}</Text>
        <View style={styles.tagsWrap}>
          {props.persona.traits.map((t) => (
            <Text key={t} style={styles.tag}>{t}</Text>
          ))}
        </View>
        <View style={styles.divider} />
        <Text style={styles.eyebrow}>tone</Text>
        <Text style={styles.body}>{props.tone}</Text>
        <View style={styles.footer}>
          <Text>{props.campaignName}</Text>
          <Text>campaign playbook · 02</Text>
        </View>
      </Page>

      {/* Headlines */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{props.campaignName} / messaging</Text>
          <Text>03</Text>
        </View>
        <Text style={styles.sectionTitle}>Headlines.</Text>
        {props.headlines.map((h, i) => (
          <Text
            key={i}
            style={{
              fontFamily: "Instrument Serif",
              fontSize: 30,
              lineHeight: 1.1,
              marginBottom: 14,
              color: i === 0 ? COLORS.spark : COLORS.bone,
            }}
          >
            {h}
          </Text>
        ))}
        <View style={styles.divider} />
        <Text style={styles.eyebrow}>cta</Text>
        <Text style={{ fontFamily: "Instrument Serif", fontSize: 38, color: COLORS.spark, marginTop: 6 }}>
          {props.cta}
        </Text>
        <View style={styles.footer}>
          <Text>{props.campaignName}</Text>
          <Text>campaign playbook · 03</Text>
        </View>
      </Page>

      {/* Colors */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{props.campaignName} / colors</Text>
          <Text>04</Text>
        </View>
        <Text style={styles.sectionTitle}>{props.palette.name}.</Text>
        <Text style={[styles.body, { marginBottom: 30 }]}>{props.palette.rationale}</Text>
        <View style={styles.swatchRow}>
          {props.palette.hexes.map((h) => (
            <View key={h} style={[styles.swatch, { backgroundColor: h }]}>
              <Text style={[styles.swatchHex, { color: contrastOn(h) }]}>{h}</Text>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Text>{props.campaignName}</Text>
          <Text>campaign playbook · 04</Text>
        </View>
      </Page>

      {/* Type */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{props.campaignName} / type</Text>
          <Text>05</Text>
        </View>
        <Text style={styles.sectionTitle}>Type.</Text>
        <Text style={[styles.body, { marginBottom: 30 }]}>{props.type.rationale}</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>display · {props.type.display}</Text>
            <Text style={{ fontFamily: "Instrument Serif", fontSize: 80, lineHeight: 0.95, marginTop: 8 }}>Aa Rr</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>body · {props.type.body}</Text>
            <Text style={{ fontFamily: "Inter", fontSize: 11, lineHeight: 1.6, marginTop: 8 }}>
              {props.persona.description}
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text>{props.campaignName}</Text>
          <Text>campaign playbook · 05</Text>
        </View>
      </Page>

      {/* Channels */}
      {Object.entries(props.channelIdeas).filter(([, v]) => v).length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text>{props.campaignName} / channels</Text>
            <Text>06</Text>
          </View>
          <Text style={styles.sectionTitle}>Channels.</Text>
          {Object.entries(props.channelIdeas)
            .filter(([, v]) => v && v.length > 0)
            .map(([ch, idea]) => (
              <View key={ch} style={{ marginBottom: 22 }}>
                <Text style={[styles.eyebrow, styles.eyebrowAccent]}>{ch.toUpperCase()}</Text>
                <Text style={styles.body}>{idea}</Text>
              </View>
            ))}
          <View style={styles.footer}>
            <Text>{props.campaignName}</Text>
            <Text>campaign playbook · 06</Text>
          </View>
        </Page>
      )}

      {/* Visuals */}
      {props.mockupImages.filter(Boolean).map((img, i) => (
        <Page key={i} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text>{props.campaignName} / visual {String(i + 1).padStart(2, "0")}</Text>
            <Text>0{7 + i}</Text>
          </View>
          <Text style={styles.sectionTitle}>Visual.</Text>
          {img && <Image src={img} style={styles.bigImage} />}
          <View style={styles.footer}>
            <Text>{props.campaignName}</Text>
            <Text>campaign playbook · 0{7 + i}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}

/** Helper to map archetype keys to display labels */
export const archetypesToLabel = (keys: string[]) =>
  keys
    .map((k) => {
      try {
        return archetypeByKey(k as never).name;
      } catch {
        return k;
      }
    })
    .join(" + ");

export function buildBrandPlaybook(g: GeneratedBrand, languageNative: string) {
  return (
    <BrandPlaybook
      kind="brand"
      name={g.input.businessName}
      industry={g.input.industry}
      description={g.input.description}
      audience={g.input.targetAudience}
      mission={g.input.mission}
      tagline={g.tagline}
      story={g.story}
      patternIdea={g.patternIdea}
      archetypes={archetypesToLabel(g.input.archetypes)}
      tone={g.input.toneKeywords.join(" · ")}
      palette={g.selectedPalette}
      type={g.selectedType}
      persona={g.persona}
      mockupImages={g.mockupImages}
      logoImageDataUrl={g.logoImageDataUrl}
      language={languageNative}
    />
  );
}

export function buildCampaignPlaybook(
  g: GeneratedCampaign,
  languageNative: string
) {
  return (
    <CampaignPlaybook
      kind="campaign"
      name={g.input.brandName}
      brandDescription={g.input.brandDescription}
      campaignName={g.input.campaignName}
      campaignPurpose={g.input.campaignPurpose}
      campaignStory={g.input.campaignStory}
      targetMarket={g.input.targetMarket}
      channels={g.input.channels}
      headlines={g.headlines}
      cta={g.cta}
      channelIdeas={g.channelIdeas}
      archetypes={archetypesToLabel(g.input.archetypes)}
      tone={g.input.toneKeywords.join(" · ")}
      palette={g.selectedPalette}
      type={g.selectedType}
      persona={g.persona}
      mockupImages={g.mockupImages}
      logoImageDataUrl={g.input.logoDataUrl}
      language={languageNative}
    />
  );
}
