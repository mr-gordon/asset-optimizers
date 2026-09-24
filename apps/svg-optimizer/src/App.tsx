import React, { useState, useEffect, useCallback } from 'react';
import { SvgItem, PngScaleFactor } from './types';
import { optimizeSvgString } from './utils/svgOptimizer';
import { exportSvgsAsZip, exportPngsAsZip, exportAllAsZip } from './utils/zipExport';

import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { BatchControlBar } from './components/BatchControlBar';
import { StatsBanner } from './components/StatsBanner';
import { SvgCard } from './components/SvgCard';
import { SvgInspectorModal } from './components/SvgInspectorModal';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';

import { Trash2 } from 'lucide-react';

const DEFAULT_PRESET_COLORS = ['#000000', '#34383c', '#059669', '#2563eb', '#dc2626', '#f6b83c'];
const LOCAL_STORAGE_COLOR_KEY = 'svg_optimizer_color_history';

export default function App() {
  const [items, setItems] = useState<SvgItem[]>([]);
  const [fillColor, setFillColor] = useState<string>('currentColor');
  
  // Load color history from localStorage across sessions
  const [colorHistory, setColorHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_COLOR_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_PRESET_COLORS;
  });

  const [pngScale, setPngScale] = useState<PngScaleFactor>(4);
  const [namingPattern, setNamingPattern] = useState<string>('{filename}_{size}_opt.{ext}');
  const [includeBoundingBox, setIncludeBoundingBox] = useState<boolean>(true);
  const [stripIdsAndClasses, setStripIdsAndClasses] = useState<boolean>(true);

  const [inspectingItem, setInspectingItem] = useState<SvgItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Save color history to localStorage whenever it updates
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_COLOR_KEY, JSON.stringify(colorHistory));
    } catch (e) {}
  }, [colorHistory]);

  // Handle color change & re-optimize all loaded SVGs in real time
  const handleColorChange = useCallback((newColor: string) => {
    setFillColor(newColor);

    // Track color in history if valid Hex
    if (newColor.startsWith('#') && (newColor.length === 7 || newColor.length === 4)) {
      setColorHistory((prev) => {
        const filtered = prev.filter((c) => c.toLowerCase() !== newColor.toLowerCase());
        return [newColor, ...filtered].slice(0, 12);
      });
    }
  }, []);

  // Re-optimize existing items when fillColor, includeBoundingBox, or stripIdsAndClasses changes
  useEffect(() => {
    if (items.length === 0) return;

    setItems((prevItems) =>
      prevItems.map((item) => {
        try {
          const { optimizedSvg, width, height } = optimizeSvgString(
            item.rawSvg,
            fillColor,
            item.width,
            item.height,
            includeBoundingBox,
            stripIdsAndClasses
          );
          return {
            ...item,
            optimizedSvg,
            optimizedSize: new Blob([optimizedSvg]).size,
            width,
            height,
          };
        } catch (err) {
          return item;
        }
      })
    );
  }, [fillColor, includeBoundingBox, stripIdsAndClasses]);

  // Process newly uploaded SVG files
  const handleFilesSelected = async (files: File[]) => {
    setIsProcessing(true);

    const newItems: SvgItem[] = [];

    for (const file of files) {
      try {
        const rawSvg = await file.text();
        const originalSize = file.size;

        const { optimizedSvg, width, height } = optimizeSvgString(
          rawSvg,
          fillColor,
          undefined,
          undefined,
          includeBoundingBox,
          stripIdsAndClasses
        );
        const optimizedSize = new Blob([optimizedSvg]).size;

        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          originalSize,
          optimizedSize,
          rawSvg,
          optimizedSvg,
          width,
          height,
          status: 'done',
        });
      } catch (err) {
        console.error(`Error optimizing ${file.name}:`, err);
      }
    }

    setItems((prev) => [...prev, ...newItems]);
    setIsProcessing(false);
  };

  const handleUpdateCode = (id: string, newSvg: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newSize = new Blob([newSvg]).size;
          return {
            ...item,
            optimizedSvg: newSvg,
            optimizedSize: newSize,
          };
        }
        return item;
      })
    );
    if (inspectingItem && inspectingItem.id === id) {
      setInspectingItem((prev) =>
        prev ? { ...prev, optimizedSvg: newSvg, optimizedSize: new Blob([newSvg]).size } : null
      );
    }
  };

  const handleUpdateDimension = (id: string, newWidth: number, newHeight: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const { optimizedSvg } = optimizeSvgString(
            item.rawSvg,
            fillColor,
            newWidth,
            newHeight,
            includeBoundingBox,
            stripIdsAndClasses
          );
          const newSize = new Blob([optimizedSvg]).size;

          return {
            ...item,
            width: newWidth,
            height: newHeight,
            optimizedSvg,
            optimizedSize: newSize,
          };
        }
        return item;
      })
    );

    if (inspectingItem && inspectingItem.id === id) {
      setInspectingItem((prev) => {
        if (!prev) return null;
        const { optimizedSvg } = optimizeSvgString(
          prev.rawSvg,
          fillColor,
          newWidth,
          newHeight,
          includeBoundingBox,
          stripIdsAndClasses
        );
        return {
          ...prev,
          width: newWidth,
          height: newHeight,
          optimizedSvg,
          optimizedSize: new Blob([optimizedSvg]).size,
        };
      });
    }
  };

  const handleUpdateName = (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: trimmed } : item))
    );
    if (inspectingItem && inspectingItem.id === id) {
      setInspectingItem((prev) => (prev ? { ...prev, name: trimmed } : null));
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
  };

  const handleDownloadAllZip = async () => {
    if (items.length > 0) {
      try {
        setIsProcessing(true);
        await exportAllAsZip(items, pngScale, namingPattern);
      } catch (err) {
        console.error('Failed to export files as ZIP', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDownloadAllSvgZip = () => {
    if (items.length > 0) {
      exportSvgsAsZip(items, namingPattern);
    }
  };

  const handleDownloadAllPngZip = async () => {
    if (items.length > 0) {
      try {
        setIsProcessing(true);
        await exportPngsAsZip(items, pngScale, namingPattern);
      } catch (err) {
        console.error('Failed to export PNGs as ZIP', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Keyboard shortcut: Cmd+S / Ctrl+S to download all files
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (items.length > 0 && !isProcessing) {
          handleDownloadAllZip();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, isProcessing, handleDownloadAllZip]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* Header Component */}
      <Header />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pt-6 pb-16 flex flex-col gap-6">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center py-8 sm:py-12">
            <Dropzone onFilesSelected={handleFilesSelected} hasItems={false} />
          </div>
        ) : (
          <>
            {/* Zone 1: Smart Dropzone Strip */}
            <Dropzone onFilesSelected={handleFilesSelected} hasItems={true} />

            {/* Zone 2: Batch Control Bar */}
            <BatchControlBar
              fillColor={fillColor}
              onFillColorChange={handleColorChange}
              colorHistory={colorHistory}
              pngScale={pngScale}
              onPngScaleChange={setPngScale}
              namingPattern={namingPattern}
              onNamingPatternChange={setNamingPattern}
              includeBoundingBox={includeBoundingBox}
              onIncludeBoundingBoxChange={setIncludeBoundingBox}
              stripIdsAndClasses={stripIdsAndClasses}
              onStripIdsAndClassesChange={setStripIdsAndClasses}
              onDownloadAllZip={handleDownloadAllZip}
              onDownloadAllSvgZip={handleDownloadAllSvgZip}
              onDownloadAllPngZip={handleDownloadAllPngZip}
              onClearAll={handleClearAll}
              hasItems={items.length > 0}
              isProcessing={isProcessing}
              itemCount={items.length}
            />

            {/* Zone 3: Compression Stats Summary */}
            <StatsBanner items={items} />

            {/* Zone 4: Grid Section Header & SVG Cards Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight text-[var(--c-text)]">
                  .svg Files ({items.length})
                </h2>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="h-8 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--c-text-tertiary)] hover:text-[var(--c-danger)] hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <SvgCard
                    key={item.id}
                    item={item}
                    pngScale={pngScale}
                    namingPattern={namingPattern}
                    onRemove={handleRemoveItem}
                    onInspect={setInspectingItem}
                    onUpdateDimension={handleUpdateDimension}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Inspector Modal */}
      <SvgInspectorModal
        item={inspectingItem}
        onClose={() => setInspectingItem(null)}
        onUpdateCode={handleUpdateCode}
        onUpdateName={handleUpdateName}
      />

      {/* Floating Bottom Right Action Helper */}
      <KeyboardShortcutsHelp />
    </div>
  );
}
