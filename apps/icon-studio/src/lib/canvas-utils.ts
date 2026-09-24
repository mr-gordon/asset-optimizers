import { IconConfig, ValidationIssue } from '../types/icon';

/**
 * Loads an image from a Data URL or Blob URL into an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = src;
  });
}

/**
 * Checks image properties for common app icon pitfalls:
 * - 1:1 aspect ratio
 * - Sufficient resolution (>= 512px)
 * - Alpha transparency (App Store iOS requires opaque icons)
 * - Safe-zone bleed detection
 */
export function inspectImage(
  img: HTMLImageElement,
  file: File
): {
  issues: ValidationIssue[];
  hasAlpha: boolean;
  safeZoneBleed: boolean;
} {
  const issues: ValidationIssue[] = [];
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');

  // 1. Aspect Ratio
  if (Math.abs(width - height) > 1 && !isSvg) {
    issues.push({
      id: 'aspect-ratio',
      type: 'warning',
      title: 'Ungleiches Seitenverhältnis',
      message: `Das Bild hat die Maße ${width}×${height}px. App-Icons müssen quadratisch (1:1) sein. Das Bild wird zentriert eingepasst.`,
    });
  }

  // 2. Resolution check
  if (!isSvg && (width < 512 || height < 512)) {
    issues.push({
      id: 'low-resolution',
      type: 'warning',
      title: 'Geringe Auflösung',
      message: `Die Auflösung beträgt nur ${width}×${height}px. Für den App Store und Google Play werden mindestens 512×512px (empfohlen 1024×1024px) vorausgesetzt.`,
    });
  }

  // 3. Alpha channel & safe zone bleed inspection via hidden canvas
  let hasAlpha = false;
  let safeZoneBleed = false;

  try {
    const sampleSize = 128;
    const canvas = document.createElement('canvas');
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx) {
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imgData.data;

      const center = sampleSize / 2;
      const safeRadius = sampleSize * 0.38; // ~76% safe diameter

      for (let y = 0; y < sampleSize; y++) {
        for (let x = 0; x < sampleSize; x++) {
          const idx = (y * sampleSize + x) * 4;
          const alpha = data[idx + 3];

          // Check if any transparent pixel exists
          if (alpha < 250) {
            hasAlpha = true;
          }

          // Safe zone bleed: if opaque pixel exists outside safe zone boundary
          if (alpha > 50) {
            const dx = x - center;
            const dy = y - center;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > safeRadius) {
              safeZoneBleed = true;
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('Canvas pixel inspection skipped:', e);
  }

  if (hasAlpha) {
    issues.push({
      id: 'ios-alpha-warning',
      type: 'info',
      title: 'Transparenter Hintergrund erkannt',
      message: 'iOS App Store verbietet Transparenz bei AppIcons. Universal Icon Studio füllt Transparenz für iOS automatisch mit der gewählten Hintergrundfarbe.',
    });
  }

  if (safeZoneBleed) {
    issues.push({
      id: 'safe-zone-bleed',
      type: 'info',
      title: 'Safe-Zone Hinweis',
      message: 'Teile deines Icons liegen nah am Rand und könnten von runden Masken (z. B. Android Kreis / Apple Squircle) abgeschnitten werden. Passe ggf. das Innen-Padding an.',
    });
  }

  return { issues, hasAlpha, safeZoneBleed };
}

/**
 * Multi-step stepped downsampling algorithm.
 * Successively halves canvas dimensions to avoid high-frequency aliasing / moire,
 * resulting in razor-sharp icons in 16px, 24px, 32px and 48px.
 */
export function renderSteppedDownsample(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  let curW = sourceCanvas.width;
  let curH = sourceCanvas.height;

  // If source is already close to or smaller than target, single pass
  if (curW <= targetWidth * 2) {
    const dest = document.createElement('canvas');
    dest.width = targetWidth;
    dest.height = targetHeight;
    const dctx = dest.getContext('2d');
    if (dctx) {
      dctx.imageSmoothingEnabled = true;
      dctx.imageSmoothingQuality = 'high';
      dctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
    }
    return dest;
  }

  // Multi-pass halving
  let currentCanvas = sourceCanvas;

  while (curW / 2 >= targetWidth && curH / 2 >= targetHeight) {
    curW = Math.round(curW / 2);
    curH = Math.round(curH / 2);

    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = curW;
    stepCanvas.height = curH;
    const sctx = stepCanvas.getContext('2d');

    if (sctx) {
      sctx.imageSmoothingEnabled = true;
      sctx.imageSmoothingQuality = 'high';
      sctx.drawImage(currentCanvas, 0, 0, curW, curH);
    }

    currentCanvas = stepCanvas;
  }

  // Final resize to exact target
  if (curW !== targetWidth || curH !== targetHeight) {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const fctx = finalCanvas.getContext('2d');
    if (fctx) {
      fctx.imageSmoothingEnabled = true;
      fctx.imageSmoothingQuality = 'high';
      fctx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);
    }
    return finalCanvas;
  }

  return currentCanvas;
}

/**
 * Composites the source image with background color/gradient and padding into a canvas of specified size.
 */
export function renderIconCanvas(
  img: HTMLImageElement,
  config: IconConfig,
  size: number,
  options: {
    forceOpaque?: boolean; // Required for iOS
    maskShape?: 'none' | 'squircle' | 'circle' | 'rounded';
    customPadding?: number;
    overrideBg?: string;
  } = {}
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, size, size);

  // Apply clipping if requested
  if (options.maskShape && options.maskShape !== 'none') {
    ctx.save();
    applyCanvasMask(ctx, options.maskShape, size);
    ctx.clip();
  }

  // Render Background
  const isTransparent = config.backgroundType === 'transparent' && !options.forceOpaque;
  const bgFill = options.overrideBg || config.backgroundColor;

  if (!isTransparent) {
    if (config.backgroundType === 'gradient' && !options.overrideBg) {
      const angleRad = (config.gradientAngle * Math.PI) / 180;
      const x1 = size / 2 - (Math.cos(angleRad) * size) / 2;
      const y1 = size / 2 - (Math.sin(angleRad) * size) / 2;
      const x2 = size / 2 + (Math.cos(angleRad) * size) / 2;
      const y2 = size / 2 + (Math.sin(angleRad) * size) / 2;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, config.backgroundColor);
      grad.addColorStop(1, config.gradientColor2);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bgFill || '#FFFFFF';
    }
    ctx.fillRect(0, 0, size, size);
  }

  // Calculate Logo Scaling & Inset (Padding)
  const padPercent = options.customPadding !== undefined ? options.customPadding : config.padding;
  const contentAreaSize = size * (1 - (padPercent * 2) / 100);

  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  const imgAspect = imgW / imgH;

  let drawW = contentAreaSize;
  let drawH = contentAreaSize;

  if (imgAspect > 1) {
    drawH = contentAreaSize / imgAspect;
  } else {
    drawW = contentAreaSize * imgAspect;
  }

  const drawX = (size - drawW) / 2;
  const drawY = (size - drawH) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  if (options.maskShape && options.maskShape !== 'none') {
    ctx.restore();
  }

  return canvas;
}

/**
 * Draws shape path directly onto canvas context for clipping or styling.
 */
export function applyCanvasMask(
  ctx: CanvasRenderingContext2D,
  shape: 'squircle' | 'circle' | 'rounded',
  size: number
) {
  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  } else if (shape === 'squircle') {
    // Apple continuous squircle approximation
    const r = size * 0.225;
    const w = size;
    const h = size;
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.bezierCurveTo(w - r / 2, 0, w, r / 2, w, r);
    ctx.lineTo(w, h - r);
    ctx.bezierCurveTo(w, h - r / 2, w - r / 2, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.bezierCurveTo(r / 2, h, 0, h - r / 2, 0, h - r);
    ctx.lineTo(0, r);
    ctx.bezierCurveTo(0, r / 2, r / 2, 0, r, 0);
  } else if (shape === 'rounded') {
    const r = size * 0.18;
    ctx.roundRect(0, 0, size, size, r);
  }
  ctx.closePath();
}

/**
 * Convert HTMLCanvasElement to Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality = 1.0
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob conversion failed'));
      },
      type,
      quality
    );
  });
}

/**
 * Convert Blob to ArrayBuffer
 */
export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read Blob as ArrayBuffer'));
    reader.readAsArrayBuffer(blob);
  });
}
