import { IconConfig } from '../types/icon';

export interface WebManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
}

export function buildWebManifest(config: IconConfig): WebManifest {
  return {
    name: config.appName || 'My App',
    short_name: config.shortName || config.appName || 'App',
    description: `${config.appName || 'My App'} Progressive Web App`,
    start_url: config.startUrl || '/',
    scope: config.scope || '/',
    display: config.displayMode || 'standalone',
    background_color: config.backgroundColor || '#ffffff',
    theme_color: config.themeColor || '#1a1d23',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

export function generateHtmlSnippet(config: IconConfig): string {
  const theme = config.themeColor || '#1a1d23';
  return `<!-- Favicon & App Icons -->
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32">
<link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="${theme}">`;
}

export function generateNextJsMetadataSnippet(config: IconConfig): string {
  const theme = config.themeColor || '#1a1d23';
  const name = config.appName || 'My App';
  return `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${name}',
  description: '${name} Application',
  manifest: '/manifest.json',
  themeColor: '${theme}',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};`;
}
