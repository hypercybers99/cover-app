import React, { useEffect, useState } from 'react';
import { ExternalLink, Copy, Check, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { GENLAYER_STUDIONET } from '../config/deployments';
import { formatUserError } from '../lib/errors';
import type { TxState } from '../types/contract';

interface TxStatusModalProps {
  state: TxState;
  title?: string;
  onClose: () => void;
}

export const TxStatusModal: React.FC<TxStatusModalProps> = ({
  state,
  title = 'Transaction in Progress',
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (state.stage === 'idle') {
      setElapsedSeconds(0);
      return;
    }
    if (state.stage === 'submitting' || state.stage === 'pending_consensus') {
      const interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    // Completed stages preserve final elapsed time or state
  }, [state.stage]);

  if (state.stage === 'idle') {
    return null;
  }

  const handleCopyHash = () => {
    if (state.txHash) {
      navigator.clipboard.writeText(state.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isTerminal = state.stage === 'finalized' || state.stage === 'user_error' || state.stage === 'failed';
  const explorerUrl = state.txHash ? `${GENLAYER_STUDIONET.explorerUrl}/tx/${state.txHash}` : null;

  const errorDetails = state.errorMessage ? formatUserError(state.errorMessage) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-modal-title"
    >
      <div className="w-full max-w-lg bg-page border-2 border-sand-border rounded-lg shadow-xl p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sand-border pb-3">
          <h2 id="tx-modal-title" className="text-xl font-bold text-ink">
            {title}
          </h2>
          {isTerminal && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-sand focus-visible:outline-none"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Status Stage Indicator */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-sand border border-sand-border">
          {state.stage === 'submitting' && (
            <>
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <div>
                <p className="font-semibold text-ink">Submitting to GenLayer</p>
                <p className="text-sm text-ink-muted">Awaiting local wallet signature...</p>
              </div>
            </>
          )}

          {state.stage === 'pending_consensus' && (
            <>
              <Loader2 className="w-6 h-6 text-clay animate-spin" />
              <div>
                <p className="font-semibold text-ink">Validating Consensus</p>
                <p className="text-sm text-ink-muted">Studionet validator set evaluating contract...</p>
              </div>
            </>
          )}

          {state.stage === 'finalized' && (
            <>
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold text-primary">Transaction Succeeded</p>
                <p className="text-sm text-ink-muted">State updated on GenLayer studionet.</p>
              </div>
            </>
          )}

          {state.stage === 'user_error' && (
            <>
              <AlertCircle className="w-6 h-6 text-brick" />
              <div>
                <p className="font-semibold text-brick">Contract Rule Rejected</p>
                <p className="text-sm text-ink-muted">The contract returned an expected user rejection.</p>
              </div>
            </>
          )}

          {state.stage === 'failed' && (
            <>
              <AlertCircle className="w-6 h-6 text-brick" />
              <div>
                <p className="font-semibold text-brick">Transaction Execution Failed</p>
                <p className="text-sm text-ink-muted">Studionet execution or consensus failure.</p>
              </div>
            </>
          )}
        </div>

        {/* Elapsed Timer */}
        <div className="flex items-center justify-between text-sm px-1">
          <span className="text-ink-muted">Elapsed Time:</span>
          <span className="font-mono font-semibold text-ink">{elapsedSeconds}s</span>
        </div>

        {/* Transaction Hash */}
        {state.txHash && (
          <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-sand border border-sand-border">
            <span className="text-xs font-semibold text-ink-muted uppercase">Transaction Hash</span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs break-all select-all text-ink">
                {state.txHash}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="p-1.5 rounded-lg hover:bg-page text-ink-muted hover:text-ink min-h-[36px]"
                  title="Copy transaction hash"
                  aria-label="Copy transaction hash"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </button>
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg hover:bg-page text-ink-muted hover:text-ink min-h-[36px] flex items-center"
                    title="View on GenLayer Explorer"
                    aria-label="View on GenLayer Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Detail Display */}
        {errorDetails && (
          <div className="p-4 rounded-lg bg-brick-bg border border-brick flex flex-col gap-2">
            <div className="flex items-center gap-2 text-brick font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorDetails.title}</span>
            </div>
            <p className="text-sm text-ink">{errorDetails.explanation}</p>
            {errorDetails.action && (
              <p className="text-xs text-ink-muted italic">
                Suggestion: {errorDetails.action}
              </p>
            )}
            <details className="mt-1 text-xs text-ink-muted">
              <summary className="cursor-pointer font-mono">Raw error message</summary>
              <pre className="mt-1 p-2 bg-page rounded border border-sand-border whitespace-pre-wrap font-mono text-[11px]">
                {state.errorMessage}
              </pre>
            </details>
          </div>
        )}

        {/* Modal Actions */}
        {isTerminal && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover min-h-[48px]"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
