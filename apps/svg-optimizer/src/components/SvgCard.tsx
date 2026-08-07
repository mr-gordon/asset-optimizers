import React, { useState } from 'react';
import { SvgItem, PngScaleFactor } from '../types';
import { renderSvgToPngBlob } from '../utils/pngRenderer';
import { downloadBlob, formatFilename } from '../utils/zipExport';
import { Copy, Download, Image as ImageIcon, Eye, Trash2, Check, Lock, Unlock, SlidersHorizontal } from 'lucide-react';

interface SvgCardProps {
  item: SvgItem;
  pngScale: PngScaleFactor;
  namingPattern?: string;
  onRemove: (id: string) => void;
  onInspect: (item: SvgItem) => void;
  onUpdateDimension?: (id: string, newWidth: number, newHeight: number) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const SvgCard: React.FC<SvgCardProps> = ({
  item,
  pngScale,
  namingPattern = '{filename}_{size}_opt.{ext}',
  onRemove,
  onInspect,
  onUpdateDimension,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isEditingDim, setIsEditingDim] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const savedBytes = Math.max(0, item.originalSize - item.optimizedSize);
  const percentSaved = item.originalSize > 0 ? Math.round((savedBytes / item.originalSize) * 100) : 0;

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.optimizedSvg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy SVG code', err);
    }
  };

  const handleDownloadSvg = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([item.optimizedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const filename = formatFilename(item.name, namingPattern, 'svg', item.width, item.height);
    downloadBlob(blob, filename);
  };

  const handleDownloadPng = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsExportingPng(true);
      const blob = await renderSvgToPngBlob(item.optimizedSvg, item.width, item.height, pngScale);
      const filename = formatFilename(item.name, namingPattern, 'png', item.width, item.height);
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Failed to export PNG', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val) || val <= 0) return;
    const newWidth = Math.round(val);
    
    let newHeight = item.height;
    if (isLocked && item.width > 0 && item.height > 0) {
      const ratio = item.height / item.width;
      newHeight = Math.max(1, Math.round(newWidth * ratio));
    }

    if (onUpdateDimension) {
      onUpdateDimension(item.id, newWidth, newHeight);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val) || val <= 0) return;
    const newHeight = Math.round(val);

    let newWidth = item.width;
    if (isLocked && item.width > 0 && item.height > 0) {
      const ratio = item.width / item.height;
      newWidth = Math.max(1, Math.round(newHeight * ratio));
    }

    if (onUpdateDimension) {
      onUpdateDimension(item.id, newWidth, newHeight);
    }
  };

  const handlePresetClick = (e: React.MouseEvent, presetWidth: number) => {
    e.stopPropagation();
    let newHeight = presetWidth;
    if (isLocked && item.width > 0 && item.height > 0) {
      const ratio = item.height / item.width;
      newHeight = Math.max(1, Math.round(presetWidth * ratio));
    }

    if (onUpdateDimension) {
      onUpdateDimension(item.id, presetWidth, newHeight);
    }
  };

  return (
    <div
      onClick={() => onInspect(item)}
      className="group relative flex flex-col justify-between cursor-pointer"
      style={{
        background: 'var(--c-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--c-border)',
        padding: '12px',
        boxShadow: 'var(--c-shadow-sm)',
        transition: 'all var(--duration-fast) var(--ease)',
      }}
    >
      <div>
        {/* Preview Container with Checkerboard Grid & Center Alignment */}
        <div
          className="relative aspect-video w-full overflow-hidden flex items-center justify-center p-3"
          style={{
            borderRadius: 'var(--radius-md)',
            backgroundImage:
              'linear-gradient(45deg, #f4f4f5 25%, transparent 25%), linear-gradient(-45deg, #f4f4f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f4f4f5 75%), linear-gradient(-45deg, transparent 75%, #f4f4f5 75%)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--c-border-light)',
          }}
        >
          <style>{`
            .card-svg-wrapper svg {
              width: 100%;
              height: 100%;
              max-width: 100%;
              max-height: 100%;
              display: block;
              margin: auto;
            }
          `}</style>
          <div
            className="card-svg-wrapper w-full h-full flex items-center justify-center transition-all duration-300 group-hover:scale-[1.03]"
            dangerouslySetInnerHTML={{ __html: item.optimizedSvg }}
          />

          {/* Floating Savings Badge */}
          {percentSaved > 0 && (
            <div
              className="absolute top-2 right-2 px-2 py-0.5 font-mono text-xs font-bold pointer-events-none"
              style={{
                borderRadius: 'var(--radius-full)',
                background: 'var(--c-success)',
                color: '#ffffff',
                boxShadow: 'var(--c-shadow-sm)',
              }}
            >
              -{percentSaved}%
            </div>
          )}

          {/* Hover Inspect Overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"
            style={{
              background: 'rgba(26, 29, 35, 0.35)',
              backdropFilter: 'blur(2px)',
            }}
          >
            <span
              className="px-3.5 py-1.5 font-semibold text-xs flex items-center gap-1.5"
              style={{
                borderRadius: 'var(--radius-full)',
                background: 'var(--c-surface)',
                color: 'var(--c-text)',
                boxShadow: 'var(--c-shadow-lg)',
              }}
            >
              <Eye className="w-3.5 h-3.5 text-[var(--c-text-secondary)]" />
              Inspect &amp; Compare
            </span>
          </div>
        </div>

        {/* Title & Interactive Editable Dimensions */}
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between gap-1.5">
            <h4
              className="text-xs font-semibold truncate flex-1"
              title={item.name}
              style={{ color: 'var(--c-text)' }}
            >
              {item.name}
            </h4>

            {/* Editable Dimension Badge Trigger */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingDim(!isEditingDim);
              }}
              className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full flex items-center gap-1 transition-all shrink-0 cursor-pointer"
              style={{
                background: isEditingDim ? 'var(--c-accent-light)' : 'var(--c-surface-alt)',
                color: isEditingDim ? 'var(--c-accent)' : 'var(--c-text-secondary)',
                border: '1px solid var(--c-border)',
              }}
              title="Click to change dimensions"
            >
              <span>{item.width} × {item.height} px</span>
              <SlidersHorizontal className="w-2.5 h-2.5 opacity-70" />
            </button>
          </div>

          {/* Dimension Controls Box */}
          {isEditingDim && (
            <div
              className="mt-2 p-2 rounded-lg space-y-2 text-xs animate-in fade-in duration-150"
              style={{
                background: 'var(--c-surface-alt)',
                border: '1px solid var(--c-border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[10px] font-mono text-[var(--c-text-tertiary)] font-bold">W:</span>
                  <input
                    type="number"
                    min="1"
                    max="2048"
                    value={item.width}
                    onChange={handleWidthChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-1.5 py-0.5 text-xs font-mono text-center rounded border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLocked(!isLocked);
                  }}
                  className="p-1 text-[var(--c-text-tertiary)] hover:text-[var(--c-text)] rounded shrink-0 cursor-pointer"
                  title={isLocked ? "Proportional ratio locked" : "Aspect ratio unlocked"}
                >
                  {isLocked ? <Lock className="w-3.5 h-3.5 text-emerald-600" /> : <Unlock className="w-3.5 h-3.5 text-amber-600" />}
                </button>

                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[10px] font-mono text-[var(--c-text-tertiary)] font-bold">H:</span>
                  <input
                    type="number"
                    min="1"
                    max="2048"
                    value={item.height}
                    onChange={handleHeightChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-1.5 py-0.5 text-xs font-mono text-center rounded border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-[var(--c-border-light)]">
                <span className="text-[9px] uppercase font-bold text-[var(--c-text-tertiary)] tracking-wider">Presets:</span>
                <div className="flex items-center gap-1">
                  {[20, 24, 32, 48, 64, 96].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) => handlePresetClick(e, size)}
                      className="px-1.5 py-0.5 text-[10px] font-mono rounded transition-all cursor-pointer"
                      style={{
                        background: item.width === size ? 'var(--c-accent-light)' : 'var(--c-surface)',
                        color: item.width === size ? 'var(--c-accent)' : 'var(--c-text-secondary)',
                        fontWeight: item.width === size ? 700 : 500,
                        border: item.width === size ? '1px solid var(--c-accent)' : '1px solid var(--c-border-light)',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Specs & Quick Action Buttons */}
      <div
        className="mt-3 pt-2.5 flex items-center justify-between text-xs"
        style={{ borderTop: '1px solid var(--c-border-light)' }}
      >
        <div>
          <span
            className="font-mono line-through mr-1.5"
            style={{ fontSize: '11px', color: 'var(--c-text-tertiary)' }}
          >
            {formatBytes(item.originalSize)}
          </span>
          <span className="font-mono font-bold" style={{ color: 'var(--c-text)' }}>
            {formatBytes(item.optimizedSize)}
          </span>
        </div>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-0.5">
          {/* Copy SVG Code */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-full transition-all hover:bg-[var(--c-surface-alt)] text-[var(--c-text-secondary)]"
            title="Copy SVG Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Download SVG */}
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="p-1.5 rounded-full transition-all hover:bg-[var(--c-surface-alt)] text-[var(--c-text-secondary)]"
            title="Download optimized SVG"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Download PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="p-1.5 rounded-full transition-all hover:bg-[var(--c-surface-alt)] text-[var(--c-text-secondary)] disabled:opacity-50"
            title={`Download PNG (${pngScale}x)`}
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Remove item */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="p-1.5 rounded-full transition-all hover:bg-red-50 text-[var(--c-text-tertiary)]"
            title="Remove"
          >
            <Trash2 className="w-4 h-4 hover:text-[var(--c-danger)]" />
          </button>
        </div>
      </div>
    </div>
  );
};
