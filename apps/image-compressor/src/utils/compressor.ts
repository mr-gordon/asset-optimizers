import { BatchSettings, ImageItem } from '../types';
import { extractApp1Segment, injectExifToJpeg } from './exif';

export interface CompressionResult {
  blob: Blob;
  size: number;
  width: number;
  height: number;
  mimeType: string;
}

/**
 * Checks if browser supports AVIF export via canvas.toBlob
 */
let avifSupportedCache: boolean | null = null;
export async function checkAvifSupport(): Promise<boolean> {
  if (avifSupportedCache !== null) return avifSupportedCache;
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvas.toBlob((blob) => {
      avifSupportedCache = blob !== null && blob.type === 'image/avif';
      resolve(avifSupportedCache);
    }, 'image/avif');
  });
}

/**
 * Loads an image from a File/Blob into HTMLImageElement
 */
export function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Calculates resized dimensions while respecting aspect ratios or crop presets
 */
export function calculateTargetDimensions(
  origW: number,
  origH: number,
  resizeSettings: BatchSettings['resize']
): { width: number; height: number; cropX: number; cropY: number; cropW: number; cropH: number } {
  let targetW = origW;
  let targetH = origH;
  let cropX = 0;
  let cropY = 0;
  let cropW = origW;
  let cropH = origH;

  // 1. Aspect Ratio Presets
  if (resizeSettings.aspectRatioPreset !== 'original' && resizeSettings.aspectRatioPreset !== 'custom') {
    let targetRatio = 1;
    if (resizeSettings.aspectRatioPreset === '16:9') targetRatio = 16 / 9;
    else if (resizeSettings.aspectRatioPreset === '1:1') targetRatio = 1;
    else if (resizeSettings.aspectRatioPreset === '4:3') targetRatio = 4 / 3;
    else if (resizeSettings.aspectRatioPreset === '3:2') targetRatio = 3 / 2;
    else if (resizeSettings.aspectRatioPreset === '1200x630') targetRatio = 1200 / 630;

    const currentRatio = origW / origH;
    if (currentRatio > targetRatio) {
      // Image is wider than crop box
      cropW = origH * targetRatio;
      cropH = origH;
      cropX = (origW - cropW) / 2;
    } else {
      // Image is taller than crop box
      cropW = origW;
      cropH = origW / targetRatio;
      cropY = (origH - cropH) / 2;
    }

    targetW = cropW;
    targetH = cropH;

    if (resizeSettings.aspectRatioPreset === '1200x630') {
      targetW = 1200;
      targetH = 630;
    }
  }

  // 2. Max Dimension constraints
  let maxW = Infinity;
  let maxH = Infinity;

  if (resizeSettings.mode === 'fhd') {
    maxW = 1920;
    maxH = 1080;
  } else if (resizeSettings.mode === '4k') {
    maxW = 3840;
    maxH = 2160;
  } else if (resizeSettings.mode === 'custom') {
    if (resizeSettings.maxWidth && resizeSettings.maxWidth > 0) maxW = resizeSettings.maxWidth;
    if (resizeSettings.maxHeight && resizeSettings.maxHeight > 0) maxH = resizeSettings.maxHeight;
  }

  if (targetW > maxW || targetH > maxH) {
    if (resizeSettings.maintainAspectRatio) {
      const scale = Math.min(maxW / targetW, maxH / targetH);
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
    } else {
      targetW = Math.min(targetW, maxW);
      targetH = Math.min(targetH, maxH);
    }
  }

  return {
    width: Math.max(1, Math.round(targetW)),
    height: Math.max(1, Math.round(targetH)),
    cropX: Math.round(cropX),
    cropY: Math.round(cropY),
    cropW: Math.round(cropW),
    cropH: Math.round(cropH),
  };
}

/**
 * Main compression function for a single ImageItem
 */
export async function compressSingleImage(
  item: ImageItem,
  globalSettings: BatchSettings
): Promise<CompressionResult> {
  const settings: BatchSettings = {
    ...globalSettings,
    ...(item.overrideSettings || {}),
  };

  const img = await loadImage(item.file);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  // Calculate target dimensions & crops
  const dims = calculateTargetDimensions(origW, origH, settings.resize);

  // Setup OffscreenCanvas or standard Canvas
  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Determine output MIME type
  let mimeType = settings.targetFormat;
  if (mimeType === 'original') {
    mimeType = (item.mimeType as any) || 'image/jpeg';
  }

  // Fallback if AVIF requested but not supported
  if (mimeType === 'image/avif') {
    const isAvifOk = await checkAvifSupport();
    if (!isAvifOk) {
      mimeType = 'image/webp'; // Fallback to WebP
    }
  }

  // Handle transparent background for non-alpha formats (JPEG)
  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = settings.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, dims.width, dims.height);
  } else {
    ctx.clearRect(0, 0, dims.width, dims.height);
  }

  // Chroma Subsampling rendering tuning
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = settings.chromaSubsampling === '4:4:4' ? 'high' : 'medium';

  // Draw scaled & cropped image
  ctx.drawImage(
    img,
    dims.cropX,
    dims.cropY,
    dims.cropW,
    dims.cropH,
    0,
    0,
    dims.width,
    dims.height
  );

  // Compression & Blob Generation
  let finalBlob: Blob;

  if (settings.qualityMode === 'target_size') {
    // Binary search for target KB size
    const targetBytes = settings.targetSizeKb * 1024;
    let minQ = 0.05;
    let maxQ = 0.98;
    let bestBlob: Blob | null = null;

    for (let i = 0; i < 7; i++) {
      const testQ = (minQ + maxQ) / 2;
      const currentBlob = await canvasToBlob(canvas, mimeType, testQ);
      bestBlob = currentBlob;

      if (currentBlob.size > targetBytes) {
        maxQ = testQ; // Size too big, drop quality
      } else {
        minQ = testQ; // Size within limit, try slightly higher quality
      }
    }
    finalBlob = bestBlob || (await canvasToBlob(canvas, mimeType, settings.quality / 100));
  } else {
    // Percentage quality mode
    const qualityDecimal = Math.max(0.01, Math.min(1.0, settings.quality / 100));
    finalBlob = await canvasToBlob(canvas, mimeType, qualityDecimal);
  }

  // Handle EXIF metadata
  if (!settings.stripExif && (item.mimeType.includes('jpeg') || item.mimeType.includes('jpg')) && mimeType === 'image/jpeg') {
    const app1Segment = await extractApp1Segment(item.file);
    if (app1Segment) {
      finalBlob = await injectExifToJpeg(finalBlob, app1Segment);
    }
  }

  return {
    blob: finalBlob,
    size: finalBlob.size,
    width: dims.width,
    height: dims.height,
    mimeType: finalBlob.type || mimeType,
  };
}

/**
 * Helper to promise-ify canvas.toBlob
 */
function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Formats byte size to human readable string (KB / MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Generates output filename according to pattern e.g. "{filename}_opt.{ext}"
 */
export function generateOutputFilename(
  originalName: string,
  targetMimeType: string,
  pattern = '{filename}_opt.{ext}'
): string {
  const lastDot = originalName.lastIndexOf('.');
  const baseName = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
  
  let ext = 'jpg';
  if (targetMimeType.includes('png')) ext = 'png';
  else if (targetMimeType.includes('webp')) ext = 'webp';
  else if (targetMimeType.includes('avif')) ext = 'avif';
  else if (targetMimeType.includes('gif')) ext = 'gif';
  else if (lastDot !== -1) ext = originalName.substring(lastDot + 1);

  return pattern.replace('{filename}', baseName).replace('{ext}', ext);
}
