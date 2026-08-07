export interface SvgItem {
  id: string;
  name: string;
  originalSize: number;
  optimizedSize: number;
  rawSvg: string;
  optimizedSvg: string;
  width: number;
  height: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  errorMessage?: string;
}

export type PngScaleFactor = 1 | 2 | 4 | 8;

export interface SvgOptions {
  fillColor: string;
  pngScaleFactor: PngScaleFactor;
}
