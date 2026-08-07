import JSZip from 'jszip';
import { SvgItem } from '../types';
import { renderSvgToPngBlob } from './pngRenderer';

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatFilename(
  originalName: string,
  pattern: string = '{filename}_{size}_opt.{ext}',
  targetExt: string = 'svg',
  width?: number,
  height?: number
): string {
  const p = pattern && pattern.trim() ? pattern : '{filename}_{size}_opt.{ext}';
  const baseName = originalName.replace(/\.[^/.]+$/, '');

  let sizeStr = '';
  if (width !== undefined) {
    if (height !== undefined && height !== width) {
      sizeStr = `${width}x${height}`;
    } else {
      sizeStr = `${width}`;
    }
  }

  let formatted = p
    .replace(/\{filename\}/gi, baseName)
    .replace(/\{size\}/gi, sizeStr)
    .replace(/\{ext\}/gi, targetExt);

  // Clean up double underscores or trailing underscores before dot if {size} was empty
  if (!sizeStr) {
    formatted = formatted.replace(/__+/g, '_').replace(/_\./g, '.');
  }

  const extClean = targetExt.startsWith('.') ? targetExt : `.${targetExt}`;
  if (!formatted.toLowerCase().endsWith(extClean.toLowerCase())) {
    formatted = `${formatted}${extClean}`;
  }

  return formatted;
}

export async function exportSvgsAsZip(
  items: SvgItem[],
  namingPattern: string = '{filename}_{size}_opt.{ext}',
  zipFilename = 'optimized-svgs.zip'
) {
  const zip = new JSZip();

  items.forEach((item) => {
    if (item.status === 'done' && item.optimizedSvg) {
      const filename = formatFilename(item.name, namingPattern, 'svg', item.width, item.height);
      zip.file(filename, item.optimizedSvg);
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, zipFilename);
}

export async function exportPngsAsZip(
  items: SvgItem[],
  scale: number = 4,
  namingPattern: string = '{filename}_{size}_opt.{ext}',
  zipFilename = 'svg-png-exports.zip'
) {
  const zip = new JSZip();

  for (const item of items) {
    if (item.status === 'done' && item.optimizedSvg) {
      try {
        const pngBlob = await renderSvgToPngBlob(item.optimizedSvg, item.width, item.height, scale);
        const filename = formatFilename(item.name, namingPattern, 'png', item.width, item.height);
        zip.file(filename, pngBlob);
      } catch (err) {
        console.error(`Failed to generate PNG for ${item.name}`, err);
      }
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, zipFilename);
}

export async function exportAllAsZip(
  items: SvgItem[],
  scale: number = 4,
  namingPattern: string = '{filename}_{size}_opt.{ext}',
  zipFilename = 'all-svgs-and-pngs.zip'
) {
  const zip = new JSZip();

  for (const item of items) {
    if (item.status === 'done' && item.optimizedSvg) {
      // Add SVG file
      const svgFilename = formatFilename(item.name, namingPattern, 'svg', item.width, item.height);
      zip.file(svgFilename, item.optimizedSvg);

      // Add transparent PNG file
      try {
        const pngBlob = await renderSvgToPngBlob(item.optimizedSvg, item.width, item.height, scale);
        const pngFilename = formatFilename(item.name, namingPattern, 'png', item.width, item.height);
        zip.file(pngFilename, pngBlob);
      } catch (err) {
        console.error(`Failed to generate PNG for ${item.name}`, err);
      }
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, zipFilename);
}

