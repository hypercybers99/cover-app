import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Scale, Cpu, Coins } from 'lucide-react';
import { CoverReadClient } from '../services/readClient';
import type { Limits } from '../types/contract';
import { DemoCreditNotice } from '../components/DemoCreditNotice';

export const LimitsPage: React.FC = () => {
  const [limits, setLimits] = useState<Limits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = async () => {
    setLoading(true);
    setError(null);
    try {
      const client = new CoverReadClient();
      const res = await client.getLimits();
      setLimits(res);
    } catch (err: any) {
      console.error('Failed to load contract limits:', err);
      setError(err?.message || 'Failed to read operational limits from contract.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Operational Limits & Boundaries</h1>
          <p className="text-ink-muted mt-1">
            Enforced directly on-chain by the Cover intelligent contract view <code className="font-mono">get_limits()</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLimits}
          className="p-2.5 rounded-lg border border-sand-border bg-sand hover:bg-sand-border/50 text-ink min-h-[44px] flex items-center gap-2 text-sm self-start"
          title="Refresh limits from contract"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-brick-bg border border-brick text-brick flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Limits */}
        <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-clay" />
            <h2 className="text-xl font-bold text-ink">Financial Bounds</h2>
          </div>
          <div className="flex flex-col gap-3 font-mono text-sm">
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Deposit Range:</span>
              <span className="font-bold text-ink">
                {limits ? `${limits.min_deposit} – ${limits.max_deposit.toLocaleString()} CR` : '...'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Coverage Range:</span>
              <span className="font-bold text-primary">
                {limits ? `${limits.min_coverage} – ${limits.max_coverage.toLocaleString()} CR` : '...'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-ink-muted font-sans font-medium">Annual Premium BPS:</span>
              <span className="font-bold text-ink">
                {limits ? `${limits.min_premium_bps} – ${limits.max_premium_bps} bps (${limits.min_premium_bps / 100}% – ${limits.max_premium_bps / 100}%)` : '...'}
              </span>
            </div>
          </div>
          <p className="text-xs text-ink-muted pt-2 border-t border-sand-border">
            Bounds prevent integer overflows and guarantee full reserve coverage for all active claims.
          </p>
        </div>

        {/* Temporal Limits */}
        <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-ink">Policy Duration</h2>
          </div>
          <div className="flex flex-col gap-3 font-mono text-sm">
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Minimum Duration:</span>
              <span className="font-bold text-ink">
                {limits ? `${limits.min_duration_days} Day` : '...'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Maximum Duration:</span>
              <span className="font-bold text-ink">
                {limits ? `${limits.max_duration_days} Days (1 Year)` : '...'}
              </span>
            </div>
          </div>
          <p className="text-xs text-ink-muted pt-2 border-t border-sand-border">
            Term limits restrict stale risk exposure and enable dynamic underwriting adjustments.
          </p>
        </div>

        {/* Text & URL Length Limits */}
        <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-ink">Input Length Boundaries</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
              <span className="font-sans font-medium text-ink-muted">Product Name:</span>
              <span className="text-base font-bold text-ink">
                {limits ? `${limits.name_min_len} – ${limits.name_max_len} chars` : '...'}
              </span>
              <span className="text-[10px] text-ink-muted">ASCII only</span>
            </div>

            <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
              <span className="font-sans font-medium text-ink-muted">Source URL:</span>
              <span className="text-base font-bold text-ink">
                {limits ? `Max ${limits.url_max_len} bytes` : '...'}
              </span>
              <span className="text-[10px] text-ink-muted">HTTPS, no ports or raw IPs</span>
            </div>

            <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
              <span className="font-sans font-medium text-ink-muted">Incident Rule Text:</span>
              <span className="text-base font-bold text-ink">
                {limits ? `${limits.rule_min_len} – ${limits.rule_max_len} chars` : '...'}
              </span>
              <span className="text-[10px] text-ink-muted">Bounded prompt injection guard</span>
            </div>
          </div>
          <p className="text-xs text-ink-muted pt-2 border-t border-sand-border">
            Bounded prompt sizes ensure deterministic prompt templating and consistent consensus voting among GenLayer validator nodes.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <DemoCreditNotice variant="inline" />
      </div>
    </div>
  );
};
