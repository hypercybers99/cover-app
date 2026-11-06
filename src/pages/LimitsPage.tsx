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
              <span className="text-ink-muted font-sans font-medium">Faucet Allotment:</span>
              <span className="font-bold text-ink">
                {limits ? `${limits.demo_credits.toLocaleString()} CR` : '...'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Coverage Range:</span>
              <span className="font-bold text-primary">
                {limits ? `${limits.min_coverage} – ${limits.max_coverage.toLocaleString()} CR` : '...'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-ink-muted font-sans font-medium">Premium Rate Bounds:</span>
              <span className="font-bold text-ink">
                100 – 5,000 bps (1.00% – 50.00%)
              </span>
            </div>
          </div>
          <p className="text-xs text-ink-muted pt-2 border-t border-sand-border">
            Bounds prevent integer overflows and guarantee full reserve coverage for all active claims.
          </p>
        </div>

        {/* Coverage Term & Settlement Schedule */}
        <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-ink">Coverage Term & Thresholds</h2>
          </div>
          <div className="flex flex-col gap-3 font-mono text-sm">
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Policy Term:</span>
              <span className="font-bold text-primary text-xs">
                Open until settled or cancelled
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Full Outage Threshold:</span>
              <span className="font-bold text-ink">
                2 – 10,080 minutes (7 days)
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-ink-muted font-sans font-medium">Partial Outage Threshold:</span>
              <span className="font-bold text-ink">
                1 to (min_full - 1) min
              </span>
            </div>
          </div>
          <p className="text-xs text-ink-muted pt-2 border-t border-sand-border">
            Policies remain active indefinitely until settled or cancelled. No artificial expiration clocks.
          </p>
        </div>

        {/* Web Extraction & Protocol Boundaries */}
        <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-ink">Decentralized Web Extraction Boundaries</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
              <span className="font-sans font-medium text-ink-muted">Max Web Page Size:</span>
              <span className="text-base font-bold text-ink">
                {limits ? `${(limits.max_page_bytes / 1000).toFixed(0)} KB` : '...'}
              </span>
              <span className="text-[10px] text-ink-muted">Contract rejects pages &gt; 400KB</span>
            </div>

            <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
              <span className="font-sans font-medium text-ink-muted">Min Extracted Text:</span>
              <span className="text-base font-bold text-ink">
                {limits ? `${limits.min_text_chars} chars` : '...'}
              </span>
              <span className="text-[10px] text-ink-muted">Prevents unreadable status pages</span>
            </div>

            <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
              <span className="font-sans font-medium text-ink-muted">Max List Limit:</span>
              <span className="text-base font-bold text-ink">
                {limits ? `${limits.max_list_limit} items` : '...'}
              </span>
              <span className="text-[10px] text-ink-muted">Bounded query pagination</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs pt-2 border-t border-sand-border">
            <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
              <span className="font-sans font-medium text-ink-muted">Product Name Length:</span>
              <span className="text-sm font-bold text-ink">3 – 60 ASCII characters</span>
            </div>
            <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
              <span className="font-sans font-medium text-ink-muted">Source URL Length:</span>
              <span className="text-sm font-bold text-ink">1 – 300 ASCII characters (HTTPS only)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <DemoCreditNotice variant="inline" />
      </div>
    </div>
  );
};
