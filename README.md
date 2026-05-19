# BRND

> Your brand journey, in minutes.

A creative platform that turns a few honest inputs into a complete brand or a complete campaign — voice, visuals, persona, applied mockups — composed in a bento reveal, exported as a printable playbook with every asset.

**Reasoned by Gemini · Rendered by Nano Banana (Gemini 2.5 Flash Image)**

---

## What it does

Pick a path:

1. **Brand from scratch** — 8 steps. Language → basics → audience & mission → archetype & voice → logo direction → direction & palette (with concept thumbnails) → typography → review.
2. **Campaign from scratch** — 9 steps. Language → brand & logo upload → brief → target → archetype & voice → direction & palette (with concept thumbnails) → typography → channels → review.

The output is a **bento reveal** — asymmetric composition of lockup, mockups, palette, type, persona, headlines, CTA. Each mockup tile can be **regenerated individually** on hover. Then download the **complete playbook**: multi-page PDF + raw assets + color tokens + typography reference + JSON data dump.

---

## v0.2 features

- ✅ **Language selector** — generate copy in English, Bahasa Indonesia, Malay, Thai, Vietnamese, Tagalog, Spanish, French, German, Japanese, Korean, or Chinese
- ✅ **Concept thumbnails** — palette step renders one Nano Banana thumbnail per direction so users see the mood before committing to a full bento
- ✅ **Logo compositing** — uploaded campaign logos are passed to Gemini 2.5 Flash Image as an input image and composited onto every mockup using its native image-editing mode
- ✅ **Per-tile regen** — hover any mockup tile in the bento to regenerate just that asset
- ✅ **Playbook export** — full ZIP containing a multi-page PDF brand/campaign book, all raw images, `colors.css` + `colors.json` tokens, typography reference, README, and full JSON dump for re-import

---

## Stack

- **Next.js 14** (App Router) — deployed to Vercel
- **Gemini 2.5 Flash** for reasoning
- **Gemini 2.5 Flash Image** (Nano Banana) for visuals + logo compositing
- **@react-pdf/renderer** for the PDF playbook (client-side, dynamically imported)
- **JSZip** for asset bundling
- **Tailwind CSS** + custom design system (Instrument Serif + Geist + JetBrains Mono)
- **Motion** for transitions
- **Zustand** for flow state (sessionStorage)

No Claude, no other engines — Gemini only, per spec.

---

## Local dev

```bash
npm install

# Optional — add your Gemini key (works without one, falls back to mocks)
cp .env.example .env.local
# edit .env.local and paste your key from https://aistudio.google.com/apikey

npm run dev
```

Open http://localhost:3000.

**It works without a key.** If `GEMINI_API_KEY` is unset, the app falls back to high-quality mock data and SVG placeholder images so you can demo the full flow — including the playbook download — before paying for any tokens.

---

## Deploy to Vercel

```bash
git init && git add . && git commit -m "init brnd"
git remote add origin git@github.com:your/brnd.git
git push -u origin main

# at vercel.com/new:
#  · import the repo
#  · add env var GEMINI_API_KEY
#  · deploy
```

CLI alternative:

```bash
npm i -g vercel
vercel
vercel env add GEMINI_API_KEY production
vercel --prod
```

---

## Environment variables

| Key | Required | Default | Notes |
|---|---|---|---|
| `GEMINI_API_KEY` | No (mocks if absent) | — | [Get one here](https://aistudio.google.com/apikey) |
| `GEMINI_TEXT_MODEL` | No | `gemini-2.5-flash` | |
| `GEMINI_IMAGE_MODEL` | No | `gemini-2.5-flash-image` | Nano Banana |

---

## What's in the playbook ZIP

When the user clicks "Download playbook", they get a `<name>-playbook.zip` containing:

```
<name>-playbook.zip
├── README.md                  # Brand or campaign summary, plain text
├── <name>-playbook.pdf        # Multi-page A4 playbook
│   ├── Cover
│   ├── Essence / Brief
│   ├── Logo (brand flow)
│   ├── Colors
│   ├── Typography
│   ├── Persona
│   ├── Headlines (campaign)
│   ├── Channels (campaign)
│   └── Visuals · one page per mockup
├── brand.json / campaign.json  # Full data dump — re-importable
└── assets/
    ├── logo.png                # Raw logo file
    ├── mockup-01.png           # Each generated mockup
    ├── mockup-02.png
    ├── mockup-03.png
    ├── concept-01-<name>.png   # The concept thumbnails considered
    ├── concept-02-<name>.png
    ├── concept-03-<name>.png
    ├── colors.css              # CSS variables ready to paste
    ├── colors.json             # Palette tokens
    └── type.md                 # Google Fonts links + CSS vars
```

---

## File tree

```
brnd/
├── app/
│   ├── api/
│   │   ├── reason/route.ts      # Gemini text
│   │   └── image/route.ts       # Gemini 2.5 Flash Image (with input images)
│   ├── brand/page.tsx           # 8-step brand flow
│   ├── campaign/page.tsx        # 9-step campaign flow
│   ├── result/page.tsx          # Bento + playbook download + tile regen
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Landing
├── components/
│   ├── ArchetypePicker.tsx
│   ├── Bento.tsx                # Asymmetric grid + per-tile regen
│   ├── ChannelPicker.tsx
│   ├── LanguagePicker.tsx       # 12 languages
│   ├── LogoStylePicker.tsx
│   ├── PalettePicker.tsx        # With Nano Banana concept thumbnails
│   ├── PlaybookPDF.tsx          # @react-pdf/renderer playbook docs
│   ├── StepShell.tsx
│   ├── TonePicker.tsx
│   └── TypePicker.tsx
├── lib/
│   ├── archetypes.ts            # Jung's 12
│   ├── gemini.ts                # Server-side AI client + image input support
│   ├── languages.ts             # 12 supported languages
│   ├── mocks.ts                 # No-key fallback data
│   ├── playbook.ts              # Client-side ZIP packager
│   ├── prompts.ts               # Language-aware prompt builders
│   ├── store.ts                 # Zustand state + regen actions
│   └── types.ts
├── tailwind.config.ts
├── next.config.js
├── vercel.json                  # 60s timeout for AI calls
└── package.json
```

---

## How logo compositing works

In the **campaign flow**, when the user uploads a logo, we pass it as an `inputImages` parameter to `/api/image`. The route forwards both the text prompt **and** the logo image to `gemini-2.5-flash-image`, which natively supports multi-modal input. The prompt instructs Gemini to apply the logo onto the visible product surface in the scene while preserving proportions and matching the lighting.

In the **brand flow**, the logo is generated first, then composited onto every subsequent mockup the same way — keeping the brand identity consistent across all visuals.

---

## How concept thumbnails work

After the user completes the archetype + tone step, Gemini's brand/campaign-suggestions response includes three `conceptThumbnailPrompts` alongside the three palettes. The palette step kicks off three Nano Banana renders in parallel — one per direction. Each thumbnail appears progressively above its palette card as it lands, so users can see the mood, not just the swatches. Picking a palette = picking a direction.

---

## Performance notes

- **@react-pdf/renderer + jszip are dynamically imported** in `lib/playbook.ts`, so the initial bundle stays lean. They load only when the user clicks "Download playbook."
- **Concept thumbnails are non-blocking** — the user can continue to typography while they render in the background.
- **API timeouts are set to 60s** in `vercel.json` to accommodate batched image generation.

---

## License

MIT
