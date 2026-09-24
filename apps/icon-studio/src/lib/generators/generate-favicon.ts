import { IconConfig, AssetFile } from '../../types/icon';
import {
  renderIconCanvas,
  renderSteppedDownsample,
  canvasToBlob,
  blobToArrayBuffer,
} from '../canvas-utils';

/**
 * Packs multiple PNG Blobs into a single valid Windows/Web .ico binary file.
 */
export async function createIcoBitstream(
  images: { width: number; height: number; blob: Blob }[]
): Promise<Blob> {
  const count = images.length;
  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + entrySize * count;

  // Read all png array buffers
  const buffers: ArrayBuffer[] = [];
  for (const img of images) {
    buffers.push(await blobToArrayBuffer(img.blob));
  }

  // Calculate total file size
  let totalSize = dirSize;
  for (const buf of buffers) {
    totalSize += buf.byteLength;
  }

  const outBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(outBuffer);
  const outBytes = new Uint8Array(outBuffer);

  // 1. ICONDIR Header (6 bytes)
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // 1 = ICO
  view.setUint16(4, count, true); // image count

  // 2. ICONDIRENTRY Entries (16 bytes each)
  let currentOffset = dirSize;
  for (let i = 0; i < count; i++) {
    const entryOffset = headerSize + i * entrySize;
    const img = images[i];
    const buf = buffers[i];
    const w = img.width >= 256 ? 0 : img.width;
    const h = img.height >= 256 ? 0 : img.height;

    view.setUint8(entryOffset + 0, w); // width
    view.setUint8(entryOffset + 1, h); // height
    view.setUint8(entryOffset + 2, 0); // color count
    view.setUint8(entryOffset + 3, 0); // reserved
    view.setUint16(entryOffset + 4, 1, true); // color planes
    view.setUint16(entryOffset + 6, 32, true); // bits per pixel
    view.setUint32(entryOffset + 8, buf.byteLength, true); // bytes in resource
    view.setUint32(entryOffset + 12, currentOffset, true); // image offset

    // Copy PNG bytes into outBuffer at currentOffset
    outBytes.set(new Uint8Array(buf), currentOffset);
    currentOffset += buf.byteLength;
  }

  return new Blob([outBuffer], { type: 'image/x-icon' });
}

/**
 * Generates all Web & Favicon assets:
 * - favicon.ico (16, 32, 48px)
 * - favicon-16x16.png
 * - favicon-32x32.png
 * - apple-touch-icon.png (180x180)
 * - icon-192.png
 * - icon-512.png
 * - icon-512-maskable.png (20% safe margin filled with background)
 */
export async function generateWebAssets(
  img: HTMLImageElement,
  config: IconConfig
): Promise<AssetFile[]> {
  const assets: AssetFile[] = [];

  // 1. Master 1024 base canvas
  const masterCanvas = renderIconCanvas(img, config, 1024);

  // Favicon sizes: 16, 32, 48
  const ico16Canvas = renderSteppedDownsample(masterCanvas, 16, 16);
  const ico32Canvas = renderSteppedDownsample(masterCanvas, 32, 32);
  const ico48Canvas = renderSteppedDownsample(masterCanvas, 48, 48);

  const [blob16, blob32, blob48] = await Promise.all([
    canvasToBlob(ico16Canvas),
    canvasToBlob(ico32Canvas),
    canvasToBlob(ico48Canvas),
  ]);

  // Combine into multi-size favicon.ico
  const icoBlob = await createIcoBitstream([
    { width: 16, height: 16, blob: blob16 },
    { width: 32, height: 32, blob: blob32 },
    { width: 48, height: 48, blob: blob48 },
  ]);

  assets.push({ path: 'web/favicon.ico', blob: icoBlob });
  assets.push({ path: 'web/favicon-16x16.png', blob: blob16 });
  assets.push({ path: 'web/favicon-32x32.png', blob: blob32 });

  // 2. Apple Touch Icon 180x180 (Apple requires opaque background, square without rounded corners)
  const appleTouchCanvas = renderIconCanvas(img, config, 180, { forceOpaque: true });
  const appleTouchBlob = await canvasToBlob(appleTouchCanvas);
  assets.push({ path: 'web/apple-touch-icon.png', blob: appleTouchBlob });

  // 3. PWA Icon 192x192
  const pwa192Canvas = renderSteppedDownsample(masterCanvas, 192, 192);
  const pwa192Blob = await canvasToBlob(pwa192Canvas);
  assets.push({ path: 'web/icon-192.png', blob: pwa192Blob });

  // 4. PWA Icon 512x512
  const pwa512Canvas = renderSteppedDownsample(masterCanvas, 512, 512);
  const pwa512Blob = await canvasToBlob(pwa512Canvas);
  assets.push({ path: 'web/icon-512.png', blob: pwa512Blob });

  // 5. PWA Maskable Icon 512x512
  const maskableCanvas = renderIconCanvas(img, config, 512, {
    forceOpaque: true,
    customPadding: config.padding,
  });
  const maskableBlob = await canvasToBlob(maskableCanvas);
  assets.push({ path: 'web/icon-512-maskable.png', blob: maskableBlob });

  return assets;
}
