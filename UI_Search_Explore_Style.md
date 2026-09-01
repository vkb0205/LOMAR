# UI / Design System Specification — "AIC 2026" Retrieval App

> **Purpose:** A portable spec that captures the visual language, design tokens, component architecture, and interaction patterns of the frontend so it can be adapted into other projects.
>
> **Source project:** `AIC-2026-uiauia/frontend` — a Multi-modal Video Retrieval Engine UI (React 19 + TypeScript + Vite + TailwindCSS v4 + Zustand + Radix UI + lucide-react).
>
> **Design inspiration:** Claude / Anthropic editorial design language — warm "paper &amp; ink" palette, serif display type, generous whitespace, hairline borders, and calm state coloring.

---

## 1. Design Philosophy

The interface reads like an **editorial workspace for machine-generated content**: warm paper tones, a single coral brand accent, serif display headlines for hero/empty states, and disciplined hairlines that organize dense, technical data without feeling cluttered.

Guiding principles:

1. **Paper &amp; Ink.** Off-white/cream surfaces dominate; near-black ink drives contrast; the coral accent is used sparingly to signal the primary action.
2. **Editorial typography.** A serif display face (`Cormorant Garamond`) for large headings pairs with a clean grotesque body face (`Inter`) for UI and `JetBrains Mono` for data/identifiers.
3. **Hairline discipline.** Borders are 1px and antialiased (`hairline` tones) so texture stays subtle.
4. **Calm, semantic color.** Success / warning / error and branch accents (teal, amber) are used only for meaning, never decoration.
5. **Dense-but-scannable data cards.** Cards use compact typography, mono identifiers, color-coded score badges, and inline evidence snippets to pack a lot of information without losing hierarchy.

---

## 2. Design Tokens

All tokens are declared as **CSS custom properties** in `:root` (in `src/app/styles/index.css`) AND mirrored into the **Tailwind CSS v4 `@theme`** so both `var(--token)` and Tailwind utilities (`bg-[var(--token)]`, `text-[var(--token)]`) resolve consistently.

### 2.1 Color — Brand &amp; Accent


| Token                      | Hex       | Usage                                                |
| -------------------------- | --------- | ---------------------------------------------------- |
| `--color-primary`          | `#cc785c` | Coral — primary buttons, active borders, focus rings |
| `--color-primary-active`   | `#a9583e` | Hover/pressed state of coral                         |
| `--color-primary-disabled` | `#e6dfd8` | Disabled coral surface                               |
| `--color-accent-teal`      | `#5db8a6` | ASR / secondary meta accent                          |
| `--color-accent-amber`     | `#e8a55a` | OCR / pin / pinned-mode accent                       |


### 2.2 Color — Surfaces


| Token                           | Hex       | Usage                                   |
| ------------------------------- | --------- | --------------------------------------- |
| `--color-canvas`                | `#faf9f5` | App background, primary card surface    |
| `--color-surface-soft`          | `#f5f0e8` | Inputs, subtle wells, hover backgrounds |
| `--color-surface-card`          | `#efe9de` | Cards, bubbles, selected surfaces       |
| `--color-surface-cream-strong`  | `#e8e0d2` | Stronger cream divide                   |
| `--color-surface-dark`          | `#181715` | Dark panels, avatars, tooltips          |
| `--color-surface-dark-elevated` | `#252320` | Dark elevated / secondary-dark buttons  |
| `--color-surface-dark-soft`     | `#1f1e1b` | Dark hover                              |


### 2.3 Color — Borders


| Token                   | Hex       | Usage                          |
| ----------------------- | --------- | ------------------------------ |
| `--color-hairline`      | `#e6dfd8` | Default 1px border, separators |
| `--color-hairline-soft` | `#ebe6df` | Softer border variant          |


### 2.4 Color — Text (Ink)


| Token                  | Hex       | Usage                       |
| ---------------------- | --------- | --------------------------- |
| `--color-ink`          | `#141413` | Primary text, headings      |
| `--color-body-strong`  | `#252523` | Strong body                 |
| `--color-body`         | `#3d3d3a` | Body copy                   |
| `--color-muted`        | `#6c6a64` | Secondary text, labels      |
| `--color-muted-soft`   | `#8e8b82` | Placeholders, tertiary text |
| `--color-on-primary`   | `#ffffff` | Text on coral               |
| `--color-on-dark`      | `#faf9f5` | Text on dark panels         |
| `--color-on-dark-soft` | `#a09d96` | Muted text on dark          |


---

## 3. Typography

### 3.1 Type Faces


| Token            | Stack                                                                        | Use                                             |
| ---------------- | ---------------------------------------------------------------------------- | ----------------------------------------------- |
| `--font-display` | `"Cormorant Garamond", "Tiempos Headline", Georgia, serif`                   | Large display headings / empty-state hero       |
| `--font-body`    | `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | All UI chrome, body, buttons                    |
| `--font-mono`    | `"JetBrains Mono", "Fira Code", ui-monospace, monospace`                     | IDs, timestamps, scores, data, technical detail |


### 3.2 Type Scale (Custom utilities in `@layer utilities`)


| Utility               | Face    | Size | Weight | Line-Height | Letter-spacing          |
| --------------------- | ------- | ---- | ------ | ----------- | ----------------------- |
| `.text-display-xl`    | display | 64px | 400    | 1.05        | -1.5px                  |
| `.text-display-lg`    | display | 48px | 400    | 1.1         | -1px                    |
| `.text-display-md`    | display | 36px | 400    | 1.15        | -0.5px                  |
| `.text-display-sm`    | display | 28px | 400    | 1.2         | -0.3px                  |
| `.text-title-lg`      | body    | 22px | 500    | 1.3         | —                       |
| `.text-title-md`      | body    | 18px | 500    | 1.4         | —                       |
| `.text-title-sm`      | body    | 16px | 500    | 1.4         | —                       |
| `.text-body-md`       | body    | 16px | 400    | 1.55        | —                       |
| `.text-body-sm`       | body    | 14px | 400    | 1.55        | —                       |
| `.text-caption`       | body    | 13px | 500    | 1.4         | —                       |
| `.text-caption-upper` | body    | 12px | 500    | 1.4         | **1.5px** + `uppercase` |
| `.text-code`          | mono    | 14px | 400    | 1.6         | —                       |


**Conventions:**

- **Labels** (form field labels, section headings, toolbar labels) → `text-caption-upper` (12px, 500, uppercase, 1.5px tracking).
- **Identifiers / data** (video IDs, frame IDs, timestamps, scores, meta) → `font-mono`, small (10–14px), often `font-semibold`.
- **Empty/hero state** → serif display util (`text-display-md`) with a large emoji/icon.
- Global: `body` is `16px`, `line-height 1.55`, `font-body`.

---

## 4. Spacing, Radius, Elevation, Motion

### 4.1 Spacing scale (custom props)


| Token             | Value |
| ----------------- | ----- |
| `--space-xxs`     | 4px   |
| `--space-xs`      | 8px   |
| `--space-sm`      | 12px  |
| `--space-md`      | 16px  |
| `--space-lg`      | 24px  |
| `--space-xl`      | 32px  |
| `--space-xxl`     | 48px  |
| `--space-section` | 96px  |


> Components generally use fixed pixel values via Tailwind (`p-3`, `px-4`, `gap-2`, `py-2.5`, etc.). The scale exists for cross-project consistency.

### 4.2 Radius scale


| Token           | Value  | Typical use                      |
| --------------- | ------ | -------------------------------- |
| `--radius-xs`   | 4px    | Tags, thumbnail chips            |
| `--radius-sm`   | 6px    | Bubbles corners, small wells     |
| `--radius-md`   | 8px    | Buttons, inputs, cards, tooltips |
| `--radius-lg`   | 12px   | Cards, drawers, textareas        |
| `--radius-xl`   | 16px   | Larger panels                    |
| `--radius-pill` | 9999px | Badges, pills, scrollbar thumb   |


### 4.3 Elevation (shadows)


| Token             | Value                             | Use                              |
| ----------------- | --------------------------------- | -------------------------------- |
| `--shadow-subtle` | `0 1px 3px rgba(20,20,19,0.08)`   | Hover lift, small notes          |
| `--shadow-card`   | `0 2px 8px rgba(20,20,19,0.06)`   | Cards, tooltips, focus highlight |
| `--shadow-drawer` | `-4px 0 24px rgba(20,20,19,0.12)` | Right-side drawers               |


> Shadows are **extremely subtle** — the aesthetic relies on color and hairline, not depth. On dark overlays (lightbox, dark controls), use translucent `bg-black/80`, `backdrop-blur`, and `border-white/10-20` instead of drop shadows.

### 4.4 Motion / transitions


| Token               | Value        |
| ------------------- | ------------ |
| `--transition-fast` | `120ms ease` |
| `--transition-base` | `200ms ease` |
| `--transition-slow` | `300ms ease` |


- Interactive elements: `transition-colors` (+ `transition-all` in a few places like pinned buttons).
- Cards: `transition-all duration-150`.
- Skeleton shimmer: `skeleton-shimmer 1.5s infinite` on a 200%-width linear gradient.
- Radix overlays use `animate-in fade-in-0 zoom-in-95` (tailwind-animate style) with appropriate `slide-in-from-*` for popovers/tooltips, and `data-[state=closed]:animate-out ...`.

### 4.5 Layout tokens


| Token                      | Value  |
| -------------------------- | ------ |
| `--query-workspace-width`  | 32%    |
| `--result-workspace-width` | 68%    |
| `--topbar-height`          | 52px   |
| `--drawer-width`           | 420px  |
| `--card-thumbnail-aspect`  | 16 / 9 |


---

## 5. Application Layout

### 5.1 Master frame (`AppShell`)

```
┌──────────────────────────────────────────────────────────┐
│  Top Bar (BackendStatusBar, h=52px)                      │
│  ┌───────────────┬──║──┬──────────────────────────────┐  │
│  │ Query / Chat  │resize│   Result Workspace           │  │
│  │ workspace     │handle│   ┌────────────────────────┐ │  │
│  │ (32%, clamp   │      │   │ ResultToolbar          │ │  │
│  │  20%–50%)     │      │   ├────────────────────────┤ │  │
│  │ ┌────────────┐│      │   │ KISResultGrid (cards / │ │  │
│  │ │MessageList ││      │   │  temporal sequences)   │ │  │
│  │ ├────────────┤│      │   │                        │ │  │
│  │ │QueryComposer │     │   │                        │ │  │
│  │ └────────────┘│      │   └────────────────────────┘ │  │
│  └───────────────┴──║──┴──────────────────────────────┘  │
│  Global overlays: ModelConfigPanel, ResultDetailDrawer,  │
│  SessionDrawer, CommandPalette, DebugTraceDrawer         │
└──────────────────────────────────────────────────────────┘
```

- **Colors:** whole app on `--color-canvas`; result workspace body uses `--color-surface-soft`; query panel uses `--color-canvas`.
- **Resizable divider** between panels: 4px wide (`w-1` spillover), `cursor-col-resize`, hairline → coral on hover, with a centered `GripVertical` icon that fades in on hover. Drag clamps left panel to **20%–50%**, default 32%.
- **Top bar** (`topbar-height: 52px`): brand/logo left, status/controls right, separated by a `h-4 w-px bg-hairline` vertical divider.

---

## 6. Component System

### 6.1 Base primitives (`shared/ui`)

#### Button (`Button.tsx`) — cva-driven

Variants:


| Variant          | Style                                                       |
| ---------------- | ----------------------------------------------------------- |
| `primary`        | coral bg, white text → hover `primary-active`               |
| `secondary`      | canvas bg, hairline border, ink text → hover `surface-soft` |
| `secondary-dark` | dark-elevated bg, on-dark text → hover `surface-dark-soft`  |
| `ghost`          | transparent, ink → hover `surface-soft`                     |
| `ghost-muted`    | transparent, muted → hover `surface-soft` + ink text        |
| `danger`         | error red bg, white → `hover:opacity-90`                    |


Sizes:


| Size      | Dims                         |
| --------- | ---------------------------- |
| `sm`      | `h-7 px-2.5 text-xs gap-1.5` |
| `md`      | `h-9 px-4`                   |
| `lg`      | `h-11 px-5 text-base`        |
| `icon`    | `h-8 w-8`                    |
| `icon-sm` | `h-7 w-7`                    |
| `icon-lg` | `h-10 w-10`                  |


Base: inline-flex, center, `gap-2`, `text-sm font-medium`, `rounded-[radius-md]`, focus-visible coral ring, disabled `opacity-50 pointer-events-none`, `select-none`.

#### Badge (`Badge.tsx`) — cva-driven, pill-shaped


| Variant   | Style                                                    |
| --------- | -------------------------------------------------------- |
| `default` | `surface-card` bg, ink text, 13px, `px-3 py-0.5`         |
| `coral`   | coral bg, white text, 12px, uppercase, `tracking-widest` |
| `teal`    | teal at 15% mix bg, teal text, 12px, `px-2.5`            |
| `amber`   | amber at 15% mix bg, amber text, 12px                    |
| `success` | green at 15% mix bg, green text                          |
| `error`   | red at 15% mix bg, red text                              |
| `warning` | amber at 15% mix bg, amber text                          |
| `outline` | hairline border, muted text                              |
| `dark`    | dark bg, on-dark text                                    |


Base: inline-flex, `gap-1`, `rounded-pill`, `font-medium`, `whitespace-nowrap`. Tinted variants use `color-mix(in_srgb, <color> 15%, transparent)`.

#### Skeleton (`Skeleton.tsx`)

- `.skeleton` shimmer utility + `rounded` prop (`sm|md|lg|xl|full`).
- `SkeletonCard` = realistic card placeholder (aspect-video thumbnail, identity row, text lines, pill badges, icon row).

#### Tooltip (`Tooltip.tsx`) — Radix

- Content: dark surface, on-dark text, `rounded-md px-3 py-1.5`, `shadow-card`, zoom/fade in + slide from side.
- Configurable `side`, `delayDuration` (default 300ms), convenience wrapper `<Tooltip content side>{children}</Tooltip>`.

### 6.2 Media &amp; entity components (`entities`)

#### MediaFrame (`entities/media/MediaFrame.tsx`)

- Zero-overhead image renderer; `aspectRatio: video|square|auto`; native lazy loading + async decode; graceful `ImageOff` + "No image" fallback on error.

#### ScoreBadge / FinalScoreBadge (`entities/search-result/ScoreBadge.tsx`)

- `ScoreBadge`: branch label + normalized score; compact vs full mode; status-driven variant (timeout→warning, error→error, skipped→outline); tooltip shows raw / norm / rank / latency / status.
- `FinalScoreBadge`: mono score, color via `scoreColorClass`.

#### EvidenceSnippet (`entities/search-result/EvidenceSnippet.tsx`)

- A labeled single/two-line snippet. `label` blue (ASR=teal) or amber (OCR). Truncates to `maxChars`, shows "N/A" when empty, italic body text, tooltip on title.

### 6.3 Feature components

#### Top bar (`BackendStatusBar`)

- Loads health/ready/providers status on mount.
- Shows `Searching…` (spinner) while searching, or connectivity with `Wifi`/`WifiOff` color-coded.
- `Providers (N degraded)` drop-down (`<details>`) listing provider + shard status.
- Right cluster: `CommandPalette` button (`⌘`-icon), `Settings` button (retrieval settings), using `ghost-muted icon-sm`.

#### ResultToolbar

- Left: result count (mono/semibold), execution-time chip (emerald `bg-emerald-500/10 border-emerald-500/20`, mono), task badge (`outline`), PARTIAL warning badge, selection count (`coral`), select-all checkbox button.
- Right: **Grid** badge (teal, always), vertical divider, **Pinned** toggle (amber-fill pin icon, amber styling when active), **Cấu hình Trọng số** (weights config) toggle, **Export** button → downloads CSV (KIS or TRAKE).
- Buttons are `ghost-muted sm` with icons + optional responsive labels (`hidden md:inline`, `hidden xl:inline`).

#### Chat workspace

- **MessageList** — user messages right-aligned (bubbles `surface-card`, `rounded-tr-sm`), agent messages left-aligned (canvas bg + hairline border, `rounded-tl-sm`); avatars (`User` on `surface-card` vs `Bot` on dark); status icon + task + result count + relative time in meta row; hover copy button; expandable technical-details `<details>`. Bubble max width 85%.
- **QueryComposer** — contextual per task:
  - *KIS (default):* rounded `lg` bordered textarea on `surface-soft`, `focus-within` coral border + ring; send/cancel buttons; hint line at bottom.
  - *TEMPORAL:* numbered event inputs (coral number bubbles 1..n), reorder/remove buttons, big dashed "+ Thêm sự kiện" (max 10), submit row.
  - *ID:* structured 4-field form — Video ID (mono uppercase), Frame#/Second radio toggle, ±Neighbors range slider, submit.

#### Result grid (`KISResultGrid`) &amp; card (`KISResultCard`)

- Responsive card grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`, `gap-4 p-4`.
- Card anatomy (top→bottom):
  1. Absolute **rank badge** (dark `#01` mono chip) top-left; in pinned mode → amber `TOP #n`.
  2. Top-right overlays (in normal mode): selection checkbox (`accent-primary`), amber pinned-pin, status badges (`CACHE`/`FALLBACK`/`PARTIAL`).
  3. **MediaFrame** thumbnail (aspect-video).
  4. Optional **mini context keyframe strip** (`±K`): horizontal scroll of `w-10 h-6` thumbnails, current highlighted with amber ring + scale, timestamp tag bottom-right (black/80 mono).
  5. **Body:** identity row — mono video/frame ID (semibold) + mono timestamp, right-aligned `FinalScoreBadge`; then ASR &amp; OCR `EvidenceSnippet`s.
  6. **Action row** (`grid grid-cols-3 gap-2 mt-auto border-t`): YouTube (external link), Copy ID, Pin/Unpin — all `ghost-muted icon` on `surface-soft`, full-width.
- Interaction: hover → coral border + card shadow; keyboard-focus → coral ring; selected → coral-mix border + coral-3% bg; pinned → amber ring. `isPinnedMode` adds drag-to-reorder + up/down controls.

#### ResultDetailDrawer (right slide-over, Radix Dialog)

- Width `min(560px,100vw)`, `border-l`, `shadow-drawer`. Overlay `bg-black/40`.
- Header: mono rank, mono title (keyframe/video ID) + mono timestamp, action cluster (maximize/lightbox, pin, YouTube, copy, close) all `ghost-muted icon-sm`.
- Body sections: hoverable image w/ "Xem toàn màn hình" overlay + `FinalScoreBadge`; **Context frames** collapsible strip; **Metadata** dl grid; **Event score / RRF score**; **ASR &amp; OCR evidence** panels; **Component evidence** table (8 branch cells: PE, FG, Qwen VI, Qwen EN, Nemotron VI, Nemotron EN, ASR BM25, OCR BM25); **Technical details** collapsible (`pre` JSON).
- **Lightbox** (full-screen pop-up, `z-[10000]`, `bg-black/85`): top bar (`bg-black/60 backdrop-blur rounded-xl`), centered image (`max-w`, round-xl, `border-white/15`), bottom context strip; keynav: `Esc` close, `←`/`,` prev, `→`/`.` next, `C` copy.

#### TemporalSequenceCard

- Wrapper card: `surface-card`-ish translucent bg, `rounded-lg`, `p-4`, `space-y-3.5`, hairline/amber borders by state.
- Header: coral/amber `SEQ #` badge, chain-select checkbox, mono video ID, event-count badge; right: reorder (pinned mode), pin-sequence toggle, total-score chip (mono coral), YouTube, Copy Seq.
- Body: responsive `grid-cols-1 sm:2 lg:3` of event panels — each an event-step badge + description + a nested `KISResultCard`.

#### Drawers &amp; panels (overlays)

- **SessionDrawer**, **ModelConfigPanel** (weights sliders, toggles, RRF/retrieval/topK/±K controls), **CommandPalette** (`cmdk`), **DebugTraceDrawer** — all rendered as global overlays off the `AppShell`.

---

## 7. Global / Cross-cutting Style Rules

### 7.1 Inputs &amp; controls (shared pattern)

```
"min-w-0 w-full rounded-lg border border-hairline
 bg-surface-soft px-3 py-2 text-sm text-ink
 placeholder:text-muted-soft
 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30
 transition-colors"
```

- Custom inputs use `accent-[var(--color-primary)]` for the native control tint.
- Textarea containers get `focus-within:border-primary focus-within:ring-1 focus-within:ring-primary`.

### 7.2 Focus &amp; accessibility

- Global `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; border-radius: var(--radius-sm); }`.
- Cards are `role="article"`/`role="listitem"`, keyboard-navigable (`tabIndex`, `Enter`/`Space`).
- Keyboard shortcuts (global, skip while typing):
  - `j`/`k` or arrows — move result selection
  - `p` — pin/unpin; `c` — copy ID; `y` — open YouTube; `d` — toggle model config
  - `Enter` — open detail (or focus query); `/` — focus query; `Esc` — close drawers
  - `Ctrl`/`Cmd`+`/` — focus query composer

### 7.3 Scrolling

- Thin custom scrollbars: 6px, transparent track, hairline thumb (`radius-pill`), muted on hover.
- `.scroll-area` (vertical) and `.scroll-area-x` (horizontal) utility classes.

### 7.4 Selection

- `::selection { background: color-mix(in srgb, primary 20%, transparent); color: ink; }`.

### 7.5 Responsive behavior

- Breakpoints via Tailwind defaults (`sm`, `md`, `lg`, `2xl`).
- Card grid: 1 → 2 (sm) → 3 (lg) → 4 (2xl).
- Toolbar labels hide below breakpoints (`hidden md:inline`, `hidden xl:inline`).
- Drawer width caps at `100vw`.
- Temporal event grid: 1 (base) → 2 (sm) → 3 (lg).

---

## 8. Data → Visual Mapping


| Concept                     | Visual treatment                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------- |
| Search result               | Data card in responsive grid                                                            |
| Rank                        | Mono `#NN` chip (dark, top-left); `formatRank()` pads to 2 digits                       |
| Final relevance score       | `FinalScoreBadge` mono, color by `scoreColorClass` (≥0.7 green, ≥0.4 amber, else muted) |
| Branch score                | `ScoreBadge` pill; tooltip w/ raw/norm/rank/latency/status                              |
| ASR transcript              | Teal-labeled snippet / panel (Mic icon)                                                 |
| OCR text                    | Amber-labeled snippet / panel (FileText icon)                                           |
| Status (ready/success)      | Green `Wifi`/`CheckCircle2`                                                             |
| Warning / partial / timeout | Amber `Clock`/`AlertCircle`, `warning` badge                                            |
| Error / offline             | Red `WifiOff`/`AlertCircle`, `error` badge                                              |
| Pinned                      | Amber fill-pin; amber ring on card; `TOP #n` badge in pinned mode                       |
| Selected                    | Coral-mix border + coral-3% tint + checkbox                                             |
| Temporal chain              | Sequence card wrapping nested event cards                                               |


---

## 9. Tech Stack &amp; Setup Notes (for porting)

- **React 19** + **TypeScript 6** + **Vite 8** + **TailwindCSS v4**.
- Tailwind v4 is configured via the `@tailwindcss/vite` plugin; global CSS imported once in `main.tsx` from `@/app/styles/index.css`.
- Path alias `@` → `src` (in `vite.config.ts`).
- **State:** Zustand stores (`stores/useAppStore`) + selector hooks.
- **UI primitives:** Radix UI (`dialog`, `dropdown-menu`, `label`, `popover`, `scroll-area`, `separator`, `slot`, `toggle-group`, `tooltip`), `cmdk` (command palette), `class-variance-authority` + `clsx` + `tailwind-merge` (`cn` helper).
- **Icons:** `lucide-react`.
- **Routing:** `react-router-dom` available (v7).
- **Data layer:** service interface (`RetrievalService`) with real (`ApiRetrievalService`) and mock (`MockRetrievalService`) implementations; `VITE_USE_MOCK_API` env toggle.

### Minimal file map to reuse the system

```
src/app/styles/index.css     ← ALL design tokens + typography utilities + base
src/shared/lib/utils.ts      ← cn(), formatTimestamp, formatScore, scoreColorClass, formatRank...
src/shared/ui/*              ← Button, Badge, Skeleton, Tooltip
src/entities/*               ← MediaFrame, ScoreBadge, EvidenceSnippet
src/shared/types/index.ts    ← domain types
```

### To adapt for a new project

1. Copy `index.css` → keep the `:root` tokens and `@theme`, drop app-specific utilities you don't need.
2. Copy `shared/ui/*` and `shared/lib/utils.ts`.
3. Swap the two DOM-ready fonts (`Inter`, `Cormorant Garamond`, `JetBrains Mono`) — load via Google Fonts or self-host; they drive the entire look.
4. Rebrand by editing only `--color-primary`, `--color-accent-teal`, `--color-accent-amber` in `:root` and `@theme` — the whole system re-themes.
5. Keep the hairline + subtle-shadow discipline to preserve the editorial feel.

---

## 10. Recommended Quick Wins / Customization Checklist

- [ ] Change brand accent → edit `--color-primary` + `--color-primary-active` only.
- [ ] Switch display serif → edit `--font-display`.
- [ ] Tighten/loosen density → adjust spacing tokens and card `p-*` values.
- [ ] Add dark mode → map `--color-*` behind a `.dark` class (signature subtle shadows already carry).
- [ ] Localize → UI strings are centralized in components; the spec keeps English labels + Vietnamese tooltips pattern.

---

*End of spec. Generated from `AIC-2026-uiauia/frontend` source for reuse across projects.*