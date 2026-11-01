import React from 'react';
import type { Gate } from '../types/contract';
import { Eye, ShieldAlert, Cpu } from 'lucide-react';

interface GateChipProps {
  gate: Gate;
  showMeaning?: boolean;
}

const GATE_CONFIG: Record<
  Gate,
  {
    label: string;
    meaning: string;
    borderClass: string;
    bgClass: string;
    textClass: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  PAGE_UNCHANGED: {
    label: 'PAGE UNCHANGED',
    meaning: 'Page sha256 identical to policy creation; resolved NO_PAY without LLM call.',
    borderClass: 'border-sand-border',
    bgClass: 'bg-sand',
    textClass: 'text-ink-muted',
    icon: Eye,
  },
  TRIPWIRE: {
    label: 'TRIPWIRE HIT',
    meaning: 'Deterministic pattern matched outage indicator immediately.',
    borderClass: 'border-clay',
    bgClass: 'bg-clay-bg',
    textClass: 'text-clay',
    icon: ShieldAlert,
  },
  JUDGED: {
    label: 'EVALUATED BY CONSENSUS',
    meaning: 'Non-deterministic web extract evaluated through GenLayer validator consensus.',
    borderClass: 'border-primary',
    bgClass: 'bg-sage',
    textClass: 'text-sage-text',
    icon: Cpu,
  },
};

export const GateChip: React.FC<GateChipProps> = ({ gate, showMeaning = true }) => {
  const config = GATE_CONFIG[gate] || {
    label: gate || 'UNKNOWN',
    meaning: 'Settlement evaluation path',
    borderClass: 'border-sand-border',
    bgClass: 'bg-sand',
    textClass: 'text-ink-muted',
    icon: Cpu,
  };
  const Icon = config.icon;

  return (
    <div className="inline-flex flex-col gap-1 items-start">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-medium uppercase tracking-wide ${config.borderClass} ${config.bgClass} ${config.textClass}`}
        role="status"
        aria-label={`Evaluation Gate: ${config.label}`}
      >
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
        {config.label}
      </span>
      {showMeaning && (
        <span className="text-xs text-ink-muted max-w-sm">{config.meaning}</span>
      )}
    </div>
  );
};
