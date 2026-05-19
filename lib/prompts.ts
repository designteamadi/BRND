import type {
  BrandInput,
  CampaignInput,
  ColorPalette,
  LanguageCode,
} from "./types";
import { archetypeByKey } from "./archetypes";
import { languageName } from "./languages";

const archetypeBlock = (keys: BrandInput["archetypes"]) =>
  keys
    .map((k) => {
      const a = archetypeByKey(k);
      return `- ${a.name} — desire: ${a.desire}. Voice: ${a.voice}.`;
    })
    .join("\n");

const langClause = (lang: LanguageCode) =>
  `Write all creative copy (taglines, headlines, story, persona description, traits, CTA, channel ideas, pattern idea) in ${languageName(
    lang
  )}. Keep JSON keys and font names in English.`;

export const brandSuggestionsPrompt = (b: BrandInput) => `
You are a senior brand strategist. Given the inputs below, propose three distinct creative directions for the brand. Each direction is a coherent set: a color palette, a font pairing, a tagline, a one-paragraph brand story, and a pattern idea.

Business name: ${b.businessName}
Industry: ${b.industry}
Description: ${b.description}
Target audience: ${b.targetAudience}
Mission: ${b.mission}
Archetypes:
${archetypeBlock(b.archetypes)}
Tone keywords: ${b.toneKeywords.join(", ")}

${langClause(b.outputLanguage)}

Return JSON only, no commentary:
{
  "palettes": [
    { "name": "string (max 3 words, in ${languageName(b.outputLanguage)})", "hexes": ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"], "rationale": "one sentence" }
  ],
  "typography": [
    { "display": "Font Name", "body": "Font Name", "rationale": "one sentence" }
  ],
  "taglines": ["three to five words", "three to five words", "three to five words"],
  "story": "120-180 word brand origin/story written in the chosen voice.",
  "patternIdea": "one sentence describing a signature pattern or texture for this brand.",
  "conceptThumbnailPrompts": [
    "one concise photographic prompt for a representative visual of palette 1 — a single hero composition that captures the mood. Reference the brand name where natural.",
    "same for palette 2",
    "same for palette 3"
  ],
  "mockupPrompts": [
    "an image generation prompt for a key product mockup",
    "an image generation prompt for a second contextual mockup",
    "an image generation prompt for a third lifestyle / brand-in-context mockup"
  ]
}

Provide exactly 3 palettes, 3 typography pairings, 3 concept thumbnail prompts (one per palette), and 3 mockup prompts. Use only real, currently available Google Fonts for typography. Make image prompts photographic, specific, and on-brief — include lighting, framing, surface, and the brand name where natural. The conceptThumbnailPrompts should each represent the matching palette's mood visually.
`.trim();

export const brandPersonaPrompt = (b: BrandInput, p: ColorPalette) => `
You are a brand strategist. Compose the brand persona for the brand below, expressed as a single archetypal character — not a buyer persona.

Business: ${b.businessName} (${b.industry})
Description: ${b.description}
Audience: ${b.targetAudience}
Mission: ${b.mission}
Archetypes: ${b.archetypes.join(" + ")}
Tone: ${b.toneKeywords.join(", ")}
Visual direction: ${p.name} — ${p.rationale}

${langClause(b.outputLanguage)}

Return JSON only:
{
  "name": "evocative two-to-four word character name",
  "description": "60-90 word vivid character portrait in present tense",
  "traits": ["five short trait words or phrases"]
}
`.trim();

export const campaignSuggestionsPrompt = (c: CampaignInput) => `
You are a senior campaign creative director. Given the campaign brief below, propose three creative directions.

Brand: ${c.brandName}
Brand description: ${c.brandDescription}
Campaign: ${c.campaignName}
Purpose: ${c.campaignPurpose}
Story / message: ${c.campaignStory}
Target market: ${c.targetMarket}
Archetypes:
${archetypeBlock(c.archetypes)}
Tone keywords: ${c.toneKeywords.join(", ")}
Channels: ${c.channels.join(", ")}

${langClause(c.outputLanguage)}

Return JSON only:
{
  "palettes": [
    { "name": "string", "hexes": ["#RRGGBB","#RRGGBB","#RRGGBB","#RRGGBB"], "rationale": "one sentence" }
  ],
  "typography": [
    { "display": "Font Name", "body": "Font Name", "rationale": "one sentence" }
  ],
  "headlines": ["five strong campaign headlines, each under 8 words"],
  "cta": "the campaign call-to-action, under 5 words",
  "channelIdeas": {
    "instagram": "one-sentence idea (or empty if not in channels)",
    "tiktok": "one-sentence idea",
    "youtube": "one-sentence idea",
    "ooh": "one-sentence idea",
    "print": "one-sentence idea",
    "email": "one-sentence idea",
    "web": "one-sentence idea",
    "radio": "one-sentence idea"
  },
  "conceptThumbnailPrompts": [
    "one concise photographic prompt for palette 1's campaign hero feel",
    "same for palette 2",
    "same for palette 3"
  ],
  "mockupPrompts": [
    "image generation prompt for a hero campaign visual",
    "image generation prompt for a second key campaign asset",
    "image generation prompt for an in-context lifestyle moment"
  ]
}

Provide exactly 3 palettes, 3 typography pairings, 3 concept thumbnail prompts, and 3 mockup prompts. Only fill channelIdeas keys that are in the selected channels list above; for others, return an empty string. Photographic prompts only — include lighting, framing, subject, and reference the campaign message visually.
`.trim();

export const campaignPersonaPrompt = (c: CampaignInput, p: ColorPalette) => `
You are a brand strategist. Compose the campaign persona — the single character voice this campaign will speak as.

Brand: ${c.brandName}
Campaign: ${c.campaignName}
Purpose: ${c.campaignPurpose}
Story: ${c.campaignStory}
Target market: ${c.targetMarket}
Archetypes: ${c.archetypes.join(" + ")}
Tone: ${c.toneKeywords.join(", ")}
Visual direction: ${p.name} — ${p.rationale}

${langClause(c.outputLanguage)}

Return JSON only:
{
  "name": "two-to-four word character name",
  "description": "60-90 word character portrait, present tense, in the campaign's voice",
  "traits": ["five short trait words or phrases"]
}
`.trim();

export const logoImagePrompt = (b: BrandInput) => {
  const styleHint = {
    wordmark: "wordmark — a custom-set typographic logo using the brand name. No icon.",
    symbol: "a single distinctive geometric symbol or mark, no text.",
    combination: "a combination mark: a small distinctive symbol next to the wordmark.",
    mascot: "a stylized mascot illustration paired with the brand name.",
  }[b.logoStyle];

  return `Studio-quality vector-style brand logo for "${b.businessName}". ${styleHint} ${b.logoPrompt}. Clean, modern, flat, on a plain white or transparent-looking background, centered, suitable for use as a brand identity. High contrast, premium feel, evocative of: ${b.toneKeywords.join(", ")}.`;
};

/** Prompt for compositing brand logo onto a mockup scene */
export const logoCompositePrompt = (basePrompt: string, brandName: string) =>
  `${basePrompt}\n\nIMPORTANT: Take the brand logo from the provided image and integrate it naturally into the scene as the visible brand identity for "${brandName}" — apply it to the relevant product surface, packaging, signage, or apparel in a way that feels real and physically consistent with the lighting and perspective. Do not redraw the logo; preserve its proportions and style.`;
