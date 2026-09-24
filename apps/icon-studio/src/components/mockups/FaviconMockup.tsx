import React, { useState } from 'react';
import { IconConfig } from '../../types/icon';
import { Lock, Sun, Moon } from 'lucide-react';

interface FaviconMockupProps {
  imgElement: HTMLImageElement | null;
  config: IconConfig;
}

export const FaviconMockup: React.FC<FaviconMockupProps> = ({
  imgElement,
  config,
}) => {
  const [browserMode, setBrowserMode] = useState<'chrome' | 'safari' | 'arc' | 'serp'>('chrome');
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
      {/* Sub-nav selector: Chrome / Safari / Arc / Google SERP */}
      <div
        className="flex items-center gap-1.5 p-1 mb-6 rounded-full"
        style={{
          background: 'var(--c-surface-alt)',
          border: '1px solid var(--c-border)',
        }}
      >
        <button
          type="button"
          onClick={() => setBrowserMode('chrome')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            browserMode === 'chrome'
              ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-sm font-semibold'
              : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
          }`}
        >
          Google Chrome
        </button>

        <button
          type="button"
          onClick={() => setBrowserMode('safari')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            browserMode === 'safari'
              ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-sm font-semibold'
              : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
          }`}
        >
          Apple Safari
        </button>

        <button
          type="button"
          onClick={() => setBrowserMode('arc')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            browserMode === 'arc'
              ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-sm font-semibold'
              : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
          }`}
        >
          Arc Browser
        </button>

        <button
          type="button"
          onClick={() => setBrowserMode('serp')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            browserMode === 'serp'
              ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-sm font-semibold'
              : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
          }`}
        >
          Google SERP Snippet
        </button>

        {browserMode !== 'serp' && (
          <div className="flex items-center pl-2 border-l border-[var(--c-border)]">
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-full hover:bg-[var(--c-hover)] text-[var(--c-text-secondary)]"
              title="Browser Theme umschalten"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Browser or SERP Preview Container */}
      {browserMode === 'serp' ? (
        /* Google SERP Snippet Preview */
        <div
          className="w-full max-w-2xl rounded-2xl p-6 sm:p-8 border shadow-xl text-left"
          style={{
            background: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div className="text-xs font-semibold text-[var(--c-text-secondary)] uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Google Suchergebnis Vorschau</span>
            <span className="text-[11px] font-mono lowercase">google.de/search</span>
          </div>

          <div className="flex flex-col gap-1 max-w-xl">
            {/* SERP Header: Favicon + Domain Hierarchy */}
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center p-1 border shadow-xs"
                style={{
                  background: config.backgroundColor || '#ffffff',
                  borderColor: 'var(--c-border)',
                }}
              >
                {imgElement ? (
                  <img
                    src={imgElement.src}
                    alt={config.appName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500" />
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[var(--c-text)]">
                  {config.appName || 'My App'}
                </span>
                <span className="text-[11px] text-[var(--c-text-secondary)]">
                  https://www.{config.shortName ? config.shortName.toLowerCase().replace(/\s+/g, '') : 'myapp'}.com
                </span>
              </div>
            </div>

            {/* Clickable SERP Title */}
            <h3 className="text-lg font-medium text-blue-600 hover:underline cursor-pointer mt-1">
              {config.appName || 'My App'} – Offizielle Website &amp; Webanwendung
            </h3>

            {/* Meta Description */}
            <p className="text-xs text-[var(--c-text-secondary)] leading-relaxed mt-0.5">
              Willkommen bei {config.appName || 'My App'}. Entdecke die moderne, blitzschnelle Webanwendung direkt in deinem Browser mit 100% Client-Side Funktionalität und nativer Offline-PWA Unterstützung.
            </p>
          </div>
        </div>
      ) : (
        /* Realistic Browser Window (Chrome / Safari / Arc) */
        <div
          className={`w-full h-[460px] rounded-2xl overflow-hidden border shadow-2xl flex flex-col transition-all ${
            isDarkMode ? 'bg-[#1e1f22] text-white border-zinc-700' : 'bg-slate-100 text-slate-800 border-slate-200'
          }`}
          style={{
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
          }}
        >
          {/* Window Titlebar & Controls */}
          <div
            className={`h-11 px-4 flex items-center gap-3 border-b ${
              isDarkMode ? 'bg-[#18191c] border-zinc-800' : 'bg-slate-200/80 border-slate-300'
            }`}
          >
            {/* Traffic Lights */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
            </div>

            {/* Tabs Bar */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {/* Active Tab with Favicon */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium shadow-xs max-w-[200px] truncate ${
                  isDarkMode ? 'bg-[#1e1f22] text-white' : 'bg-white text-slate-800'
                }`}
              >
                {/* 16px Favicon in Tab */}
                <div
                  className="w-4 h-4 shrink-0 rounded flex items-center justify-center overflow-hidden"
                  style={{
                    background: config.backgroundColor || '#ffffff',
                  }}
                >
                  {imgElement ? (
                    <img
                      src={imgElement.src}
                      alt="Favicon"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className="truncate">{config.appName || 'My App'}</span>
                <span className="opacity-50 text-[10px] ml-auto hover:opacity-100 cursor-pointer">✕</span>
              </div>

              {/* Inactive Tab */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs opacity-60 hover:opacity-90 cursor-pointer">
                <span>GitHub</span>
                <span className="text-[10px]">✕</span>
              </div>
            </div>
          </div>

          {/* Browser Navigation Bar */}
          <div
            className={`h-10 px-4 flex items-center gap-3 border-b ${
              isDarkMode ? 'bg-[#1e1f22] border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 opacity-60 text-xs">
              <span>←</span>
              <span>→</span>
              <span>↻</span>
            </div>

            {/* Address Bar */}
            <div
              className={`flex-1 flex items-center gap-2 px-3 py-1 rounded-full text-xs max-w-md mx-auto ${
                isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="truncate">https://{config.shortName ? config.shortName.toLowerCase().replace(/\s+/g, '') : 'myapp'}.com</span>
            </div>
          </div>

          {/* Browser Viewport Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-4 p-3"
              style={{
                background:
                  config.backgroundType === 'gradient'
                    ? `linear-gradient(${config.gradientAngle}deg, ${config.backgroundColor}, ${config.gradientColor2})`
                    : config.backgroundColor || '#ffffff',
              }}
            >
              {imgElement ? (
                <img
                  src={imgElement.src}
                  alt={config.appName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-500/30" />
              )}
            </div>

            <h2 className="text-xl font-bold tracking-tight mb-1">{config.appName || 'My App'}</h2>
            <p className="text-xs opacity-70 max-w-sm">
              Live Favicon &amp; Web Preview in {browserMode.toUpperCase()}. Das Icon wird in Browser-Tabs als 16×16 / 32×32 px Favicon gerendert.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
