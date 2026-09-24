# Asset Optimizers

[![Version](https://img.shields.io/badge/version-v2.0.0-blue.svg)](https://github.com/mr-gordon/asset-optimizers)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-purple)](https://vitejs.dev/)
[![TurboRepo](https://img.shields.io/badge/Monorepo-Turborepo-ef4444)](https://turbo.build/)
[![100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-emerald)](https://github.com/mr-gordon/asset-optimizers)

A modern, high-performance web tooling suite and Turborepo monorepo featuring **Universal Icon Studio v1.0.0**, **Image Compressor v1.8.0**, **SVG Optimizer v1.6.5**, and **Font Checker v1.5.1**. Designed for designers and web engineers who value precision, speed, and privacy.

- **Universal Icon Studio (v1.0.0):** [https://app-icon.christopherwinker.de/](https://app-icon.christopherwinker.de/)
- **Image Compressor (v1.8.0):** [https://image.christopherwinker.de/](https://image.christopherwinker.de/)
- **SVG Optimizer (v1.6.5):** [https://svg.christopherwinker.de/](https://svg.christopherwinker.de/)
- **Font Checker (v1.5.1):** [https://fonts.christopherwinker.de/](https://fonts.christopherwinker.de/)

<div style="float: left;">
<img src="https://www.christopherwinker.de/tools/data/screen-image-compressor.png" alt="Vorschau Image Compressor" width="32.5%">
<img src="https://www.christopherwinker.de/tools/data/screen-svg-optimizer.jpg" alt="Vorschau Image Compressor" width="32.5%">
<img src="https://www.christopherwinker.de/tools/data/screen-font-checker.jpg" alt="Vorschau Image Compressor" width="32.5%">
</div>

---

## Workspace Architecture

This project is structured as a Turborepo monorepo:

- **[`apps/icon-studio`](./apps/icon-studio)** (v1.0.0): Universal Icon Studio for cross-platform app icons (iOS, Android, macOS, Windows 11, Web & Favicon). Features real-time system mockups, safe-zone linter, stepped downsampling, native bitstream `.ico` and `.icns` generators, and structured ZIP bulk export. Built with Next.js (App Router), React 19, TypeScript, and Tailwind CSS v4.
- **[`apps/image-compressor`](./apps/image-compressor)** (v1.8.0): Batch image compression, format conversion (JPEG, PNG, WebP, AVIF, GIF, SVG), split slider comparison, 2.5× loupe magnifier, EXIF policy controls, and ZIP bulk export. Built with React 19, TypeScript, and Vite.
- **[`apps/svg-optimizer`](./apps/svg-optimizer)** (v1.6.5): SVG vector icon minification, recoloring (`currentColor` / custom hex), transparent PNG generation (1x–8x), dimension presets (`20, 24, 32, 48, 64, 96px`), and combined SVG + PNG ZIP export. Built with React 19, TypeScript, and Vite.
- **[`apps/font-checker`](./apps/font-checker)** (v1.5.1): Precision WebFont Inspector, Binary Metric Analyzer & Side-by-Side Comparison Studio ("Font Studio Pro"). Embedded fontkit + wawoff2 parser for `.woff2`, `.woff`, `.ttf`, `.otf`, `.ttc`. Features typographic anatomy guides, OS/2 `fsSelection` bit audit, UI stress testing, glyph/ligature inspectors, 80+ language coverage analysis, and zero-CLS `@font-face` compensation CSS generation. Operates both as a Vite web app and a 100% offline standalone HTML file.
- **[`packages/ui`](./packages/ui)**: Shared corporate UI design system tokens, components, and styling.
- **[`packages/tsconfig`](./packages/tsconfig)**: Shared TypeScript config definitions.

---

## Key Features

### 1. 100% Private & Client-Side Processing
All image, SVG, font binary, and icon operations happen 100% locally in your browser. **Your files are never uploaded to any external server or third-party cloud.**

### 2. Consistent Corporate Design System
- **Unified Look & Feel:** Glassmorphic navigation headers, card-based layouts, and refined neutral typography.
- **Interactive Unified Dropzones:** Integrated drag & drop zones with subtle hover tints (blue for Primary A, purple for Comparison B) and active drag indicators.
- **Minimalist Floating Actions:** Bottom-right floating group containing an App Info Modal and Keyboard Shortcuts Dialog (`?`).
- **Complete Favicon & PWA Suite:** Multi-resolution favicons, Apple touch icons, Microsoft Windows tiles, and web app manifests across apps.

### 3. Universal Icon Studio Highlights
- **Cross-Platform Target Suite:** Single-source generation for iOS (App Store & Home Screen squircle), Android (Adaptive Icon with foreground/background layers, legacy & circular shapes), macOS (Liquid squircle with realistic depth/lighting), Windows 11 (App list & Start tiles), and Web / PWA favicon suite.
- **Native Bitstream Generation:** Generates binary multi-resolution `.ico` (16, 32, 48, 64, 128, 256px) and Apple icon bitstream `.icns` (16 to 1024px @2x) directly in the browser via native binary packers without third-party CLI or server dependencies.
- **Stepped Downsampling & Edge Sharpening:** High-fidelity multi-stage downsampling (`canvas` bicubic stepping + unsharp mask sharpening filter) prevents pixel blur and contrast loss on tiny resolutions (16×16, 32×32).
- **Interactive System Mockups & Safe-Zone Linter:** Live preview in realistic OS chrome (macOS Dock, iOS Home Screen, Android Launchers, Windows Start Menu, Browser Tab) with integrated Apple squircle, Android circle/squircle safe-zone guidelines and contrast warnings.
- **PWA Manifest & HTML Meta Generator:** Visual `manifest.json` editor with dynamic category toggles and one-click copyable HTML `<head>` meta tags.

### 4. Font Checker Highlights
- **Dual Engine Pipeline:** Embedded `fontkit` reads raw SFNT binary tables, supported by an embedded `wawoff2` WebAssembly fallback decoder for robust WOFF2 parsing. Parallel native `FontFace` registration ensures pixel-accurate browser rendering.
- **Typographic Anatomy Guides:** Interactive SVG overlays displaying Ascender, Cap Height, Waist (x-Height), Baseline, and Descender lines calculated directly from font binary tables.
- **OS/2 & Windows-Bounds Audit:** Bit-level inspection of `fsSelection` Bit 7 (`USE_TYPO_METRICS` / `0x80`), comparing `sTypo*`, `usWin*`, and `hhea` metrics to diagnose line-height discrepancy across operating systems.
- **UI Component Stress Test:** Live 40px text-input benchmark detecting inner overflow (`scrollHeight > clientHeight`) and calculated descender clipping risk before hitting production.
- **Glyph & OpenType Ligature Inspection:** Interactive glyph browser with pan/zoom detail modal and GSUB lookup inspection (`liga`, `clig`, `dlig`, `calt`).
- **Language Coverage & Zero-CLS Compensation:** Curated orthographic evaluation across 80+ languages, plus automatic `@font-face` fallback CSS generation (`size-adjust`, `ascent-override`, `descent-override`).

### 5. Image & SVG Optimizer Highlights
- **Distortion-Free 2.5× Loupe Zoom:** Pixel-accurate magnifier loupe in Inspector Modal preserving natural aspect ratios for both Original and Compressed images.
- **Transparent Multi-Density PNG Generation:** Export vector SVGs directly to transparent PNGs at 1× through 8× density or standard icon sizes.
- **Combined ZIP Bundling:** Export all optimized assets together with one click.

---

## Changelog

### Release Highlights

#### Universal Icon Studio (v1.0.0)
- **Monorepo Suite Addition:** Added Next.js 15 & React 19 Universal Icon Studio to Turborepo workspace with dev task on port 3003.
- **Unified Design Alignment:** Full integration with `@repo/ui` glassmorphic design system tokens, diamond branding (`StudioDiamondIcon`), unified compact dropzone, and keyboard shortcuts modal (`?`).
- **Comprehensive Platform Engines:** iOS, Android Adaptive, macOS Dock, Windows 11, Web & Favicon generators.
- **Binary Bitstream Packaging:** Native client-side byte packing for multi-density `.ico` and macOS `.icns` files.
- **Standardized Card Previews:** High-resolution preview pods, platform-specific segmented control switches, and one-click structured ZIP export.

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
   # Universal Icon Studio (port 3003)
   npm run dev --filter=@repo/icon-studio

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
