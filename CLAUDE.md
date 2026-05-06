# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

StealthHumanizer — a Next.js full-stack app that rewrites AI-generated text into human-sounding prose. Two consumers share the same core library:

- **Web app** (`app/`) — Next.js 16 / React 19 UI + API routes (`app/api/*/route.ts`)
- **CLI** (`bin/cli.ts`) — invokes `humanizeText()` directly from `lib/humanizer.ts`, no server involved

Both call into `lib/` for the humanization pipeline. Provider API keys live client-side (web) or in env vars (CLI) and are forwarded straight to providers — the server never persists them.

## Commands

```bash
npm run dev                  # Next dev server (http://localhost:3000)
npm run build                # Production build
npm run start                # Run production build
npm run lint                 # ESLint (eslint-config-next + TS)
npm run cli -- [options]     # Run the CLI (tsx bin/cli.ts)

npm run test:integration     # scripts/tests/integration-smoke.mjs
npm run test:pr2-integrity   # schema integrity check
npm run pipeline:complete    # end-to-end pipeline test
```

There is no unit-test runner — tests are standalone `.mjs` smoke scripts under `scripts/tests/`. Run a single one directly: `node scripts/tests/<name>.mjs`.

The `cli:build` script references `tsconfig.cli.json`, which does not exist in the repo — use `npm run cli` (tsx) for now.

## Architecture

### The pipeline (lib/humanizer.ts and app/api/humanize/route.ts)

The humanization flow is **layered**, and the two entry points implement slightly different versions of it:

1. **Layer 1 — LLM rewrite.** Text is chunked at sentence boundaries (≤2,500 words/chunk) and sent to the configured provider via `generateWithProvider()` (`lib/providers.ts`). The system prompt is composed from `level + style + tone + persona + anti-patterns` in `lib/prompts.ts`. If the corpus style model is loaded (`hasStyleModel()`), `getCorpusAwareSystemPrompt` is used instead, injecting calibrated statistical targets (sentence length, burstiness, etc.).
2. **Layer 2 — Deterministic post-processing** (`lib/postprocess.ts`). Pure non-LLM transforms: em-dash stripping, AI-phrase collocation swaps, safe synonym substitution. **Use `{ light: true }`** unless you specifically want full mode — full mode reorders sentences, which breaks logical flow. The CLI always uses light mode.
3. **Layer 3 (optional, web only) — Multi-model chain** (`lib/chain.ts`). Routes the text through additional providers when `chainModelIds` is set in the request.
4. **Layer 4 — Multi-pass re-humanization.** `lib/detector.ts` scores each sentence; sentences classified as `ai`/`maybe` are batched into a re-humanize prompt and replaced. Pass count is driven by `level`: `light=1`, `medium=1`, `aggressive=2`, `ninja=2-3`. The web route also has a `applyRewriteRegressionGuard` that falls back to the Pass-1 output if the post-processed text drifts too far from the original (lexical overlap / length ratio).

The web route additionally enforces rate limiting (`lib/rate-limit.ts`), safety policy (`lib/server/humanization-governance.ts`), and writes audit logs. **The LLM self-check loop is intentionally disabled** in `app/api/humanize/route.ts` — the comment there explains why (multi-pass self-checking *adds* AI fingerprints rather than removing them).

### Sentence splitting

Both `lib/humanizer.ts` and `lib/postprocess.ts` have their own `splitIntoSentences` / `splitSentences`. Both protect periods inside version numbers, decimals, and IPs (`Llama 3.x`, `0.5`, `192.168.1.1`) so they aren't treated as sentence boundaries — preserve this behavior when touching either splitter.

### Style model (corpus calibration)

`public/corpus-style-model.json` holds statistics extracted from a real academic corpus (OpenAlex, 11 domains). It is loaded at runtime via `fetch()` in browsers and via `node:fs` on the server (`lib/style-model.ts`). When present, it:

- biases the prompt toward measured human distributions (`getCorpusAwareSystemPrompt`)
- recalibrates the AI detector thresholds (`calibrateWithCorpus` in `lib/detector.ts`)
- enables `corpusAwarePostprocess` in Layer 2

Keep `lib/style-model.ts` browser-safe — `node:fs` access must stay behind a runtime check so the client bundle doesn't break (this regressed once; see CHANGELOG 2.1.0).

### Providers (lib/providers.ts)

13 providers behind a single `generateWithProvider(provider, apiKey, systemPrompt, userPrompt, options)` interface. Most are OpenAI-chat-compatible (Groq/Together/OpenRouter/DeepInfra/Cerebras/Mistral/zai). Native adapters: Gemini, Claude, Cohere, HuggingFace, Cloudflare Workers AI. To add a provider, add an entry to `PROVIDERS[]` and a case in `generateWithProvider` (use `openAICompatibleGenerate` if the API matches the OpenAI shape).

### Web vs CLI feature parity

The web route (`app/api/humanize/route.ts`) is the richer surface: rate limiting, safety policy, regression guard, audit logging, batch mode, multi-model chain, runtime model scoring. The CLI is a thinner direct call to `humanizeText()` and does not run those server-side features. When fixing bugs in the pipeline core, prefer changing `lib/` so both consumers benefit; when adding governance/safety features, they typically belong only in the API route.

## Conventions

- **TypeScript strict mode** is on (`tsconfig.json`). The repo is TS-first despite being a JS-preferred user environment — match the existing style.
- ESM-style imports, `@/*` path alias maps to repo root.
- Don't introduce server-side persistence of user prompts, outputs, or keys (see `CONTRIBUTING.md` and `SECURITY.md`).
- Conventional-commit prefixes (`feat:`, `fix:`, `docs:`, `chore:`, `ci:`).

## Upstream

This is a fork of `rudra496/StealthHumanizer`. The `master` branch carries our changes (TypeScript CLI, em-dash stripping, sentence-split fixes for version numbers/decimals — see recent git log). Upstream uses `master`.
