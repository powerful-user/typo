# Typo

Font management CLI for web and mobile projects. Search, download, link, and generate font configurations for Next.js, Tailwind v4, CSS/Vite, and Flutter.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/powerful-user/typo/main/install.sh | bash
```

Or install manually from source:

```bash
git clone https://github.com/powerful-user/typo.git
cd typo
npm install && npm run build
npm link
```

## Quick Start

```bash
# Set up global font library
typo init --global

# Search and add a font
typo search inter
typo add inter

# Set up a project
cd my-nextjs-project
typo init
typo link inter --variable
typo generate

# Generated: src/fonts.ts with next/font/local config
```

## Commands

| Command | Description |
|---------|-------------|
| `typo init [--global]` | Initialize config (project or global library) |
| `typo add <name>` | Download font from Fontsource |
| `typo add --from <path>` | Add local font files |
| `typo link <name>` | Link library font to project |
| `typo list [--project]` | List fonts in library or project |
| `typo info <name>` | Show font metadata |
| `typo generate` | Generate framework config |
| `typo search <query>` | Search Fontsource catalog |
| `typo subset <name>` | Subset font to character range |
| `typo convert <name>` | Convert font format |

## Framework Support

- **Next.js** — `localFont()` declarations in `src/fonts.ts`
- **Tailwind v4** — `@font-face` + `@theme` block in `src/fonts.css`
- **CSS/Vite** — `@font-face` rules in `src/fonts.css`
- **Flutter** — `fonts:` section in `pubspec.yaml`

Framework is auto-detected from `package.json` / `pubspec.yaml`. Override with `--framework`.

## How It Works

Typo separates font **sourcing** from project **integration**:

1. **Global library** (`~/.typo/`) stores font files, organized by family
2. **Projects** get symlinks to library fonts + generated framework config
3. **Transforms** (subset, convert) output to `.fonts/` build directory — source files are never modified

```
~/.typo/fonts/inter/Inter-Variable.woff2  ← source of truth
      ↓ symlink
my-project/fonts/Inter-Variable.woff2     ← project reference
my-project/src/fonts.ts                   ← generated config
```

## Claude Code Skill

Typo includes a Claude Code skill for intelligent font workflow orchestration. Install it to get natural language font management:

- "Set up fonts for this project"
- "Add Inter and Geist Mono to my project"
- "Optimize fonts for production"

See `skill/SKILL.md` for the skill definition.

## Requirements

- Node.js 18+
- For subsetting/conversion: Python fonttools (`pip install fonttools brotli`)

## Fast Follows

- **React Native / Expo** — Metro bundler has symlink issues; will need file copying strategy
- **Rust rewrite** — Performance-critical path (fontkit → skrifa, config I/O)

## License

MIT
