import React, { useState } from 'react';
import { IconConfig } from '../../types/icon';
import { Search } from 'lucide-react';

interface WindowsMockupProps {
  imgElement: HTMLImageElement | null;
  config: IconConfig;
}

export const WindowsMockup: React.FC<WindowsMockupProps> = ({
  imgElement,
  config,
}) => {
  const [startOpen, setStartOpen] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
      {/* Windows 11 Desktop Screen */}
      <div
        className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl flex flex-col justify-between select-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, #173863 0%, #0b1c33 50%, #060d17 100%)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.7)',
        }}
      >
        {/* Desktop Icons Area */}
        <div className="p-5 flex flex-col gap-5 items-start">
          <div className="flex flex-col items-center gap-1 cursor-pointer group">
            <div className="w-10 h-10 flex items-center justify-center text-xl bg-white/10 rounded border border-white/10 group-hover:bg-white/20">
              🗑️
            </div>
            <span className="text-[11px] text-white drop-shadow">Papierkorb</span>
          </div>

          <div className="flex flex-col items-center gap-1 cursor-pointer group">
            <div className="w-10 h-10 flex items-center justify-center text-xl bg-white/10 rounded border border-white/10 group-hover:bg-white/20">
              📁
            </div>
            <span className="text-[11px] text-white drop-shadow">Dateien</span>
          </div>
        </div>

        {/* Windows 11 Floating Start Menu */}
        {startOpen && (
          <div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[460px] h-[380px] rounded-xl backdrop-blur-2xl border p-5 flex flex-col justify-between shadow-2xl z-30 transition-all animate-in fade-in zoom-in-95 duration-150"
            style={{
              background: 'rgba(23, 27, 36, 0.85)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            }}
          >
            {/* Search Input */}
            <div className="w-full bg-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/10 text-xs text-white/70">
              <Search className="w-3.5 h-3.5 text-white/50" />
              <span>Hier Suchbegriff eingeben...</span>
            </div>

            {/* Pinned Section */}
            <div className="mt-4 flex-1">
              <div className="flex items-center justify-between text-xs font-semibold text-white/90 mb-3 px-1">
                <span>Angeheftet</span>
                <span className="text-[11px] text-blue-400 cursor-pointer">Alle Apps &gt;</span>
              </div>

              <div className="grid grid-cols-6 gap-y-4 gap-x-2">
                {/* HERO ITEM: User Icon */}
                <div className="flex flex-col items-center gap-1 cursor-pointer group">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 shadow-md"
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
                        className="object-contain"
                        style={{
                          width: `${100 - config.padding * 2}%`,
                          height: `${100 - config.padding * 2}%`,
                        }}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded bg-white/30" />
                    )}
                  </div>
                  <span className="text-[10px] text-white/90 truncate max-w-[54px] text-center">
                    {config.appName || 'My App'}
                  </span>
                </div>

                {/* Companion Pinned Apps */}
                <WinPinnedItem name="Edge" icon="🌐" />
                <WinPinnedItem name="Word" icon="📄" />
                <WinPinnedItem name="Excel" icon="📊" />
                <WinPinnedItem name="Store" icon="🛍️" />
                <WinPinnedItem name="Fotos" icon="🖼️" />
                <WinPinnedItem name="Mail" icon="✉️" />
                <WinPinnedItem name="Teams" icon="👥" />
                <WinPinnedItem name="Rechner" icon="🧮" />
                <WinPinnedItem name="Terminal" icon="💻" />
                <WinPinnedItem name="Notizen" icon="📝" />
                <WinPinnedItem name="Spotify" icon="🎧" />
              </div>
            </div>

            {/* User Account Bar */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold">
                  CW
                </div>
                <span className="text-xs text-white/90 font-medium">Christopher</span>
              </div>
              <span className="text-sm cursor-pointer text-white/70 hover:text-white">⏻</span>
            </div>
          </div>
        )}

        {/* Windows 11 Centered Taskbar */}
        <div
          className="w-full h-12 backdrop-blur-xl border-t flex items-center justify-between px-4 z-20"
          style={{
            background: 'rgba(15, 20, 28, 0.85)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Weather Widget */}
          <div className="flex items-center gap-2 text-xs text-white/80">
            <span>⛅</span>
            <span className="hidden sm:inline">21°C Heiter</span>
          </div>

          {/* Centered Icons */}
          <div className="flex items-center gap-1.5">
            {/* Start Button */}
            <button
              type="button"
              onClick={() => setStartOpen(!startOpen)}
              className={`p-1.5 rounded-md transition-colors ${
                startOpen ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
              title="Start"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7.5" height="7.5" fill="#00ADEF" />
                <rect x="10.5" y="2" width="7.5" height="7.5" fill="#00ADEF" />
                <rect x="2" y="10.5" width="7.5" height="7.5" fill="#00ADEF" />
                <rect x="10.5" y="10.5" width="7.5" height="7.5" fill="#00ADEF" />
              </svg>
            </button>

            {/* Search Icon */}
            <div className="p-1.5 rounded-md hover:bg-white/10 cursor-pointer text-white/80 text-sm">
              🔍
            </div>

            {/* Task View */}
            <div className="p-1.5 rounded-md hover:bg-white/10 cursor-pointer text-white/80 text-sm">
              🗔
            </div>

            {/* Pinned User App on Taskbar */}
            <div
              className="relative p-1.5 rounded-md hover:bg-white/10 cursor-pointer flex flex-col items-center"
              title={config.appName || 'My App'}
            >
              <div
                className="w-6 h-6 rounded flex items-center justify-center p-0.5 shadow"
                style={{
                  background: config.backgroundColor || '#ffffff',
                }}
              >
                {imgElement ? (
                  <img
                    src={imgElement.src}
                    alt={config.appName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-3 h-3 rounded bg-blue-500" />
                )}
              </div>
              {/* Taskbar Active Indicator Bar */}
              <div className="w-3 h-0.5 bg-blue-400 rounded-full mt-1" />
            </div>

            {/* Companion Taskbar Apps */}
            <div className="p-1.5 rounded-md hover:bg-white/10 cursor-pointer text-base">
              🌐
            </div>
            <div className="p-1.5 rounded-md hover:bg-white/10 cursor-pointer text-base">
              📁
            </div>
            <div className="p-1.5 rounded-md hover:bg-white/10 cursor-pointer text-base">
              🛍️
            </div>
          </div>

          {/* System Tray */}
          <div className="flex items-center gap-3 text-xs text-white/80">
            <span>🔊</span>
            <span>📶</span>
            <div className="text-right leading-tight hidden sm:block">
              <div>21:05</div>
              <div className="text-[10px] text-white/60">18.09.2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WinPinnedItem: React.FC<{ name: string; icon: string }> = ({ name, icon }) => (
  <div className="flex flex-col items-center gap-1 cursor-pointer group">
    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl transition-transform group-hover:scale-105 border border-white/5">
      {icon}
    </div>
    <span className="text-[10px] text-white/90 truncate max-w-[54px] text-center">
      {name}
    </span>
  </div>
);
