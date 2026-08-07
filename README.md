# Image Compressor und SVG Optimizer Monorepo

[![Version](https://img.shields.io/badge/version-v1.8.0-blue.svg)](https://github.com/mr-gordon/image-compressor)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-purple)](https://vitejs.dev/)
[![TurboRepo](https://img.shields.io/badge/Monorepo-Turborepo-ef4444)](https://turbo.build/)
[![100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-emerald)](https://github.com/mr-gordon/image-compressor)

A modern, high-performance monorepo featuring **Image Compressor v1.8.0** and **SVG Optimizer v1.6.5** web applications. Built with React 19, TypeScript 5.8, Tailwind CSS v4, and Vite 6.

**Website:** [https://image.christopherwinker.de/](https://image.christopherwinker.de/)

<img src="https://www.christopherwinker.de/tools/data/screen-image-compressor.png" alt="Vorschau" width="100%">

---

## Workspace Architecture

This project is structured as a Turborepo monorepo:

- **[`apps/image-compressor`](./apps/image-compressor)** (v1.8.0): Batch image compression, format conversion (JPEG, PNG, WebP, AVIF, GIF, SVG), split slider comparison, 2.5× loupe magnifier, EXIF policy controls, and ZIP bulk export.
- **[`apps/svg-optimizer`](./apps/svg-optimizer)** (v1.6.5): SVG vector icon minification, recoloring (`currentColor` / custom hex), transparent PNG generation (1x–8x), dimension presets (`20, 24, 32, 48, 64, 96px`), and combined SVG + PNG ZIP export.
- **[`packages/ui`](./packages/ui)**: Shared corporate UI design system tokens and styling.
- **[`packages/tsconfig`](./packages/tsconfig)**: Shared TypeScript config definitions.

---

## Key Features

### 100% Private & Client-Side Processing
All image and SVG operations happen 100% locally in your browser. **Your files are never uploaded to any external server.**

### Sleek Corporate Design & Circular Actions
- **Minimalist Icon Controls:** Sleek circular icon-only buttons for clearing items and saving ZIP archives.
- **Inspector Modal & Inline Filename Editing:** Click `<h3>` titles inside Inspector modals to edit file names inline.
- **Distortion-Free 2.5× Loupe Zoom:** Pixel-accurate magnifier loupe in Inspector Modal preserving original & compressed aspect ratios.

---

## Changelog

### Release v1.8.0 / v1.6.5 (Current)

#### Image Compressor (v1.8.0)
- **Fix Loupe Zoom Aspect Ratio Distortion:** Corrected calculation for object-contain images; loupe background position & sizing now preserve exact natural aspect ratios for both Original and Compressed images.
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
   git clone https://github.com/mr-gordon/image-compressor.git
   cd image-compressor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development servers:**
   ```bash
   # Image Compressor (port 3000)
   npm run dev --filter=@repo/image-compressor

   # SVG Optimizer (port 3001)
   npm run dev --filter=@repo/svg-optimizer
   ```

4. **Build production bundles:**
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
