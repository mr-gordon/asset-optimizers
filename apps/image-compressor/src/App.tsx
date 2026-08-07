import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ImageItem, BatchSettings, CompressionMode, CompressionStats } from './types';
import { compressSingleImage, formatBytes } from './utils/compressor';
import { PRESET_PROFILES } from './utils/presets';
import { createZipArchive, triggerDownload } from './utils/zip';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { BatchControlBar } from './components/BatchControlBar';
import { StatsBanner } from './components/StatsBanner';
import { ImageList } from './components/ImageList';
import { InspectorModal } from './components/InspectorModal';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';

const DEFAULT_SETTINGS: BatchSettings = {
  targetFormat: 'image/webp',
  qualityMode: 'percentage',
  quality: 80,
  targetSizeKb: 500,
  resize: {
    mode: 'original',
    maintainAspectRatio: true,
    aspectRatioPreset: 'original',
  },
  stripExif: true,
  exifOptions: {
    stripAll: true,
    stripGps: true,
    keepCameraInfo: false,
  },
  namingPattern: '{filename}_opt.{ext}',
  backgroundColor: '#ffffff',
  chromaSubsampling: '4:4:4',
};

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<BatchSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<CompressionMode>('auto');
  const [activePresetId, setActivePresetId] = useState<string | undefined>('web_performance');
  
  const [inspectorItemId, setInspectorItemId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBlinkActive, setIsBlinkActive] = useState(false);

  // Process a batch of items with current settings
  const processItems = useCallback(async (currentItems: ImageItem[], batchSettings: BatchSettings) => {
    if (currentItems.length === 0) return;
    setIsProcessing(true);

    const updatedItems = [...currentItems];

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      // Mark compressing
      updatedItems[i] = { ...item, status: 'compressing', progress: 50 };
      setItems([...updatedItems]);

      try {
        const result = await compressSingleImage(item, batchSettings);
        const compUrl = URL.createObjectURL(result.blob);

        // Revoke old compressed URL to prevent memory leak
        if (item.compressedUrl) {
          URL.revokeObjectURL(item.compressedUrl);
        }

        updatedItems[i] = {
          ...item,
          status: 'done',
          progress: 100,
          compressedBlob: result.blob,
          compressedUrl: compUrl,
          compressedSize: result.size,
          compressedWidth: result.width,
          compressedHeight: result.height,
          outputFormat: result.mimeType,
          error: undefined,
        };
      } catch (err: any) {
        updatedItems[i] = {
          ...item,
          status: 'error',
          error: err.message || 'Compression failed',
        };
      }
      setItems([...updatedItems]);
    }

    setIsProcessing(false);
  }, []);

  // Handle files selection / drag & drop / clipboard paste
  const handleAddFiles = useCallback((files: File[]) => {
    const newItems: ImageItem[] = [];

    for (const file of files) {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;

      const newItem: ImageItem = {
        id,
        file,
        name: file.name,
        originalSize: file.size,
        originalWidth: 0,
        originalHeight: 0,
        mimeType: file.type || 'image/jpeg',
        previewUrl: url,
        status: 'idle',
        progress: 0,
      };

      img.onload = () => {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? { ...it, originalWidth: img.naturalWidth, originalHeight: img.naturalHeight }
              : it
          )
        );
      };

      newItems.push(newItem);
    }

    // Fix race condition: set items first, then trigger compression via effect
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  // Auto-compress when new items are added
  useEffect(() => {
    const idleItems = items.filter((it) => it.status === 'idle');
    if (idleItems.length > 0 && !isProcessing) {
      processItems(items, settings);
    }
  }, [items, isProcessing, processItems, settings]);

  // Handle preset selection
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_PROFILES.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePresetId(presetId);
    const newSettings: BatchSettings = {
      ...settings,
      ...preset.settings,
      resize: {
        ...settings.resize,
        ...(preset.settings.resize || {}),
      },
    };
    setSettings(newSettings);
    if (items.length > 0) {
      processItems(items, newSettings);
    }
  };

  // Settings change handler
  const handleChangeSettings = (newSettings: BatchSettings) => {
    setActivePresetId(undefined); // Clear preset selection when custom modified
    setSettings(newSettings);
  };

  // Re-compress all
  const handleRecompressAll = () => {
    processItems(items, settings);
  };

  // Clear all items
  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    });
    setItems([]);
    setInspectorItemId(null);
  };

  // Single item remove – now revokes URLs to prevent memory leak
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((it) => it.id === id);
      if (item) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
    if (inspectorItemId === id) {
      setInspectorItemId(null);
    }
  };

  const handleUpdateName = (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: trimmed } : item))
    );
  };

  // Download All / Smart Save
  const handleDownloadAll = useCallback(async () => {
    const doneItems = items.filter((it) => it.status === 'done' && it.compressedBlob);
    if (doneItems.length === 0) return;

    if (doneItems.length > 3) {
      // Download as ZIP archive
      const zipBlob = await createZipArchive(doneItems, settings);
      triggerDownload(zipBlob, `compressed_images_${Date.now()}.zip`);
    } else {
      // Direct individual downloads
      for (const item of doneItems) {
        if (item.compressedBlob) {
          const mime = item.outputFormat || settings.targetFormat;
          const fileName = `${item.name.replace(/\.[^/.]+$/, '')}_opt.${mime.replace('image/', '')}`;
          triggerDownload(item.compressedBlob, fileName);
        }
      }
    }
  }, [items, settings]);

  // Override update per item
  const handleUpdateOverride = (itemId: string, override: Partial<BatchSettings>) => {
    setItems((prev) => {
      const next = prev.map((it) => {
        if (it.id === itemId) {
          const updated = { ...it, overrideSettings: override };
          // Recompress single item immediately
          compressSingleImage(updated, settings).then((res) => {
            const compUrl = URL.createObjectURL(res.blob);
            setItems((curr) =>
              curr.map((c) =>
                c.id === itemId
                  ? {
                      ...c,
                      status: 'done',
                      compressedBlob: res.blob,
                      compressedUrl: compUrl,
                      compressedSize: res.size,
                      compressedWidth: res.width,
                      compressedHeight: res.height,
                      outputFormat: res.mimeType,
                    }
                  : c
              )
            );
          });
          return updated;
        }
        return it;
      });
      return next;
    });
  };

  // Stats calculation
  const stats: CompressionStats = useMemo(() => {
    let completed = 0;
    let origTot = 0;
    let compTot = 0;

    for (const item of items) {
      origTot += item.originalSize;
      if (item.status === 'done' && item.compressedSize) {
        completed++;
        compTot += item.compressedSize;
      } else {
        compTot += item.originalSize;
      }
    }

    const saved = Math.max(0, origTot - compTot);
    const savedPct = origTot > 0 ? Math.round((saved / origTot) * 100) : 0;

    return {
      totalFiles: items.length,
      completedFiles: completed,
      totalOriginalBytes: origTot,
      totalCompressedBytes: compTot,
      totalSavedBytes: saved,
      savedPercentage: savedPct,
    };
  }, [items]);

  // Active item for inspector
  const activeInspectorItem = useMemo(() => {
    return items.find((it) => it.id === inspectorItemId) || null;
  }, [items, inspectorItemId]);

  const activeIndex = useMemo(() => {
    return items.findIndex((it) => it.id === inspectorItemId);
  }, [items, inspectorItemId]);

  const handleNavigateInspector = (dir: 'prev' | 'next') => {
    if (activeIndex === -1) return;
    const targetIdx = dir === 'prev' ? activeIndex - 1 : activeIndex + 1;
    if (targetIdx >= 0 && targetIdx < items.length) {
      setInspectorItemId(items[targetIdx].id);
    }
  };

  // Register Global Keyboard Shortcuts
  useKeyboardShortcuts({
    onPasteImages: handleAddFiles,
    onToggleBlink: () => setIsBlinkActive((prev) => !prev),
    onCloseInspector: () => setInspectorItemId(null),
    onDeleteSelected: () => {
      if (inspectorItemId) handleRemoveItem(inspectorItemId);
    },
    onDownloadAll: handleDownloadAll,
    isInspectorOpen: !!inspectorItemId,
  });

  const isExpanded = mode === 'manual' || items.length > 0;

  return (
    <div className="min-h-screen font-[var(--font)] transition-colors flex flex-col"
         style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      
      {/* Header & Presets */}
      <Header
        mode={mode}
        onModeChange={setMode}
        onSelectPreset={handleSelectPreset}
        activePresetId={activePresetId}
      />

      {/* Main App Container */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 transition-all duration-300 space-y-6 ${
        isExpanded ? 'pt-6 pb-12' : 'flex flex-col justify-center py-8 sm:py-12'
      }`}>
        
        {/* Zone 1: Smart Dropzone */}
        <Dropzone onFilesSelected={handleAddFiles} hasItems={items.length > 0} isExpanded={isExpanded} />

        {/* Zone 2: Batch Control Bar (Visible in Manual mode or when images exist) */}
        {isExpanded && (
          <BatchControlBar
            settings={settings}
            onChangeSettings={handleChangeSettings}
            onRecompressAll={handleRecompressAll}
            onClearAll={handleClearAll}
            onDownloadAll={handleDownloadAll}
            hasItems={items.length > 0}
            isProcessing={isProcessing}
            itemCount={items.length}
          />
        )}

        {/* Overall Compression Stats Summary */}
        <StatsBanner stats={stats} isProcessing={isProcessing} />

        {/* Zone 3: Batch Cards List */}
        <ImageList
          items={items}
          onOpenInspector={(id) => setInspectorItemId(id)}
          onRemove={handleRemoveItem}
          namingPattern={settings.namingPattern}
          onClearAll={handleClearAll}
        />

      </main>

      {/* Zone 3: Pro Detail Panel Inspector Modal */}
      <InspectorModal
        item={activeInspectorItem}
        globalSettings={settings}
        onClose={() => setInspectorItemId(null)}
        onUpdateOverride={handleUpdateOverride}
        onUpdateName={handleUpdateName}
        onRemove={handleRemoveItem}
        onNavigate={handleNavigateInspector}
        hasPrev={activeIndex > 0}
        hasNext={activeIndex < items.length - 1}
        isBlinkActive={isBlinkActive}
        onToggleBlink={() => setIsBlinkActive((prev) => !prev)}
      />

      {/* Keyboard Shortcuts Floating Helper */}
      <KeyboardShortcutsHelp />

    </div>
  );
}
