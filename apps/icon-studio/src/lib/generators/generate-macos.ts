import { IconConfig, AssetFile } from '../../types/icon';
import {
  renderIconCanvas,
  renderSteppedDownsample,
  canvasToBlob,
  blobToArrayBuffer,
} from '../canvas-utils';

interface IcnsEntry {
  ostype: string;
  size: number;
  blob: Blob;
}

/**
 * Packs multiple PNG blobs into a valid Apple ICNS binary file format.
 */
export async function createIcnsBitstream(entries: IcnsEntry[]): Promise<Blob> {
  const preparedEntries: { ostype: string; buffer: ArrayBuffer }[] = [];

  for (const entry of entries) {
    const buffer = await blobToArrayBuffer(entry.blob);
    preparedEntries.push({
      ostype: entry.ostype,
      buffer,
    });
  }

  // Calculate total size: 8 bytes file header + for each chunk: 8 bytes (4 ostype + 4 length) + buffer.byteLength
  let totalLength = 8;
  for (const item of preparedEntries) {
    totalLength += 8 + item.buffer.byteLength;
  }

  const outBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(outBuffer);
  const outBytes = new Uint8Array(outBuffer);

  // File Header
  // 'icns' = 0x69636E73
  view.setUint32(0, 0x69636e73, false); // Big Endian
  view.setUint32(4, totalLength, false); // Big Endian total size

  let offset = 8;
  for (const item of preparedEntries) {
    // Write 4-char OSType
    for (let c = 0; c < 4; c++) {
      view.setUint8(offset + c, item.ostype.charCodeAt(c));
    }
    // Write chunk length (8 + payload) Big Endian
    const chunkLen = 8 + item.buffer.byteLength;
    view.setUint32(offset + 4, chunkLen, false);

    // Copy payload
    outBytes.set(new Uint8Array(item.buffer), offset + 8);
    offset += chunkLen;
  }

  return new Blob([outBuffer], { type: 'image/x-icns' });
}

/**
 * Generates complete macOS asset package:
 * - AppIcon.icns
 * - AppIcon.iconset/ directory files for iconutil
 */
export async function generateMacOsAssets(
  img: HTMLImageElement,
  config: IconConfig
): Promise<AssetFile[]> {
  const assets: AssetFile[] = [];

  // macOS app icons traditionally use continuous squircle with padding
  const master1024 = renderIconCanvas(img, config, 1024, {
    maskShape: 'squircle',
    forceOpaque: true,
  });

  const sizes = [
    { name: '16x16', size: 16, ostype: 'ic04' },
    { name: '16x16@2x', size: 32, ostype: 'ic11' },
    { name: '32x32', size: 32, ostype: 'ic05' },
    { name: '32x32@2x', size: 64, ostype: 'ic12' },
    { name: '128x128', size: 128, ostype: 'ic07' },
    { name: '128x128@2x', size: 256, ostype: 'ic13' },
    { name: '256x256', size: 256, ostype: 'ic08' },
    { name: '256x256@2x', size: 512, ostype: 'ic14' },
    { name: '512x512', size: 512, ostype: 'ic09' },
    { name: '512x512@2x', size: 1024, ostype: 'ic10' },
  ];

  const icnsEntries: IcnsEntry[] = [];

  for (const s of sizes) {
    const canvas = s.size === 1024 ? master1024 : renderSteppedDownsample(master1024, s.size, s.size);
    const blob = await canvasToBlob(canvas);

    // Add to iconset folder
    assets.push({
      path: `macos/AppIcon.iconset/icon_${s.name}.png`,
      blob,
    });

    icnsEntries.push({
      ostype: s.ostype,
      size: s.size,
      blob,
    });
  }

  // Create AppIcon.icns binary
  const icnsBlob = await createIcnsBitstream(icnsEntries);
  assets.push({
    path: 'macos/AppIcon.icns',
    blob: icnsBlob,
  });

  return assets;
}
