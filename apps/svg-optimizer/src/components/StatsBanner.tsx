import React from 'react';
import { SvgItem } from '../types';
import { FileCheck, HardDrive, Sparkles, TrendingDown } from 'lucide-react';

interface StatsBannerProps {
  items: SvgItem[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ items }) => {
  if (items.length === 0) return null;

  const totalOriginal = items.reduce((acc, item) => acc + item.originalSize, 0);
  const totalOptimized = items.reduce((acc, item) => acc + item.optimizedSize, 0);
  const totalSaved = Math.max(0, totalOriginal - totalOptimized);
  const savingsPercent = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;
  const completedCount = items.filter((it) => it.status === 'done').length;

  return (
    <div
      className="space-y-0 animate-in fade-in duration-300"
      style={{
        background: 'var(--c-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--c-border)',
        padding: '16px 20px',
        boxShadow: 'var(--c-shadow-sm)',
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* 4-Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
          {/* Metric 1: Processed */}
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 flex items-center justify-center shrink-0"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--c-surface-alt)',
                border: '1px solid var(--c-border-light)',
              }}
            >
              <FileCheck className="w-5 h-5 text-[var(--c-text-tertiary)]" />
            </div>
            <div>
              <p
                className="font-medium uppercase tracking-wider"
                style={{ fontSize: '10px', color: 'var(--c-text-tertiary)' }}
              >
                Processed
              </p>
              <p
                className="font-bold font-mono"
                style={{ fontSize: 'var(--fs-md)', color: 'var(--c-text)' }}
              >
                {completedCount} / {items.length}
              </p>
            </div>
          </div>

          {/* Metric 2: Original */}
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 flex items-center justify-center shrink-0"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--c-surface-alt)',
                border: '1px solid var(--c-border-light)',
              }}
            >
              <HardDrive className="w-5 h-5 text-[var(--c-text-tertiary)]" />
            </div>
            <div>
              <p
                className="font-medium uppercase tracking-wider"
                style={{ fontSize: '10px', color: 'var(--c-text-tertiary)' }}
              >
                Original
              </p>
              <p
                className="font-bold font-mono"
                style={{ fontSize: 'var(--fs-md)', color: 'var(--c-text)' }}
              >
                {formatBytes(totalOriginal)}
              </p>
            </div>
          </div>

          {/* Metric 3: Optimized */}
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 flex items-center justify-center shrink-0"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--c-surface-alt)',
                border: '1px solid var(--c-border-light)',
              }}
            >
              <Sparkles className="w-5 h-5 text-[var(--c-text-tertiary)]" />
            </div>
            <div>
              <p
                className="font-medium uppercase tracking-wider"
                style={{ fontSize: '10px', color: 'var(--c-text-tertiary)' }}
              >
                Optimized
              </p>
              <p
                className="font-bold font-mono"
                style={{ fontSize: 'var(--fs-md)', color: 'var(--c-text)' }}
              >
                {formatBytes(totalOptimized)}
              </p>
            </div>
          </div>

          {/* Metric 4: Total Savings (%) */}
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 flex items-center justify-center shrink-0"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--c-success-light)',
                border: '1px solid rgba(5, 150, 105, 0.12)',
              }}
            >
              <TrendingDown className="w-5 h-5 text-[var(--c-success)]" />
            </div>
            <div>
              <p
                className="font-medium uppercase tracking-wider"
                style={{ fontSize: '10px', color: 'var(--c-success)' }}
              >
                Total Savings
              </p>
              <p
                className="font-bold font-mono"
                style={{ fontSize: 'var(--fs-md)', color: 'var(--c-success)' }}
              >
                -{savingsPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* Right Badge: Total Storage Saved */}
        <div
          className="flex items-center justify-center px-4 py-2.5 text-center sm:text-right shrink-0"
          style={{
            borderRadius: 'var(--radius-lg)',
            background: 'var(--c-success-light)',
            border: '1px solid rgba(5, 150, 105, 0.12)',
          }}
        >
          <div>
            <span className="text-xs font-medium block" style={{ color: 'var(--c-success)' }}>
              Total Storage Saved
            </span>
            <span
              className="font-black font-mono"
              style={{ fontSize: 'var(--fs-lg)', color: 'var(--c-success)' }}
            >
              {formatBytes(totalSaved)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
