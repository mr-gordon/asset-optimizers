import React from 'react';
import { CompressionMode } from '../types';
import { PRESET_PROFILES } from '../utils/presets';
import { Header as SharedHeader } from '@repo/ui';
import { Layers } from 'lucide-react';

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
    <SharedHeader
      title="Image Compressor"
      icon={<Layers className="w-4 h-4" />}
      showPrivacyBadge={true}
      privacyBadgeText="Private"
    >
      {/* Presets Select Dropdown */}
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
    </SharedHeader>
  );
};
