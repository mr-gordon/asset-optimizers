import React, { useState } from 'react';
import { IconConfig } from '../../types/icon';
import {
  buildWebManifest,
  generateHtmlSnippet,
  generateNextJsMetadataSnippet,
} from '../../lib/generate-manifest';
import { Copy, Check, Code, FileCode } from 'lucide-react';

interface ManifestEditorProps {
  config: IconConfig;
  onConfigChange: (updates: Partial<IconConfig>) => void;
}

export const ManifestEditor: React.FC<ManifestEditorProps> = ({
  config,
  onConfigChange,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'nextjs' | 'json'>('html');
  const [copied, setCopied] = useState(false);

  const manifestJson = JSON.stringify(buildWebManifest(config), null, 2);
  const htmlSnippet = generateHtmlSnippet(config);
  const nextSnippet = generateNextJsMetadataSnippet(config);

  const currentCode =
    activeCodeTab === 'html'
      ? htmlSnippet
      : activeCodeTab === 'nextjs'
      ? nextSnippet
      : manifestJson;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Manifest Configuration Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-medium text-[var(--c-text)] block mb-1">
            Display Mode
          </label>
          <select
            value={config.displayMode}
            onChange={(e: any) => onConfigChange({ displayMode: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg border outline-none"
            style={{
              borderColor: 'var(--c-border)',
              background: 'var(--c-surface-alt)',
              color: 'var(--c-text)',
            }}
          >
            <option value="standalone">Standalone (App-Fenster ohne Browser-UI)</option>
            <option value="fullscreen">Fullscreen (Vollbildschirm)</option>
            <option value="minimal-ui">Minimal UI</option>
            <option value="browser">Browser (Normal)</option>
          </select>
        </div>

        <div>
          <label className="font-medium text-[var(--c-text)] block mb-1">
            Theme Color (Statusleiste &amp; Tabs)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.themeColor}
              onChange={(e) => onConfigChange({ themeColor: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border border-[var(--c-border)] p-0.5 bg-transparent"
            />
            <input
              type="text"
              value={config.themeColor}
              onChange={(e) => onConfigChange({ themeColor: e.target.value })}
              className="flex-1 px-3 py-1.5 rounded-lg border font-mono uppercase"
              style={{
                borderColor: 'var(--c-border)',
                background: 'var(--c-surface-alt)',
                color: 'var(--c-text)',
              }}
            />
          </div>
        </div>

        <div>
          <label className="font-medium text-[var(--c-text)] block mb-1">
            Start URL
          </label>
          <input
            type="text"
            value={config.startUrl}
            onChange={(e) => onConfigChange({ startUrl: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg border font-mono"
            style={{
              borderColor: 'var(--c-border)',
              background: 'var(--c-surface-alt)',
              color: 'var(--c-text)',
            }}
          />
        </div>

        <div>
          <label className="font-medium text-[var(--c-text)] block mb-1">
            Scope
          </label>
          <input
            type="text"
            value={config.scope}
            onChange={(e) => onConfigChange({ scope: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg border font-mono"
            style={{
              borderColor: 'var(--c-border)',
              background: 'var(--c-surface-alt)',
              color: 'var(--c-text)',
            }}
          />
        </div>
      </div>

      {/* Snippet Code Tabs */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          borderColor: 'var(--c-border)',
          background: '#0e1117',
        }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#161b22]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveCodeTab('html')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                activeCodeTab === 'html'
                  ? 'bg-white/15 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              HTML &lt;head&gt;
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('nextjs')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                activeCodeTab === 'nextjs'
                  ? 'bg-white/15 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Next.js Metadata
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('json')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                activeCodeTab === 'json'
                  ? 'bg-white/15 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              manifest.json
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Kopiert!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Code kopieren</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-3 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-56">
          <code>{currentCode}</code>
        </pre>
      </div>
    </div>
  );
};
