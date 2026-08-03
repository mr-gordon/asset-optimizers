import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Clipboard } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  hasItems: boolean;
  isExpanded?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected, hasItems, isExpanded = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const validFiles: File[] = [];
      const items = e.dataTransfer.files;

      for (let i = 0; i < items.length; i++) {
        const file = items[i];
        if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(file.name)) {
          validFiles.push(file);
        }
      }

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative text-center flex flex-col items-center justify-center transition-all duration-200 ${
        hasItems ? 'py-2.5 px-4 min-h-0' : 'py-6 sm:py-8 px-4 min-h-[170px] sm:min-h-[190px]'
      }`}
      style={{
        borderRadius: 'var(--radius-xl)',
        border: `2px solid ${isDragging ? 'var(--c-accent)' : 'transparent'}`,
        background: isDragging ? 'var(--c-accent-light)' : 'transparent',
        transition: `all var(--duration) var(--ease)`,
        transform: isDragging ? 'scale(1.005)' : 'scale(1)',
        boxShadow: isDragging ? 'var(--c-shadow-sm)' : 'none',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg"
        className="hidden"
      />

      {hasItems ? (
        /* Compact horizontal strip when images exist */
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
                Drag & drop or click to select
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
        /* Sleek compact vertical hero when empty */
        <div className="max-w-lg mx-auto flex flex-col items-center justify-center space-y-3.5">
          {/* Animated Icon Container (Only in Default centered state) */}
          {!isExpanded && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center cursor-pointer group shrink-0"
              style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--c-surface-alt)',
                border: '1px solid var(--c-border)',
                transition: `all var(--duration-fast) var(--ease)`,
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
          )}

          {/* Heading (Only in Default centered state) */}
          {!isExpanded && (
            <div className="space-y-0.5">
              <h2
                className="font-semibold tracking-tight text-base sm:text-lg"
                style={{ color: 'var(--c-text)', letterSpacing: '-0.015em' }}
              >
                Drag & Drop images here
              </h2>
              <p className="text-xs text-[var(--c-text-tertiary)]">
                or click to select files from your computer
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 font-semibold h-10 px-5 text-xs sm:text-sm shrink-0 rounded-full bg-[var(--c-accent)] text-white shadow-sm hover:bg-[var(--c-accent-hover)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              Select Images
            </button>

            <div className="inline-flex items-center justify-center gap-2 px-4 h-10 text-xs sm:text-sm font-medium shrink-0 rounded-full bg-[var(--c-surface-alt)] text-[var(--c-text-secondary)] border border-[var(--c-border)] shadow-xs hover:bg-[var(--c-hover)] transition-all">
              <Clipboard className="w-4 h-4 text-[var(--c-text-tertiary)]" />
              <span>Paste from clipboard</span>
              <kbd className="ml-0.5 px-2 py-0.5 font-mono text-[10px] font-semibold rounded bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text-tertiary)] shadow-xs">
                Ctrl+V
              </kbd>
            </div>
          </div>

          {/* Formats info */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[11px] text-[var(--c-text-tertiary)]">
            <span className="font-medium text-[var(--c-text-secondary)]">Formats:</span>
            <span>JPG · PNG · WebP · AVIF · GIF · SVG</span>
          </div>
        </div>
      )}
    </div>
  );
};
