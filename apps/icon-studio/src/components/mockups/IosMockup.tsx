import React, { useMemo } from 'react';
import { IconConfig } from '../../types/icon';
import { Sun, Moon, Palette } from 'lucide-react';

interface IosMockupProps {
  imgElement: HTMLImageElement | null;
  config: IconConfig;
  onConfigChange: (updates: Partial<IconConfig>) => void;
}

export const IosMockup: React.FC<IosMockupProps> = ({
  imgElement,
  config,
  onConfigChange,
}) => {
  // Compute rendered icon background & filter style
  const iconStyle = useMemo(() => {
    if (!imgElement) return {};

    if (config.iosMode === 'dark') {
      return {
        background: '#121316',
        filter: 'brightness(0.92) contrast(1.05)',
      };
    }

    if (config.iosMode === 'tinted') {
      return {
        background: '#15171C',
      };
    }

    if (config.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${config.gradientAngle}deg, ${config.backgroundColor}, ${config.gradientColor2})`,
      };
    }

    return {
      background: config.backgroundColor || '#ffffff',
    };
  }, [config, imgElement]);

  const tintFilter = useMemo(() => {
    if (config.iosMode === 'tinted') {
      return {
        filter: 'grayscale(100%) brightness(1.3) contrast(1.2)',
        mixBlendMode: 'screen' as const,
      };
    }
    return {};
  }, [config.iosMode]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      {/* iOS Mode Toggles: Standard / Dark / Tinted */}
      <div
        className="flex items-center gap-1.5 p-1 mb-6 rounded-full"
        style={{
          background: 'var(--c-surface-alt)',
          border: '1px solid var(--c-border)',
        }}
      >
        <button
          type="button"
          onClick={() => onConfigChange({ iosMode: 'standard' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            config.iosMode === 'standard'
              ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-sm font-semibold'
              : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          Standard
        </button>

        <button
          type="button"
          onClick={() => onConfigChange({ iosMode: 'dark' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            config.iosMode === 'dark'
              ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-sm font-semibold'
              : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          Dark
        </button>

        <button
          type="button"
          onClick={() => onConfigChange({ iosMode: 'tinted' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            config.iosMode === 'tinted'
              ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-sm font-semibold'
              : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          iOS 18 Tinted
        </button>

        {config.iosMode === 'tinted' && (
          <div className="flex items-center gap-1.5 pl-2 pr-1 border-l border-[var(--c-border)]">
            <input
              type="color"
              value={config.iosTintColor}
              onChange={(e) => onConfigChange({ iosTintColor: e.target.value })}
              className="w-5 h-5 rounded-full cursor-pointer border-0 bg-transparent p-0"
              title="iOS 18 Tönungsfarbe wählen"
            />
          </div>
        )}
      </div>

      {/* SVG Mask Definition for Apple Continuous Squircle */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id="apple-squircle-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.225,0 L 0.775,0 C 0.8875,0 1,0.1125 1,0.225 L 1,0.775 C 1,0.8875 0.8875,1 0.775,1 L 0.225,1 C 0.1125,1 0,0.8875 0,0.775 L 0,0.225 C 0,0.1125 0.1125,0 0.225,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* iPhone Device Frame */}
      <div
        className="relative w-[340px] h-[690px] rounded-[52px] p-3 shadow-2xl border-[5px] transition-all overflow-hidden select-none"
        style={{
          borderColor: '#2A2D35',
          background: '#090A0D',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Screen Wallpaper */}
        <div
          className="relative w-full h-full rounded-[42px] overflow-hidden flex flex-col justify-between p-4"
          style={{
            background:
              config.iosMode === 'dark' || config.iosMode === 'tinted'
                ? 'linear-gradient(155deg, #10121a 0%, #171b26 45%, #0d0f15 100%)'
                : 'linear-gradient(155deg, #1e3a8a 0%, #3b82f6 40%, #06b6d4 100%)',
          }}
        >
          {/* Dynamic Island */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex items-center justify-end px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#111927] border border-[#1f2937]" />
          </div>

          {/* Status Bar */}
          <div className="w-full flex items-center justify-between text-white text-[11px] font-semibold tracking-tight px-3 pt-1 z-10">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <span className="text-[9px]">5G</span>
              <div className="w-5 h-2.5 border border-white/80 rounded-sm p-0.5 flex items-center">
                <div className="h-full w-3.5 bg-white rounded-xs" />
              </div>
            </div>
          </div>

          {/* Homescreen App Grid */}
          <div className="grid grid-cols-4 gap-y-5 gap-x-3 mt-8 px-1">
            {/* HERO ITEM: The User's Icon */}
            <div className="flex flex-col items-center gap-1 group">
              <div
                className="relative w-[58px] h-[58px] flex items-center justify-center transition-transform hover:scale-105"
                style={{
                  clipPath: 'url(#apple-squircle-clip)',
                  ...iconStyle,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                }}
              >
                {/* Tint Overlay for iOS 18 mode */}
                {config.iosMode === 'tinted' && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-80"
                    style={{ backgroundColor: config.iosTintColor }}
                  />
                )}

                {imgElement ? (
                  <img
                    src={imgElement.src}
                    alt={config.appName}
                    className="object-contain transition-all"
                    style={{
                      width: `${100 - config.padding * 2}%`,
                      height: `${100 - config.padding * 2}%`,
                      ...tintFilter,
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/20 animate-pulse" />
                )}

                {/* Safe Zone Visualizer Guide */}
                {config.showSafeZone && (
                  <div
                    className="absolute inset-1.5 border border-dashed border-red-400/80 rounded-xl pointer-events-none"
                    title="Apple Safe Area (inner boundary)"
                  />
                )}
              </div>
              <span className="text-[11px] font-medium text-white tracking-tight truncate max-w-[62px] text-center drop-shadow-md">
                {config.appName || 'My App'}
              </span>
            </div>

            {/* Companion Mockup Apps */}
            <DummyIosApp name="Photos" color="linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)" glyph="🌸" />
            <DummyIosApp name="Camera" color="#374151" glyph="📷" />
            <DummyIosApp name="Maps" color="linear-gradient(135deg, #10b981, #3b82f6)" glyph="🗺️" />
            <DummyIosApp name="Weather" color="linear-gradient(135deg, #38bdf8, #1d4ed8)" glyph="☀️" />
            <DummyIosApp name="Notes" color="linear-gradient(135deg, #fbbf24, #f59e0b)" glyph="📝" />
            <DummyIosApp name="Health" color="#ef4444" glyph="❤️" />
            <DummyIosApp name="Wallet" color="#111827" glyph="💳" />
            <DummyIosApp name="Settings" color="linear-gradient(135deg, #9ca3af, #4b5563)" glyph="⚙️" />
            <DummyIosApp name="Store" color="linear-gradient(135deg, #0284c7, #0369a1)" glyph="🅰️" />
            <DummyIosApp name="Clock" color="#000000" glyph="⏰" />
            <DummyIosApp name="Files" color="linear-gradient(135deg, #38bdf8, #2563eb)" glyph="📁" />
          </div>

          {/* Dock */}
          <div
            className="w-full h-[84px] rounded-[32px] px-4 py-2 flex items-center justify-around backdrop-blur-xl border border-white/20 shadow-lg mt-auto mb-2"
            style={{
              background: 'rgba(255, 255, 255, 0.22)',
            }}
          >
            <DummyIosApp name="" color="linear-gradient(135deg, #22c55e, #16a34a)" glyph="📞" inDock />
            <DummyIosApp name="" color="linear-gradient(135deg, #38bdf8, #2563eb)" glyph="🧭" inDock />
            <DummyIosApp name="" color="linear-gradient(135deg, #22c55e, #15803d)" glyph="💬" inDock />
            <DummyIosApp name="" color="linear-gradient(135deg, #ec4899, #f43f5e)" glyph="🎵" inDock />
          </div>

          {/* Home Bar Indicator */}
          <div className="w-32 h-1 bg-white/80 rounded-full mx-auto mt-1 mb-0.5" />
        </div>
      </div>
    </div>
  );
};

const DummyIosApp: React.FC<{
  name: string;
  color: string;
  glyph: string;
  inDock?: boolean;
}> = ({ name, color, glyph, inDock }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className="w-[58px] h-[58px] flex items-center justify-center text-xl shadow-md transition-transform hover:scale-105"
      style={{
        clipPath: 'url(#apple-squircle-clip)',
        background: color,
      }}
    >
      <span>{glyph}</span>
    </div>
    {!inDock && (
      <span className="text-[11px] font-medium text-white tracking-tight truncate max-w-[62px] text-center drop-shadow-md">
        {name}
      </span>
    )}
  </div>
);
