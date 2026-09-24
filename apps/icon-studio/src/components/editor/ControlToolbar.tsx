import React from 'react';
import { IconConfig } from '../../types/icon';
import {
  Settings2,
  Sliders,
  Paintbrush,
  ShieldAlert,
  Code2,
  Type,
} from 'lucide-react';

interface ControlToolbarProps {
  config: IconConfig;
  onConfigChange: (updates: Partial<IconConfig>) => void;
  onOpenManifestModal: () => void;
}

const PRESET_COLORS = [
  '#0F172A',
  '#FFFFFF',
  '#000000',
  '#2563EB',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
];

export const ControlToolbar: React.FC<ControlToolbarProps> = ({
  config,
  onConfigChange,
  onOpenManifestModal,
}) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 'var(--control-height)',
    padding: '0 14px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--c-surface-alt)',
    border: '1px solid var(--c-border)',
    fontSize: 'var(--fs-sm)',
    fontWeight: 500,
    color: 'var(--c-text)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--fs-xs)',
    fontWeight: 600,
    color: 'var(--c-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginBottom: '6px',
  };

  return (
    <div
      className="space-y-4"
      style={{
        background: 'var(--c-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--c-border)',
        padding: '16px 20px',
        boxShadow: 'var(--c-shadow-sm)',
      }}
    >
      {/* Top Header Row */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3"
        style={{ borderBottom: '1px solid var(--c-border-light)' }}
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-[var(--c-text-tertiary)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text)]">
            Icon-Einstellungen &amp; Layout
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Safe-Zone Guide Toggle */}
          <button
            type="button"
            onClick={() => onConfigChange({ showSafeZone: !config.showSafeZone })}
            className={`px-3 h-8 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border transition-all ${
              config.showSafeZone
                ? 'bg-[var(--c-accent)] text-white border-transparent shadow-xs'
                : 'border-[var(--c-border)] text-[var(--c-text-secondary)] hover:bg-[var(--c-hover)]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Safe-Zone Guide</span>
          </button>

          {/* PWA Code Snippets */}
          <button
            type="button"
            onClick={onOpenManifestModal}
            className="px-3 h-8 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border transition-all border-[var(--c-border)] text-[var(--c-text-secondary)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)]"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>PWA &amp; Snippets</span>
          </button>
        </div>
      </div>

      {/* Main Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Parameter 1: App Name */}
        <div>
          <label style={labelStyle}>
            <Type className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
            <span>App-Name</span>
          </label>
          <input
            type="text"
            value={config.appName}
            onChange={(e) => onConfigChange({ appName: e.target.value })}
            placeholder="z. B. Universal Icon Studio"
            style={inputStyle}
          />
        </div>

        {/* Parameter 2: Short Name */}
        <div>
          <label style={labelStyle}>
            <Type className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
            <span>Kurzname (PWA &amp; Homescreen)</span>
          </label>
          <input
            type="text"
            value={config.shortName}
            onChange={(e) => onConfigChange({ shortName: e.target.value })}
            placeholder="z. B. IconStudio"
            style={inputStyle}
          />
        </div>

        {/* Parameter 3: Logo Inset / Padding */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label style={{ ...labelStyle, marginBottom: 0 }}>
              <Sliders className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
              <span>Randabstand (Logo Inset)</span>
            </label>
            <span className="text-xs font-mono font-semibold text-[var(--c-text)]">
              {config.padding}%
            </span>
          </div>
          <div className="h-8 flex items-center">
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={config.padding}
              onChange={(e) => onConfigChange({ padding: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        {/* Parameter 4: Background Type Segmented Control */}
        <div>
          <label style={labelStyle}>
            <Paintbrush className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
            <span>Hintergrund-Modus</span>
          </label>
          <div
            className="flex p-0.5 rounded-full border text-xs"
            style={{
              height: 'var(--control-height)',
              borderColor: 'var(--c-border)',
              background: 'var(--c-surface-alt)',
            }}
          >
            <button
              type="button"
              onClick={() => onConfigChange({ backgroundType: 'solid' })}
              className={`flex-1 rounded-full font-medium transition-all ${
                config.backgroundType === 'solid'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs font-semibold'
                  : 'text-[var(--c-text-secondary)]'
              }`}
            >
              Farbe
            </button>
            <button
              type="button"
              onClick={() => onConfigChange({ backgroundType: 'gradient' })}
              className={`flex-1 rounded-full font-medium transition-all ${
                config.backgroundType === 'gradient'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs font-semibold'
                  : 'text-[var(--c-text-secondary)]'
              }`}
            >
              Verlauf
            </button>
            <button
              type="button"
              onClick={() => onConfigChange({ backgroundType: 'transparent' })}
              className={`flex-1 rounded-full font-medium transition-all ${
                config.backgroundType === 'transparent'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs font-semibold'
                  : 'text-[var(--c-text-secondary)]'
              }`}
            >
              Transp.
            </button>
          </div>
        </div>
      </div>

      {/* Background Color & Swatches Sub-Row (if not transparent) */}
      {config.backgroundType !== 'transparent' && (
        <div
          className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{ borderTop: '1px solid var(--c-border-light)' }}
        >
          {/* Color 1 */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[var(--c-text-secondary)]">
              {config.backgroundType === 'gradient' ? 'Startfarbe:' : 'Farbe:'}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                className="w-7 h-7 rounded-full cursor-pointer border border-[var(--c-border)] p-0.5 bg-transparent"
              />
              <span className="font-mono text-xs uppercase font-semibold text-[var(--c-text)]">
                {config.backgroundColor}
              </span>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-[var(--c-border)]">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => onConfigChange({ backgroundColor: col })}
                  className={`w-5 h-5 rounded-full border transition-transform hover:scale-115 shadow-xs ${
                    config.backgroundColor.toLowerCase() === col.toLowerCase()
                      ? 'ring-2 ring-[var(--c-accent)] ring-offset-1'
                      : ''
                  }`}
                  style={{
                    backgroundColor: col,
                    borderColor: 'var(--c-border)',
                  }}
                  title={col}
                />
              ))}
            </div>
          </div>

          {/* Color 2 (if gradient) */}
          {config.backgroundType === 'gradient' && (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[var(--c-text-secondary)]">
                Endfarbe:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.gradientColor2}
                  onChange={(e) => onConfigChange({ gradientColor2: e.target.value })}
                  className="w-7 h-7 rounded-full cursor-pointer border border-[var(--c-border)] p-0.5 bg-transparent"
                />
                <span className="font-mono text-xs uppercase font-semibold text-[var(--c-text)]">
                  {config.gradientColor2}
                </span>
              </div>

              <div className="flex items-center gap-2 pl-3 border-l border-[var(--c-border)]">
                <span className="text-[var(--c-text-secondary)] font-medium">
                  Winkel: {config.gradientAngle}°
                </span>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={5}
                  value={config.gradientAngle}
                  onChange={(e) =>
                    onConfigChange({ gradientAngle: Number(e.target.value) })
                  }
                  className="w-24"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
