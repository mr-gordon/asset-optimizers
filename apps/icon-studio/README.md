# Universal Icon Studio 💎

[![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)](https://github.com/mr-gordon/asset-optimizers)
[![100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-emerald)](https://github.com/mr-gordon/asset-optimizers)

High-performance, 100% client-side universal app icon generator & real-time system mockup studio built with Next.js 15 (App Router), React 19, TypeScript, and Tailwind CSS v4.

## 🌟 Key Features

- **100% Private & Local Processing**: All canvas rasterization, downsampling filters, and binary bitstream packing occur entirely in your browser.
- **Cross-Platform Target Engines**:
  - **iOS**: App Store (1024×1024) and home screen continuous squircle assets.
  - **Android**: Adaptive Icons with foreground & background split layers, legacy squares, and circular assets.
  - **macOS**: Native squircle icon with realistic glassmorphism, rim lighting, and dock themes (Light/Dark).
  - **Windows 11**: App list (48×48) and Start tiles (Medium 150×150) with plate styling.
  - **Web & Favicon Suite**: Multi-resolution favicons, Apple touch icons, Android Chrome icons, Microsoft tiles, and `manifest.json`.
- **Native Binary Bitstream Packaging**:
  - Direct binary generation of multi-resolution Windows `.ico` files (16, 32, 48, 64, 128, 256px).
  - Native byte-level Apple `.icns` packager supporting all retina icon types (16×16 to 1024×1024).
- **Stepped Downsampling & Sharpening**:
  - Multi-pass canvas downsampling prevents aliasing and color bleeding.
  - Optional unsharp mask filter enhances clarity on micro-resolutions (16×16 and 32×32).
- **Interactive System Mockups**: Real-time rendering in realistic OS chrome with safe-zone guides (Apple squircle, Android circular boundary) and contrast validation.
- **PWA Manifest & Meta Generator**: Interactive visual `manifest.json` editor with copyable HTML `<head>` tags.
- **Structured Bulk Export**: Download single icons or full platform ZIP archives with platform-accurate folder structures and manifests.
