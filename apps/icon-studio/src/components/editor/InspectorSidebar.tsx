import React from 'react';
import { IconConfig, SourceImage, ValidationIssue } from '../../types/icon';
import { Dropzone } from './Dropzone';
import { Sliders, Paintbrush, FileText, Layers } from 'lucide-react';

interface InspectorSidebarProps {
  config: IconConfig;
  onConfigChange: (updates: Partial<IconConfig>) => void;
  sourceImage: SourceImage | null;
  onImageLoaded: (source: SourceImage, imgElement: HTMLImageElement) => void;
  issues: ValidationIssue[];
}

const PRESET_COLORS = [
  '#FFFFFF',
  '#000000',
  '#0F172A',
  '#2563EB',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
];

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({
  config,
  onConfigChange,
  sourceImage,
  onImageLoaded,
  issues,
}) => {
  return (
    <aside
      className="w-full lg:w-84 xl:w-92 flex flex-col border-r h-full overflow-y-auto shrink-0 z-10"
      style={{
        background: 'var(--c-surface)',
        borderColor: 'var(--c-border-light)',
      }}
    >
      <div className="p-4 space-y-6">
        {/* 1. Upload & Dropzone Section */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Layers className="w-4 h-4 text-[var(--c-text-secondary)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text-secondary)]">
              Icon-Quelle
            </h2>
          </div>
          <Dropzone
            sourceImage={sourceImage}
            onImageLoaded={onImageLoaded}
            issues={issues}
          />
        </div>

        {/* 2. Metadata / App Info */}
        <div className="pt-4 border-t border-[var(--c-border-light)]">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-[var(--c-text-secondary)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text-secondary)]">
              App-Identität
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[var(--c-text)] block mb-1">
                App-Name
              </label>
              <input
                type="text"
                value={config.appName}
                onChange={(e) => onConfigChange({ appName: e.target.value })}
                placeholder="z. B. Universal Icon Studio"
                className="w-full px-3 py-1.5 text-xs rounded-lg border outline-none focus:border-[var(--c-accent)] transition-colors"
                style={{
                  borderColor: 'var(--c-border)',
                  background: 'var(--c-surface-alt)',
                  color: 'var(--c-text)',
                }}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--c-text)] block mb-1">
                Kurzname (Short Name)
              </label>
              <input
                type="text"
                value={config.shortName}
                onChange={(e) => onConfigChange({ shortName: e.target.value })}
                placeholder="z. B. IconStudio"
                className="w-full px-3 py-1.5 text-xs rounded-lg border outline-none focus:border-[var(--c-accent)] transition-colors"
                style={{
                  borderColor: 'var(--c-border)',
                  background: 'var(--c-surface-alt)',
                  color: 'var(--c-text)',
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. Icon Sizing & Padding */}
        <div className="pt-4 border-t border-[var(--c-border-light)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--c-text-secondary)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text-secondary)]">
                Layout &amp; Inset
              </h2>
            </div>
            <span className="text-xs font-mono font-semibold text-[var(--c-text)]">
              {config.padding}%
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-[var(--c-text-secondary)] mb-1">
              <span>Randabstand (Logo Inset)</span>
              <span>0% – 40%</span>
            </div>
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

        {/* 4. Background Styling & Colors */}
        <div className="pt-4 border-t border-[var(--c-border-light)]">
          <div className="flex items-center gap-2 mb-3">
            <Paintbrush className="w-4 h-4 text-[var(--c-text-secondary)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text-secondary)]">
              Hintergrund
            </h2>
          </div>

          {/* Type Segment: Solid, Gradient, Transparent */}
          <div
            className="flex p-1 rounded-lg border mb-3 text-xs"
            style={{
              borderColor: 'var(--c-border)',
              background: 'var(--c-surface-alt)',
            }}
          >
            <button
              type="button"
              onClick={() => onConfigChange({ backgroundType: 'solid' })}
              className={`flex-1 py-1 rounded font-medium transition-all ${
                config.backgroundType === 'solid'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                  : 'text-[var(--c-text-secondary)]'
              }`}
            >
              Farbe
            </button>
            <button
              type="button"
              onClick={() => onConfigChange({ backgroundType: 'gradient' })}
              className={`flex-1 py-1 rounded font-medium transition-all ${
                config.backgroundType === 'gradient'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                  : 'text-[var(--c-text-secondary)]'
              }`}
            >
              Verlauf
            </button>
            <button
              type="button"
              onClick={() => onConfigChange({ backgroundType: 'transparent' })}
              className={`flex-1 py-1 rounded font-medium transition-all ${
                config.backgroundType === 'transparent'
                  ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                  : 'text-[var(--c-text-secondary)]'
              }`}
            >
              Transp.
            </button>
          </div>

          {config.backgroundType !== 'transparent' && (
            <div className="space-y-3">
              {/* Color 1 Picker + Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-[var(--c-text)]">
                    {config.backgroundType === 'gradient' ? 'Startfarbe' : 'Hintergrundfarbe'}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--c-text-secondary)] uppercase">
                    {config.backgroundColor}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-[var(--c-border)] p-0.5 bg-transparent shrink-0"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => onConfigChange({ backgroundColor: col })}
                        className="w-5 h-5 rounded-md border transition-transform hover:scale-110 shadow-xs"
                        style={{
                          backgroundColor: col,
                          borderColor: 'var(--c-border)',
                        }}
                        title={col}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Color 2 (for gradient) */}
              {config.backgroundType === 'gradient' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium text-[var(--c-text)]">
                      Endfarbe
                    </span>
                    <span className="text-[11px] font-mono text-[var(--c-text-secondary)] uppercase">
                      {config.gradientColor2}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.gradientColor2}
                      onChange={(e) => onConfigChange({ gradientColor2: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[var(--c-border)] p-0.5 bg-transparent shrink-0"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.slice(3).map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => onConfigChange({ gradientColor2: col })}
                          className="w-5 h-5 rounded-md border transition-transform hover:scale-110 shadow-xs"
                          style={{
                            backgroundColor: col,
                            borderColor: 'var(--c-border)',
                          }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Gradient Angle Slider */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[11px] text-[var(--c-text-secondary)] mb-1">
                      <span>Winkel</span>
                      <span>{config.gradientAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={5}
                      value={config.gradientAngle}
                      onChange={(e) =>
                        onConfigChange({ gradientAngle: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
