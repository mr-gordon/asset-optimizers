import React from 'react';
import { CompressionStats } from '../types';
import { formatBytes } from '../utils/compressor';
import { TrendingDown, FileCheck, HardDrive, Sparkles } from 'lucide-react';

interface StatsBannerProps {
  stats: CompressionStats;
  isProcessing: boolean;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ stats, isProcessing }) => {
  if (stats.totalFiles === 0) return null;

  const isSavingsPositive = stats.totalSavedBytes > 0;
  const progressPct = stats.totalFiles > 0
    ? Math.round((stats.completedFiles / stats.totalFiles) * 100)
    : 0;

  return (
    <div
      className="space-y-0"
      style={{
        background: 'var(--c-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--c-border)',
        padding: '16px 20px',
        boxShadow: 'var(--c-shadow-sm)',
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
          
          {/* Total Files */}
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 flex items-center justify-center"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--c-surface-alt)',
                border: '1px solid var(--c-border-light)',
              }}
            >
              <FileCheck className="w-5 h-5" style={{ color: 'var(--c-text-tertiary)' }} />
            </div>
            <div>
              <p className="font-medium uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--c-text-tertiary)' }}>Processed</p>
              <p className="font-bold font-mono" style={{ fontSize: 'var(--fs-md)', color: 'var(--c-text)' }}>
                {stats.completedFiles} / {stats.totalFiles}
              </p>
            </div>
          </div>

          {/* Original Size */}
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 flex items-center justify-center"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--c-surface-alt)',
                border: '1px solid var(--c-border-light)',
              }}
            >
              <HardDrive className="w-5 h-5" style={{ color: 'var(--c-text-tertiary)' }} />
            </div>
            <div>
              <p className="font-medium uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--c-text-tertiary)' }}>Original</p>
              <p className="font-bold font-mono" style={{ fontSize: 'var(--fs-md)', color: 'var(--c-text)' }}>
                {formatBytes(stats.totalOriginalBytes)}
              </p>
            </div>
          </div>

          {/* Compressed Size */}
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 flex items-center justify-center"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--c-surface-alt)',
                border: '1px solid var(--c-border-light)',
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: 'var(--c-text-tertiary)' }} />
            </div>
            <div>
              <p className="font-medium uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--c-text-tertiary)' }}>Compressed</p>
              <p className="font-bold font-mono" style={{ fontSize: 'var(--fs-md)', color: 'var(--c-text)' }}>
                {formatBytes(stats.totalCompressedBytes)}
              </p>
            </div>
          </div>

          {/* Saved % */}
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 flex items-center justify-center"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--c-success-light)',
                border: '1px solid rgba(5, 150, 105, 0.12)',
              }}
            >
              <TrendingDown className="w-5 h-5" style={{ color: 'var(--c-success)' }} />
            </div>
            <div>
              <p className="font-medium uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--c-success)' }}>Total Savings</p>
              <p className="font-bold font-mono" style={{ fontSize: 'var(--fs-md)', color: 'var(--c-success)' }}>
                {isSavingsPositive ? `-${stats.savedPercentage}%` : '0%'}
              </p>
            </div>
          </div>

        </div>

        {/* Right Saved Badge */}
        {isSavingsPositive && (
          <div
            className="flex items-center justify-center px-4 py-2.5 text-center sm:text-right"
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'var(--c-success-light)',
              border: '1px solid rgba(5, 150, 105, 0.12)',
            }}
          >
            <div>
              <span className="text-xs font-medium block" style={{ color: 'var(--c-success)' }}>Total Storage Saved</span>
              <span className="font-black font-mono" style={{ fontSize: 'var(--fs-lg)', color: 'var(--c-success)' }}>
                {formatBytes(stats.totalSavedBytes)}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Processing Bar */}
      {isProcessing && (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--c-border-light)' }}>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--c-text-secondary)' }}>
            <span>Compressing images in browser...</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 overflow-hidden" style={{ background: 'var(--c-surface-alt)', borderRadius: 'var(--radius-full)' }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progressPct}%`,
                background: 'var(--c-accent)',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
