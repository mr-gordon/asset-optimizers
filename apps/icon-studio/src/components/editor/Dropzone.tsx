import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SourceImage, ValidationIssue } from '../../types/icon';
import { inspectImage, loadImage } from '../../lib/canvas-utils';
import {
  Upload,
  Image as ImageIcon,
  Clipboard,
  Sparkles,
  RefreshCw,
  Trash2,
} from 'lucide-react';

interface DropzoneProps {
  sourceImage: SourceImage | null;
  onImageLoaded: (source: SourceImage, imgElement: HTMLImageElement) => void;
  onClearImage?: () => void;
  issues?: ValidationIssue[];
}

export const Dropzone: React.FC<DropzoneProps> = ({
  sourceImage,
  onImageLoaded,
  onClearImage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
        return;
      }

      const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');
      const reader = new FileReader();

      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        try {
          const img = await loadImage(dataUrl);
          const { issues: inspectedIssues, hasAlpha, safeZoneBleed } = inspectImage(img, file);

          const source: SourceImage = {
            file,
            name: file.name,
            width: img.naturalWidth || 1024,
            height: img.naturalHeight || 1024,
            dataUrl,
            isSvg,
            hasAlpha,
            safeZoneBleed,
          };

          onImageLoaded(source, img);
        } catch (err) {
          console.error('Failed to load image:', err);
        }
      };

      reader.readAsDataURL(file);
    },
    [onImageLoaded]
  );

  // Global Clipboard paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSample = () => {
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <defs>
        <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="100%" stop-color="#818CF8"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="130" fill="url(#glow)"/>
      <path d="M256 110 L370 380 L310 380 L256 250 L202 380 L142 380 Z" fill="#ffffff"/>
      <circle cx="256" cy="180" r="32" fill="#ffffff"/>
    </svg>`;
    const blob = new Blob([sampleSvg], { type: 'image/svg+xml' });
    const file = new File([blob], 'nova-app-icon.svg', { type: 'image/svg+xml' });
    processFile(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative text-center flex flex-col items-center justify-center transition-all duration-200 ${
        sourceImage
          ? 'py-2.5 px-4 min-h-0'
          : 'py-8 sm:py-12 px-4 min-h-[200px] sm:min-h-[230px]'
      }`}
      style={{
        borderRadius: 'var(--radius-xl)',
        border: `2px solid ${isDragging ? 'var(--c-accent)' : 'transparent'}`,
        background: isDragging ? 'var(--c-accent-light)' : 'transparent',
        transition: 'all var(--duration) var(--ease)',
        transform: isDragging ? 'scale(1.005)' : 'scale(1)',
        boxShadow: isDragging ? 'var(--c-shadow-sm)' : 'none',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/svg+xml,image/jpeg,image/webp"
        className="hidden"
      />

      {sourceImage ? (
        /* Compact horizontal strip matching monorepo Dropzone */
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--c-surface-alt)',
                border: '1px solid var(--c-border)',
              }}
            >
              <Upload className="w-4 h-4 text-[var(--c-text-secondary)] group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold block text-[var(--c-text)]">
                Add more images
              </span>
              <span className="text-[11px] text-[var(--c-text-tertiary)]">
                Drag &amp; drop or click to select
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-1.5 font-semibold h-7 px-3.5 text-xs shrink-0 rounded-full bg-[var(--c-accent)] text-white shadow-xs hover:opacity-90 transition-all cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Add Images
            </button>
            <div className="hidden md:inline-flex items-center gap-1 px-2.5 h-7 text-[11px] font-medium shrink-0 rounded-full bg-[var(--c-surface-alt)] text-[var(--c-text-secondary)] border border-[var(--c-border)]">
              <Clipboard className="w-3 h-3 text-[var(--c-text-tertiary)]" />
              <span>Paste</span>
              <kbd className="px-1 py-0.5 text-[9px] font-mono rounded bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text-tertiary)]">
                Ctrl+V
              </kbd>
            </div>
          </div>
        </div>
      ) : (
        /* Corporate Hero Dropzone identical to SVG Optimizer & Image Compressor */
        <div className="max-w-lg mx-auto flex flex-col items-center justify-center space-y-3.5">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center cursor-pointer group shrink-0"
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--c-surface-alt)',
              border: '1px solid var(--c-border)',
              transition: 'all var(--duration-fast) var(--ease)',
            }}
          >
            <Upload
              className="group-hover:-translate-y-0.5 transition-transform"
              style={{
                width: '26px',
                height: '26px',
                color: 'var(--c-text-secondary)',
              }}
            />
          </div>

          <div className="space-y-0.5">
            <h2
              className="font-semibold tracking-tight text-base sm:text-lg"
              style={{ color: 'var(--c-text)', letterSpacing: '-0.015em' }}
            >
              Drag &amp; Drop Icon hier ablegen
            </h2>
            <p className="text-xs text-[var(--c-text-tertiary)]">
              oder per Klick vom Computer auswählen
            </p>
          </div>

          {/* Action Buttons (Horizontal Row) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 font-semibold h-10 px-5 text-xs sm:text-sm shrink-0 rounded-full bg-[var(--c-accent)] text-white shadow-sm hover:bg-[var(--c-accent-hover)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              Icon auswählen
            </button>

            <div className="inline-flex items-center justify-center gap-2 px-4 h-10 text-xs sm:text-sm font-medium shrink-0 rounded-full bg-[var(--c-surface-alt)] text-[var(--c-text-secondary)] border border-[var(--c-border)] shadow-xs hover:bg-[var(--c-hover)] transition-all">
              <Clipboard className="w-4 h-4 text-[var(--c-text-tertiary)]" />
              <span>Aus Zwischenablage</span>
              <kbd className="ml-0.5 px-2 py-0.5 font-mono text-[10px] font-semibold rounded bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text-tertiary)] shadow-xs">
                Ctrl+V
              </kbd>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSample();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 h-10 text-xs sm:text-sm font-medium shrink-0 rounded-full bg-[var(--c-surface-alt)] text-[var(--c-text-secondary)] border border-[var(--c-border)] shadow-xs hover:bg-[var(--c-hover)] hover:text-[var(--c-text)] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--c-text-tertiary)]" />
              <span>Beispiel-Icon</span>
            </button>
          </div>

          {/* Formats info */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[11px] text-[var(--c-text-tertiary)]">
            <span className="font-medium text-[var(--c-text-secondary)]">Formate:</span>
            <span>SVG (Vektor) · PNG · WebP · JPG (1024×1024 px empfohlen)</span>
          </div>
        </div>
      )}
    </div>
  );
};
