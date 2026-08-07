import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onPasteImages?: (files: File[]) => void;
  onToggleBlink?: () => void;
  onCloseInspector?: () => void;
  onDeleteSelected?: () => void;
  onDownloadAll?: () => void;
  isInspectorOpen?: boolean;
}

export function useKeyboardShortcuts({
  onPasteImages,
  onToggleBlink,
  onCloseInspector,
  onDeleteSelected,
  onDownloadAll,
  isInspectorOpen,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!onPasteImages) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        onPasteImages(imageFiles);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT';

      // Cmd+S or Ctrl+S: Download All
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (onDownloadAll) onDownloadAll();
        return;
      }

      // Spacebar: Toggle Before/After blink in Inspector
      if (e.code === 'Space' && !isInput && isInspectorOpen) {
        e.preventDefault();
        if (onToggleBlink) onToggleBlink();
        return;
      }

      // Escape: Close Inspector
      if (e.key === 'Escape' && isInspectorOpen) {
        e.preventDefault();
        if (onCloseInspector) onCloseInspector();
        return;
      }

      // Delete / Backspace: Delete active image in inspector
      if ((e.key === 'Delete' || (e.key === 'Backspace' && e.shiftKey)) && !isInput && isInspectorOpen) {
        e.preventDefault();
        if (onDeleteSelected) onDeleteSelected();
        return;
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPasteImages, onToggleBlink, onCloseInspector, onDeleteSelected, onDownloadAll, isInspectorOpen]);
}
