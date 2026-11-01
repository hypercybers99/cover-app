import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { CoverReadClient } from '../services/readClient';
import { useWallet } from '../context/WalletContext';
import { OutcomeStamp } from '../components/OutcomeStamp';
import { GateChip } from '../components/GateChip';
import { TxStatusModal } from '../components/TxStatusModal';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import type { Policy, Product, TxState } from '../types/contract';

export const PolicyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const policyId = Number(id);

  const { address, isConnected, walletClient } = useWallet();

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [txState, setTxState] = useState<TxState>({ stage: 'idle' });
  const [txTitle, setTxTitle] = useState('Transaction in Progress');

  const loadPolicyData = async () => {
    if (isNaN(policyId)) return;
    setLoading(true);
    setError(null);
    try {
      const client = new CoverReadClient();
      const pol = await client.getPolicy(policyId);
      setPolicy(pol);
      if (pol) {
        const prod = await client.getProduct(pol.product_id).catch(() => null);
        setProduct(prod);
      }
    } catch (err: any) {
      console.error('Failed to load policy:', err);
      setError(err?.message || 'Failed to load policy from contract.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicyData();
  }, [policyId]);

  const isBuyer =
    isConnected &&
    address &&
    policy &&
    address.toLowerCase() === policy.buyer.toLowerCase();

  const handleSettle = async () => {
    if (!walletClient) return;
    setTxTitle('Settling Policy Claim');
    const res = await walletClient.settlePolicy(policyId, setTxState);
    if (res.status === 'SUCCESS') {
      await loadPolicyData();
    }
  };

  const handleCancel = async () => {
    if (!walletClient) return;
    setTxTitle('Cancelling Policy');
    const res = await walletClient.cancelPolicy(policyId, setTxState);
    if (res.status === 'SUCCESS') {
      await loadPolicyData();
    }
  };

  const formatDate = (timestampSeconds: number) => {
    if (!timestampSeconds) return 'N/A';
    return new Date(timestampSeconds * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-ink-muted">Reading policy #{policyId}...</span>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-brick" />
        <h2 className="text-2xl font-bold text-ink">Policy Not Found</h2>
        <p className="text-ink-muted">{error || `Policy #${policyId} does not exist.`}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-contrast font-medium hover:bg-primary-hover min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Products</span>
        </Link>
      </div>
    );
  }

  const isExpired = Date.now() / 1000 >= policy.end_time;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Back Link */}
      <div>
        <Link
          to={product ? `/products/${product.id}` : '/products'}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product #{policy.product_id}</span>
        </Link>
      </div>

      {/* Main Policy Header Card */}
      <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-ink">Policy #{policy.id}</h1>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider ${
                policy.status === 'ACTIVE'
                  ? 'bg-sage text-sage-text border border-primary/20'
                  : policy.status === 'SETTLED'
                  ? 'bg-brick-bg text-brick border border-brick/20'
                  : 'bg-page text-ink-muted border border-sand-border'
              }`}
            >
              {policy.status}
            </span>
          </div>
          <DemoCreditNotice variant="inline" />
        </div>

        {product && (
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <span>Product:</span>
            <Link
              to={`/products/${product.id}`}
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>{product.name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Settlement Outcome Banner (If Settled) */}
      {policy.status === 'SETTLED' && (
        <div className="p-6 rounded-lg bg-page border-2 border-primary/30 flex flex-col gap-4 shadow-sm">
          <h2 className="text-xl font-bold text-ink">Settlement Adjudication</h2>
          <div className="flex flex-wrap items-center gap-6">
            <OutcomeStamp outcome={policy.outcome} size="lg" />
            <GateChip gate={policy.gate} />
          </div>
          {policy.settlement_tx_hash && (
            <div className="text-xs font-mono text-ink-muted flex items-center gap-2 pt-2 border-t border-sand-border">
              <span>Settlement Tx:</span>
              <span className="text-ink break-all">{policy.settlement_tx_hash}</span>
            </div>
          )}
        </div>
      )}

      {/* Policy Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coverage & Financials */}
        <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
          <h3 className="text-lg font-bold text-ink">Financial Terms</h3>
          <div className="flex flex-col gap-3 font-mono text-sm">
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Coverage Protected:</span>
              <span className="text-xl font-bold text-primary">{policy.coverage_amount} CR</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Premium Paid:</span>
              <span className="text-ink font-semibold">{policy.premium} CR</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Policyholder (Buyer):</span>
              <span className="text-xs text-ink">{policy.buyer}</span>
            </div>
          </div>
        </div>

        {/* Temporal Duration */}
        <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
          <h3 className="text-lg font-bold text-ink">Coverage Schedule</h3>
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex flex-col gap-1 py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Start Timestamp:</span>
              <span className="text-ink">{formatDate(policy.start_time)}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Expiration Timestamp:</span>
              <span className="text-ink">{formatDate(policy.end_time)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-ink-muted font-sans font-medium">Temporal Status:</span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  isExpired ? 'bg-clay-bg text-clay' : 'bg-sage text-sage-text'
                }`}
              >
                {isExpired ? 'EXPIRED' : 'ACTIVE TERM'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Observation Facts */}
      <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
        <h3 className="text-lg font-bold text-ink flex items-center gap-2">
          <FileText className="w-5 h-5 text-ink-muted" />
          <span>Observation & Consensus Facts</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
            <span className="font-sans font-semibold text-ink-muted">Creation Snapshot Hash:</span>
            <span className="break-all text-ink">{policy.initial_snapshot_hash || 'None'}</span>
          </div>
          <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
            <span className="font-sans font-semibold text-ink-muted">Settlement Observation Hash:</span>
            <span className="break-all text-ink">{policy.settlement_snapshot_hash || 'Unsettled'}</span>
          </div>
        </div>
      </div>

      {/* Actions (Settle & Cancel) */}
      {policy.status === 'ACTIVE' && (
        <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-ink">Execute Claim or Termination</h4>
            <p className="text-xs text-ink-muted">
              Consensus settlement evaluates web status. Cancellation refunds unspent term.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isBuyer && (
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-brick text-brick hover:bg-brick-bg font-semibold min-h-[48px]"
              >
                Cancel Policy
              </button>
            )}

            <button
              type="button"
              onClick={handleSettle}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary text-primary-contrast font-semibold hover:bg-primary-hover min-h-[48px]"
            >
              Trigger Settlement
            </button>
          </div>
        </div>
      )}

      <TxStatusModal
        state={txState}
        title={txTitle}
        onClose={() => setTxState({ stage: 'idle' })}
      />
    </div>
  );
};
