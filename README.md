# Asset Optimizers: Image Compressor, SVG Optimizer & Font Checker

[![Version](https://img.shields.io/badge/version-v1.8.0-blue.svg)](https://github.com/mr-gordon/asset-optimizers)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-purple)](https://vitejs.dev/)
[![TurboRepo](https://img.shields.io/badge/Monorepo-Turborepo-ef4444)](https://turbo.build/)
[![100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-emerald)](https://github.com/mr-gordon/asset-optimizers)

A modern, high-performance web tooling suite and Turborepo monorepo featuring **Image Compressor v1.8.0**, **SVG Optimizer v1.6.5**, and **Font Checker v1.5.1**. Designed for designers and web engineers who value precision, speed, and privacy.

- **Image Compressor (v1.8.0):** [https://image.christopherwinker.de/](https://image.christopherwinker.de/)
- **SVG Optimizer (v1.6.5):** [https://svg.christopherwinker.de/](https://svg.christopherwinker.de/)
- **Font Checker (v1.5.1):** [https://font.christopherwinker.de/](https://font.christopherwinker.de/)

<img src="https://www.christopherwinker.de/tools/data/screen-image-compressor.png" alt="Vorschau Image Compressor" width="100%">

---

## Workspace Architecture

This project is structured as a Turborepo monorepo:

- **[`apps/image-compressor`](./apps/image-compressor)** (v1.8.0): Batch image compression, format conversion (JPEG, PNG, WebP, AVIF, GIF, SVG), split slider comparison, 2.5× loupe magnifier, EXIF policy controls, and ZIP bulk export. Built with React 19, TypeScript, and Vite.
- **[`apps/svg-optimizer`](./apps/svg-optimizer)** (v1.6.5): SVG vector icon minification, recoloring (`currentColor` / custom hex), transparent PNG generation (1x–8x), dimension presets (`20, 24, 32, 48, 64, 96px`), and combined SVG + PNG ZIP export. Built with React 19, TypeScript, and Vite.
- **[`apps/font-checker`](./apps/font-checker)** (v1.5.1): Precision WebFont Inspector, Binary Metric Analyzer & Side-by-Side Comparison Studio ("Font Studio Pro"). Embedded fontkit + wawoff2 parser for `.woff2`, `.woff`, `.ttf`, `.otf`, `.ttc`. Features typographic anatomy guides, OS/2 `fsSelection` bit audit, UI stress testing, glyph/ligature inspectors, 80+ language coverage analysis, and zero-CLS `@font-face` compensation CSS generation. Operates both as a Vite web app and a 100% offline standalone HTML file.
- **[`packages/ui`](./packages/ui)**: Shared corporate UI design system tokens, components, and styling.
- **[`packages/tsconfig`](./packages/tsconfig)**: Shared TypeScript config definitions.

---

## Key Features

### 1. 100% Private & Client-Side Processing
All image, SVG, and font binary operations happen 100% locally in your browser. **Your files are never uploaded to any external server or third-party cloud.**

### 2. Consistent Corporate Design System
- **Unified Look & Feel:** Glassmorphic navigation headers, card-based layouts, and refined neutral typography.
- **Interactive Unified Dropzones:** Integrated drag & drop zones with subtle hover tints (blue for Primary A, purple for Comparison B) and active drag indicators.
- **Minimalist Floating Actions:** Bottom-right floating group containing an App Info Modal and Keyboard Shortcuts Dialog (`?`).
- **Complete Favicon & PWA Suite:** Multi-resolution favicons, Apple touch icons, Microsoft Windows tiles, and web app manifests across apps.

### 3. Font Checker Highlights
- **Dual Engine Pipeline:** Embedded `fontkit` reads raw SFNT binary tables, supported by an embedded `wawoff2` WebAssembly fallback decoder for robust WOFF2 parsing. Parallel native `FontFace` registration ensures pixel-accurate browser rendering.
- **Typographic Anatomy Guides:** Interactive SVG overlays displaying Ascender, Cap Height, Waist (x-Height), Baseline, and Descender lines calculated directly from font binary tables.
- **OS/2 & Windows-Bounds Audit:** Bit-level inspection of `fsSelection` Bit 7 (`USE_TYPO_METRICS` / `0x80`), comparing `sTypo*`, `usWin*`, and `hhea` metrics to diagnose line-height discrepancy across operating systems.
- **UI Component Stress Test:** Live 40px text-input benchmark detecting inner overflow (`scrollHeight > clientHeight`) and calculated descender clipping risk before hitting production.
- **Glyph & OpenType Ligature Inspection:** Interactive glyph browser with pan/zoom detail modal and GSUB lookup inspection (`liga`, `clig`, `dlig`, `calt`).
- **Language Coverage & Zero-CLS Compensation:** Curated orthographic evaluation across 80+ languages, plus automatic `@font-face` fallback CSS generation (`size-adjust`, `ascent-override`, `descent-override`).

### 4. Image & SVG Optimizer Highlights
- **Distortion-Free 2.5× Loupe Zoom:** Pixel-accurate magnifier loupe in Inspector Modal preserving natural aspect ratios for both Original and Compressed images.
- **Transparent Multi-Density PNG Generation:** Export vector SVGs directly to transparent PNGs at 1× through 8× density or standard icon sizes.
- **Combined ZIP Bundling:** Export all optimized assets together with one click.

---

## Changelog

### Release Highlights

#### Font Checker (v1.5.1)
- **Monorepo Integration:** Added to Turborepo workspace with dedicated dev (`port 3002`) and build tasks.
- **Corporate Design Alignment:** Harmonized UI tokens with Image Compressor & SVG Optimizer (unnested cards, glassmorphic header, floating info & shortcuts action buttons, Lucide GitHub branding).
- **Unified Dropzone:** Combined Slot A & Slot B dropzones into a single shared card with dual-color hover tints (`rgba(59, 130, 246, 0.06)` / `rgba(168, 85, 247, 0.06)`).
- **Interactive Font Weight Slider:** Added 10-step increments (`step="10"`) for variable fonts.
- **Favicon & Web App Manifest Suite:** Integrated complete standard icons, Apple touch icons, Windows tiles, and web manifest.
- **Dual-File Offline Parity:** Maintained 100% byte-identical synchronization between `index.html` (Vite) and `index.htm` (standalone offline single-file).

#### Image Compressor (v1.8.0)
- **Fix Loupe Zoom Aspect Ratio Distortion:** Corrected calculation for `object-contain` images; loupe background position & sizing now preserve exact natural aspect ratios.
- **Dynamic Natural Dimension Measurement:** Added automatic `naturalWidth` and `naturalHeight` measurement on image load for reliable rendering.
- **Inline Filename Editing:** Click `<h3>` title in Inspector Modal to edit item filename directly.
- **Circular Icon-Only Action Buttons:** Updated Clear and Save All batch buttons to sleek circular icon buttons.
- **GitHub Repository Links & Info Modal Versioning:** Updated Info Modal with link to `https://github.com/mr-gordon` and version bump to `1.8.0`.

#### SVG Optimizer (v1.6.5)
- **Always Transparent PNG Exports:** Updated PNG renderer default background to `transparent` for single and bulk PNG exports.
- **Combined ZIP Export (`Save all`):** The primary `Save all` action bundles both optimized `.svg` and transparent `.png` files together into a single ZIP archive.
- **Updated Size Presets:** Replaced `16px` preset with `96px` (`20, 24, 32, 48, 64, 96px`).
- **Inline Filename Editing:** Added inline filename editing capability inside Inspector Modal.
- **Circular Action Buttons:** Updated header action buttons (`Clear`, `All (.zip)`) to textless circular icon buttons.
- **Info Modal & GitHub Integration:** Added version bump to `1.6.5` and direct link to `https://github.com/mr-gordon`.

---

## Local Setup & Development

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mr-gordon/asset-optimizers.git
   cd asset-optimizers
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development servers:**
   ```bash
   # Start all applications simultaneously:
   npm run dev

   # Or run individual applications:
   # Image Compressor (port 3000)
   npm run dev --filter=@repo/image-compressor

   # SVG Optimizer (port 3001)
   npm run dev --filter=@repo/svg-optimizer

   # Font Checker (port 3002)
   npm run dev --filter=@repo/font-checker
   ```

4. **Standalone Font Checker (No Node/Build needed):**
   Simply double-click [`apps/font-checker/index.htm`](./apps/font-checker/index.htm) to open it in any modern browser (`file://`), or serve via any static HTTP server:
   ```bash
   python3 -m http.server 8080 --directory apps/font-checker
   ```

5. **Build production bundles:**
   ```bash
   npm run build
   ```

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Author

**Christopher Winker**
- GitHub: [@mr-gordon](https://github.com/mr-gordon)
