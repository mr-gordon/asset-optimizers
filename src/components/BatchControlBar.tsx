import React, { useState } from 'react';
import { BatchSettings, ImageFormat, ChromaSubsampling } from '../types';
import {
  Sliders,
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  Shield,
  FileSpreadsheet,
  Settings2,
  Maximize2,
  Palette,
  Eye,
} from 'lucide-react';

interface BatchControlBarProps {
  settings: BatchSettings;
  onChangeSettings: (newSettings: BatchSettings) => void;
  onRecompressAll: () => void;
  onClearAll: () => void;
  onDownloadAll: () => void;
  hasItems: boolean;
  isProcessing: boolean;
  itemCount: number;
}

export const BatchControlBar: React.FC<BatchControlBarProps> = ({
  settings,
  onChangeSettings,
  onRecompressAll,
  onClearAll,
  onDownloadAll,
  hasItems,
  isProcessing,
  itemCount,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSetting = <K extends keyof BatchSettings>(key: K, value: BatchSettings[K]) => {
    onChangeSettings({
      ...settings,
      [key]: value,
    });
  };

  const selectStyle: React.CSSProperties = {
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
    cursor: 'pointer',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--fs-xs)',
    fontWeight: 600,
    color: 'var(--c-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    height: '20px',
  };

  const iconStyle = { color: 'var(--c-text-tertiary)' };

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
      
      {/* Top Header Row of Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3" style={{ borderBottom: '1px solid var(--c-border-light)' }}>
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5" style={iconStyle} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
            Batch Controls <span className="text-xs font-normal" style={{ color: 'var(--c-text-tertiary)' }}>({itemCount} images)</span>
          </h3>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRecompressAll}
            disabled={!hasItems || isProcessing}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 h-8 text-xs font-medium shrink-0 disabled:opacity-40"
            style={{
              borderRadius: 'var(--radius-full)',
              background: 'var(--c-surface-alt)',
              color: 'var(--c-text-secondary)',
              border: '1px solid var(--c-border)',
              transition: `all var(--duration-fast) var(--ease)`,
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            Re-compress
          </button>

          <button
            onClick={onClearAll}
            disabled={!hasItems || isProcessing}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 h-8 text-xs font-medium shrink-0 disabled:opacity-40"
            style={{
              borderRadius: 'var(--radius-full)',
              background: 'rgba(220, 38, 38, 0.06)',
              color: 'var(--c-danger)',
              border: '1px solid rgba(220, 38, 38, 0.15)',
              transition: `all var(--duration-fast) var(--ease)`,
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>

          <button
            onClick={onDownloadAll}
            disabled={!hasItems || isProcessing}
            className="inline-flex items-center justify-center gap-1.5 px-4 h-8 text-xs font-semibold shrink-0 disabled:opacity-40"
            style={{
              borderRadius: 'var(--radius-full)',
              background: 'var(--c-accent)',
              color: '#ffffff',
              boxShadow: 'var(--c-shadow-sm)',
              transition: `all var(--duration-fast) var(--ease)`,
            }}
          >
            <Download className="w-3.5 h-3.5" />
            {itemCount > 3 ? 'Save All (ZIP)' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Main Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Target Format */}
        <div className="space-y-1.5">
          <label style={labelStyle}>
            <ImageIcon className="w-3.5 h-3.5" style={iconStyle} />
            Target Format
          </label>
          <select
            value={settings.targetFormat}
            onChange={(e) => updateSetting('targetFormat', e.target.value as ImageFormat)}
            style={selectStyle}
          >
            <option value="original">Original Format</option>
            <option value="image/webp">WebP (Recommended)</option>
            <option value="image/avif">AVIF (Ultra High)</option>
            <option value="image/jpeg">JPEG / JPG</option>
            <option value="image/png">PNG</option>
          </select>
        </div>

        {/* 2. Quality / Target KB Mode */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between h-[20px]">
            <label style={labelStyle}>
              <Sliders className="w-3.5 h-3.5" style={iconStyle} />
              {settings.qualityMode === 'percentage' ? `Quality: ${settings.quality}%` : `Target KB: ${settings.targetSizeKb} KB`}
            </label>
            <div
              className="inline-flex items-center p-0.5 text-[10px] h-6 shrink-0 gap-0.5"
              style={{
                borderRadius: 'var(--radius-full)',
                background: 'var(--c-surface-alt)',
                border: '1px solid var(--c-border)',
                boxSizing: 'border-box',
              }}
            >
              <button
                type="button"
                onClick={() => updateSetting('qualityMode', 'percentage')}
                className="px-2.5 h-5 inline-flex items-center justify-center shrink-0"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: settings.qualityMode === 'percentage' ? 'var(--c-surface)' : 'transparent',
                  fontWeight: settings.qualityMode === 'percentage' ? 700 : 400,
                  color: settings.qualityMode === 'percentage' ? 'var(--c-text)' : 'var(--c-text-secondary)',
                  boxShadow: settings.qualityMode === 'percentage' ? 'var(--c-shadow-sm)' : 'none',
                  transition: `all var(--duration-fast) var(--ease)`,
                }}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => updateSetting('qualityMode', 'target_size')}
                className="px-2.5 h-5 inline-flex items-center justify-center shrink-0"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: settings.qualityMode === 'target_size' ? 'var(--c-surface)' : 'transparent',
                  fontWeight: settings.qualityMode === 'target_size' ? 700 : 400,
                  color: settings.qualityMode === 'target_size' ? 'var(--c-text)' : 'var(--c-text-secondary)',
                  boxShadow: settings.qualityMode === 'target_size' ? 'var(--c-shadow-sm)' : 'none',
                  transition: `all var(--duration-fast) var(--ease)`,
                }}
              >
                KB
              </button>
            </div>
          </div>

          {settings.qualityMode === 'percentage' ? (
            <div className="flex items-center gap-2 h-8">
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={settings.quality}
                onChange={(e) => updateSetting('quality', parseInt(e.target.value))}
                className="w-full h-1.5"
              />
              <span className="text-xs font-mono font-bold w-9 text-right" style={{ color: 'var(--c-text)' }}>
                {settings.quality}%
              </span>
            </div>
          ) : (
            <div className="relative h-8 flex items-center">
              <input
                type="number"
                min="10"
                max="50000"
                step="50"
                value={settings.targetSizeKb}
                onChange={(e) => updateSetting('targetSizeKb', Math.max(10, parseInt(e.target.value) || 100))}
                className="w-full h-8 px-3 text-xs font-mono font-medium"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--c-surface-alt)',
                  border: '1px solid var(--c-border)',
                  color: 'var(--c-text)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <span className="absolute right-3 text-[10px] uppercase font-semibold" style={{ color: 'var(--c-text-tertiary)' }}>
                KB
              </span>
            </div>
          )}
        </div>

        {/* 3. Resize Preset */}
        <div className="space-y-1.5">
          <label style={labelStyle}>
            <Maximize2 className="w-3.5 h-3.5" style={iconStyle} />
            Resizing
          </label>
          <select
            value={settings.resize.mode}
            onChange={(e) =>
              onChangeSettings({
                ...settings,
                resize: {
                  ...settings.resize,
                  mode: e.target.value as any,
                },
              })
            }
            style={selectStyle}
          >
            <option value="original">Original Size</option>
            <option value="fhd">Max 1920px (FHD)</option>
            <option value="4k">Max 3840px (4K)</option>
            <option value="custom">Custom Max Width</option>
          </select>
        </div>

        {/* 4. Metadata EXIF Toggle */}
        <div className="space-y-1.5">
          <label style={labelStyle}>
            <Shield className="w-3.5 h-3.5" style={iconStyle} />
            Metadata / EXIF
          </label>
          <button
            type="button"
            onClick={() => updateSetting('stripExif', !settings.stripExif)}
            className="w-full h-8 px-3.5 text-xs font-medium inline-flex items-center justify-between"
            style={{
              borderRadius: 'var(--radius-full)',
              background: settings.stripExif ? 'var(--c-success-light)' : 'var(--c-surface-alt)',
              color: settings.stripExif ? 'var(--c-success)' : 'var(--c-text-secondary)',
              border: `1px solid ${settings.stripExif ? 'rgba(5, 150, 105, 0.2)' : 'var(--c-border)'}`,
              transition: `all var(--duration-fast) var(--ease)`,
              boxSizing: 'border-box',
            }}
          >
            <span>{settings.stripExif ? 'Strip EXIF & GPS' : 'Keep EXIF Data'}</span>
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: settings.stripExif ? 'var(--c-success)' : 'var(--c-text-tertiary)' }}
            />
          </button>
        </div>

      </div>

      {/* Toggle Advanced Controls */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-medium inline-flex items-center gap-1.5 h-7"
          style={{ color: 'var(--c-text-secondary)' }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--c-text-tertiary)' }} />
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Pro Options (Chroma, Transparency, Naming)'}
        </button>

        {showAdvanced && (
          <div
            className="mt-3 p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-4"
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'var(--c-surface-alt)',
              border: '1px solid var(--c-border-light)',
            }}
          >
            
            {/* Chroma Subsampling */}
            <div className="space-y-1">
              <label style={labelStyle}>
                <Eye className="w-3.5 h-3.5" style={iconStyle} />
                Chroma Subsampling
              </label>
              <select
                value={settings.chromaSubsampling}
                onChange={(e) => updateSetting('chromaSubsampling', e.target.value as ChromaSubsampling)}
                style={{ ...selectStyle, borderRadius: 'var(--radius-full)', background: 'var(--c-surface)' }}
              >
                <option value="4:4:4">4:4:4 (Sharp graphics/text)</option>
                <option value="4:2:0">4:2:0 (Photos - High compression)</option>
              </select>
            </div>

            {/* Background Color Fill for PNG->JPG */}
            <div className="space-y-1">
              <label style={labelStyle}>
                <Palette className="w-3.5 h-3.5" style={iconStyle} />
                PNG to JPG Background
              </label>
              <div className="flex items-center gap-2 h-8">
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                  className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
                  style={{ borderRadius: 'var(--radius-full)', border: '1px solid var(--c-border)', boxSizing: 'border-box' }}
                />
                <input
                  type="text"
                  value={settings.backgroundColor}
                  onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                  className="w-full h-8 px-3 text-xs font-mono"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--c-surface)',
                    border: '1px solid var(--c-border)',
                    color: 'var(--c-text)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Batch Naming Pattern */}
            <div className="space-y-1">
              <label style={labelStyle}>
                <FileSpreadsheet className="w-3.5 h-3.5" style={iconStyle} />
                File Naming Pattern
              </label>
              <input
                type="text"
                value={settings.namingPattern}
                onChange={(e) => updateSetting('namingPattern', e.target.value)}
                placeholder="{filename}_opt.{ext}"
                className="w-full h-8 px-3 text-xs font-mono"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  color: 'var(--c-text)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
