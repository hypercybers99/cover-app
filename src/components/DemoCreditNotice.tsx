import React from 'react';
import { Coins, Info } from 'lucide-react';

interface DemoCreditNoticeProps {
  className?: string;
  variant?: 'banner' | 'inline';
}

export const DemoCreditNotice: React.FC<DemoCreditNoticeProps> = ({
  className = '',
  variant = 'inline',
}) => {
  if (variant === 'banner') {
    return (
      <aside
        aria-label="Demo credit disclaimer"
        className={`w-full bg-sand border-b border-sand-border px-4 py-2 text-sm text-ink-muted flex items-center justify-center gap-2 ${className}`}
      >
        <Coins className="w-4 h-4 text-clay shrink-0" aria-hidden="true" />
        <span>
          <strong>Notice:</strong> Credits are demo credits on GenLayer studionet, not money.
        </span>
      </aside>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-ink-muted bg-sand border border-sand-border px-2 py-0.5 rounded-lg ${className}`}
      title="Credits are demo credits on GenLayer studionet, not money."
    >
      <Info className="w-3.5 h-3.5 text-clay shrink-0" aria-hidden="true" />
      <span>Demo credits, not money</span>
    </span>
  );
};
