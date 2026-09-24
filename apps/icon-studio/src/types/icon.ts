export type PlatformTab = 'all' | 'ios' | 'android' | 'macos' | 'windows' | 'web' | 'sizes';

export type StageBackground = 'neutral' | 'white' | 'checker';

export type IosThemeMode = 'standard' | 'dark' | 'tinted';

export type AndroidMaskShape = 'rounded-square' | 'circle' | 'squircle' | 'teardrop' | 'pebble';

export type WebBrowserType = 'chrome' | 'safari' | 'arc' | 'serp';

export interface IconConfig {
  appName: string;
  shortName: string;
  backgroundColor: string;
  backgroundType: 'solid' | 'gradient' | 'transparent';
  gradientColor2: string;
  gradientAngle: number;
  padding: number; // 0 to 40 (%)
  borderRadius: number; // custom radius in preview if needed
  iosTintColor: string;
  iosMode: IosThemeMode;
  androidMask: AndroidMaskShape;
  androidDynamicColor: boolean;
  androidAccentColor: string;
  themeColor: string;
  displayMode: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  scope: string;
  startUrl: string;
  showSafeZone: boolean;
}

export interface ValidationIssue {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export interface SourceImage {
  file: File;
  name: string;
  width: number;
  height: number;
  dataUrl: string;
  isSvg: boolean;
  hasAlpha: boolean;
  safeZoneBleed: boolean;
}

export interface ExportProgress {
  status: 'idle' | 'generating' | 'zipping' | 'done' | 'error';
  progress: number; // 0 to 100
  currentTask: string;
  error?: string;
}

export interface AssetFile {
  path: string;
  blob: Blob;
  size?: number;
}
