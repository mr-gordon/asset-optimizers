import React, { ReactNode } from 'react';
import { Layers, ShieldCheck } from 'lucide-react';

export interface HeaderProps {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
  showPrivacyBadge?: boolean;
  privacyBadgeText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  icon = <Layers className="w-4 h-4" />,
  children,
  showPrivacyBadge = true,
  privacyBadgeText = 'Private',
}) => {
  return (
    <header
      className="sticky top-0 z-30 transition-all"
      style={{
        background: 'rgba(250, 251, 252, 0.55)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--c-border-light)',
        paddingTop: '0.875rem', // 14px
        paddingBottom: '0.875rem', // 14px
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10 gap-4">
          
          {/* Brand Logo & App Name */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center shrink-0"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--c-accent)',
                color: 'white',
                boxShadow: 'var(--c-shadow-sm)',
              }}
            >
              {icon}
            </div>
            <h1
              className="text-base font-semibold tracking-tight"
              style={{ color: 'var(--c-text)', letterSpacing: '-0.02em' }}
            >
              {title}
            </h1>
          </div>

          {/* Controls Slot & Privacy Badge */}
          <div className="flex items-center gap-2.5">
            {children}

            {showPrivacyBadge && (
              <div
                className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3 h-8 text-xs font-medium shrink-0"
                title="100% Client-Side Privacy"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--c-success-light)',
                  color: 'var(--c-success)',
                  border: '1px solid rgba(5, 150, 105, 0.15)',
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[11px]">{privacyBadgeText}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
