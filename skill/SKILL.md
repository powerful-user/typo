---
name: typo
description: >-
  Font management CLI for web and mobile projects. Search Fontsource catalog,
  download fonts, generate next/font/local and @font-face configurations,
  subset and convert .woff2/.ttf/.otf files. Use when user wants to: (1) add
  custom fonts to a project, (2) generate font config for Next.js, Tailwind v4,
  Vite, or Flutter, (3) search for or browse fonts, (4) optimize font file size
  with subsetting or format conversion, (5) manage a shared font library across
  projects, or (6) set up @font-face, font-display, or CSS custom properties
  for fonts. Trigger keywords: fonts, typography, woff2, font-face, next/font,
  localFont, font-display, Fontsource, font pairing, font loading.
version: 0.1.0
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - Edit
  - Write
---

# Typo — Font Management Skill

You orchestrate font workflows using the `typo` CLI. Your role is deciding the right strategy, running the right commands, and connecting the output to the user's framework.

## Font Strategy Thinking

Before running any commands, consider:

- **Scope**: Single project or monorepo? Monorepo → `init --global` once, `link` from each package.
- **Performance budget**: Total font payload target is <100KB (ideal <50KB). A full Inter variable font is ~300KB unsubset; latin subset is ~48KB.
- **Variable vs static**: Does the design use more than 2 weights? Yes → variable is almost always smaller total payload. Only use static if targeting a single weight.
- **Subsetting**: Is the audience primarily latin script? Yes → subset immediately after adding, save 60-80% payload.
- **Framework implications**: Next.js auto-subsets at build time, so manual subsetting is redundant for Next.js projects. Flutter can't use symlinks — copy files instead.

### When NOT to Use Typo

Skip typo entirely if:
- **Single font via CDN** — user just wants `<link href="fonts.googleapis.com/...">`. No local files, no value from typo.
- **`next/font/google` is sufficient** — if the font is on Google Fonts and the project is Next.js, `next/font/google` handles everything. Typo only helps with local/custom fonts in Next.js.
- **One font, one weight, throwaway project** — writing a single `@font-face` rule by hand is faster than setting up typo.
- **React Native / Expo** — Metro bundler has symlink issues. Typo doesn't support this yet.

### Before Optimizing, Ask

When user asks to optimize fonts, assess before running commands:
- **What's the current total payload?** Run `typo info <name>` for each font to check file count and whether they're already subset.
- **Is the framework already optimizing?** Next.js auto-subsets — manual subsetting is redundant and may conflict.
- **What locales does the app serve?** Latin-only → `--preset latin`. Multi-locale → subset per locale or skip subsetting.
- **Are there unused weights?** If the design only uses 400 and 700 but all weights are linked, re-link with `--weights 400,700` before subsetting.

## Architecture

```
~/.typo/                        # Global library (typo init --global)
├── config.json                 # Library settings
├── manifest.json               # Font metadata index
├── cache/                      # Fontsource catalog cache (24h TTL)
└── fonts/<family>/             # Font files organized by family

project/                        # Per-project (typo init)
├── .typo.json                  # Framework, linked fonts, paths
├── fonts/                      # Symlinks → library (gitignore)
├── .fonts/                     # Build artifacts from subset/convert (gitignore)
└── src/fonts.ts|css            # Generated config (framework-specific)
```

## Commands

```
typo init [--global]              # Initialize config
typo add [name] [--from <path>]   # Add font to library (Fontsource or local)
typo link <name> [--variable]     # Symlink library font into project
typo list [--project] [--json]    # List fonts
typo info <name> [--json]         # Show font metadata
typo generate [--framework <id>]  # Generate framework config
typo search <query> [--json]      # Search Fontsource catalog
typo subset <name> --preset <p>   # Subset to Unicode range → .fonts/
typo convert <name> --format <f>  # Convert format → .fonts/
```

## Workflows

### "Set up fonts for this project"

1. Check global library: `typo list`. If not initialized → `typo init --global`.
2. `typo init` in project root. **Checkpoint**: read `.typo.json` — confirm `version: 1` and `framework` field present.
3. Ask what fonts they want. If unsure, recommend based on project type (see Font Pairing below).
4. For each font: `typo add <name>` or `typo add --from <path>`.
5. `typo link <name> --variable` (prefer variable; use `--weights 400,700` only if design is locked to specific weights).
6. `typo generate`. **Checkpoint**: read the generated file and verify it contains one declaration per linked font, correct relative paths (`../fonts/` for files in `src/`), and variable fonts use weight range not single weight.
7. Show the user the generated file and how to wire it up.

**MANDATORY**: After `typo generate`, read [`references/frameworks.md`](references/frameworks.md) for the target framework to show the user correct usage patterns (layout.tsx className for Next.js, @import order for Tailwind v4, pubspec structure for Flutter). **Do NOT load** `references/commands.md` — the inline reference above is sufficient for this workflow.

### "Add <font> to my project"

1. `typo add <name>` → downloads variable + static from Fontsource.
2. `typo link <name> --variable`.
3. `typo generate`.
4. Read the generated output file and show it to the user.

### "Search for a font"

1. `typo search <query>` — presents family, variable support, weights, license.
2. If they choose one: `typo add <id>`.

### "Set up fonts across a monorepo"

1. `typo init --global` once (at repo root or user home — doesn't matter, it's global).
2. `typo add <name>` for all shared fonts.
3. In each package that needs fonts:
   - `cd packages/<name> && typo init`
   - `typo link <font> --variable`
   - `typo generate`
4. Each package gets its own `.typo.json`, `fonts/` symlinks, and generated config — all pointing to the same global library.
5. Add `fonts/` and `.fonts/` to the root `.gitignore`.

### "Optimize fonts for production"

1. `typo list --project` — check current fonts.
2. Determine if subsetting helps (skip for Next.js — it auto-subsets at build).
3. `typo subset <name> --preset latin` — check the savings % in output.
4. `typo generate` — regenerates config pointing to `.fonts/` build artifacts.

**MANDATORY**: Read [`references/commands.md`](references/commands.md) for full subset/convert flag reference before running optimization commands. Especially check available presets and format options. **Do NOT load** `references/frameworks.md` for this workflow.

### Error Recovery

- **`typo add` fails with HTTP error**: Run `typo search <name>` to verify the ID. Fontsource IDs are lowercase-hyphenated (e.g., `plus-jakarta-sans`, not `Plus Jakarta Sans`).
- **`typo generate` produces empty output**: Run `typo list --project --json` — if `fonts` array is empty, fonts are added to library but not linked. Run `typo link <name>` first.
- **`typo subset` fails**: Run `which pyftsubset` — if not found, install with `pip install fonttools brotli`.
- **Symlinks broken after moving project**: Run `ls -la fonts/` to confirm broken links, then `typo link <name>` to recreate.
- **Generated paths wrong**: Generators resolve paths relative to `src/`. If project has no `src/` dir, the `../fonts/` paths will be wrong — either create `src/` or manually adjust the generated file path.

## NEVER

- **NEVER link static weights when variable font exists** — variable is always smaller total payload and more flexible. The only exception is deliberately targeting a single weight for minimal builds.
- **NEVER use `font-display: swap` for above-fold hero text** — causes visible text reflow (FOUT). Use `optional` for critical UI text that must not shift, `swap` for body copy.
- **NEVER skip subsetting for production** (except Next.js which auto-subsets) — a full variable font can be 300KB+, latin subset is 50KB. The user won't miss the glyphs, but they'll feel the load time.
- **NEVER manually edit generated files** (`src/fonts.ts`, `src/fonts.css`) — `typo generate` overwrites them. Edit `.typo.json` config instead, then regenerate.
- **NEVER commit `.fonts/` or `fonts/` symlinks** — both should be in `.gitignore`. `.fonts/` is a build artifact; `fonts/` symlinks resolve to absolute paths that differ per machine.
- **NEVER mix symlinked and copied font files** in the same project — pick one strategy. Symlinks break in Docker builds and some CI environments.
- **NEVER use `typo subset` in a Next.js project** — Next.js already subsets fonts at build time via `next/font`. Manual subsetting creates redundant work and may conflict.
- **NEVER assume Tailwind v4 `@theme` variable names are arbitrary** — they must follow the `--font-*` convention to map to `font-*` utility classes (e.g., `--font-sans` → `font-sans`).

## Font Pairing Recommendations

When asked for pairing advice:

| Project Type | Heading | Body | Mono | Why |
|---|---|---|---|---|
| SaaS / Dashboard | Inter | Inter | JetBrains Mono | Neutral, high readability at small sizes |
| Marketing / Landing | Plus Jakarta Sans | DM Sans | Fira Code | Friendly geometric warmth |
| Vercel-style | Geist | Geist | Geist Mono | Cohesive modern system |
| Editorial / Blog | Newsreader | Source Serif 4 | Source Code Pro | Serif authority for long-form |
| Minimal / Dev tool | IBM Plex Sans | IBM Plex Sans | IBM Plex Mono | Systematic, technical feel |

## Framework Quick Reference

| Framework | Output | Content | Notes |
|---|---|---|---|
| Next.js | `src/fonts.ts` | `localFont()` with `variable` CSS prop | Auto-subsets; use in layout.tsx className |
| Tailwind v4 | `src/fonts.css` | `@font-face` + `@theme { --font-* }` | Import AFTER `@import "tailwindcss"` |
| CSS/Vite | `src/fonts.css` | `@font-face` with `font-display` | Standard; import in entry CSS |
| Flutter | `pubspec.yaml` | `fonts:` section merge | Must copy files, not symlink |

For detailed framework usage examples and generated output samples, read [`references/frameworks.md`](references/frameworks.md).
