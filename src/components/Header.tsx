import React from 'react';
import { CompressionMode } from '../types';
import { PRESET_PROFILES } from '../utils/presets';
import { ShieldCheck, Layers } from 'lucide-react';

interface HeaderProps {
  mode: CompressionMode;
  onModeChange: (mode: CompressionMode) => void;
  onSelectPreset: (presetId: string) => void;
  activePresetId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  onSelectPreset,
  activePresetId,
}) => {
  return (
    <header
      className="sticky top-0 z-30 py-3.5 transition-all"
      style={{
        background: 'rgba(250, 251, 252, 0.55)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--c-border-light)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center shrink-0"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--c-accent)',
                color: 'white',
                boxShadow: 'var(--c-shadow-sm)',
              }}
            >
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-base font-semibold tracking-tight" style={{ color: 'var(--c-text)', letterSpacing: '-0.02em' }}>
              Image Compressor
            </h1>
          </div>

          {/* Controls Right: Presets Dropdown & Auto/Pro Toggle */}
          <div className="flex items-center gap-2.5">
            
            {/* Presets Select Dropdown (Left of Auto/Pro) */}
            <select
              value={activePresetId || ''}
              onChange={(e) => {
                if (e.target.value) onSelectPreset(e.target.value);
              }}
              className="h-8 text-xs font-semibold shrink-0 outline-none cursor-pointer"
              style={{
                borderRadius: 'var(--radius-full)',
                background: 'var(--c-surface-alt)',
                border: '1px solid var(--c-border)',
                color: 'var(--c-text)',
                boxSizing: 'border-box',
              }}
            >
              <option value="" disabled>Presets...</option>
              {PRESET_PROFILES.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>

            {/* Mode Switcher - Auto / Pro */}
            <div
              className="p-1 inline-flex items-center h-8 shrink-0 gap-0.5"
              style={{
                background: 'var(--c-surface-alt)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--c-border)',
                boxSizing: 'border-box',
              }}
            >
              <button
                type="button"
                onClick={() => onModeChange('auto')}
                className="px-3.5 h-6 inline-flex items-center justify-center text-xs font-semibold shrink-0"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: mode === 'auto' ? 'var(--c-surface)' : 'transparent',
                  color: mode === 'auto' ? 'var(--c-text)' : 'var(--c-text-secondary)',
                  boxShadow: mode === 'auto' ? 'var(--c-shadow-sm)' : 'none',
                  transition: `all var(--duration-fast) var(--ease)`,
                }}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => onModeChange('manual')}
                className="px-3.5 h-6 inline-flex items-center justify-center text-xs font-semibold shrink-0"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: mode === 'manual' ? 'var(--c-surface)' : 'transparent',
                  color: mode === 'manual' ? 'var(--c-text)' : 'var(--c-text-secondary)',
                  boxShadow: mode === 'manual' ? 'var(--c-shadow-sm)' : 'none',
                  transition: `all var(--duration-fast) var(--ease)`,
                }}
              >
                Pro
              </button>
            </div>

            {/* Privacy indicator */}
            <div
              className="hidden lg:inline-flex items-center justify-center gap-1.5 px-3 h-8 text-xs font-medium shrink-0"
              title="100% Client-Side Privacy"
              style={{
                borderRadius: 'var(--radius-full)',
                background: 'var(--c-success-light)',
                color: 'var(--c-success)',
                border: '1px solid rgba(5, 150, 105, 0.15)',
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[11px]">Private</span>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
