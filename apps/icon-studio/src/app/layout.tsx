import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Universal Icon Studio by Christopher Winker',
  description:
    'Erstelle, teste und exportiere hochpräzise Icons für iOS, Android, macOS, Windows und Web. Mit Echtzeit-Mockups, Safe-Zone Linter, Lanczos-Skalierung und 1-Klick Asset-ZIP.',
  keywords: [
    'icon generator',
    'app icon generator',
    'favicon generator',
    'ios appiconset',
    'android adaptive icon',
    'macos icns generator',
    'windows ico',
    'web app manifest',
    'client side',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-full" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96x96.png" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="57x57" href="/assets/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/assets/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/assets/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/assets/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/assets/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/assets/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/assets/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/assets/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-icon-180x180.png" />

        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#34383c" />
        <meta name="msapplication-TileImage" content="/assets/ms-icon-144x144.png" />
        <meta name="msapplication-config" content="/assets/browserconfig.xml" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/assets/manifest.json" />
      </head>
      <body className="min-h-full antialiased flex flex-col bg-[var(--c-bg)] text-[var(--c-text)]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
