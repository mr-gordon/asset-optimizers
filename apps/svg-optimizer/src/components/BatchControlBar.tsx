import React, { useState } from 'react';
import { PngScaleFactor } from '../types';
import {
  Download,
  Image as ImageIcon,
  Trash2,
  Palette,
  RefreshCw,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  FileSpreadsheet,
  Square,
  Tag,
} from 'lucide-react';

interface BatchControlBarProps {
  fillColor: string;
  onFillColorChange: (color: string) => void;
  colorHistory: string[];
  pngScale: PngScaleFactor;
  onPngScaleChange: (scale: PngScaleFactor) => void;
  namingPattern: string;
  onNamingPatternChange: (pattern: string) => void;
  includeBoundingBox: boolean;
  onIncludeBoundingBoxChange: (val: boolean) => void;
  stripIdsAndClasses: boolean;
  onStripIdsAndClassesChange: (val: boolean) => void;
  onDownloadAllZip: () => void;
  onDownloadAllSvgZip?: () => void;
  onDownloadAllPngZip: () => void;
  onClearAll: () => void;
  hasItems: boolean;
  isProcessing?: boolean;
  itemCount?: number;
}

const PRESET_LABELS: Record<string, string> = {
  '#000000': 'Black (#000000)',
  '#34383c': 'Corporate Dark (#34383C)',
  '#059669': 'Emerald Green (#059669)',
  '#2563eb': 'Royal Blue (#2563EB)',
  '#dc2626': 'Danger Red (#DC2626)',
  '#f6b83c': 'Brand Yellow (#F6B83C)',
};

export const BatchControlBar: React.FC<BatchControlBarProps> = ({
  fillColor,
  onFillColorChange,
  colorHistory,
  pngScale,
  onPngScaleChange,
  namingPattern,
  onNamingPatternChange,
  includeBoundingBox,
  onIncludeBoundingBoxChange,
  stripIdsAndClasses,
  onStripIdsAndClassesChange,
  onDownloadAllZip,
  onDownloadAllSvgZip,
  onDownloadAllPngZip,
  onClearAll,
  hasItems,
  isProcessing = false,
  itemCount = 0,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isCurrentColorMode = fillColor === 'currentColor';

  return (
    <div
      className="space-y-4 transition-all"
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
          <Settings2 className="w-5 h-5 text-[var(--c-text-tertiary)]" />
          <h3 className="text-sm font-semibold text-[var(--c-text)]">
            Batch Controls{' '}
            <span className="text-xs font-normal text-[var(--c-text-tertiary)]">
              ({itemCount} files)
            </span>
          </h3>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex items-center gap-2">
          {/* Clear Button */}
          <button
            type="button"
            onClick={onClearAll}
            disabled={!hasItems || isProcessing}
            title="Clear all files"
            aria-label="Clear all files"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full shrink-0 disabled:opacity-40 cursor-pointer hover:opacity-80"
            style={{
              background: 'rgba(220, 38, 38, 0.08)',
              color: 'var(--c-danger)',
              border: '1px solid rgba(220, 38, 38, 0.15)',
              transition: 'all var(--duration-fast) var(--ease)',
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Download All ZIP */}
          <button
            type="button"
            onClick={onDownloadAllZip}
            disabled={!hasItems || isProcessing}
            title="Download SVGs & Transparent PNGs as ZIP"
            aria-label="Download SVGs & Transparent PNGs as ZIP"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-[var(--c-accent)] text-white hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Grid Row (4 Columns for Basic Options) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Col 1: Fill Color Mode */}
        <div className="space-y-1.5">
          <label
            style={{
              fontSize: 'var(--fs-xs)',
              fontWeight: 600,
              color: 'var(--c-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '20px',
            }}
          >
            <Palette className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
            Fill Mode
          </label>
          <div
            className="p-1 inline-flex items-center w-full h-[var(--control-height)] shrink-0 gap-0.5"
            style={{
              background: 'var(--c-surface-alt)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--c-border)',
              boxSizing: 'border-box',
            }}
          >
            <button
              type="button"
              onClick={() => onFillColorChange('currentColor')}
              className="flex-1 h-6 inline-flex items-center justify-center text-xs font-semibold shrink-0 cursor-pointer"
              style={{
                borderRadius: 'var(--radius-full)',
                background: isCurrentColorMode ? 'var(--c-surface)' : 'transparent',
                color: isCurrentColorMode ? 'var(--c-text)' : 'var(--c-text-secondary)',
                boxShadow: isCurrentColorMode ? 'var(--c-shadow-sm)' : 'none',
                transition: `all var(--duration-fast) var(--ease)`,
              }}
            >
              currentColor
            </button>
            <button
              type="button"
              onClick={() => {
                if (isCurrentColorMode) onFillColorChange(colorHistory[0] || '#000000');
              }}
              className="flex-1 h-6 inline-flex items-center justify-center text-xs font-semibold shrink-0 cursor-pointer"
              style={{
                borderRadius: 'var(--radius-full)',
                background: !isCurrentColorMode ? 'var(--c-surface)' : 'transparent',
                color: !isCurrentColorMode ? 'var(--c-text)' : 'var(--c-text-secondary)',
                boxShadow: !isCurrentColorMode ? 'var(--c-shadow-sm)' : 'none',
                transition: `all var(--duration-fast) var(--ease)`,
              }}
            >
              Custom Hex
            </button>
          </div>
        </div>

        {/* Col 2: Color Presets & History Dropdown */}
        <div className="space-y-1.5">
          <label
            style={{
              fontSize: 'var(--fs-xs)',
              fontWeight: 600,
              color: 'var(--c-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '20px',
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
            Color Palette &amp; History
          </label>

          <div className="flex items-center gap-2">
            {!isCurrentColorMode && (
              <div
                className="relative w-8 h-8 rounded-full border border-[var(--c-border)] overflow-hidden shrink-0 cursor-pointer shadow-xs"
                title="Color Picker"
              >
                <input
                  type="color"
                  value={fillColor.startsWith('#') ? fillColor : '#000000'}
                  onChange={(e) => onFillColorChange(e.target.value)}
                  className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                />
              </div>
            )}

            <select
              value={isCurrentColorMode ? 'currentColor' : fillColor}
              onChange={(e) => {
                if (e.target.value && e.target.value !== 'currentColor') {
                  onFillColorChange(e.target.value);
                }
              }}
              disabled={isCurrentColorMode}
              style={{
                width: '100%',
                height: 'var(--control-height)',
                padding: '0px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--c-surface-alt)',
                border: '1px solid var(--c-border)',
                fontSize: 'var(--fs-sm)',
                fontWeight: 500,
                color: isCurrentColorMode ? 'var(--c-text-tertiary)' : 'var(--c-text)',
                outline: 'none',
                cursor: isCurrentColorMode ? 'not-allowed' : 'pointer',
                boxSizing: 'border-box',
                opacity: isCurrentColorMode ? 0.6 : 1,
              }}
            >
              {isCurrentColorMode ? (
                <option value="currentColor">currentColor (CSS inherited)</option>
              ) : (
                <>
                  <option value="#000000">Black (#000000)</option>
                  <option value="#34383c">Corporate Dark (#34383C)</option>
                  <option value="#059669">Emerald Green (#059669)</option>
                  <option value="#2563eb">Royal Blue (#2563EB)</option>
                  <option value="#dc2626">Danger Red (#DC2626)</option>
                  <option value="#f6b83c">Brand Yellow (#F6B83C)</option>
                  {colorHistory
                    .filter((c) => !Object.keys(PRESET_LABELS).includes(c.toLowerCase()))
                    .map((c) => (
                      <option key={c} value={c}>
                        History: {c}
                      </option>
                    ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Col 3: PNG Scale Factor */}
        <div className="space-y-1.5">
          <label
            style={{
              fontSize: 'var(--fs-xs)',
              fontWeight: 600,
              color: 'var(--c-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '20px',
            }}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
            PNG Scale
          </label>
          <select
            value={pngScale}
            onChange={(e) => onPngScaleChange(Number(e.target.value) as PngScaleFactor)}
            style={{
              width: '100%',
              height: 'var(--control-height)',
              padding: '0px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--c-surface-alt)',
              border: '1px solid var(--c-border)',
              fontSize: 'var(--fs-sm)',
              fontWeight: 500,
              color: 'var(--c-text)',
              outline: 'none',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            <option value={1}>1x HD</option>
            <option value={2}>2x Ultra</option>
            <option value={4}>4x Retina (4K)</option>
            <option value={8}>8x Max (8K)</option>
          </select>
        </div>

        {/* Col 4: Quick Action Status */}
        <div className="space-y-1.5">
          <label
            style={{
              fontSize: 'var(--fs-xs)',
              fontWeight: 600,
              color: 'var(--c-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '20px',
            }}
          >
            <Download className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
            Export Actions
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownloadAllSvgZip || onDownloadAllZip}
              disabled={!hasItems || isProcessing}
              className="flex-1 h-[var(--control-height)] text-xs font-semibold rounded-full bg-[var(--c-surface-alt)] border border-[var(--c-border)] text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-all disabled:opacity-40 cursor-pointer"
              title="Download SVGs only as ZIP"
            >
              .svgs (zip)
            </button>
            <button
              type="button"
              onClick={onDownloadAllPngZip}
              disabled={!hasItems || isProcessing}
              className="flex-1 h-[var(--control-height)] text-xs font-semibold rounded-full bg-[var(--c-surface-alt)] border border-[var(--c-border)] text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-all disabled:opacity-40 cursor-pointer"
              title="Download PNGs only as ZIP"
            >
              .pngs (zip)
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Options Section */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-medium inline-flex items-center gap-1.5 h-7 cursor-pointer hover:opacity-80 transition-all"
          style={{ color: 'var(--c-text-secondary)' }}
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>

        {showAdvanced && (
          <div
            className="mt-3 p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-150"
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'var(--c-surface-alt)',
              border: '1px solid var(--c-border-light)',
            }}
          >
            {/* Col 1: File Naming Pattern */}
            <div className="space-y-1.5">
              <label
                style={{
                  fontSize: 'var(--fs-xs)',
                  fontWeight: 600,
                  color: 'var(--c-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  height: '20px',
                }}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
                File Naming Pattern
              </label>
              <input
                placeholder="{filename}_{size}_opt.{ext}"
                className="w-full h-8 px-3 text-xs font-mono"
                type="text"
                value={namingPattern}
                onChange={(e) => onNamingPatternChange(e.target.value)}
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  color: 'var(--c-text)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <p className="text-[10px] text-[var(--c-text-tertiary)] font-mono">
                Tags: <code className="bg-[var(--c-surface)] px-1 rounded">{'{filename}'}</code>, <code className="bg-[var(--c-surface)] px-1 rounded">{'{size}'}</code>, <code className="bg-[var(--c-surface)] px-1 rounded">{'{ext}'}</code>
              </p>
            </div>

            {/* Col 2: Artboard Bounding Box Rect */}
            <div className="space-y-1.5">
              <label
                style={{
                  fontSize: 'var(--fs-xs)',
                  fontWeight: 600,
                  color: 'var(--c-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  height: '20px',
                }}
              >
                <Square className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
                Artboard Bounding Box
              </label>
              <select
                value={includeBoundingBox ? 'true' : 'false'}
                onChange={(e) => onIncludeBoundingBoxChange(e.target.value === 'true')}
                style={{
                  width: '100%',
                  height: 'var(--control-height)',
                  padding: '0px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  fontSize: 'var(--fs-sm)',
                  fontWeight: 500,
                  color: 'var(--c-text)',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option value="true">Include transparent &lt;rect&gt; (Artboard)</option>
                <option value="false">Omit &lt;rect&gt; (Clean Inline SVG)</option>
              </select>
            </div>

            {/* Col 3: Strip IDs & Classes */}
            <div className="space-y-1.5">
              <label
                style={{
                  fontSize: 'var(--fs-xs)',
                  fontWeight: 600,
                  color: 'var(--c-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  height: '20px',
                }}
              >
                <Tag className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
                Clean IDs &amp; Classes
              </label>
              <select
                value={stripIdsAndClasses ? 'true' : 'false'}
                onChange={(e) => onStripIdsAndClassesChange(e.target.value === 'true')}
                style={{
                  width: '100%',
                  height: 'var(--control-height)',
                  padding: '0px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  fontSize: 'var(--fs-sm)',
                  fontWeight: 500,
                  color: 'var(--c-text)',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option value="true">Strip IDs &amp; Class attributes (Clean)</option>
                <option value="false">Preserve original IDs &amp; Classes</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
