import React, { useState, useCallback, useEffect } from 'react';
import { IconConfig, ExportProgress } from '../../types/icon';
import {
  packageAllAssets,
  triggerBlobDownload,
} from '../../lib/zip-packager';
import { generateIosAssets } from '../../lib/generators/generate-ios';
import { generateAndroidAssets } from '../../lib/generators/generate-android';
import { generateMacOsAssets } from '../../lib/generators/generate-macos';
import { generateWebAssets } from '../../lib/generators/generate-favicon';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileArchive,
} from 'lucide-react';
import JSZip from 'jszip';

interface ExportBarProps {
  imgElement: HTMLImageElement | null;
  config: IconConfig;
}

export const ExportBar: React.FC<ExportBarProps> = ({
  imgElement,
  config,
}) => {
  const [progress, setProgress] = useState<ExportProgress>({
    status: 'idle',
    progress: 0,
    currentTask: '',
  });

  const handleExportAll = useCallback(async () => {
    if (!imgElement) return;

    setProgress({
      status: 'generating',
      progress: 5,
      currentTask: 'Initialisiere Generator...',
    });

    try {
      const zipBlob = await packageAllAssets(imgElement, config, (pct, text) => {
        setProgress({
          status: pct >= 95 ? 'zipping' : 'generating',
          progress: pct,
          currentTask: text,
        });
      });

      const filename = `${config.shortName ? config.shortName.toLowerCase().replace(/\s+/g, '-') : 'app'}-icons.zip`;
      triggerBlobDownload(zipBlob, filename);

      setProgress({
        status: 'done',
        progress: 100,
        currentTask: 'Download gestartet!',
      });

      setTimeout(() => {
        setProgress({ status: 'idle', progress: 0, currentTask: '' });
      }, 3000);
    } catch (err: any) {
      console.error('Export failed:', err);
      setProgress({
        status: 'error',
        progress: 0,
        currentTask: '',
        error: err.message || 'Export fehlgeschlagen',
      });
    }
  }, [imgElement, config]);

  // Global Keyboard Shortcut: Ctrl + S / Cmd + S to download all icons
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        if (imgElement && progress.status !== 'generating' && progress.status !== 'zipping') {
          handleExportAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExportAll, imgElement, progress.status]);

  const handleQuickExport = async (target: 'ico' | 'icns' | 'macos' | 'ios' | 'android' | 'web') => {
    if (!imgElement) return;

    try {
      if (target === 'macos' || target === 'icns') {
        const assets = await generateMacOsAssets(imgElement, config);
        const icns = assets.find((a) => a.path.endsWith('.icns'));
        if (icns) triggerBlobDownload(icns.blob, 'AppIcon.icns');
      } else if (target === 'ico') {
        const assets = await generateWebAssets(imgElement, config);
        const ico = assets.find((a) => a.path.endsWith('.ico'));
        if (ico) triggerBlobDownload(ico.blob, 'favicon.ico');
      } else if (target === 'ios') {
        const assets = await generateIosAssets(imgElement, config);
        const zip = new JSZip();
        for (const a of assets) zip.file(a.path, a.blob);
        const b = await zip.generateAsync({ type: 'blob' });
        triggerBlobDownload(b, 'ios-appiconset.zip');
      } else if (target === 'android') {
        const assets = await generateAndroidAssets(imgElement, config);
        const zip = new JSZip();
        for (const a of assets) zip.file(a.path, a.blob);
        const b = await zip.generateAsync({ type: 'blob' });
        triggerBlobDownload(b, 'android-res.zip');
      } else if (target === 'web') {
        const assets = await generateWebAssets(imgElement, config);
        const zip = new JSZip();
        for (const a of assets) zip.file(a.path, a.blob);
        const b = await zip.generateAsync({ type: 'blob' });
        triggerBlobDownload(b, 'web-favicons.zip');
      }
    } catch (err) {
      console.error('Quick export error:', err);
    }
  };

  const isBusy = progress.status === 'generating' || progress.status === 'zipping';

  return (
    <div
      className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
      style={{
        background: 'var(--c-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--c-border)',
        boxShadow: 'var(--c-shadow-sm)',
      }}
    >
      {/* Left: Quick Export Formats */}
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <span className="text-xs font-semibold text-[var(--c-text-secondary)]">
          Einzelexport:
        </span>
        <button
          type="button"
          disabled={!imgElement || isBusy}
          onClick={() => handleQuickExport('ico')}
          className="px-3 h-8 inline-flex items-center text-xs font-mono font-medium rounded-full border border-[var(--c-border)] bg-[var(--c-surface-alt)] hover:bg-[var(--c-hover)] text-[var(--c-text)] disabled:opacity-40 transition-colors"
        >
          .ico
        </button>
        <button
          type="button"
          disabled={!imgElement || isBusy}
          onClick={() => handleQuickExport('macos')}
          className="px-3 h-8 inline-flex items-center text-xs font-mono font-medium rounded-full border border-[var(--c-border)] bg-[var(--c-surface-alt)] hover:bg-[var(--c-hover)] text-[var(--c-text)] disabled:opacity-40 transition-colors"
        >
          .icns
        </button>
        <button
          type="button"
          disabled={!imgElement || isBusy}
          onClick={() => handleQuickExport('ios')}
          className="px-3 h-8 inline-flex items-center text-xs font-medium rounded-full border border-[var(--c-border)] bg-[var(--c-surface-alt)] hover:bg-[var(--c-hover)] text-[var(--c-text)] disabled:opacity-40 transition-colors"
        >
          iOS Paket
        </button>
        <button
          type="button"
          disabled={!imgElement || isBusy}
          onClick={() => handleQuickExport('android')}
          className="px-3 h-8 inline-flex items-center text-xs font-medium rounded-full border border-[var(--c-border)] bg-[var(--c-surface-alt)] hover:bg-[var(--c-hover)] text-[var(--c-text)] disabled:opacity-40 transition-colors"
        >
          Android res
        </button>
        <button
          type="button"
          disabled={!imgElement || isBusy}
          onClick={() => handleQuickExport('web')}
          className="px-3 h-8 inline-flex items-center text-xs font-medium rounded-full border border-[var(--c-border)] bg-[var(--c-surface-alt)] hover:bg-[var(--c-hover)] text-[var(--c-text)] disabled:opacity-40 transition-colors"
        >
          Web Favicons
        </button>
      </div>

      {/* Right: Status & Primary Download ZIP Button */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {isBusy && (
          <div className="flex items-center gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--c-accent)]" />
            <span className="text-[var(--c-text-secondary)] font-medium">
              {progress.currentTask} ({progress.progress}%)
            </span>
          </div>
        )}

        {progress.status === 'done' && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--c-success)] font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{progress.currentTask}</span>
          </div>
        )}

        {progress.status === 'error' && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--c-danger)] font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>{progress.error}</span>
          </div>
        )}

        <button
          type="button"
          disabled={!imgElement || isBusy}
          onClick={handleExportAll}
          className="h-10 px-5 inline-flex items-center justify-center gap-2 text-xs font-semibold rounded-full text-white shadow-sm hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: 'var(--c-accent)',
          }}
        >
          {isBusy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>Vollständiges Asset-Paket (.ZIP)</span>
        </button>
      </div>
    </div>
  );
};
