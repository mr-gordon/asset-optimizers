/**
 * EXIF parsing and manipulation utility for JPEG files.
 * Canvas redrawing strips EXIF by default.
 * If user wants to preserve EXIF, we extract the APP1 segment from the original file
 * and insert it into the newly compressed JPEG file.
 */

export interface ExifInfo {
  hasExif: boolean;
  hasGps: boolean;
  cameraModel?: string;
  dateTime?: string;
  software?: string;
}

/**
 * Extracts EXIF metadata summary from JPEG ArrayBuffer
 */
export async function parseExifInfo(file: File): Promise<ExifInfo> {
  const info: ExifInfo = { hasExif: false, hasGps: false };
  if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
    return info;
  }

  try {
    const buffer = await file.slice(0, 128 * 1024).arrayBuffer(); // First 128KB is enough for EXIF
    const view = new DataView(buffer);

    if (view.getUint16(0, false) !== 0xffd8) {
      return info; // Not a valid JPEG
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length - 2) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xffe1) {
        // APP1 marker
        info.hasExif = true;
        const segmentLength = view.getUint16(offset, false);
        const segmentData = new Uint8Array(buffer, offset + 2, segmentLength - 2);

        // Check for "Exif\0\0"
        const header = String.fromCharCode(...segmentData.slice(0, 4));
        if (header === 'Exif') {
          // Check for GPS tags roughly in string scan
          const str = String.fromCharCode(...segmentData);
          if (str.includes('GPS') || str.includes('latitude') || str.includes('longitude')) {
            info.hasGps = true;
          }
        }
        break;
      } else if ((marker & 0xff00) === 0xff00) {
        const segLen = view.getUint16(offset, false);
        offset += segLen;
      } else {
        break;
      }
    }
  } catch {
    // Fail gracefully
  }

  return info;
}

/**
 * Extracts raw APP1 EXIF segment from original JPEG buffer
 */
export async function extractApp1Segment(file: File): Promise<ArrayBuffer | null> {
  if (!file.type.includes('jpeg') && !file.type.includes('jpg')) return null;

  try {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);

    if (view.getUint16(0, false) !== 0xffd8) return null;

    let offset = 2;
    const length = view.byteLength;

    while (offset < length - 2) {
      const marker = view.getUint16(offset, false);
      const segmentLength = view.getUint16(offset + 2, false);

      if (marker === 0xffe1) {
        // Found APP1 segment (includes marker 0xffe1 + 2-byte length + payload)
        return buffer.slice(offset, offset + 2 + segmentLength);
      }

      if (marker === 0xffda) break; // Start of Scan (SOS), no EXIF after this
      offset += 2 + segmentLength;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Preserves EXIF by injecting the APP1 segment into a compressed JPEG array buffer.
 */
export async function injectExifToJpeg(compressedBlob: Blob, app1Buffer: ArrayBuffer): Promise<Blob> {
  try {
    const compressedBuf = await compressedBlob.arrayBuffer();
    const view = new DataView(compressedBuf);

    if (view.getUint16(0, false) !== 0xffd8) return compressedBlob; // Not JPEG

    // SOI marker is 2 bytes (0xFFD8). Insert APP1 right after SOI.
    const newHeader = new Uint8Array(2);
    newHeader[0] = 0xff;
    newHeader[1] = 0xd8;

    const app1Data = new Uint8Array(app1Buffer);
    const restData = new Uint8Array(compressedBuf.slice(2));

    const combined = new Uint8Array(2 + app1Data.byteLength + restData.byteLength);
    combined.set(newHeader, 0);
    combined.set(app1Data, 2);
    combined.set(restData, 2 + app1Data.byteLength);

    return new Blob([combined], { type: 'image/jpeg' });
  } catch {
    return compressedBlob;
  }
}
