import React from 'react';
import { ValidationIssue } from '../../types/icon';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

interface NotificationToastProps {
  issues: ValidationIssue[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  issues,
  onDismiss,
}) => {
  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-16 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
      aria-live="polite"
    >
      {issues.map((issue) => {
        const isWarning = issue.type === 'warning';
        const isError = issue.type === 'error';
        const isInfo = issue.type === 'info';

        return (
          <div
            key={issue.id}
            className="pointer-events-auto group relative flex items-start gap-3 p-3.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-md transition-all duration-200 ease-out hover:shadow-xl hover:-translate-y-0.5 animate-in fade-in slide-in-from-top-2"
            style={{
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Icon Container */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                isError
                  ? 'bg-rose-50 text-rose-600'
                  : isWarning
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-[var(--c-surface-alt)] text-[var(--c-text-secondary)]'
              }`}
            >
              {isError ? (
                <AlertCircle className="w-4 h-4" />
              ) : isWarning ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pr-1 text-left min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-[var(--c-text)]">
                  {issue.title}
                </p>
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md ${
                    isError
                      ? 'bg-rose-100 text-rose-700'
                      : isWarning
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[var(--c-surface-alt)] text-[var(--c-text-secondary)] border border-[var(--c-border)]'
                  }`}
                >
                  {isError ? 'Fehler' : isWarning ? 'Warnung' : 'Hinweis'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--c-text-secondary)] leading-relaxed mt-1">
                {issue.message}
              </p>
            </div>

            {/* Dismiss 1-Click Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(issue.id);
              }}
              className="shrink-0 p-1 -mr-1 -mt-1 rounded-full text-[var(--c-text-tertiary)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-colors"
              title="Meldung schließen"
              aria-label="Meldung schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
