import React, { useState, useMemo } from 'react';
import {
  PlatformTab,
  IconConfig,
  StageBackground,
  AndroidMaskShape,
  IosThemeMode,
} from '../../types/icon';
import {
  Smartphone,
  Laptop,
  Globe,
  Grid,
  ShieldAlert,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Moon,
  Palette,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface StageProps {
  imgElement: HTMLImageElement | null;
  config: IconConfig;
  onConfigChange: (updates: Partial<IconConfig>) => void;
  activePlatform: PlatformTab;
  onPlatformChange: (tab: PlatformTab) => void;
}

export const Stage: React.FC<StageProps> = ({
  imgElement,
  config,
  onConfigChange,
  activePlatform,
  onPlatformChange,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [stageBg, setStageBg] = useState<StageBackground>('neutral');
  const [showAndroidLayers, setShowAndroidLayers] = useState<boolean>(false);
  const [macOsMode, setMacOsMode] = useState<'standard' | 'dock'>('standard');
  const [macOsLight, setMacOsLight] = useState<boolean>(true);
  const [windowsView, setWindowsView] = useState<'tile' | 'taskbar' | 'tray'>('tile');
  const [windowsDarkTaskbar, setWindowsDarkTaskbar] = useState<boolean>(true);

  // Background style for stage
  const stageBgStyle = useMemo(() => {
    switch (stageBg) {
      case 'white':
        return { background: '#FFFFFF' };
      case 'checker':
        return {
          backgroundImage: `
            linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
            linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
            linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
          `,
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          backgroundColor: '#FFFFFF',
        };
      case 'neutral':
      default:
        return {
          background: 'var(--c-surface-alt)',
          backgroundImage:
            'radial-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: 'center',
        };
    }
  }, [stageBg]);

  // Standard icon background fill
  const iconBaseBg = useMemo(() => {
    if (config.backgroundType === 'gradient') {
      return `linear-gradient(${config.gradientAngle}deg, ${config.backgroundColor}, ${config.gradientColor2})`;
    }
    if (config.backgroundType === 'transparent') {
      return 'transparent';
    }
    return config.backgroundColor || '#FFFFFF';
  }, [config]);

  // Android Mask border radius
  const androidRadius = useMemo(() => {
    switch (config.androidMask) {
      case 'rounded-square':
        return '22%';
      case 'circle':
        return '50%';
      case 'squircle':
        return '34%';
      case 'teardrop':
        return '50% 50% 50% 12%';
      case 'pebble':
        return '32% 68% 68% 32% / 32% 32% 68% 68%';
      default:
        return '22%';
    }
  }, [config.androidMask]);

  const platforms: { id: PlatformTab; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Alle Plattformen', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'ios', label: 'iOS & iPadOS', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'android', label: 'Android Adaptive', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'macos', label: 'macOS', icon: <Laptop className="w-3.5 h-3.5" /> },
    { id: 'windows', label: 'Windows 11', icon: <Grid className="w-3.5 h-3.5" /> },
    { id: 'web', label: 'Web Favicons', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'sizes', label: 'Schärfe-Inspektor', icon: <Eye className="w-3.5 h-3.5" /> },
  ];

  const androidShapes: { id: AndroidMaskShape; label: string; shortLabel: string }[] = [
    { id: 'rounded-square', label: 'Eckig mit runden Ecken', shortLabel: 'Eckig' },
    { id: 'circle', label: 'Kreis (Pixel)', shortLabel: 'Kreis' },
    { id: 'squircle', label: 'Squircle (Samsung)', shortLabel: 'Squircle' },
    { id: 'teardrop', label: 'Teardrop', shortLabel: 'Tropfen' },
    { id: 'pebble', label: 'Kieselstein', shortLabel: 'Kiesel' },
  ];

  // 1. iOS Card Component
  const renderIosCard = () => (
    <div
      className="rounded-2xl border flex flex-col justify-between overflow-hidden transition-all h-full"
      style={{
        background: 'var(--c-surface)',
        borderColor: 'var(--c-border)',
        boxShadow: 'var(--c-shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 border-b flex items-center justify-between shrink-0 h-12"
        style={{
          borderBottom: '1px solid var(--c-border-light)',
          background: 'var(--c-surface)',
        }}
      >
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[var(--c-text-secondary)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text)]">
            iOS &amp; iPadOS AppIcon
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[var(--c-text-secondary)] px-2 py-0.5 rounded-md bg-[var(--c-surface-alt)] border border-[var(--c-border-light)]">
          AppIcon.appiconset
        </span>
      </div>

      {/* Stage Preview Pod */}
      <div className="p-6 flex flex-col items-center justify-center h-[240px] bg-[var(--c-surface-alt)]/30 border-b border-[var(--c-border-light)] shrink-0">
        <div
          className="relative w-[150px] h-[150px] flex items-center justify-center transition-all group"
          style={{
            clipPath: 'url(#apple-squircle-clip)',
            background:
              config.iosMode === 'dark'
                ? '#121316'
                : config.iosMode === 'tinted'
                ? '#15171C'
                : iconBaseBg,
            boxShadow: '0 16px 30px -6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.08)',
          }}
        >
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
                filter:
                  config.iosMode === 'tinted'
                    ? 'grayscale(100%) brightness(1.3) contrast(1.2)'
                    : config.iosMode === 'dark'
                    ? 'brightness(0.92) contrast(1.05)'
                    : 'none',
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-200 animate-pulse" />
          )}

          {config.showSafeZone && (
            <div
              className="absolute inset-3 border border-dashed border-rose-500/80 rounded-2xl pointer-events-none"
              title="Apple Safe Area"
            />
          )}
        </div>

        <span className="text-xs font-bold text-[var(--c-text)] mt-3 truncate max-w-[200px] text-center">
          {config.appName || 'My App'}
        </span>
      </div>

      {/* Controls & Alignment */}
      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-[var(--c-text)] mb-0.5">
              iOS 18 Shader-Modi
            </h4>
            <p className="text-[11px] text-[var(--c-text-secondary)] leading-relaxed h-[32px] line-clamp-2">
              Prüfe das App-Icon für Standard-, Dark- und getönte Homescreens:
            </p>
          </div>

          {/* Slot 1: Segmented Control */}
          <div className="grid grid-cols-3 p-0.5 rounded-full bg-[var(--c-surface-alt)] border border-[var(--c-border)] gap-1 h-8 items-center">
            <button
              type="button"
              onClick={() => onConfigChange({ iosMode: 'standard' })}
              className={`h-7 px-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                config.iosMode === 'standard'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                  : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Standard</span>
            </button>

            <button
              type="button"
              onClick={() => onConfigChange({ iosMode: 'dark' })}
              className={`h-7 px-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                config.iosMode === 'dark'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                  : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => onConfigChange({ iosMode: 'tinted' })}
              className={`h-7 px-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                config.iosMode === 'tinted'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                  : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Tinted</span>
            </button>
          </div>

          {/* Slot 2: Secondary Options (Uniform h-8) */}
          <div className="h-8">
            {config.iosMode === 'tinted' ? (
              <div className="flex items-center justify-between gap-2 px-3 h-8 rounded-full bg-[var(--c-surface-alt)] border border-[var(--c-border)] text-xs">
                <span className="text-[11px] font-medium text-[var(--c-text-secondary)]">Tönungsfarbe:</span>
                <div className="flex items-center gap-1.5">
                  {['#38BDF8', '#818CF8', '#34D399', '#F472B6', '#FB923C'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onConfigChange({ iosTintColor: c })}
                      className={`w-4 h-4 rounded-full border transition-transform ${
                        config.iosTintColor === c ? 'ring-2 ring-[var(--c-accent)] scale-110' : ''
                      }`}
                      style={{ backgroundColor: c, borderColor: 'rgba(0,0,0,0.1)' }}
                    />
                  ))}
                  <input
                    type="color"
                    value={config.iosTintColor}
                    onChange={(e) => onConfigChange({ iosTintColor: e.target.value })}
                    className="w-5 h-5 rounded-full cursor-pointer border border-[var(--c-border)] p-0 bg-transparent ml-1"
                    title="Eigene Tönungsfarbe"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 h-8 rounded-full bg-[var(--c-surface-alt)] border border-[var(--c-border)] text-[11px] text-[var(--c-text-secondary)]">
                <span>Systemzustand:</span>
                <span className="font-semibold text-[var(--c-text)]">
                  {config.iosMode === 'dark' ? 'iOS Dark Mode Farbschema' : 'Standard P3/sRGB Farbschema'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Standardized Metadata Footer */}
        <div className="p-2.5 rounded-xl bg-[var(--c-surface-alt)] border border-[var(--c-border)] text-[11px] text-[var(--c-text-secondary)] space-y-1 mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-[var(--c-text-tertiary)]">Export-Format:</span>
            <span className="font-mono font-semibold text-[var(--c-text)]">AppIcon.appiconset</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--c-text-tertiary)]">Geometrie / Alpha:</span>
            <span className="font-medium text-[var(--c-text)]">1024×1024 px · Vollflächig (Kein Alpha)</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Android Card Component
  const renderAndroidCard = () => (
    <div
      className="rounded-2xl border flex flex-col justify-between overflow-hidden transition-all h-full"
      style={{
        background: 'var(--c-surface)',
        borderColor: 'var(--c-border)',
        boxShadow: 'var(--c-shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 border-b flex items-center justify-between shrink-0 h-12"
        style={{
          borderBottom: '1px solid var(--c-border-light)',
          background: 'var(--c-surface)',
        }}
      >
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[var(--c-text-secondary)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text)]">
            Android Adaptive Icon
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[var(--c-text-secondary)] px-2 py-0.5 rounded-md bg-[var(--c-surface-alt)] border border-[var(--c-border-light)]">
          Adaptive Vector XML
        </span>
      </div>

      {/* Stage Preview Pod */}
      <div className="p-6 flex flex-col items-center justify-center h-[240px] bg-[var(--c-surface-alt)]/30 border-b border-[var(--c-border-light)] shrink-0">
        {!showAndroidLayers ? (
          <div
            className="relative w-[150px] h-[150px] flex items-center justify-center transition-all overflow-hidden"
            style={{
              borderRadius: androidRadius,
              background: config.androidDynamicColor
                ? config.androidAccentColor || '#D0E4FF'
                : iconBaseBg,
              boxShadow: '0 16px 30px -6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.08)',
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
              <div className="w-14 h-14 rounded-full bg-slate-200 animate-pulse" />
            )}

            {config.showSafeZone && (
              <div
                className="absolute inset-6 border border-dashed border-rose-500/80 rounded-full pointer-events-none"
                title="Android 66dp Safe Area"
              />
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 h-[150px]">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-18 h-18 rounded-xl border flex items-center justify-center bg-[var(--c-surface-alt)] shadow-xs overflow-hidden"
                style={{ borderColor: 'var(--c-border)' }}
              >
                {imgElement && (
                  <img
                    src={imgElement.src}
                    alt="Foreground"
                    className="object-contain"
                    style={{
                      width: `${100 - config.padding * 2}%`,
                      height: `${100 - config.padding * 2}%`,
                    }}
                  />
                )}
              </div>
              <span className="text-[10px] font-semibold text-[var(--c-text-secondary)]">Vordergrund</span>
            </div>
            <span className="text-xs font-bold text-[var(--c-text-tertiary)]">+</span>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-18 h-18 rounded-xl border shadow-xs"
                style={{ background: iconBaseBg, borderColor: 'var(--c-border)' }}
              />
              <span className="text-[10px] font-semibold text-[var(--c-text-secondary)]">Hintergrund</span>
            </div>
          </div>
        )}

        <span className="text-xs font-bold text-[var(--c-text)] mt-3 truncate max-w-[200px] text-center">
          {config.appName || 'My App'}
        </span>
      </div>

      {/* Controls & Alignment */}
      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-[var(--c-text)] mb-0.5">
              Adaptive Masken &amp; Material You
            </h4>
            <p className="text-[11px] text-[var(--c-text-secondary)] leading-relaxed h-[32px] line-clamp-2">
              Wähle die OEM-Maske (z. B. Eckig nach aktuellem Google-Standard):
            </p>
          </div>

          {/* Slot 1: 5-Shape Segmented Control */}
          <div className="grid grid-cols-5 p-0.5 rounded-full bg-[var(--c-surface-alt)] border border-[var(--c-border)] gap-0.5 h-8 items-center">
            {androidShapes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onConfigChange({ androidMask: s.id })}
                className={`h-7 px-1 text-[11px] font-semibold rounded-full transition-all text-center truncate ${
                  config.androidMask === s.id
                    ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                    : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
                }`}
                title={s.label}
              >
                {s.shortLabel}
              </button>
            ))}
          </div>

          {/* Slot 2: Secondary Options (Uniform h-8 grid) */}
          <div className="grid grid-cols-2 gap-2 h-8">
            <button
              type="button"
              onClick={() => setShowAndroidLayers(!showAndroidLayers)}
              className={`h-8 px-3 text-xs font-semibold rounded-full border transition-all flex items-center justify-center gap-1.5 ${
                showAndroidLayers
                  ? 'bg-[var(--c-accent)] text-white border-transparent shadow-xs'
                  : 'border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text-secondary)] hover:bg-[var(--c-hover)] hover:text-[var(--c-text)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showAndroidLayers ? 'Maskiert' : 'Ebenen teilen'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onConfigChange({ androidDynamicColor: !config.androidDynamicColor })
              }
              className={`h-8 px-3 text-xs font-semibold rounded-full border transition-all flex items-center justify-center gap-1.5 ${
                config.androidDynamicColor
                  ? 'bg-[var(--c-accent)] text-white border-transparent shadow-xs'
                  : 'border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text-secondary)] hover:bg-[var(--c-hover)] hover:text-[var(--c-text)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Material You</span>
            </button>
          </div>
        </div>

        {/* Standardized Metadata Footer */}
        <div className="p-2.5 rounded-xl bg-[var(--c-surface-alt)] border border-[var(--c-border)] text-[11px] text-[var(--c-text-secondary)] space-y-1 mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-[var(--c-text-tertiary)]">Export-Format:</span>
            <span className="font-mono font-semibold text-[var(--c-text)]">Adaptive Vector XML</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--c-text-tertiary)]">Geometrie / Alpha:</span>
            <span className="font-medium text-[var(--c-text)]">108dp Viewport · 66dp Safe-Zone</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. macOS Card Component
  const renderMacOsCard = () => (
    <div
      className="rounded-2xl border flex flex-col justify-between overflow-hidden transition-all h-full"
      style={{
        background: 'var(--c-surface)',
        borderColor: 'var(--c-border)',
        boxShadow: 'var(--c-shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 border-b flex items-center justify-between shrink-0 h-12"
        style={{
          borderBottom: '1px solid var(--c-border-light)',
          background: 'var(--c-surface)',
        }}
      >
        <div className="flex items-center gap-2">
          <Laptop className="w-4 h-4 text-[var(--c-text-secondary)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text)]">
            macOS Desktop Icon
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[var(--c-text-secondary)] px-2 py-0.5 rounded-md bg-[var(--c-surface-alt)] border border-[var(--c-border-light)]">
          AppIcon.icns
        </span>
      </div>

      {/* Stage Preview Pod */}
      <div className="p-6 flex flex-col items-center justify-center h-[240px] bg-[var(--c-surface-alt)]/30 border-b border-[var(--c-border-light)] shrink-0">
        <div
          className="relative w-[150px] h-[150px] flex items-center justify-center transition-all group"
          style={{
            clipPath: 'url(#macos-squircle-clip)',
            background: macOsMode === 'dock' ? '#121316' : iconBaseBg,
            boxShadow:
              '0 20px 35px -8px rgba(0,0,0,0.28), inset 0 1px 2px rgba(255,255,255,0.7), inset 0 -2px 4px rgba(0,0,0,0.2)',
          }}
        >
          {imgElement && (
            <img
              src={imgElement.src}
              alt={config.appName}
              className="object-contain"
              style={{
                width: `${100 - config.padding * 2}%`,
                height: `${100 - config.padding * 2}%`,
              }}
            />
          )}

          {macOsLight && (
            <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-b from-white/30 via-transparent to-black/15" />
          )}
        </div>

        <span className="text-xs font-bold text-[var(--c-text)] mt-3 truncate max-w-[200px] text-center">
          {config.appName || 'My App'}
        </span>
      </div>

      {/* Controls & Alignment */}
      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-[var(--c-text)] mb-0.5">
              macOS Sonoma / Sequoia Ansicht
            </h4>
            <p className="text-[11px] text-[var(--c-text-secondary)] leading-relaxed h-[32px] line-clamp-2">
              Apples Desktop-Icon mit 3D-Kantenbeleuchtung und Schattierung:
            </p>
          </div>

          {/* Slot 1: Segmented Control */}
          <div className="grid grid-cols-2 p-0.5 rounded-full bg-[var(--c-surface-alt)] border border-[var(--c-border)] gap-1 h-8 items-center">
            <button
              type="button"
              onClick={() => setMacOsMode('standard')}
              className={`h-7 px-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                macOsMode === 'standard'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                  : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Finder / Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setMacOsMode('dock')}
              className={`h-7 px-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                macOsMode === 'dock'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                  : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>macOS Dock</span>
            </button>
          </div>

          {/* Slot 2: Secondary Options (Uniform h-8 grid) */}
          <div className="grid grid-cols-2 gap-2 h-8">
            <button
              type="button"
              onClick={() => setMacOsLight((prev) => !prev)}
              className={`h-8 px-3 text-xs font-semibold rounded-full border transition-all flex items-center justify-center gap-1.5 ${
                macOsLight
                  ? 'bg-[var(--c-accent)] text-white border-transparent shadow-xs'
                  : 'border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text-secondary)] hover:bg-[var(--c-hover)] hover:text-[var(--c-text)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D-Lichtglanz</span>
            </button>

            <div className="flex items-center justify-center px-3 h-8 rounded-full bg-[var(--c-surface-alt)] border border-[var(--c-border)] text-[11px] font-semibold text-[var(--c-text-secondary)]">
              <span>Apple ICNS Vektor</span>
            </div>
          </div>
        </div>

        {/* Standardized Metadata Footer */}
        <div className="p-2.5 rounded-xl bg-[var(--c-surface-alt)] border border-[var(--c-border)] text-[11px] text-[var(--c-text-secondary)] space-y-1 mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-[var(--c-text-tertiary)]">Export-Format:</span>
            <span className="font-mono font-semibold text-[var(--c-text)]">AppIcon.icns</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--c-text-tertiary)]">Geometrie / Alpha:</span>
            <span className="font-medium text-[var(--c-text)]">1024×1024 px · Superellipse (9° Neigung)</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. Windows 11 Card Component
  const renderWindowsCard = () => (
    <div
      className="rounded-2xl border flex flex-col justify-between overflow-hidden transition-all h-full"
      style={{
        background: 'var(--c-surface)',
        borderColor: 'var(--c-border)',
        boxShadow: 'var(--c-shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 border-b flex items-center justify-between shrink-0 h-12"
        style={{
          borderBottom: '1px solid var(--c-border-light)',
          background: 'var(--c-surface)',
        }}
      >
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-[var(--c-text-secondary)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text)]">
            Windows 11 Tile &amp; Taskbar
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[var(--c-text-secondary)] px-2 py-0.5 rounded-md bg-[var(--c-surface-alt)] border border-[var(--c-border-light)]">
          app.ico
        </span>
      </div>

      {/* Stage Preview Pod */}
      <div className="p-6 flex flex-col items-center justify-center h-[240px] bg-[var(--c-surface-alt)]/30 border-b border-[var(--c-border-light)] shrink-0">
        {windowsView === 'tile' && (
          <div
            className="w-[150px] h-[150px] rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border border-black/10"
            style={{
              background: iconBaseBg,
              boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
            }}
          >
            {imgElement && (
              <img
                src={imgElement.src}
                alt={config.appName}
                className="object-contain"
                style={{
                  width: `${100 - config.padding * 2}%`,
                  height: `${100 - config.padding * 2}%`,
                }}
              />
            )}
          </div>
        )}

        {windowsView === 'taskbar' && (
          <div className="h-[150px] flex items-center justify-center">
            <div
              className={`px-5 py-3 rounded-xl border flex items-center gap-3 shadow-md ${
                windowsDarkTaskbar
                  ? 'bg-[#1e2025] border-white/10 text-white/90'
                  : 'bg-[#f3f4f6] border-black/10 text-black/90'
              }`}
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center shadow-xs border border-white/10 overflow-hidden"
                style={{ background: iconBaseBg }}
              >
                {imgElement && (
                  <img
                    src={imgElement.src}
                    alt=""
                    className="object-contain"
                    style={{
                      width: `${100 - config.padding * 2}%`,
                      height: `${100 - config.padding * 2}%`,
                    }}
                  />
                )}
              </div>
              <span className="text-xs font-medium">Taskbar-Icon (32×32)</span>
            </div>
          </div>
        )}

        {windowsView === 'tray' && (
          <div className="h-[150px] flex items-center justify-center">
            <div
              className={`px-5 py-3 rounded-xl border flex items-center gap-3 shadow-md ${
                windowsDarkTaskbar
                  ? 'bg-[#1e2025] border-white/10 text-white/90'
                  : 'bg-[#f3f4f6] border-black/10 text-black/90'
              }`}
            >
              <div
                className="w-5 h-5 rounded-xs flex items-center justify-center shadow-xs border border-white/10 overflow-hidden"
                style={{ background: iconBaseBg }}
              >
                {imgElement && (
                  <img
                    src={imgElement.src}
                    alt=""
                    className="object-contain"
                    style={{
                      width: `${100 - config.padding * 2}%`,
                      height: `${100 - config.padding * 2}%`,
                    }}
                  />
                )}
              </div>
              <span className="text-xs font-medium">System-Tray (16×16)</span>
            </div>
          </div>
        )}

        <span className="text-xs font-bold text-[var(--c-text)] mt-3 truncate max-w-[200px] text-center">
          {config.appName || 'My App'}
        </span>
      </div>

      {/* Controls & Alignment */}
      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-[var(--c-text)] mb-0.5">
              Windows 11 Start &amp; Taskbar
            </h4>
            <p className="text-[11px] text-[var(--c-text-secondary)] leading-relaxed h-[32px] line-clamp-2">
              Moderne Fluent-Tile und Miniatur-Ansichten:
            </p>
          </div>

          {/* Slot 1: Segmented Control */}
          <div className="grid grid-cols-3 p-0.5 rounded-full bg-[var(--c-surface-alt)] border border-[var(--c-border)] gap-1 h-8 items-center">
            <button
              type="button"
              onClick={() => setWindowsView('tile')}
              className={`h-7 px-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                windowsView === 'tile'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                  : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
              <span>Kachel</span>
            </button>

            <button
              type="button"
              onClick={() => setWindowsView('taskbar')}
              className={`h-7 px-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                windowsView === 'taskbar'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                  : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Taskbar</span>
            </button>

            <button
              type="button"
              onClick={() => setWindowsView('tray')}
              className={`h-7 px-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                windowsView === 'tray'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                  : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Tray</span>
            </button>
          </div>

          {/* Slot 2: Secondary Options (Uniform h-8 grid) */}
          <div className="grid grid-cols-2 gap-2 h-8">
            <button
              type="button"
              onClick={() => setWindowsDarkTaskbar((prev) => !prev)}
              className={`h-8 px-3 text-xs font-semibold rounded-full border transition-all flex items-center justify-center gap-1.5 ${
                windowsDarkTaskbar
                  ? 'bg-[var(--c-accent)] text-white border-transparent shadow-xs'
                  : 'border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text-secondary)] hover:bg-[var(--c-hover)] hover:text-[var(--c-text)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{windowsDarkTaskbar ? 'Dark Taskbar' : 'Light Taskbar'}</span>
            </button>

            <div className="flex items-center justify-center px-3 h-8 rounded-full bg-[var(--c-surface-alt)] border border-[var(--c-border)] text-[11px] font-semibold text-[var(--c-text-secondary)]">
              <span>16–256px Ebenen</span>
            </div>
          </div>
        </div>

        {/* Standardized Metadata Footer */}
        <div className="p-2.5 rounded-xl bg-[var(--c-surface-alt)] border border-[var(--c-border)] text-[11px] text-[var(--c-text-secondary)] space-y-1 mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-[var(--c-text-tertiary)]">Export-Format:</span>
            <span className="font-mono font-semibold text-[var(--c-text)]">app.ico (Multi-Layer)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--c-text-tertiary)]">Geometrie / Alpha:</span>
            <span className="font-medium text-[var(--c-text)]">Quadratisch · 32-Bit RGBA Transparenz</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 5. Web, Favicon & PWA Suite Component
  const renderWebCard = () => (
    <div
      className="rounded-2xl border overflow-hidden flex flex-col transition-all w-full"
      style={{
        background: 'var(--c-surface)',
        borderColor: 'var(--c-border)',
        boxShadow: 'var(--c-shadow-sm)',
      }}
    >
      <div
        className="px-5 py-3 border-b flex items-center justify-between shrink-0 h-12"
        style={{
          borderBottom: '1px solid var(--c-border-light)',
          background: 'var(--c-surface)',
        }}
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[var(--c-text-secondary)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text)]">
            Web, Favicon &amp; PWA Suite
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[var(--c-text-secondary)] px-2 py-0.5 rounded-md bg-[var(--c-surface-alt)] border border-[var(--c-border-light)]">
          favicon.ico · maskable · apple-touch
        </span>
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* 1. Apple Touch Icon */}
        <div className="flex flex-col items-center justify-between p-5 rounded-xl bg-[var(--c-surface-alt)]/40 border border-[var(--c-border)] text-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-[var(--c-text)]">Apple Touch Icon</span>
            <span className="text-[11px] text-[var(--c-text-secondary)] h-[20px] flex items-center">iOS Safari Homescreen Bookmark</span>
          </div>
          <div className="h-[140px] flex items-center justify-center">
            <div
              className="w-[130px] h-[130px] rounded-2xl flex items-center justify-center overflow-hidden shadow-md border border-black/5"
              style={{ background: iconBaseBg }}
            >
              {imgElement && (
                <img
                  src={imgElement.src}
                  alt="Apple Touch"
                  className="object-contain"
                  style={{
                    width: `${100 - config.padding * 2}%`,
                    height: `${100 - config.padding * 2}%`,
                  }}
                />
              )}
            </div>
          </div>
          <div className="h-8 px-2 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[11px] font-mono w-full flex items-center justify-center text-[var(--c-text)]">
            apple-touch-icon.png (180×180)
          </div>
        </div>

        {/* 2. PWA Maskable Icon */}
        <div className="flex flex-col items-center justify-between p-5 rounded-xl bg-[var(--c-surface-alt)]/40 border border-[var(--c-border)] text-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-[var(--c-text)]">PWA Maskable Icon</span>
            <span className="text-[11px] text-[var(--c-text-secondary)] h-[20px] flex items-center">Android &amp; Chrome PWA Install</span>
          </div>
          <div className="h-[140px] flex items-center justify-center">
            <div
              className="w-[130px] h-[130px] rounded-full flex items-center justify-center overflow-hidden shadow-md border border-black/5"
              style={{ background: iconBaseBg }}
            >
              {imgElement && (
                <img
                  src={imgElement.src}
                  alt="PWA Maskable"
                  className="object-contain"
                  style={{
                    width: `${100 - config.padding * 2}%`,
                    height: `${100 - config.padding * 2}%`,
                  }}
                />
              )}
            </div>
          </div>
          <div className="h-8 px-2 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[11px] font-mono w-full flex items-center justify-center text-[var(--c-text)]">
            icon-512-maskable.png (512×512)
          </div>
        </div>

        {/* 3. Multi-Size Favicon Real Scale Pod */}
        <div className="flex flex-col items-center justify-between p-5 rounded-xl bg-[var(--c-surface-alt)]/40 border border-[var(--c-border)] text-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-[var(--c-text)]">Browser Favicons</span>
            <span className="text-[11px] text-[var(--c-text-secondary)] h-[20px] flex items-center">Tabs, Lesezeichen &amp; Shortcuts</span>
          </div>
          <div className="h-[140px] flex items-end justify-center gap-4 pb-2">
            {/* 48px */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shadow-xs border border-black/10 overflow-hidden"
                style={{ background: iconBaseBg }}
              >
                {imgElement && (
                  <img
                    src={imgElement.src}
                    alt=""
                    className="object-contain"
                    style={{
                      width: `${100 - config.padding * 2}%`,
                      height: `${100 - config.padding * 2}%`,
                    }}
                  />
                )}
              </div>
              <span className="text-[10px] font-mono text-[var(--c-text-tertiary)]">48px</span>
            </div>
            {/* 32px */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded flex items-center justify-center shadow-xs border border-black/10 overflow-hidden"
                style={{ background: iconBaseBg }}
              >
                {imgElement && (
                  <img
                    src={imgElement.src}
                    alt=""
                    className="object-contain"
                    style={{
                      width: `${100 - config.padding * 2}%`,
                      height: `${100 - config.padding * 2}%`,
                    }}
                  />
                )}
              </div>
              <span className="text-[10px] font-mono text-[var(--c-text-tertiary)]">32px</span>
            </div>
            {/* 16px */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-xs flex items-center justify-center shadow-xs border border-black/10 overflow-hidden"
                style={{ background: iconBaseBg }}
              >
                {imgElement && (
                  <img
                    src={imgElement.src}
                    alt=""
                    className="object-contain"
                    style={{
                      width: `${100 - config.padding * 2}%`,
                      height: `${100 - config.padding * 2}%`,
                    }}
                  />
                )}
              </div>
              <span className="text-[10px] font-mono text-[var(--c-text-tertiary)]">16px</span>
            </div>
          </div>
          <div className="h-8 px-2 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[11px] font-mono w-full flex items-center justify-center text-[var(--c-text)]">
            favicon.ico (16/32/48px Multi-Res)
          </div>
        </div>
      </div>
    </div>
  );

  // 6. Sharpness Inspector Component
  const renderSizesCard = () => (
    <div
      className="rounded-2xl border overflow-hidden flex flex-col transition-all w-full"
      style={{
        background: 'var(--c-surface)',
        borderColor: 'var(--c-border)',
        boxShadow: 'var(--c-shadow-sm)',
      }}
    >
      <div
        className="px-5 py-3 border-b flex items-center justify-between shrink-0"
        style={{
          borderBottom: '1px solid var(--c-border-light)',
          background: 'var(--c-surface)',
        }}
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[var(--c-text-secondary)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text)]">
            Schärfe-Inspektor (16px – 512px)
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--c-text-secondary)] font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
          <span>Lanczos &amp; Stepped Downsampling aktiv</span>
        </div>
      </div>

      <div className="p-6 flex flex-wrap items-end justify-around gap-6 overflow-x-auto">
        {[
          { size: 16, label: '16×16', usage: 'Favicon / Tray' },
          { size: 24, label: '24×24', usage: 'Windows Small' },
          { size: 32, label: '32×32', usage: 'Tab / Taskbar' },
          { size: 48, label: '48×48', usage: 'Android mdpi' },
          { size: 64, label: '64×64', usage: 'macOS Mini' },
          { size: 96, label: '96×96', usage: 'Android xhdpi' },
          { size: 128, label: '128×128', usage: 'Dock / Tile' },
          { size: 180, label: '180×180', usage: 'Apple Touch' },
        ].map((res) => (
          <div key={res.size} className="flex flex-col items-center gap-2">
            <div
              className="rounded-lg flex items-center justify-center shadow-xs border border-black/10 overflow-hidden"
              style={{
                width: `${res.size}px`,
                height: `${res.size}px`,
                background: iconBaseBg,
              }}
            >
              {imgElement && (
                <img
                  src={imgElement.src}
                  alt=""
                  className="w-full h-full object-contain"
                  style={{
                    transform: `scale(${1 - config.padding / 50})`,
                  }}
                />
              )}
            </div>

            <div className="text-center">
              <span className="text-[11px] font-mono font-bold text-[var(--c-text)] block">
                {res.label}
              </span>
              <span className="text-[9px] text-[var(--c-text-tertiary)] block whitespace-nowrap">
                {res.usage}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="flex flex-col w-full overflow-hidden"
      style={{
        background: 'var(--c-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--c-border)',
        boxShadow: 'var(--c-shadow-sm)',
      }}
    >
      {/* SVG ClipPath for Apple Continuous Squircle */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id="apple-squircle-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.225,0 L 0.775,0 C 0.8875,0 1,0.1125 1,0.225 L 1,0.775 C 1,0.8875 0.8875,1 0.775,1 L 0.225,1 C 0.1125,1 0,0.8875 0,0.775 L 0,0.225 C 0,0.1125 0.1125,0 0.225,0 Z" />
          </clipPath>
          <clipPath id="macos-squircle-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.22,0 L 0.78,0 C 0.90,0 1,0.10 1,0.22 L 1,0.78 C 1,0.90 0.90,1 0.78,1 L 0.22,1 C 0.10,1 0,0.90 0,0.78 L 0,0.22 C 0,0.10 0.10,0 0.22,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Card Header: Platform Selector Pills & Stage Tools */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b shrink-0"
        style={{
          borderBottom: '1px solid var(--c-border-light)',
          background: 'var(--c-surface)',
        }}
      >
        {/* Platform View Tabs */}
        <div
          className="inline-flex p-1 rounded-full items-center gap-1 overflow-x-auto"
          style={{
            background: 'var(--c-surface-alt)',
            border: '1px solid var(--c-border)',
          }}
        >
          {platforms.map((p) => {
            const isActive = activePlatform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPlatformChange(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs font-bold'
                    : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
                }`}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Studio Utilities: Background Color & Zoom */}
        <div className="flex items-center gap-3">
          {/* Studio Stage Background Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-medium text-[var(--c-text-secondary)] hidden sm:inline">
              Hintergrund:
            </span>
            <div
              className="flex items-center gap-1 p-1 rounded-full border"
              style={{
                borderColor: 'var(--c-border)',
                background: 'var(--c-surface-alt)',
              }}
            >
              <button
                type="button"
                onClick={() => setStageBg('neutral')}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  stageBg === 'neutral' ? 'ring-2 ring-[var(--c-accent)] scale-110' : ''
                }`}
                style={{ background: '#F4F5F7', borderColor: '#CBD5E1' }}
                title="Studio Neutral"
              />
              <button
                type="button"
                onClick={() => setStageBg('white')}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  stageBg === 'white' ? 'ring-2 ring-[var(--c-accent)] scale-110' : ''
                }`}
                style={{ background: '#FFFFFF', borderColor: '#CBD5E1' }}
                title="Weiß"
              />
              <button
                type="button"
                onClick={() => setStageBg('checker')}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  stageBg === 'checker' ? 'ring-2 ring-[var(--c-accent)] scale-110' : ''
                }`}
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%)',
                  backgroundSize: '8px 8px',
                  borderColor: '#94A3B8',
                }}
                title="Schachbrett (Transparenz)"
              />
            </div>
          </div>

          {/* Safe-Zone Guide Toggle */}
          <button
            type="button"
            onClick={() => onConfigChange({ showSafeZone: !config.showSafeZone })}
            className={`px-2.5 h-7 inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full border transition-all ${
              config.showSafeZone
                ? 'bg-[var(--c-accent)] text-white border-transparent shadow-xs'
                : 'border-[var(--c-border)] text-[var(--c-text-secondary)] hover:bg-[var(--c-hover)]'
            }`}
            title="Safe-Zone Hilfslinien einblenden"
          >
            <ShieldAlert className="w-3 h-3" />
            <span className="hidden sm:inline">Safe-Zone</span>
          </button>

          {/* Zoom Controls */}
          <div
            className="flex items-center gap-1 px-2 h-7 rounded-full border"
            style={{
              borderColor: 'var(--c-border)',
              background: 'var(--c-surface-alt)',
            }}
          >
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              disabled={zoomLevel <= 70}
              className="p-0.5 rounded-full hover:bg-[var(--c-hover)] text-[var(--c-text-secondary)] disabled:opacity-30"
              title="Verkleinern"
            >
              <ZoomOut className="w-3 h-3" />
            </button>

            <span className="text-[11px] font-mono w-8 text-center font-semibold text-[var(--c-text)]">
              {zoomLevel}%
            </span>

            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              disabled={zoomLevel >= 130}
              className="p-0.5 rounded-full hover:bg-[var(--c-hover)] text-[var(--c-text-secondary)] disabled:opacity-30"
              title="Vergrößern"
            >
              <ZoomIn className="w-3 h-3" />
            </button>

            {zoomLevel !== 100 && (
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-0.5 rounded-full hover:bg-[var(--c-hover)] text-[var(--c-text-secondary)]"
                title="100%"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div
        className="overflow-auto p-6 sm:p-10 flex flex-col items-center justify-center min-h-[560px] transition-all"
        style={stageBgStyle}
      >
        <div
          className="transition-transform duration-200 ease-out origin-top w-full max-w-6xl space-y-6"
          style={{
            transform: `scale(${zoomLevel / 100})`,
          }}
        >
          {/* VIEW 1: ALL PLATFORMS HARMONIZED GRID */}
          {activePlatform === 'all' && (
            <>
              {/* Symmetrical 2-Column Grid for OS Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {renderIosCard()}
                {renderAndroidCard()}
                {renderMacOsCard()}
                {renderWindowsCard()}
              </div>

              {/* Web & Favicon Suite Full Width */}
              {renderWebCard()}

              {/* Sharpness Inspector Full Width */}
              {renderSizesCard()}
            </>
          )}

          {/* VIEW 2: SINGLE PLATFORM DETAILED VIEWS */}
          {activePlatform === 'ios' && (
            <div className="max-w-2xl mx-auto w-full">
              {renderIosCard()}
            </div>
          )}

          {activePlatform === 'android' && (
            <div className="max-w-2xl mx-auto w-full">
              {renderAndroidCard()}
            </div>
          )}

          {activePlatform === 'macos' && (
            <div className="max-w-2xl mx-auto w-full">
              {renderMacOsCard()}
            </div>
          )}

          {activePlatform === 'windows' && (
            <div className="max-w-2xl mx-auto w-full">
              {renderWindowsCard()}
            </div>
          )}

          {activePlatform === 'web' && (
            <div className="max-w-5xl mx-auto w-full">
              {renderWebCard()}
            </div>
          )}

          {activePlatform === 'sizes' && (
            <div className="max-w-5xl mx-auto w-full">
              {renderSizesCard()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
