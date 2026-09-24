import JSZip from 'jszip';
import { IconConfig, AssetFile } from '../types/icon';
import { generateIosAssets } from './generators/generate-ios';
import { generateAndroidAssets } from './generators/generate-android';
import { generateMacOsAssets } from './generators/generate-macos';
import { generateWebAssets, createIcoBitstream } from './generators/generate-favicon';
import { buildWebManifest } from './generate-manifest';
import {
  renderIconCanvas,
  renderSteppedDownsample,
  canvasToBlob,
} from './canvas-utils';

export interface PackagingProgressCallback {
  (percentage: number, statusText: string): void;
}

/**
 * Generates Windows specific assets:
 * - windows/app.ico (16, 24, 32, 48, 64, 128, 256px multi-layer ICO)
 * - windows/Square150x150Logo.png
 * - windows/Square44x44Logo.png
 */
async function generateWindowsAssets(
  img: HTMLImageElement,
  config: IconConfig
): Promise<AssetFile[]> {
  const assets: AssetFile[] = [];
  const master1024 = renderIconCanvas(img, config, 1024, { forceOpaque: true });

  const winSizes = [16, 24, 32, 48, 64, 128, 256];
  const icoEntries: { width: number; height: number; blob: Blob }[] = [];

  for (const size of winSizes) {
    const canvas = renderSteppedDownsample(master1024, size, size);
    const blob = await canvasToBlob(canvas);
    icoEntries.push({ width: size, height: size, blob });
  }

  const winIcoBlob = await createIcoBitstream(icoEntries);
  assets.push({
    path: 'windows/app.ico',
    blob: winIcoBlob,
  });

  // Windows Tile Logos
  const tile150 = renderSteppedDownsample(master1024, 150, 150);
  const tile150Blob = await canvasToBlob(tile150);
  assets.push({
    path: 'windows/Square150x150Logo.png',
    blob: tile150Blob,
  });

  const tile44 = renderSteppedDownsample(master1024, 44, 44);
  const tile44Blob = await canvasToBlob(tile44);
  assets.push({
    path: 'windows/Square44x44Logo.png',
    blob: tile44Blob,
  });

  return assets;
}

/**
 * Assembles all assets across all operating systems and platforms into universal-app-icons.zip
 */
export async function packageAllAssets(
  img: HTMLImageElement,
  config: IconConfig,
  onProgress?: PackagingProgressCallback
): Promise<Blob> {
  const zip = new JSZip();

  // 1. iOS Assets (10%)
  onProgress?.(10, 'Generiere iOS AppIcon.appiconset...');
  const iosAssets = await generateIosAssets(img, config);
  for (const item of iosAssets) {
    zip.file(item.path, item.blob);
  }

  // 2. Android Assets (30%)
  onProgress?.(30, 'Generiere Android mipmap & Adaptive Icons...');
  const androidAssets = await generateAndroidAssets(img, config);
  for (const item of androidAssets) {
    zip.file(item.path, item.blob);
  }

  // 3. macOS Assets (50%)
  onProgress?.(50, 'Generiere macOS AppIcon.icns & Iconset...');
  const macosAssets = await generateMacOsAssets(img, config);
  for (const item of macosAssets) {
    zip.file(item.path, item.blob);
  }

  // 4. Windows Assets (70%)
  onProgress?.(70, 'Generiere Windows multi-res app.ico...');
  const windowsAssets = await generateWindowsAssets(img, config);
  for (const item of windowsAssets) {
    zip.file(item.path, item.blob);
  }

  // 5. Web Assets & Manifest (85%)
  onProgress?.(85, 'Generiere Web Favicons & manifest.json...');
  const webAssets = await generateWebAssets(img, config);
  for (const item of webAssets) {
    zip.file(item.path, item.blob);
  }

  // Add manifest.json to web/
  const manifestObj = buildWebManifest(config);
  const manifestBlob = new Blob([JSON.stringify(manifestObj, null, 2)], {
    type: 'application/json',
  });
  zip.file('web/manifest.json', manifestBlob);

  // 6. Generate ZIP binary (95%)
  onProgress?.(95, 'Komprimiere universal-app-icons.zip...');
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress?.(95 + Math.round(metadata.percent * 0.05), `ZIP Kompression: ${Math.round(metadata.percent)}%`);
    }
  );

  onProgress?.(100, 'Fertig!');
  return zipBlob;
}

/**
 * Triggers native browser download without third-party dependencies
 */
export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
}
