/**
 * Renders an SVG string to a PNG Blob via HTML5 Canvas with custom scaling (1x, 2x, 4x, etc.)
 */
export function renderSvgToPngBlob(
  svgString: string,
  width: number,
  height: number,
  scale: number = 4,
  bgColor: string = 'transparent'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If fillColor is currentColor, replace it with black or dark neutral for PNG export visibility
    let exportSvg = svgString;
    if (exportSvg.includes('fill="currentColor"')) {
      exportSvg = exportSvg.replace(/fill="currentColor"/g, 'fill="#1A1D23"');
    }

    const blob = new Blob([exportSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas 2D context not supported'));
          return;
        }

        // Apply background color if specified and not transparent
        if (bgColor && bgColor.toLowerCase() !== 'transparent') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (pngBlob) => {
            URL.revokeObjectURL(url);
            if (pngBlob) {
              resolve(pngBlob);
            } else {
              reject(new Error('Failed to generate PNG Blob from canvas'));
            }
          },
          'image/png',
          1.0
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image for PNG rendering'));
    };

    img.src = url;
  });
}
