'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@repo/ui';
import {
  IconConfig,
  PlatformTab,
  SourceImage,
  ValidationIssue,
} from '../types/icon';
import { Dropzone } from '../components/editor/Dropzone';
import { ControlToolbar } from '../components/editor/ControlToolbar';
import { Stage } from '../components/mockups/Stage';
import { ExportBar } from '../components/editor/ExportBar';
import { ManifestEditor } from '../components/editor/ManifestEditor';
import { KeyboardShortcutsHelp } from '../components/editor/KeyboardShortcutsHelp';
import { NotificationToast } from '../components/common/NotificationToast';
import { StudioDiamondIcon } from '../components/common/StudioDiamondIcon';
import { loadImage, inspectImage } from '../lib/canvas-utils';
import { Sparkles, X, Code2, Info } from 'lucide-react';

const DEFAULT_CONFIG: IconConfig = {
  appName: 'Nova Studio',
  shortName: 'Nova',
  backgroundColor: '#0F172A',
  backgroundType: 'gradient',
  gradientColor2: '#3B82F6',
  gradientAngle: 135,
  padding: 8,
  borderRadius: 22,
  iosTintColor: '#38BDF8',
  iosMode: 'standard',
  androidMask: 'rounded-square', // Default: Eckig mit runden Ecken
  androidDynamicColor: false,
  androidAccentColor: '#93C5FD',
  themeColor: '#0F172A',
  displayMode: 'standalone',
  scope: '/',
  startUrl: '/',
  showSafeZone: false,
};

export default function HomePage() {
  const [config, setConfig] = useState<IconConfig>(DEFAULT_CONFIG);
  const [activePlatform, setActivePlatform] = useState<PlatformTab>('all');
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);

  // Check if returning session; don't re-display info toasts if user has already visited
  useEffect(() => {
    try {
      const hasVisited = localStorage.getItem('icon_studio_has_visited');
      if (!hasVisited) {
        setShowNotifications(true);
        localStorage.setItem('icon_studio_has_visited', 'true');
      } else {
        setShowNotifications(false);
      }
    } catch {
      setShowNotifications(false);
    }
  }, []);

  // Initialize with default logo
  useEffect(() => {
    const initDefaultLogo = async () => {
      const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
        <defs>
          <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#818CF8"/>
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="16" stdDeviation="20" flood-opacity="0.35"/>
          </filter>
        </defs>
        <rect width="512" height="512" rx="130" fill="url(#glow)"/>
        <g filter="url(#shadow)">
          <path d="M256 110 L370 380 L310 380 L256 250 L202 380 L142 380 Z" fill="#ffffff"/>
          <circle cx="256" cy="180" r="32" fill="#ffffff"/>
        </g>
      </svg>`;

      const blob = new Blob([defaultSvg], { type: 'image/svg+xml' });
      const file = new File([blob], 'nova-app-icon.svg', { type: 'image/svg+xml' });
      const dataUrl = `data:image/svg+xml;base64,${btoa(defaultSvg)}`;

      try {
        const img = await loadImage(dataUrl);
        const { issues: initialIssues, hasAlpha, safeZoneBleed } = inspectImage(img, file);

        setSourceImage({
          file,
          name: 'nova-app-icon.svg',
          width: 512,
          height: 512,
          dataUrl,
          isSvg: true,
          hasAlpha,
          safeZoneBleed,
        });
        setImgElement(img);
        setIssues(initialIssues);
      } catch (e) {
        console.error('Failed to load initial logo:', e);
      }
    };

    initDefaultLogo();
  }, []);

  const handleConfigChange = useCallback((updates: Partial<IconConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleImageLoaded = useCallback(
    (source: SourceImage, img: HTMLImageElement) => {
      setSourceImage(source);
      setImgElement(img);
      const { issues: inspectedIssues } = inspectImage(img, source.file);
      setIssues(inspectedIssues);
    },
    []
  );

  const handleClearImage = useCallback(() => {
    setSourceImage(null);
    setImgElement(null);
    setIssues([]);
  }, []);

  const handleDismissIssue = useCallback((id: string) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
  }, []);

  const handleToggleNotifications = useCallback(() => {
    setShowNotifications((prev) => {
      const nextState = !prev;
      if (nextState) {
        // If opening and no issues are currently present, re-check image if loaded
        if (issues.length === 0 && imgElement && sourceImage) {
          const { issues: rechecked } = inspectImage(imgElement, sourceImage.file);
          if (rechecked.length > 0) {
            setIssues(rechecked);
          } else {
            setIssues([
              {
                id: 'all-good',
                type: 'info',
                title: 'Keine aktuellen Hinweise',
                message: 'Dein Icon erfüllt alle Empfehlungen für die konfigurierten Plattformen.',
              },
            ]);
          }
        }
      }
      return nextState;
    });
  }, [issues.length, imgElement, sourceImage]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes manifest modal or notification toasts
      if (e.key === 'Escape') {
        if (isManifestModalOpen) setIsManifestModalOpen(false);
        if (showNotifications) setShowNotifications(false);
      }

      // Cmd+S / Ctrl+S when no image is loaded
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's' && !sourceImage) {
        e.preventDefault();
        setIssues((prev) => [
          ...prev.filter((i) => i.id !== 'no-image-export'),
          {
            id: 'no-image-export',
            type: 'info',
            title: 'Kein Icon geladen',
            message: 'Lade oder wähle zuerst ein Icon aus, um das Asset-Paket herunterzuladen.',
          },
        ]);
        setShowNotifications(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isManifestModalOpen, showNotifications, sourceImage]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* Floating Interactive Notification Toasts (Fixed, Hoverable, Dismissable) */}
      {showNotifications && issues.length > 0 && (
        <NotificationToast
          issues={issues}
          onDismiss={handleDismissIssue}
        />
      )}

      {/* Monorepo Corporate Header from @repo/ui */}
      <Header
        title="Universal Icon Studio"
        icon={<StudioDiamondIcon className="w-4 h-4 text-white" />}
        showPrivacyBadge={true}
        privacyBadgeText="Private"
      >
        {/* Info button directly to the left of the Private badge */}
        <button
          type="button"
          onClick={handleToggleNotifications}
          className={`h-8 inline-flex items-center justify-center gap-1.5 px-2.5 rounded-full border transition-all cursor-pointer text-xs font-medium ${
            showNotifications && issues.length > 0
              ? 'border-[var(--c-accent)] bg-[var(--c-accent)] text-white shadow-xs'
              : 'border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text-secondary)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)]'
          }`}
          title={showNotifications ? 'Meldungen schließen' : 'Hinweise und Meldungen anzeigen'}
          aria-label="Hinweise und Meldungen anzeigen"
        >
          <Info className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Info</span>
          {issues.length > 0 && (
            <span
              className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                showNotifications
                  ? 'bg-white/20 text-white'
                  : 'bg-[var(--c-surface-alt)] text-[var(--c-text-secondary)] border border-[var(--c-border)]'
              }`}
            >
              {issues.length}
            </span>
          )}
        </button>
      </Header>

      {/* Main Container matching image-compressor and svg-optimizer */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pt-6 pb-16 flex flex-col gap-6">
        {!sourceImage ? (
          <div className="flex-1 flex flex-col justify-center py-8 sm:py-12">
            <Dropzone
              sourceImage={null}
              onImageLoaded={handleImageLoaded}
              onClearImage={handleClearImage}
            />
          </div>
        ) : (
          <>
            {/* Zone 1: Smart Corporate Dropzone Strip */}
            <Dropzone
              sourceImage={sourceImage}
              onImageLoaded={handleImageLoaded}
              onClearImage={handleClearImage}
            />

            {/* Zone 2: Control Toolbar Card (Parameters, Colors, Sliders) */}
            <ControlToolbar
              config={config}
              onConfigChange={handleConfigChange}
              onOpenManifestModal={() => setIsManifestModalOpen(true)}
            />

            {/* Zone 3: Live Preview Stage Card */}
            <Stage
              imgElement={imgElement}
              config={config}
              onConfigChange={handleConfigChange}
              activePlatform={activePlatform}
              onPlatformChange={setActivePlatform}
            />

            {/* Zone 4: Export Action Bar Card */}
            <ExportBar
              imgElement={imgElement}
              config={config}
            />
          </>
        )}
      </main>

      {/* Floating Bottom Right Action Helper (About & Keyboard Shortcuts) */}
      <KeyboardShortcutsHelp />

      {/* Manifest & PWA Modal */}
      {isManifestModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsManifestModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]"
            style={{
              background: 'var(--c-surface)',
              borderColor: 'var(--c-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--c-border)]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'var(--c-accent)',
                    color: 'white',
                  }}
                >
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-text)]">
                    PWA &amp; Web Manifest Editor
                  </h3>
                  <p className="text-[11px] text-[var(--c-text-secondary)]">
                    Konfiguriere manifest.json Einstellungen und kopiere Snippets
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsManifestModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--c-hover)] text-[var(--c-text-secondary)] hover:text-[var(--c-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-4 overflow-y-auto flex-1">
              <ManifestEditor
                config={config}
                onConfigChange={handleConfigChange}
              />
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[var(--c-border)] flex justify-end">
              <button
                type="button"
                onClick={() => setIsManifestModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--c-surface-alt)] hover:bg-[var(--c-hover)] text-[var(--c-text)] border border-[var(--c-border)] transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
