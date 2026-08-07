import React, { useState } from 'react';
import { Keyboard, Info, X, Sparkles, Github } from 'lucide-react';

export const KeyboardShortcutsHelp: React.FC = () => {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const kbdStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border)',
    fontFamily: 'var(--font)',
    fontWeight: 600,
    fontSize: '11px',
    color: 'var(--c-text-secondary)',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--c-surface-alt)',
  };

  return (
    <>
      {/* Floating Bottom Right Action Group */}
      <div className="fixed bottom-4 right-4 z-20 flex items-center gap-2">
        {/* Circular Info Button */}
        <button
          type="button"
          onClick={() => setIsInfoOpen(true)}
          className="w-8 h-8 inline-flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer"
          style={{
            borderRadius: 'var(--radius-full)',
            background: 'var(--c-surface)',
            color: 'var(--c-text-secondary)',
            border: '1px solid var(--c-border)',
            boxShadow: 'var(--c-shadow-md)',
            transition: `all var(--duration-fast) var(--ease)`,
          }}
          title="About & App Info"
        >
          <Info className="w-4 h-4 text-[var(--c-text-tertiary)]" />
        </button>

        {/* Shortcuts Button */}
        <button
          type="button"
          onClick={() => setIsShortcutsOpen(true)}
          className="px-4.5 h-8 flex items-center gap-2 shrink-0 transition-transform active:scale-95 cursor-pointer"
          style={{
            borderRadius: 'var(--radius-full)',
            background: 'var(--c-surface)',
            color: 'var(--c-text-secondary)',
            border: '1px solid var(--c-border)',
            boxShadow: 'var(--c-shadow-md)',
            fontSize: 'var(--fs-xs)',
            fontWeight: 600,
            transition: `all var(--duration-fast) var(--ease)`,
          }}
          title="View Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4 text-[var(--c-text-tertiary)]" />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>
      </div>

      {/* 1. KEYBOARD SHORTCUTS MODAL */}
      {isShortcutsOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsShortcutsOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
          style={{ background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(8px)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full space-y-4 cursor-default"
            style={{
              background: 'var(--c-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--c-border)',
              padding: '24px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <h3 className="font-semibold flex items-center gap-2" style={{ fontSize: 'var(--fs-md)', color: 'var(--c-text)' }}>
                <Keyboard className="w-5 h-5 text-[var(--c-text-tertiary)]" />
                Keyboard Shortcuts
              </h3>
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(false)}
                className="w-8 h-8 inline-flex items-center justify-center transition-colors cursor-pointer"
                style={{ borderRadius: 'var(--radius-full)', color: 'var(--c-text-tertiary)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div style={rowStyle}>
                <span style={{ color: 'var(--c-text-secondary)' }}>Paste SVG / file anywhere</span>
                <kbd style={kbdStyle}>Ctrl + V / Cmd + V</kbd>
              </div>

              <div style={rowStyle}>
                <span style={{ color: 'var(--c-text-secondary)' }}>Download All (.svgs ZIP)</span>
                <kbd style={kbdStyle}>Ctrl + S / Cmd + S</kbd>
              </div>

              <div style={rowStyle}>
                <span style={{ color: 'var(--c-text-secondary)' }}>Close Inspector / Modal</span>
                <kbd style={kbdStyle}>Esc</kbd>
              </div>

              <div style={rowStyle}>
                <span style={{ color: 'var(--c-text-secondary)' }}>Delete selected SVG</span>
                <kbd style={kbdStyle}>Delete / Backspace</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. APP INFO DIALOG MODAL */}
      {isInfoOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsInfoOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
          style={{ background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(8px)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xs sm:max-w-sm w-full text-center cursor-default"
            style={{
              background: 'var(--c-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--c-border)',
              padding: '32px 24px 28px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsInfoOpen(false)}
              className="absolute top-3.5 right-3.5 w-8 h-8 inline-flex items-center justify-center transition-colors cursor-pointer"
              style={{ borderRadius: 'var(--radius-full)', color: 'var(--c-text-tertiary)' }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* App Icon Squircle */}
            <div className="flex justify-center mb-5">
              <div
                className="w-20 h-20 flex items-center justify-center"
                style={{
                  borderRadius: '22px',
                  background: '#34383c',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* App Title & Version Info */}
            <h3
              className="text-xl font-bold tracking-tight"
              style={{ color: 'var(--c-text)', letterSpacing: '-0.02em' }}
            >
              .svg Optimizer
            </h3>

            <p className="text-xs sm:text-sm font-normal mt-2" style={{ color: 'var(--c-text-secondary)' }}>
              Version 1.8.0
            </p>

            <div className="mt-4 flex flex-col items-center gap-1.5 text-xs sm:text-sm" style={{ color: 'var(--c-text-secondary)' }}>
              <p>Copyright © 2026 Christopher Winker.</p>
              <a
                href="https://github.com/mr-gordon"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[var(--c-accent)] hover:underline font-semibold"
              >
                <Github className="w-4 h-4" />
                <span>github.com/mr-gordon</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
