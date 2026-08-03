# Image Compressor ⚡️

[![Version](https://img.shields.io/badge/version-v1.7.0-blue.svg)](https://github.com/mr-gordon/image-compressor)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple)](https://vitejs.dev/)
[![100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-emerald)](https://github.com/mr-gordon/image-compressor)

A modern, high-performance, 100% client-side batch image compression & format conversion web application built with React 19, TypeScript, and Vite. Designed with an Apple/Corporate design system aesthetic, featuring real-time interactive previews, blink tests, and customizable compression profiles.

**Repository:** [https://github.com/mr-gordon/image-compressor](https://github.com/mr-gordon/image-compressor)

---

## Key Features

### 100% Private & Client-Side Processing
All image processing and conversion happens locally inside your browser using native HTML5 Canvas and Web APIs. **Your images are never uploaded to any external server.**

### Modern Adaptive Layout
- **Dynamic Centering:** In the initial default state (`Auto` mode with no files), the dropzone is vertically centered on your screen for a clean, distraction-free experience.
- **Smart Top-Shift:** Toggling to `Pro` mode or dropping files smoothly transitions the layout upwards to maximize space for compression controls and image batch lists.
- **Compact Sleek Sizing:** Ultra-compact dropzone bar in active state so you can process hundreds of images effortlessly.

### Auto & Pro Compression Modes
- **Auto Mode:** Intelligent automatic compression defaults (WebP output, 80% quality, EXIF stripped) for one-click optimization.
- **Pro Mode:** Complete manual control over target format, quality percentage, target file size (in KB), custom width/height resizing, aspect ratio presets, chroma subsampling (`4:4:4`, `4:2:2`, `4:2:0`), and EXIF metadata policies.

### Multi-Format Support
Input & Output support for:
- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.avif`
- `.gif`
- `.svg`

### Preset Profiles
Instant configuration via built-in profiles:
-  **Web Performance:** WebP, 1920px max, 80% Quality, EXIF stripped.
-  **Photographer Archive:** Original format, 92% Quality, Keep EXIF.
-  **Email and Social:** JPEG, Target ~500 KB, 1920px max.
-  **Lossless Clean:** Lossless optimization, EXIF stripped.

### Inspector Modal & Blink Test
- Compare original and compressed images side-by-side.
- Press **Spacebar** to toggle an interactive "Blink Test" (overlaying original over compressed).
- Per-image setting overrides for fine-grained batch tweaking.

### Smart Batch Export & Keyboard Shortcuts
- Download individual optimized images or bulk export as a `.zip` archive.
- **`Ctrl+V` / `Cmd+V`**: Paste images directly from clipboard.
- **`Ctrl+S` / `Cmd+S`**: Download all processed images.
- **`Spacebar`**: Toggle Blink Test in Inspector.
- **`Esc`**: Close modal dialogs.
- **`Delete` / `Backspace`**: Remove active image.

---

## Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript 5.8](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS Design System Tokens
- **Icons:** [Lucide React](https://lucide.react.dev/)
- **Zip Generation:** [JSZip](https://stuk.github.io/jszip/)

---

## Local Setup & Installation

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

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Lint and type-check:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled static bundle will be generated in the `dist/` directory.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Author

**Christopher Winker**
- GitHub: [@mr-gordon](https://github.com/mr-gordon)
- Website: [https://github.com/mr-gordon/image-compressor](https://github.com/mr-gordon/image-compressor)
