import JSZip from 'jszip';
import { ImageItem, BatchSettings } from '../types';
import { generateOutputFilename } from './compressor';

export async function createZipArchive(
  items: ImageItem[],
  settings: BatchSettings
): Promise<Blob> {
  const zip = new JSZip();

  for (const item of items) {
    if (item.compressedBlob) {
      const outputMime = item.outputFormat || settings.targetFormat;
      const fileName = generateOutputFilename(item.name, outputMime, settings.namingPattern);
      zip.file(fileName, item.compressedBlob);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
