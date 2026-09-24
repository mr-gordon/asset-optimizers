import React, { useState } from 'react';
import { IconConfig } from '../../types/icon';

interface MacOsMockupProps {
  imgElement: HTMLImageElement | null;
  config: IconConfig;
}

export const MacOsMockup: React.FC<MacOsMockupProps> = ({
  imgElement,
  config,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // App list for dock
  const dockApps = [
    { id: 'finder', name: 'Finder', icon: '💻' },
    { id: 'safari', name: 'Safari', icon: '🧭' },
    { id: 'messages', name: 'Messages', icon: '💬' },
    { id: 'hero', name: config.appName || 'My App', isHero: true },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'terminal', name: 'Terminal', icon: '⌨️' },
    { id: 'trash', name: 'Papierkorb', icon: '🗑️' },
  ];

  // Helper for magnification scale
  const getScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const dist = Math.abs(hoveredIndex - index);
    if (dist === 0) return 1.45; // Hero hover magnification
    if (dist === 1) return 1.22;
    if (dist === 2) return 1.08;
    return 1;
  };

  const getTranslateY = (index: number) => {
    if (hoveredIndex === null) return 0;
    const dist = Math.abs(hoveredIndex - index);
    if (dist === 0) return -18;
    if (dist === 1) return -9;
    if (dist === 2) return -3;
    return 0;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
      {/* SVG ClipPath for macOS Squircle */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id="macos-squircle-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.22,0 L 0.78,0 C 0.90,0 1,0.10 1,0.22 L 1,0.78 C 1,0.90 0.90,1 0.78,1 L 0.22,1 C 0.10,1 0,0.90 0,0.78 L 0,0.22 C 0,0.10 0.10,0 0.22,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Desktop Container */}
      <div
        className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between select-none"
        style={{
          background:
            'radial-gradient(ellipse at top, #2b334d 0%, #151824 60%, #0c0e15 100%)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.7)',
        }}
      >
        {/* macOS Top Menu Bar */}
        <div className="w-full h-7 px-4 flex items-center justify-between text-[13px] font-medium text-white/90 backdrop-blur-md bg-black/25 border-b border-white/10 z-10">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold"></span>
            <span className="font-semibold">{config.appName || 'My App'}</span>
            <span className="text-white/70 hidden sm:inline text-xs">Ablage</span>
            <span className="text-white/70 hidden sm:inline text-xs">Bearbeiten</span>
            <span className="text-white/70 hidden sm:inline text-xs">Ansicht</span>
            <span className="text-white/70 hidden sm:inline text-xs">Fenster</span>
            <span className="text-white/70 hidden sm:inline text-xs">Hilfe</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/80">
            <span>100%</span>
            <span>Di. 18. Sept. 21:05</span>
          </div>
        </div>

        {/* Center Focus Badge */}
        <div className="my-auto flex flex-col items-center">
          <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white/80">
            Fahre mit der Maus über das Dock für den Magnification-Effekt
          </div>
        </div>

        {/* macOS Floating Dock */}
        <div className="w-full flex justify-center pb-5 z-20">
          <div
            onMouseLeave={() => setHoveredIndex(null)}
            className="flex items-end gap-2.5 px-4 py-2.5 rounded-2xl backdrop-blur-2xl border shadow-2xl transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderColor: 'rgba(255, 255, 255, 0.35)',
              boxShadow:
                '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.6)',
            }}
          >
            {dockApps.map((app, idx) => {
              const scale = getScale(idx);
              const translateY = getTranslateY(idx);

              if (app.isHero) {
                return (
                  <div
                    key={app.id}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    className="relative flex flex-col items-center cursor-pointer transition-transform duration-150 ease-out group"
                    style={{
                      transform: `scale(${scale}) translateY(${translateY}px)`,
                      transformOrigin: 'bottom center',
                    }}
                  >
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-9 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-lg">
                      {app.name}
                    </div>

                    {/* macOS App Icon Container with 3D Shadow and Rim */}
                    <div
                      className="relative w-14 h-14 flex items-center justify-center transition-all"
                      style={{
                        clipPath: 'url(#macos-squircle-clip)',
                        background:
                          config.backgroundType === 'gradient'
                            ? `linear-gradient(${config.gradientAngle}deg, ${config.backgroundColor}, ${config.gradientColor2})`
                            : config.backgroundColor || '#ffffff',
                        boxShadow:
                          '0 12px 24px -4px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      {imgElement ? (
                        <img
                          src={imgElement.src}
                          alt={app.name}
                          className="object-contain"
                          style={{
                            width: `${100 - config.padding * 2}%`,
                            height: `${100 - config.padding * 2}%`,
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-white/30 animate-pulse" />
                      )}

                      {/* Specular Rim Light */}
                      <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-b from-white/25 via-transparent to-black/20" />
                    </div>

                    {/* Active App Indicator Dot */}
                    <div className="w-1 h-1 rounded-full bg-white/90 mt-1 shadow-sm" />
                  </div>
                );
              }

              // Companion Dock App
              return (
                <div
                  key={app.id}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  className="relative flex flex-col items-center cursor-pointer transition-transform duration-150 ease-out group"
                  style={{
                    transform: `scale(${scale}) translateY(${translateY}px)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <div className="absolute -top-9 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-lg">
                    {app.name}
                  </div>

                  <div
                    className="w-14 h-14 flex items-center justify-center text-2xl rounded-2xl bg-gradient-to-b from-white/20 to-white/5 border border-white/20 shadow-md transition-all"
                    style={{
                      boxShadow: '0 8px 16px -2px rgba(0,0,0,0.35)',
                    }}
                  >
                    <span>{app.icon}</span>
                  </div>

                  <div className="w-1 h-1 rounded-full bg-transparent mt-1" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
