import React, { useState, useRef, useEffect } from 'react';
import { ImageItem, BatchSettings, ImageFormat, ChromaSubsampling } from '../types';
import { formatBytes, generateOutputFilename } from '../utils/compressor';
import { parseExifInfo, ExifInfo } from '../utils/exif';
import { triggerDownload } from '../utils/zip';
import {
  X,
  Eye,
  Sliders,
  Shield,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Crop,
  Layers,
  Search,
  Zap,
  Pencil,
  Check,
} from 'lucide-react';

interface InspectorModalProps {
  item: ImageItem | null;
  globalSettings: BatchSettings;
  onClose: () => void;
  onUpdateOverride: (itemId: string, settings: Partial<BatchSettings>) => void;
  onUpdateName?: (itemId: string, newName: string) => void;
  onRemove: (itemId: string) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasPrev: boolean;
  hasNext: boolean;
  isBlinkActive: boolean;
  onToggleBlink: () => void;
}

export const InspectorModal: React.FC<InspectorModalProps> = ({
  item,
  globalSettings,
  onClose,
  onUpdateOverride,
  onUpdateName,
  onRemove,
  onNavigate,
  hasPrev,
  hasNext,
  isBlinkActive,
  onToggleBlink,
}) => {
  if (!item) return null;

  // Local inspector controls
  const effectiveSettings: BatchSettings = {
    ...globalSettings,
    ...(item.overrideSettings || {}),
  };

  const [sliderPosition, setSliderPosition] = useState(50);
  const [compareMode, setCompareMode] = useState<'slider' | 'blink'>('slider');
  const [zoomLoupeEnabled, setZoomLoupeEnabled] = useState(false);
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0, containerWidth: 1, containerHeight: 1, px: 0, py: 0 });
  const [exifInfo, setExifInfo] = useState<ExifInfo>({ hasExif: false, hasGps: false });
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState<string>('');
  const [imgDimensions, setImgDimensions] = useState<{
    origW: number;
    origH: number;
    compW: number;
    compH: number;
  }>({ origW: 0, origH: 0, compW: 0, compH: 0 });

  useEffect(() => {
    if (!item) return;

    let active = true;

    const origImg = new Image();
    origImg.src = item.previewUrl;
    origImg.onload = () => {
      if (active) {
        setImgDimensions((prev) => ({
          ...prev,
          origW: origImg.naturalWidth,
          origH: origImg.naturalHeight,
        }));
      }
    };

    const targetCompUrl = item.compressedUrl || item.previewUrl;
    const compImg = new Image();
    compImg.src = targetCompUrl;
    compImg.onload = () => {
      if (active) {
        setImgDimensions((prev) => ({
          ...prev,
          compW: compImg.naturalWidth,
          compH: compImg.naturalHeight,
        }));
      }
    };

    return () => {
      active = false;
    };
  }, [item?.id, item?.previewUrl, item?.compressedUrl]);

  useEffect(() => {
    if (item) {
      setNameValue(item.name);
      setIsEditingName(false);
    }
  }, [item]);

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameValue.trim();
    if (trimmed && item && trimmed !== item.name) {
      if (onUpdateName) {
        onUpdateName(item.id, trimmed);
      }
    } else if (item) {
      setNameValue(item.name);
    }
    setIsEditingName(false);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  // Original & Compressed URLs
  const origUrl = item.previewUrl;
  const compUrl = item.compressedUrl || item.previewUrl;

  // Fetch EXIF metadata on item load
  useEffect(() => {
    if (item.file) {
      parseExifInfo(item.file).then(setExifInfo);
    }
  }, [item]);

  // Handle Slider Drag on Stage
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const updateSliderFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  const handleStageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (compareMode !== 'slider') return;
    setIsDraggingSlider(true);
    updateSliderFromClientX(e.clientX);
  };

  useEffect(() => {
    if (!isDraggingSlider) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      updateSliderFromClientX(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      setIsDraggingSlider(false);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingSlider]);

  // Handle Loupe Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    setLoupePos({ x, y, containerWidth: rect.width, containerHeight: rect.height, px, py });

    if (isDraggingSlider) {
      updateSliderFromClientX(e.clientX);
    }
  };

  const handleUpdateSetting = <K extends keyof BatchSettings>(key: K, value: BatchSettings[K]) => {
    onUpdateOverride(item.id, {
      ...item.overrideSettings,
      [key]: value,
    });
  };

  const handleResizeUpdate = (key: keyof BatchSettings['resize'], value: any) => {
    onUpdateOverride(item.id, {
      ...item.overrideSettings,
      resize: {
        ...effectiveSettings.resize,
        [key]: value,
      },
    });
  };

  const handleDownloadSingle = () => {
    if (item.compressedBlob) {
      const mime = item.outputFormat || effectiveSettings.targetFormat;
      const fileName = generateOutputFilename(item.name, mime, effectiveSettings.namingPattern);
      triggerDownload(item.compressedBlob, fileName);
    }
  };

  const origSize = item.originalSize;
  const compSize = item.compressedSize || 0;
  const savedPct = origSize > 0 ? Math.round(((origSize - compSize) / origSize) * 100) : 0;

  const panelStyle: React.CSSProperties = {
    padding: '14px',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--c-surface-alt)',
    border: '1px solid var(--c-border-light)',
  };

  const smallSelectStyle: React.CSSProperties = {
    height: 'var(--control-height)',
    padding: '0 12px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border)',
    fontSize: 'var(--fs-xs)',
    fontWeight: 500,
    color: 'var(--c-text)',
    boxSizing: 'border-box',
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 cursor-pointer"
      style={{ background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(8px)' }}
    >
      
      {/* Modal Card Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden cursor-default"
        style={{
          background: 'var(--c-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--c-border)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
          color: 'var(--c-text)',
        }}
      >
        
        {/* Top Modal Header */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3"
          style={{
            borderBottom: '1px solid var(--c-border)',
            background: 'var(--c-surface-alt)',
          }}
        >
          <div className="flex items-center gap-3 truncate flex-1 min-w-0">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-1.5 max-w-sm flex-1">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={() => handleSaveName()}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && item) {
                      setNameValue(item.name);
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  className="text-sm sm:text-base font-semibold text-[var(--c-text)] bg-[var(--c-surface)] border border-[var(--c-accent)] rounded px-2 py-0.5 outline-none w-full"
                />
                <button
                  type="submit"
                  className="p-1 text-xs text-[var(--c-accent)] hover:bg-[var(--c-surface)] rounded shrink-0 cursor-pointer"
                  title="Save filename"
                >
                  <Check className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <h3
                onClick={() => setIsEditingName(true)}
                className="font-semibold text-sm sm:text-base truncate cursor-pointer hover:text-[var(--c-accent)] transition-colors inline-flex items-center gap-1.5 group"
                title="Click to edit filename"
                style={{ color: 'var(--c-text)' }}
              >
                <span>{item.name}</span>
                <Pencil className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity text-[var(--c-text-secondary)] shrink-0" />
              </h3>
            )}
            <span
              className="inline-flex items-center px-2.5 h-8 text-xs font-mono font-semibold shrink-0"
              style={{
                borderRadius: 'var(--radius-full)',
                background: 'var(--c-surface)',
                color: 'var(--c-text-secondary)',
                border: '1px solid var(--c-border)',
              }}
            >
              {item.mimeType.replace('image/', '.')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Navigation Controls */}
            <div className="inline-flex items-center gap-1 p-0.5 h-8 shrink-0" style={{ background: 'var(--c-surface)', borderRadius: 'var(--radius-full)', border: '1px solid var(--c-border)' }}>
              <button
                onClick={() => onNavigate('prev')}
                disabled={!hasPrev}
                className="w-7 h-7 inline-flex items-center justify-center disabled:opacity-30 shrink-0"
                style={{ borderRadius: 'var(--radius-full)', transition: `all var(--duration-fast) var(--ease)` }}
                title="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('next')}
                disabled={!hasNext}
                className="w-7 h-7 inline-flex items-center justify-center disabled:opacity-30 shrink-0"
                style={{ borderRadius: 'var(--radius-full)', transition: `all var(--duration-fast) var(--ease)` }}
                title="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Download & Remove */}
            <button
              onClick={handleDownloadSingle}
              disabled={!item.compressedBlob}
              className="inline-flex items-center justify-center gap-1.5 px-4 h-8 text-xs font-semibold shrink-0 disabled:opacity-40"
              style={{
                borderRadius: 'var(--radius-full)',
                background: 'var(--c-accent)',
                color: '#ffffff',
                boxShadow: 'var(--c-shadow-sm)',
              }}
              title="Download compressed file"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 inline-flex items-center justify-center shrink-0 transition-colors"
              style={{ borderRadius: 'var(--radius-full)', color: 'var(--c-text-tertiary)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column: Interactive Visual Inspector Stage (7 Cols) */}
          <div
            className="lg:col-span-7 p-4 flex flex-col items-center justify-between min-h-[380px] lg:min-h-[500px]"
            style={{ background: '#1a1d23' }}
          >
            
            {/* Inspector Mode Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 text-xs" style={{ color: 'var(--c-text-tertiary)' }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompareMode('slider')}
                  className="inline-flex items-center gap-1.5 px-3.5 h-8 font-medium shrink-0"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    background: compareMode === 'slider' ? 'var(--c-accent)' : 'rgba(255,255,255,0.08)',
                    color: compareMode === 'slider' ? '#ffffff' : 'var(--c-text-tertiary)',
                    fontWeight: compareMode === 'slider' ? 600 : 400,
                    transition: `all var(--duration-fast) var(--ease)`,
                  }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Split Slider
                </button>
                <button
                  onClick={() => {
                    setCompareMode('blink');
                    onToggleBlink();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 h-8 font-medium shrink-0"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    background: compareMode === 'blink' ? 'var(--c-accent)' : 'rgba(255,255,255,0.08)',
                    color: compareMode === 'blink' ? '#ffffff' : 'var(--c-text-tertiary)',
                    fontWeight: compareMode === 'blink' ? 600 : 400,
                    transition: `all var(--duration-fast) var(--ease)`,
                  }}
                  title="Press Spacebar to quickly flash Original vs Compressed"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Blink Test <kbd className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>Space</kbd>
                </button>
              </div>

              {/* 100% Zoom Loupe Toggle */}
              <button
                onClick={() => setZoomLoupeEnabled(!zoomLoupeEnabled)}
                className="inline-flex items-center gap-1.5 px-3.5 h-8 font-medium shrink-0"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: zoomLoupeEnabled ? 'rgba(246, 184, 60, 0.15)' : 'rgba(255,255,255,0.08)',
                  color: zoomLoupeEnabled ? 'var(--c-brand-yellow)' : 'var(--c-text-tertiary)',
                  border: zoomLoupeEnabled ? '1px solid rgba(246, 184, 60, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                  transition: `all var(--duration-fast) var(--ease)`,
                }}
              >
                <Search className="w-3.5 h-3.5" />
                2.5× Loupe Zoom
              </button>
            </div>

            {/* Stage Container for Before / After */}
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseDown={handleStageMouseDown}
              className="relative w-full flex-1 min-h-[300px] overflow-hidden flex items-center justify-center select-none cursor-crosshair"
              style={{
                borderRadius: 'var(--radius-lg)',
                background: 'radial-gradient(#2a2d35 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              
              {/* SLIDER MODE */}
              {compareMode === 'slider' && (
                <>
                  {/* Compressed Layer (Base) */}
                  <img
                    src={compUrl}
                    alt="Compressed"
                    className="absolute inset-0 w-full h-full object-contain p-2 pointer-events-none"
                  />

                  {/* Original Layer (Clipped Overlay via clip-path for 100% pixel alignment) */}
                  <img
                    src={origUrl}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain p-2 pointer-events-none"
                    style={{
                      clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                    }}
                  />

                  {/* Split Drag Handle Bar */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 pointer-events-none"
                    style={{ left: `${sliderPosition}%`, background: 'var(--c-accent)', boxShadow: '0 0 8px rgba(0,0,0,0.5)' }}
                  >
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 flex items-center justify-center text-xs font-bold"
                      style={{
                        borderRadius: '50%',
                        background: 'var(--c-accent)',
                        color: '#ffffff',
                        border: '2px solid #ffffff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      }}
                    >
                      &harr;
                    </div>
                  </div>

                  {/* Slider Control Input */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(parseFloat(e.target.value))}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3/4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer z-10"
                  />

                  {/* Corner Labels */}
                  <span
                    className="absolute top-3 left-3 px-3 h-6 inline-flex items-center font-mono text-xs font-semibold pointer-events-none z-10"
                    style={{ borderRadius: 'var(--radius-full)', background: 'rgba(0,0,0,0.7)', color: '#ffffff', backdropFilter: 'blur(4px)' }}
                  >
                    Original ({formatBytes(origSize)})
                  </span>
                  <span
                    className="absolute top-3 right-3 px-3 h-6 inline-flex items-center font-mono text-xs font-semibold pointer-events-none z-10"
                    style={{ borderRadius: 'var(--radius-full)', background: 'rgba(52,56,60,0.85)', color: '#e0e0e0', backdropFilter: 'blur(4px)' }}
                  >
                    Compressed ({formatBytes(compSize)})
                  </span>
                </>
              )}

              {/* BLINK MODE */}
              {compareMode === 'blink' && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={isBlinkActive ? origUrl : compUrl}
                    alt={isBlinkActive ? 'Original' : 'Compressed'}
                    className="w-full h-full object-contain p-2 transition-all"
                  />
                  <div
                    className="absolute top-3 left-3 px-3.5 h-8 inline-flex items-center font-mono text-xs font-bold"
                    style={{ borderRadius: 'var(--radius-full)', background: 'var(--c-accent)', color: '#ffffff', boxShadow: 'var(--c-shadow-md)' }}
                  >
                    {isBlinkActive ? '🔴 SHOWING ORIGINAL' : '🟢 SHOWING COMPRESSED'}
                  </div>
                  <p
                    className="absolute bottom-3 text-xs px-3.5 h-7 inline-flex items-center"
                    style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--c-text-tertiary)', borderRadius: 'var(--radius-full)' }}
                  >
                    Hold / Press <kbd style={{ color: 'var(--c-brand-yellow)', fontWeight: 700 }}>Spacebar</kbd> to flash original
                  </p>
                </div>
              )}

              {/* FLOATING 2.5x MAGNIFIER LOUPE */}
              {zoomLoupeEnabled && (() => {
                const loupeRadius = 80;
                const zoomFactor = 2.5;

                const isLoupeOriginal = compareMode === 'blink'
                  ? isBlinkActive
                  : (loupePos.px <= sliderPosition);
                const activeLoupeUrl = isLoupeOriginal ? origUrl : compUrl;

                const origW = imgDimensions.origW || item.originalWidth || 1;
                const origH = imgDimensions.origH || item.originalHeight || 1;

                const compW = imgDimensions.compW || item.compressedWidth || origW;
                const compH = imgDimensions.compH || item.compressedHeight || origH;

                const imgW = isLoupeOriginal ? origW : compW;
                const imgH = isLoupeOriginal ? origH : compH;

                const cWidth = loupePos.containerWidth || 1;
                const cHeight = loupePos.containerHeight || 1;

                const p = 8; // p-2 padding
                const innerW = Math.max(1, cWidth - p * 2);
                const innerH = Math.max(1, cHeight - p * 2);

                const imgRatio = imgW / imgH;
                const areaRatio = innerW / innerH;

                let renderedW = innerW;
                let renderedH = innerH;
                let renderedX = p;
                let renderedY = p;

                if (imgRatio > areaRatio) {
                  renderedW = innerW;
                  renderedH = innerW / imgRatio;
                  renderedY = p + (innerH - renderedH) / 2;
                } else {
                  renderedH = innerH;
                  renderedW = innerH * imgRatio;
                  renderedX = p + (innerW - renderedW) / 2;
                }

                const bgWidth = renderedW * zoomFactor;
                const bgHeight = renderedH * zoomFactor;
                const bgX = loupeRadius - (loupePos.x - renderedX) * zoomFactor;
                const bgY = loupeRadius - (loupePos.y - renderedY) * zoomFactor;

                return (
                  <div
                    className="pointer-events-none absolute w-40 h-40 rounded-full overflow-hidden z-30 flex flex-col items-center justify-between p-2"
                    style={{
                      left: `${loupePos.x - loupeRadius}px`,
                      top: `${loupePos.y - loupeRadius}px`,
                      border: '2.5px solid var(--c-brand-yellow)',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
                      backgroundImage: `url(${activeLoupeUrl})`,
                      backgroundSize: `${bgWidth}px ${bgHeight}px`,
                      backgroundPosition: `${bgX}px ${bgY}px`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    {/* Badge top center */}
                    <div className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded-full bg-black/80 text-white border border-white/20 shadow-xs">
                      {isLoupeOriginal ? 'ORIGINAL' : 'COMPRESSED'} 2.5×
                    </div>

                    {/* Reticle / Crosshair center indicator */}
                    <div className="relative w-4 h-4 flex items-center justify-center pointer-events-none mb-auto mt-auto">
                      <div className="absolute w-full h-[1px] bg-amber-400/80" />
                      <div className="absolute h-full w-[1px] bg-amber-400/80" />
                      <div className="w-1.5 h-1.5 rounded-full border border-amber-400 bg-amber-400/30" />
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Bottom Inspector Stats Badge */}
            <div
              className="w-full mt-3 flex items-center justify-between text-xs font-mono pt-2"
              style={{ color: 'var(--c-text-tertiary)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span>Savings: <strong style={{ color: 'var(--c-success)' }}>-{savedPct}%</strong></span>
              <span>{item.originalWidth}x{item.originalHeight} &rarr; {item.compressedWidth || item.originalWidth}x{item.compressedHeight || item.originalHeight}</span>
            </div>

          </div>

          {/* Right Column: Fine-Tuning Inspector Controls (5 Cols) */}
          <div
            className="lg:col-span-5 p-5 space-y-5"
            style={{
              background: 'var(--c-surface)',
              borderLeft: '1px solid var(--c-border)',
            }}
          >
            
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm flex items-center gap-1.5" style={{ color: 'var(--c-text)' }}>
                <Sliders className="w-4 h-4" style={{ color: 'var(--c-text-tertiary)' }} />
                Fine-Tune Compression
              </h4>
              {item.overrideSettings && (
                <button
                  onClick={() => onUpdateOverride(item.id, {})}
                  className="text-xs font-medium h-8 inline-flex items-center"
                  style={{ color: 'var(--c-text-secondary)' }}
                >
                  Reset overrides
                </button>
              )}
            </div>

            {/* 1. Format & Quality Override */}
            <div className="space-y-3" style={panelStyle}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold" style={{ color: 'var(--c-text-secondary)' }}>
                  Target Format
                </label>
                <select
                  value={effectiveSettings.targetFormat}
                  onChange={(e) => handleUpdateSetting('targetFormat', e.target.value as ImageFormat)}
                  style={smallSelectStyle}
                >
                  <option value="original">Original</option>
                  <option value="image/webp">WebP</option>
                  <option value="image/avif">AVIF</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                </select>
              </div>

              {/* Quality Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--c-text-secondary)' }}>
                  <span>Quality</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--c-text)' }}>{effectiveSettings.quality}%</span>
                </div>
                <div className="h-8 flex items-center">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={effectiveSettings.quality}
                    onChange={(e) => handleUpdateSetting('quality', parseInt(e.target.value))}
                    className="w-full h-1.5 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 2. Chroma Subsampling & Transparency */}
            <div className="space-y-3" style={panelStyle}>
              <h5 className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--c-text-secondary)' }}>
                <Layers className="w-3.5 h-3.5" style={{ color: 'var(--c-text-tertiary)' }} />
                Color & Subsampling
              </h5>

              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--c-text-tertiary)' }}>Chroma Subsampling</span>
                <select
                  value={effectiveSettings.chromaSubsampling}
                  onChange={(e) => handleUpdateSetting('chromaSubsampling', e.target.value as ChromaSubsampling)}
                  style={smallSelectStyle}
                >
                  <option value="4:4:4">4:4:4 (Sharp Text)</option>
                  <option value="4:2:0">4:2:0 (Photos)</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--c-text-tertiary)' }}>PNG Transparency Fill</span>
                <div className="flex items-center gap-1.5 h-8">
                  <input
                    type="color"
                    value={effectiveSettings.backgroundColor || '#ffffff'}
                    onChange={(e) => handleUpdateSetting('backgroundColor', e.target.value)}
                    className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
                    style={{ borderRadius: 'var(--radius-full)', border: '1px solid var(--c-border)', boxSizing: 'border-box' }}
                  />
                  <span className="font-mono" style={{ fontSize: '10px', color: 'var(--c-text-tertiary)' }}>
                    {effectiveSettings.backgroundColor || '#ffffff'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Crop & Aspect Ratio Presets */}
            <div className="space-y-3" style={panelStyle}>
              <h5 className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--c-text-secondary)' }}>
                <Crop className="w-3.5 h-3.5" style={{ color: 'var(--c-text-tertiary)' }} />
                Aspect Ratio Presets
              </h5>
              
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Original', val: 'original' },
                  { label: '16:9', val: '16:9' },
                  { label: '1:1 Square', val: '1:1' },
                  { label: '4:3', val: '4:3' },
                  { label: 'OG Image (1200x630)', val: '1200x630' },
                ].map((preset) => {
                  const isActive = effectiveSettings.resize.aspectRatioPreset === preset.val;
                  return (
                    <button
                      key={preset.val}
                      onClick={() => handleResizeUpdate('aspectRatioPreset', preset.val)}
                      className="inline-flex items-center justify-center px-3.5 h-8 text-xs font-medium shrink-0"
                      style={{
                        borderRadius: 'var(--radius-full)',
                        background: isActive ? 'var(--c-accent)' : 'var(--c-surface)',
                        color: isActive ? '#ffffff' : 'var(--c-text-secondary)',
                        border: `1px solid ${isActive ? 'var(--c-accent)' : 'var(--c-border)'}`,
                        fontWeight: isActive ? 600 : 400,
                        transition: `all var(--duration-fast) var(--ease)`,
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Metadata & EXIF Details */}
            <div className="space-y-2" style={panelStyle}>
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--c-text-secondary)' }}>
                  <Shield className="w-3.5 h-3.5" style={{ color: 'var(--c-text-tertiary)' }} />
                  EXIF & Metadata Inspector
                </h5>
                <span
                  className="text-[10px] font-semibold px-2.5 py-0.5"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    background: exifInfo.hasExif ? 'rgba(217, 119, 6, 0.08)' : 'var(--c-surface)',
                    color: exifInfo.hasExif ? 'var(--c-warning)' : 'var(--c-text-tertiary)',
                    border: `1px solid ${exifInfo.hasExif ? 'rgba(217, 119, 6, 0.15)' : 'var(--c-border)'}`,
                  }}
                >
                  {exifInfo.hasExif ? 'EXIF Detected' : 'No EXIF'}
                </span>
              </div>

              {exifInfo.hasExif && (
                <div className="font-mono space-y-1 pt-1" style={{ fontSize: '10px', color: 'var(--c-text-tertiary)' }}>
                  {exifInfo.hasGps && (
                    <p className="font-semibold flex items-center gap-1" style={{ color: 'var(--c-danger)' }}>
                      ⚠️ GPS Location Tags Present
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleUpdateSetting('stripExif', !effectiveSettings.stripExif)}
                className="w-full h-8 px-3.5 text-xs font-medium inline-flex items-center justify-center"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: effectiveSettings.stripExif ? 'var(--c-success-light)' : 'var(--c-surface)',
                  color: effectiveSettings.stripExif ? 'var(--c-success)' : 'var(--c-text-secondary)',
                  border: `1px solid ${effectiveSettings.stripExif ? 'rgba(5, 150, 105, 0.2)' : 'var(--c-border)'}`,
                  transition: `all var(--duration-fast) var(--ease)`,
                  boxSizing: 'border-box',
                }}
              >
                {effectiveSettings.stripExif ? '✓ Stripping EXIF & GPS' : 'Keep Original EXIF Metadata'}
              </button>
            </div>

            {/* Delete Image Action */}
            <div className="pt-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--c-border)' }}>
              <button
                onClick={() => onRemove(item.id)}
                className="inline-flex items-center gap-1.5 h-8 text-xs font-medium px-2"
                style={{
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--c-danger)',
                  transition: `all var(--duration-fast) var(--ease)`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220, 38, 38, 0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove this image
              </button>

              <button
                onClick={onClose}
                className="inline-flex items-center justify-center px-4 h-8 font-semibold text-xs shrink-0"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--c-accent)',
                  color: '#ffffff',
                }}
              >
                Done
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
