# Typo CLI — Command Reference

## typo init

Initialize typo configuration.

```
typo init           # Create .typo.json in current directory
typo init --global  # Create ~/.typo/ global font library
```

**Global init** creates:
- `~/.typo/config.json` — library settings
- `~/.typo/fonts/` — font file storage
- `~/.typo/manifest.json` — font metadata index (created on first add)

**Project init** creates:
- `.typo.json` — project configuration with framework, font list, paths

---

## typo add

Add a font to the global library.

```
typo add inter                          # Download from Fontsource
typo add inter --weights 400,700        # Specific weights only
typo add inter --subset cyrillic        # Non-default subset
typo add --from ~/fonts/Inter.woff2     # From local file
typo add --from ~/fonts/inter/          # From local directory
typo add my-font --from ./CustomFont.ttf  # With custom ID
```

**From Fontsource**: downloads the font's variable version (if available) plus requested static weights. Default subset is `latin`.

**From local**: copies files into `~/.typo/fonts/<id>/` and reads metadata with fontkit.

---

## typo link

Link a library font to the current project.

```
typo link inter                    # Link all files
typo link inter --variable         # Only variable font files
typo link inter --weights 400,700  # Only specific weights
typo link inter --display optional # Set font-display
typo link inter --css-variable --font-heading  # Custom CSS var
```

Creates symlinks in `fonts/` pointing to the global library. Updates `.typo.json` with font configuration.

---

## typo list

List fonts in library or project.

```
typo list             # Library fonts
typo list --project   # Project fonts
typo list --json      # JSON output
```

---

## typo info

Show detailed information about a library font.

```
typo info inter         # Human-readable output
typo info inter --json  # JSON output
```

Shows: family name, source, file list, weights, styles, variable axes, license.

---

## typo generate

Generate framework-specific font configuration.

```
typo generate                    # Auto-detect framework
typo generate --framework nextjs # Override detection
```

**Auto-detection priority**:
1. Flutter (pubspec.yaml) — weight 10
2. Next.js (package.json deps) — weight 9
3. Tailwind v4 (package.json or CSS @import) — weight 8
4. Vite (package.json deps) — weight 5
5. Falls back to plain CSS

**Conflict resolution**: Next.js + Tailwind → nextjs generator (handles both).

---

## typo search

Search the Fontsource catalog.

```
typo search inter           # Search by name
typo search "fira code"     # Multi-word search
typo search mono --limit 5  # Limit results
typo search inter --json    # JSON output
```

Caches the full Fontsource catalog locally for 24 hours.

---

## typo subset

Subset a font to specific character ranges. Output goes to `.fonts/`.

```
typo subset inter --preset latin        # Preset Unicode range
typo subset inter --preset cyrillic     # Cyrillic preset
typo subset inter --unicodes U+0-FF     # Custom range
typo subset inter --text "Hello World"  # Only these characters
typo subset inter --preset latin --format woff2  # Specify output format
```

**Available presets**: latin, latin-ext, cyrillic, cyrillic-ext, greek, greek-ext, vietnamese.

**Requires**: `pyftsubset` from Python fonttools (`pip install fonttools brotli`).

---

## typo convert

Convert font format. Output goes to `.fonts/`.

```
typo convert inter --format woff2  # Convert to woff2
typo convert inter --format ttf    # Convert to TTF
```

**Supported formats**: woff2, woff, ttf, otf.

**Requires**: `pyftsubset` from Python fonttools (`pip install fonttools brotli`).
