import React, { useState, useEffect } from 'react';
import { SvgItem } from '../types';
import { X, Code, Eye, Pencil, Check } from 'lucide-react';
import { downloadBlob } from '../utils/zipExport';

interface SvgInspectorModalProps {
  item: SvgItem | null;
  onClose: () => void;
  onUpdateCode?: (id: string, newSvg: string) => void;
  onUpdateName?: (id: string, newName: string) => void;
}

export const SvgInspectorModal: React.FC<SvgInspectorModalProps> = ({
  item,
  onClose,
  onUpdateCode,
  onUpdateName,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [editedSvg, setEditedSvg] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState<string>('');

  useEffect(() => {
    if (item) {
      setEditedSvg(item.optimizedSvg);
      setNameValue(item.name);
      setIsEditingName(false);
      setIsSaved(false);
    }
  }, [item]);

  if (!item) return null;

  const isCodeModified = editedSvg !== item.optimizedSvg;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedSvg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy SVG code', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([editedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const baseName = item.name.replace(/\.svg$/i, '');
    downloadBlob(blob, `${baseName}_opt.svg`);
  };

  const handleSaveCode = () => {
    if (onUpdateCode && item) {
      onUpdateCode(item.id, editedSvg);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        className="relative bg-[var(--c-surface)] border border-[var(--c-border)] rounded-[var(--radius-xl)] shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[var(--c-border-light)] flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-1.5 max-w-sm">
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
                  className="text-base font-semibold text-[var(--c-text)] bg-[var(--c-surface-alt)] border border-[var(--c-accent)] rounded px-2 py-0.5 outline-none w-full"
                />
                <button
                  type="submit"
                  className="p-1 text-xs text-[var(--c-accent)] hover:bg-[var(--c-surface-alt)] rounded shrink-0 cursor-pointer"
                  title="Save filename"
                >
                  <Check className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <h3
                onClick={() => setIsEditingName(true)}
                className="text-base font-semibold text-[var(--c-text)] truncate cursor-pointer hover:text-[var(--c-accent)] transition-colors inline-flex items-center gap-1.5 group"
                title="Click to edit filename"
              >
                <span>{item.name}</span>
                <Pencil className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity text-[var(--c-text-secondary)] shrink-0" />
              </h3>
            )}
            <p className="text-xs text-[var(--c-text-secondary)] font-mono mt-0.5">
              Dimensions: {item.width} × {item.height} px | Original: {(item.originalSize / 1024).toFixed(1)} KB | Optimized: {(new Blob([editedSvg]).size / 1024).toFixed(1)} KB
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="p-0.5 bg-[var(--c-surface-alt)] rounded-full border border-[var(--c-border)] flex items-center">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all ${
                  activeTab === 'preview'
                    ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                    : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all ${
                  activeTab === 'code'
                    ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-xs'
                    : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>SVG Code</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[var(--c-text-tertiary)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[var(--c-bg)]">
          {activeTab === 'preview' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Preview */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-[var(--c-text-secondary)]">Before (Original)</span>
                <div
                  className="w-full h-72 rounded-[var(--radius-lg)] border border-[var(--c-border)] p-6 flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #f4f4f5 25%, transparent 25%), linear-gradient(-45deg, #f4f4f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f4f4f5 75%), linear-gradient(-45deg, transparent 75%, #f4f4f5 75%)',
                    backgroundSize: '16px 16px',
                    backgroundColor: '#ffffff',
                  }}
                  dangerouslySetInnerHTML={{ __html: item.rawSvg }}
                />
              </div>

              {/* Live Preview of edited SVG */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-[var(--c-text-secondary)]">After (Live Code Preview)</span>
                <div
                  className="w-full h-72 rounded-[var(--radius-lg)] border border-emerald-300 p-6 flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #f4f4f5 25%, transparent 25%), linear-gradient(-45deg, #f4f4f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f4f4f5 75%), linear-gradient(-45deg, transparent 75%, #f4f4f5 75%)',
                    backgroundSize: '16px 16px',
                    backgroundColor: '#ffffff',
                  }}
                  dangerouslySetInnerHTML={{ __html: editedSvg }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--c-text-secondary)]">
                  Directly edit &amp; customize SVG code:
                </span>
                <span className="text-[11px] font-mono text-[var(--c-text-tertiary)]">
                  {editedSvg.length} characters
                </span>
              </div>
              <textarea
                value={editedSvg}
                onChange={(e) => setEditedSvg(e.target.value)}
                className="w-full h-64 p-4 font-mono text-xs bg-[var(--c-surface)] border border-[var(--c-border)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--c-accent)] leading-relaxed break-all transition-all"
                placeholder="Enter SVG Code..."
              />
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 border-t border-[var(--c-border-light)] bg-[var(--c-surface)] flex items-center justify-between gap-4">
          <span className="text-xs text-[var(--c-text-secondary)] hidden sm:inline">
            Sanitized defs, styles, comments &amp; attributes. Live editing active.
          </span>

          <div className="flex items-center gap-3">
            {/* Save Code Button */}
            {onUpdateCode && (
              <button
                type="button"
                onClick={handleSaveCode}
                disabled={!isCodeModified && !isSaved}
                className={`h-9 px-4 inline-flex items-center justify-center text-xs font-semibold rounded-full transition-all shadow-xs ${
                  isSaved
                    ? 'bg-emerald-600 text-white'
                    : isCodeModified
                    ? 'bg-[var(--c-accent)] text-white hover:bg-[var(--c-accent-hover)] cursor-pointer'
                    : 'bg-[var(--c-surface-alt)] text-[var(--c-text-tertiary)] border border-[var(--c-border)] opacity-60 cursor-not-allowed'
                }`}
              >
                <span>{isSaved ? 'Saved!' : 'Save'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="h-9 px-4 inline-flex items-center justify-center text-xs font-semibold rounded-full bg-[var(--c-surface-alt)] text-[var(--c-text)] border border-[var(--c-border)] hover:bg-[var(--c-hover)] transition-all cursor-pointer"
            >
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="h-9 px-4 inline-flex items-center justify-center text-xs font-semibold rounded-full bg-[var(--c-surface-alt)] text-[var(--c-text)] border border-[var(--c-border)] hover:bg-[var(--c-hover)] transition-all cursor-pointer"
            >
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
