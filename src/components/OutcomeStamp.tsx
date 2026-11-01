import React from 'react';
import type { Outcome } from '../types/contract';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, XCircle } from 'lucide-react';

interface OutcomeStampProps {
  outcome: Outcome;
  showMeaning?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const OUTCOME_CONFIG: Record<
  Outcome,
  {
    label: string;
    description: string;
    borderClass: string;
    bgClass: string;
    textClass: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  PAY_100: {
    label: 'PAY 100%',
    description: 'Severe incident confirmed. Full coverage payout triggered.',
    borderClass: 'border-brick',
    bgClass: 'bg-brick-bg',
    textClass: 'text-brick',
    icon: CheckCircle2,
  },
  PAY_50: {
    label: 'PAY 50%',
    description: 'Major service impairment confirmed. Half coverage payout.',
    borderClass: 'border-clay',
    bgClass: 'bg-clay-bg',
    textClass: 'text-clay',
    icon: AlertCircle,
  },
  PAY_25: {
    label: 'PAY 25%',
    description: 'Minor service disruption confirmed. Quarter coverage payout.',
    borderClass: 'border-clay',
    bgClass: 'bg-clay-bg',
    textClass: 'text-clay',
    icon: AlertTriangle,
  },
  NO_PAY: {
    label: 'NO PAY',
    description: 'No qualifying outage or breach detected. Claim closed.',
    borderClass: 'border-primary',
    bgClass: 'bg-sage',
    textClass: 'text-sage-text',
    icon: XCircle,
  },
  REVIEW: {
    label: 'IN REVIEW',
    description: 'Ambiguous or unparsable status page. Marked for consensus re-inspection.',
    borderClass: 'border-ink-muted',
    bgClass: 'bg-sand',
    textClass: 'text-ink-muted',
    icon: HelpCircle,
  },
};

export const OutcomeStamp: React.FC<OutcomeStampProps> = ({
  outcome,
  showMeaning = true,
  size = 'md',
}) => {
  const config = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG.REVIEW;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-sm px-2.5 py-1 gap-1.5',
    md: 'text-base px-3 py-1.5 gap-2',
    lg: 'text-lg px-4 py-2 gap-2.5 font-bold',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  return (
    <div className="inline-flex flex-col gap-1 items-start">
      <span
        className={`inline-flex items-center rounded-lg border-2 font-mono font-semibold uppercase tracking-wider ${config.borderClass} ${config.bgClass} ${config.textClass} ${sizeClasses}`}
        role="status"
        aria-label={`Claim Outcome: ${config.label}`}
      >
        <Icon className={iconSizes} aria-hidden="true" />
        {config.label}
      </span>
      {showMeaning && (
        <span className="text-sm text-ink-muted max-w-xs">{config.description}</span>
      )}
    </div>
  );
};
