import React from 'react';
import { ImageItem } from '../types';
import { formatBytes, generateOutputFilename } from '../utils/compressor';
import { triggerDownload } from '../utils/zip';
import { Download, Trash2, Eye, RefreshCw, AlertCircle } from 'lucide-react';

interface ImageCardProps {
  item: ImageItem;
  onOpenInspector: (id: string) => void;
  onRemove: (id: string) => void;
  namingPattern: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  item,
  onOpenInspector,
  onRemove,
  namingPattern,
}) => {
  const isDone = item.status === 'done';
  const isCompressing = item.status === 'compressing';
  const isError = item.status === 'error';

  const origSize = item.originalSize;
  const compSize = item.compressedSize || 0;
  const savedBytes = origSize - compSize;
  const savedPct = origSize > 0 ? Math.round((savedBytes / origSize) * 100) : 0;
  const isReduced = savedPct > 0;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.compressedBlob) {
      const mime = item.outputFormat || item.mimeType;
      const fileName = generateOutputFilename(item.name, mime, namingPattern);
      triggerDownload(item.compressedBlob, fileName);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(item.id);
  };

  return (
    <div
      onClick={() => onOpenInspector(item.id)}
      className="group relative flex flex-col justify-between cursor-pointer"
      style={{
        background: 'var(--c-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--c-border)',
        padding: '12px',
        boxShadow: 'var(--c-shadow-sm)',
        transition: `all var(--duration-fast) var(--ease)`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--c-accent)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--c-shadow-md)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--c-border)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--c-shadow-sm)';
      }}
    >
      
      {/* Top Image Preview & Status Badges */}
      <div>
        <div
          className="relative aspect-video w-full overflow-hidden flex items-center justify-center"
          style={{
            borderRadius: 'var(--radius-md)',
            background: 'var(--c-surface-alt)',
            border: '1px solid var(--c-border-light)',
          }}
        >
          
          {/* Main Image */}
          <img
            src={item.previewUrl}
            alt={item.name}
            className="w-full h-full object-contain p-1 transition-transform duration-200 group-hover:scale-[1.03]"
          />

          {/* Savings Badge */}
          {isDone && isReduced && (
            <div
              className="absolute top-2 right-2 px-2 py-0.5 font-mono text-xs font-bold"
              style={{
                borderRadius: 'var(--radius-full)',
                background: 'var(--c-success)',
                color: '#ffffff',
                boxShadow: 'var(--c-shadow-sm)',
              }}
            >
              -{savedPct}%
            </div>
          )}

          {/* Hover Inspector Overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            style={{ background: 'rgba(26, 29, 35, 0.35)', backdropFilter: 'blur(2px)' }}
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
              <Eye className="w-3.5 h-3.5" style={{ color: 'var(--c-text-secondary)' }} />
              Inspect & Compare
            </span>
          </div>

          {/* Loading Spinner Overlay */}
          {isCompressing && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: 'rgba(26, 29, 35, 0.5)', backdropFilter: 'blur(2px)' }}
            >
              <RefreshCw className="w-6 h-6 animate-spin mb-1" style={{ color: 'var(--c-surface)' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--c-surface)' }}>Optimizing...</span>
            </div>
          )}
        </div>

        {/* Filename & Dimensions */}
        <div className="mt-3">
          <h4
            className="text-xs font-semibold truncate"
            title={item.name}
            style={{ color: 'var(--c-text)' }}
          >
            {item.name}
          </h4>
          <p className="mt-0.5 font-mono flex items-center gap-1.5" style={{ fontSize: '10px', color: 'var(--c-text-tertiary)' }}>
            <span>{item.originalWidth}x{item.originalHeight}px</span>
            {isDone && item.compressedWidth && item.compressedHeight && (
              <>
                <span>&rarr;</span>
                <span className="font-medium" style={{ color: 'var(--c-text-secondary)' }}>
                  {item.compressedWidth}x{item.compressedHeight}px
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Size Comparison & Action Footer */}
      <div
        className="mt-3 pt-2.5 flex items-center justify-between text-xs"
        style={{ borderTop: '1px solid var(--c-border-light)' }}
      >
        
        {/* Sizes */}
        <div>
          <span className="font-mono line-through mr-1.5" style={{ fontSize: '11px', color: 'var(--c-text-tertiary)' }}>
            {formatBytes(origSize)}
          </span>
          {isDone ? (
            <span className="font-mono font-bold" style={{ color: 'var(--c-text)' }}>
              {formatBytes(compSize)}
            </span>
          ) : isError ? (
            <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--c-danger)' }}>
              <AlertCircle className="w-3 h-3" /> Error
            </span>
          ) : (
            <span className="text-[11px]" style={{ color: 'var(--c-text-tertiary)' }}>Ready</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {isDone && (
            <button
              onClick={handleDownload}
              className="p-1.5 transition-all"
              style={{
                borderRadius: 'var(--radius-full)',
                color: 'var(--c-text-secondary)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-text)';
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-text-secondary)';
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
              title="Download compressed image"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleRemove}
            className="p-1.5 transition-all"
            style={{
              borderRadius: 'var(--radius-full)',
              color: 'var(--c-text-tertiary)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-danger)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220, 38, 38, 0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-text-tertiary)';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
            title="Remove image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
