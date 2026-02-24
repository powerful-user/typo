---
name: typo
description: Font management for web and mobile projects — search, add, link, and generate font configurations
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

You help users manage fonts across their projects using the `typo` CLI. You handle font discovery, installation, linking, configuration generation, and optimization.

## How Typo Works

Typo maintains a **global font library** at `~/.typo/` and creates **project-local configurations**. Source font files live in the library; projects get symlinks and generated config files.

```
~/.typo/                        # Global library
├── config.json                 # Library settings
├── manifest.json               # Font metadata index
└── fonts/                      # Font files organized by family
    └── inter/

my-project/                     # Per-project
├── .typo.json                  # Project config (framework, fonts)
├── fonts/                      # Symlinks → library
├── .fonts/                     # Build artifacts (subset/convert output)
└── src/fonts.ts|css            # Generated config
```

## Workflows

### "Set up fonts for this project"

1. Check if global library exists: `typo list`. If empty, `typo init --global` first.
2. Detect the project's framework by reading `package.json` or `pubspec.yaml`.
3. `typo init` in the project root to create `.typo.json`.
4. Ask what fonts they want, or recommend based on the project type.
5. For each font: `typo add <name>` (from Fontsource) or `typo add --from <path>` (local).
6. `typo link <name> --variable` (or with `--weights` for static).
7. `typo generate` to create the framework config.
8. Show the user what was generated and how to use it.

### "Add Inter to my project"

1. `typo add inter` (downloads from Fontsource with variable font).
2. `typo link inter --variable`.
3. `typo generate`.
4. Show the generated output file.

### "Search for a monospace font"

1. `typo search monospace` or `typo search "fira code"`.
2. Present results with key details (variable support, weights, license).
3. If they choose one: `typo add <id>`.

### "Optimize fonts for production"

1. Check what fonts are linked: `typo list --project`.
2. Subset to needed character set: `typo subset <name> --preset latin`.
3. Verify savings reported by the subset command.
4. `typo generate` to update config pointing to subset files.

### Font Pairing Recommendations

When asked about font pairing, recommend proven combinations:
- **Inter + JetBrains Mono** — Clean UI with monospace code blocks
- **Geist + Geist Mono** — Vercel's modern type system
- **Plus Jakarta Sans + Fira Code** — Friendly sans + readable mono
- **DM Sans + DM Mono** — Geometric pair by Colophon

## Commands Reference

```
typo init [--global]              # Initialize config
typo add [name] [--from <path>]   # Add font to library
typo link <name> [--variable]     # Link font to project
typo list [--project] [--json]    # List fonts
typo info <name> [--json]         # Show font details
typo generate [--framework <id>]  # Generate config
typo search <query> [--json]      # Search Fontsource
typo subset <name> --preset <p>   # Subset font
typo convert <name> --format <f>  # Convert format
```

## Framework Support

| Framework   | Output            | Content                              |
|-------------|-------------------|--------------------------------------|
| Next.js     | `src/fonts.ts`    | `localFont()` declarations           |
| CSS/Vite    | `src/fonts.css`   | `@font-face` rules                   |
| Tailwind v4 | `src/fonts.css`   | `@font-face` + `@theme` block        |
| Flutter     | `pubspec.yaml`    | `fonts:` section                     |

## Important Rules

- **Never modify source font files** — all transforms output to `.fonts/`.
- Always use `--variable` when the font supports it (smaller, more flexible).
- Default `font-display: swap` unless the user specifies otherwise.
- Add `.fonts/` to `.gitignore` (it's a build artifact directory).
- The `fonts/` directory contains symlinks, which should also be gitignored if the team prefers.
