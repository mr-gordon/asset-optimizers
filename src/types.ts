export type ImageFormat = 'original' | 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

export type CompressionMode = 'auto' | 'manual';

export type QualityControlMode = 'percentage' | 'target_size';

export type ChromaSubsampling = '4:4:4' | '4:2:0';

export type AspectRatioPreset = 'original' | '1:1' | '16:9' | '4:3' | '3:2' | '1200x630' | 'custom';

export interface ExifOptions {
  stripAll: boolean;
  stripGps: boolean;
  keepCameraInfo: boolean;
}

export interface ResizeOptions {
  mode: 'original' | 'fhd' | '4k' | 'custom';
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio: boolean;
  aspectRatioPreset: AspectRatioPreset;
}

export interface BatchSettings {
  targetFormat: ImageFormat;
  qualityMode: QualityControlMode;
  quality: number; // 1 to 100
  targetSizeKb: number; // in KB e.g. 500
  resize: ResizeOptions;
  stripExif: boolean;
  exifOptions: ExifOptions;
  namingPattern: string; // e.g. "{filename}_opt.{ext}"
  backgroundColor: string; // Hex e.g. "#ffffff" for transparent to JPEG conversion
  chromaSubsampling: ChromaSubsampling;
}

export interface PresetProfile {
  id: string;
  name: string;
  description: string;
  iconName: string;
  settings: Partial<BatchSettings>;
}

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number; // bytes
  originalWidth: number;
  originalHeight: number;
  mimeType: string;
  previewUrl: string;
  
  // Compression status & output
  status: 'idle' | 'compressing' | 'done' | 'error';
  progress: number; // 0 - 100
  compressedBlob?: Blob;
  compressedUrl?: string;
  compressedSize?: number; // bytes
  compressedWidth?: number;
  compressedHeight?: number;
  outputFormat?: string;
  error?: string;

  // Custom overrides per image (if modified in Inspector)
  overrideSettings?: Partial<BatchSettings>;
}

export interface CompressionStats {
  totalFiles: number;
  completedFiles: number;
  totalOriginalBytes: number;
  totalCompressedBytes: number;
  totalSavedBytes: number;
  savedPercentage: number;
}
