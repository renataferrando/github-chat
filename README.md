# GitHub Profile Chat

A self-contained interactive demo that wraps a GitHub-style profile page in a
chat interface. Ask questions about a contributor's activity; the AI assistant
streams a reasoning trace and a canned answer with highlighted heatmap cells.
**No backend, no LLM — everything is local mock data.**

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 16** (App Router) | RSC boundary keeps `page.tsx` as a server component while all interactive pieces are client components |
| UI | **React 19** | `useReducer` + context for state; no Redux needed |
| Styling | **Tailwind v4** | `@theme` block owns all design tokens; no `tailwind.config.ts`; arbitrary values prohibited |
| Animation | **Framer Motion** | Entry/exit on reasoning steps only; CSS handles everything else |
| Testing | **Vitest** | Pure-function unit tests for the reducer, utilities, and streaming generator |


---

## Architecture

### ChatProvider + reducer
`ChatProvider` (`src/components/chat/ChatProvider.tsx`) wraps the page grid
and exposes a `useChat()` hook. State lives in `useReducer(chatReducer, …)`.
The streaming effect watches `state.messages` for the latest `thinking`
assistant message; starts an async generator stream; dispatches
`BEGIN_RESPONSE → REASONING_STEP* → FINISH`. An `inFlight` Map tracks
AbortControllers so `stopStreaming()` cancels correctly even under React
StrictMode double-invoke.

### Streaming generator
`streamReasoning(steps, signal?)` in `mockChat.ts` iterates the canned
reasoning steps, `setTimeout`-delays each by its `durationMs`, and rejects
with `DOMException('AbortError')` when the signal fires.

### Server vs client components
`app/page.tsx` is a React Server Component — it computes the subhead,
imports mocked data, and renders the layout shell. Every interactive piece
(`ChatPanel`, `ContributionGraphShell`, `PinnedRepos`, `InsightsPanel`, …)
is a client component under the `ChatProvider` boundary.

### Icon library
`src/components/icons/index.tsx` exports thin wrappers around inline SVG
paths. All icons accept `size` and `className` props via a shared `Icon`
base component.

### Design tokens
All hex values live in `app/globals.css` under `@theme`. The TypeScript file
`src/lib/tokens.ts` mirrors only the values needed in JS (avatar palette,
per-username overrides).

---

## Considerations

- **No component library (no shadcn, Radix, MUI).** Every UI primitive is
  custom-built on Tailwind + native HTML. The product's GitHub-native visual
  identity is its main differentiator, and the interactive surfaces I needed
  (heatmap with roving tabindex, reasoning trace, scope bar) don't exist in
  any library. 

- **`useReducer` over Redux or other libs .** Chat state is local to one
  provider; a typed reducer with a discriminated `ChatAction` union gives
  exhaustiveness checking and is the right scale for this size of app. I'd
  reach for Zustand if state needed to be consumed outside the `ChatProvider`
  tree.

- **Custom design tokens, no Tailwind defaults for colors.** The semantic
  palette (`accent` = AI, `link` = repos, etc.) is documented in
  [DESIGN.md](DESIGN.md). Every color carries meaning.

- **Mobile is a graceful fallback, not a redesign.** Below 1180px the
  two-pane layout stacks vertically. A true mobile experience would put the
  chat in a sheet behind a FAB — out of scope here.

---

## Beyond the brief

Things in this submission that weren't in the spec:

- **AI Insights panel** ([`src/components/profile/InsightsPanel.tsx`](src/components/profile/InsightsPanel.tsx)).
  Three insights auto-derived from the contribution data — busiest day,
  sprint week, top repo. Each insight, when clicked, both highlights the
  relevant cells on the heatmap and fires a pre-written question into the
  chat.

- **Bidirectional chat ↔ heatmap coupling.** Clicking a reasoning step
  with `sourceDates` highlights the corresponding cells on the heatmap;
  clicking a heatmap cell adds it as a scope chip in the chat. State
  flows both directions through the `ChatProvider`.

- **Tooltip with computed delta.** The cell tooltip shows the day's
  count vs. the trailing-90-day average, colored green/red, plus the
  commits/PRs/reviews split and the top repo for that day.

- **Staggered cell reveal.** Heatmap cells fade in column-by-column on
  mount via a CSS keyframe with an inline `--col` custom property.
  Respects `prefers-reduced-motion`.

---

## Scripts

```bash
npm run dev        # start dev server on :3000
npm run build      # production build
npm run lint       # eslint (0 errors expected)
npm test           # vitest run
npm run test:watch # vitest watch mode
```

---

## Design system

Styling is split across two files with distinct jobs. `app/globals.css` owns every token that becomes a Tailwind utility class — colors, font sizes, and border radii — all declared under `@theme`. `src/lib/tokens.ts` holds the small set of runtime constants needed by JavaScript code only (the avatar background palette and per-username color overrides). The rule: if you reference a value in a `className`, it belongs in `globals.css`; if you reference it in JS logic, it belongs in `tokens.ts`. See [DESIGN.md](DESIGN.md) for the full semantic-color table, typography guide, and radius/spacing scale.

---

## Known not-implemented

- Message persistence or multi-conversation history
- Intent-specific answers for every possible prompt. The chat accepts different
  questions and follow-up chips, but the mock assistant intentionally reuses a
  single canned reasoning flow/answer to keep the challenge focused on the
  frontend experience rather than response-routing logic.
- Year scrubber / analysis-window brush below heatmap
- AI Insights panel driven by real inference
- Component-level tests (Playwright for the chat flow; Vitest + Testing
  Library for heatmap interactions). Pure functions (reducer, utils,
  streaming generator) are covered.
