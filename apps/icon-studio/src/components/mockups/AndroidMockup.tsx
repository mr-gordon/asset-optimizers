import React, { useState, useRef, useMemo } from 'react';
import { IconConfig, AndroidMaskShape } from '../../types/icon';
import { Sparkles } from 'lucide-react';

interface AndroidMockupProps {
  imgElement: HTMLImageElement | null;
  config: IconConfig;
  onConfigChange: (updates: Partial<IconConfig>) => void;
}

export const AndroidMockup: React.FC<AndroidMockupProps> = ({
  imgElement,
  config,
  onConfigChange,
}) => {
  // Parallax translation state
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    // Foreground parallax displacement (-12px to +12px)
    setOffset({
      x: deltaX * 14,
      y: deltaY * 14,
    });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  // Mask border radius or clip-path based on selected shape
  const maskStyle = useMemo(() => {
    switch (config.androidMask) {
      case 'rounded-square':
        return { borderRadius: '22%' }; // Eckig mit runden Ecken (Android Standard OEM)
      case 'circle':
        return { borderRadius: '50%' };
      case 'squircle':
        return { borderRadius: '34%' };
      case 'teardrop':
        return { borderRadius: '50% 50% 50% 12%' };
      case 'pebble':
        return { borderRadius: '32% 68% 68% 32% / 32% 32% 68% 68%' };
      default:
        return { borderRadius: '22%' };
    }
  }, [config.androidMask]);

  // Background style (Material You theme or custom)
  const bgStyle = useMemo(() => {
    if (config.androidDynamicColor) {
      return { background: config.androidAccentColor || '#D0E4FF' };
    }
    if (config.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${config.gradientAngle}deg, ${config.backgroundColor}, ${config.gradientColor2})`,
      };
    }
    return {
      background: config.backgroundColor || '#ffffff',
    };
  }, [config]);

  const shapes: { id: AndroidMaskShape; label: string }[] = [
    { id: 'rounded-square', label: 'Eckig mit runden Ecken' },
    { id: 'circle', label: 'Kreis (Pixel)' },
    { id: 'squircle', label: 'Squircle (Samsung)' },
    { id: 'teardrop', label: 'Teardrop' },
    { id: 'pebble', label: 'Kieselstein' },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      {/* Mask Selector Toolbar */}
      <div
        className="flex flex-wrap items-center justify-center gap-1.5 p-1 mb-6 rounded-full"
        style={{
          background: 'var(--c-surface-alt)',
          border: '1px solid var(--c-border)',
        }}
      >
        {shapes.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onConfigChange({ androidMask: s.id })}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              config.androidMask === s.id
                ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-sm font-semibold'
                : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
            }`}
          >
            {s.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() =>
            onConfigChange({ androidDynamicColor: !config.androidDynamicColor })
          }
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            config.androidDynamicColor
              ? 'bg-[var(--c-accent)] text-white shadow-sm font-semibold'
              : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
          }`}
          title="Material You dynamische Akzentfarbe aktivieren"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Material You
        </button>
      </div>

      {/* Android Pixel Device Frame with Mouse Tracking */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-[340px] h-[690px] rounded-[48px] p-3 shadow-2xl border-[5px] transition-all overflow-hidden select-none cursor-crosshair"
        style={{
          borderColor: '#1E2024',
          background: '#0c0d10',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Screen Wallpaper */}
        <div
          className="relative w-full h-full rounded-[38px] overflow-hidden flex flex-col justify-between p-4"
          style={{
            background: 'linear-gradient(180deg, #131b2e 0%, #1c2742 50%, #0d121f 100%)',
          }}
        >
          {/* Status Bar */}
          <div className="w-full flex items-center justify-between text-slate-300 text-[11px] font-medium px-2 pt-1">
            <span>9:41</span>
            {/* Center camera punch-hole */}
            <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-800" />
            <div className="flex items-center gap-1 text-[10px]">
              <span>LTE</span>
              <span>100%</span>
            </div>
          </div>

          {/* At a Glance Widget */}
          <div className="mt-6 px-3 text-left">
            <p className="text-white text-base font-semibold">Dienstag, 18. Sept.</p>
            <p className="text-slate-300 text-xs mt-0.5">22°C • Heiter</p>
          </div>

          {/* Hero Adaptive Icon with Interactive Parallax */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="relative group">
              {/* Outer Adaptive Mask Container */}
              <div
                className="relative w-[96px] h-[96px] overflow-hidden shadow-xl transition-all"
                style={{
                  ...maskStyle,
                  ...bgStyle,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* Foreground Layer with 3D Parallax translation */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out"
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
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
                        filter: config.androidDynamicColor
                          ? 'grayscale(100%) contrast(1.2)'
                          : 'none',
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse" />
                  )}
                </div>

                {/* Safe Zone Visualizer Guide */}
                {config.showSafeZone && (
                  <div
                    className="absolute inset-3 border border-dashed border-red-400/80 rounded-full pointer-events-none"
                    title="Android Adaptive Safe Zone (66dp within 108dp)"
                  />
                )}
              </div>
            </div>

            <span className="text-xs font-semibold text-white mt-2.5 drop-shadow-md">
              {config.appName || 'My App'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
              Bewegen für Parallaxe
            </span>
          </div>

          {/* Google Search Bar */}
          <div className="w-full bg-white/10 backdrop-blur-md rounded-full py-2.5 px-4 flex items-center justify-between border border-white/15 text-white/70 text-xs shadow-md mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">G</span>
              <span className="text-slate-300">Suche...</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span>🎙️</span>
              <span>📷</span>
            </div>
          </div>

          {/* Android Navigation Pill */}
          <div className="w-24 h-1 bg-white/60 rounded-full mx-auto mb-1" />
        </div>
      </div>
    </div>
  );
};
