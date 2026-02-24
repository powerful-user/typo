# Typo CLI — Full Flag Reference

Load this file when you need exact flag syntax for subset, convert, or advanced add/link options. The inline command list in SKILL.md covers common usage — this file covers the full surface area.

## typo add

```
typo add inter                            # Fontsource: variable + all static weights
typo add inter --weights 400,700          # Fontsource: specific weights only
typo add inter --subset cyrillic          # Fontsource: non-latin subset
typo add --from ~/fonts/Inter.woff2       # Local: single file
typo add --from ~/fonts/inter/            # Local: directory (all font files)
typo add my-font --from ./CustomFont.ttf  # Local: with explicit font ID
```

**Fontsource behavior**: always tries variable font first. If available, downloads it alongside any requested static weights. Default subset is `latin`.

**Local behavior**: copies files into `~/.typo/fonts/<id>/`, reads metadata via fontkit to populate manifest. ID is derived from family name if not specified.

## typo link

```
typo link inter                          # All files for this font
typo link inter --variable               # Only variable font files
typo link inter --weights 400,700        # Only matching static weights
typo link inter --display optional       # Override font-display (default: swap)
typo link inter --css-variable --font-heading  # Custom CSS variable name
```

**Filter interaction**: `--variable` and `--weights` are mutually exclusive in practice. If both given, `--variable` takes precedence (variable files have no weight filter).

**What it does**: creates symlinks in project `fonts/` dir → `~/.typo/fonts/<family>/`, updates `.typo.json` with font entry.

## typo subset

Requires: `pyftsubset` (`pip install fonttools brotli`)

```
typo subset inter --preset latin           # Preset Unicode range
typo subset inter --preset latin-ext       # Extended latin
typo subset inter --preset cyrillic        # Cyrillic characters
typo subset inter --unicodes U+0000-00FF   # Custom Unicode range
typo subset inter --text "Hello World"     # Only characters in string
typo subset inter --preset latin --format woff2  # Output format (default: woff2)
```

**Available presets**: `latin`, `latin-ext`, `cyrillic`, `cyrillic-ext`, `greek`, `greek-ext`, `vietnamese`

**Output**: all files go to `.fonts/` build directory. Original library files are never modified. Typical savings: 60-80% for latin subset of a full Unicode font.

**Edge case**: subsetting a font that's already subset (e.g., Fontsource latin download) yields minimal additional savings. Check `typo info <name>` for the font's existing subset coverage.

## typo convert

Requires: `pyftsubset` (`pip install fonttools brotli`)

```
typo convert inter --format woff2   # Convert to woff2 (smallest web format)
typo convert inter --format woff    # Convert to woff (wider compat, larger)
typo convert inter --format ttf     # Convert to TrueType
typo convert inter --format otf     # Convert to OpenType
```

**Output**: `.fonts/` build directory. Skips files already in target format.

**When to convert**: primarily useful when you have TTF/OTF source files and need woff2 for web. Fontsource already provides woff2, so conversion is rarely needed for Fontsource fonts.

## typo generate

```
typo generate                      # Auto-detect framework from project files
typo generate --framework nextjs   # Force Next.js generator
typo generate --framework tailwind-v4
typo generate --framework css
typo generate --framework flutter
```

**Detection priority** (highest wins):
1. `pubspec.yaml` with `flutter:` → flutter (weight 10)
2. `next` in package.json deps → nextjs (weight 9)
3. `tailwindcss` v4 or `@tailwindcss/*` plugins → tailwind-v4 (weight 8)
4. `@import "tailwindcss"` in CSS → tailwind-v4 (weight 7)
5. `vite` in deps → vite/css (weight 5)

**Conflict resolution**: Next.js + Tailwind v4 → nextjs (the Next.js generator handles both concerns).

**File resolution order**: prefers `.fonts/` build artifacts over `fonts/` symlinks. If you've subset a font, regenerating will automatically point to the subset file.
