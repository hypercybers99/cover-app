import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  FileText,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { CoverReadClient, getSettlement } from '../services/readClient';
import { useWallet } from '../context/WalletContext';
import { OutcomeStamp } from '../components/OutcomeStamp';
import { GateChip } from '../components/GateChip';
import { TxStatusModal } from '../components/TxStatusModal';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import type { Policy, Product, SettlementRecord, TxState } from '../types/contract';

export const PolicyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const policyId = String(id);

  const { address, isConnected, walletClient } = useWallet();

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [settlement, setSettlement] = useState<SettlementRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [txState, setTxState] = useState<TxState>({ stage: 'idle' });
  const [txTitle, setTxTitle] = useState('Transaction in Progress');

  const loadPolicyData = async () => {
    if (!policyId) return;
    setLoading(true);
    setError(null);
    try {
      const client = new CoverReadClient();
      const pol = await client.getPolicy(policyId);
      setPolicy(pol);
      if (pol) {
        const prod = await client.getProduct(pol.product_id).catch(() => null);
        setProduct(prod);

        if (pol.settlement_id && pol.settlement_id !== '' && pol.settlement_id !== '0') {
          const sett = await getSettlement(pol.settlement_id).catch(() => null);
          setSettlement(sett);
        }
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

  const isHolder =
    isConnected &&
    address &&
    policy &&
    address.toLowerCase() === policy.holder.toLowerCase();

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
                  ? 'bg-primary/20 text-primary border border-primary/30'
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

      {/* Purchase-Time Binding Guarantee Banner */}
      <div className="p-4 rounded-lg bg-page border border-primary/30 flex items-start gap-3">
        <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-ink">
            Purchase-Time Binding Guarantee
          </p>
          <p className="text-xs text-ink-muted leading-relaxed">
            These terms were locked at purchase and cannot change, even if the product's underlying URL or limits are later updated.
            Settlement is strictly adjudicated against the purchase-time evidence source URL and terms hash.
          </p>
        </div>
      </div>

      {/* Settlement Outcome Banner (If Settled) */}
      {policy.status === 'SETTLED' && settlement && (
        <div className="p-6 rounded-lg bg-page border-2 border-primary/40 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink">Settlement Adjudication (Settlement #{settlement.id})</h2>
            <span className="text-xs font-mono text-ink-muted">Settlement ID: {settlement.id}</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <OutcomeStamp outcome={settlement.outcome as any} size="lg" />
            <GateChip gate={settlement.gate as any} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono pt-3 border-t border-sand-border">
            <div>
              <span className="text-ink-muted font-sans font-medium block">Payout Distributed:</span>
              <span className="text-base font-bold text-primary">{policy.payout} CR</span>
            </div>
            <div>
              <span className="text-ink-muted font-sans font-medium block">Outage Detected:</span>
              <span className="text-base font-semibold text-ink">{settlement.minutes} min</span>
            </div>
            <div>
              <span className="text-ink-muted font-sans font-medium block">Tripwire Triggered:</span>
              <span className="text-base font-semibold text-ink">{settlement.tripwire}</span>
            </div>
          </div>
          {settlement.quote && (
            <div className="text-xs font-mono bg-sand/60 p-3 rounded border border-sand-border text-ink break-words">
              <span className="text-ink-muted block font-sans font-semibold mb-1">Adjudication Quote:</span>
              "{settlement.quote}"
            </div>
          )}
        </div>
      )}

      {/* Policy-Bound Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Terms */}
        <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
          <h3 className="text-lg font-bold text-ink">Financial Terms</h3>
          <div className="flex flex-col gap-3 font-mono text-sm">
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Coverage Limit:</span>
              <span className="text-xl font-bold text-primary">{policy.coverage} CR</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Premium Paid:</span>
              <span className="text-ink font-semibold">{policy.premium} CR</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Premium Rate:</span>
              <span className="text-ink font-semibold">
                {policy.premium_bps} bps ({(policy.premium_bps / 100).toFixed(2)}%)
              </span>
            </div>
            <div className="flex flex-col gap-1 py-2">
              <span className="text-ink-muted font-sans font-medium">Policyholder (Buyer):</span>
              <span className="text-xs text-ink break-all">{policy.holder}</span>
            </div>
          </div>
        </div>

        {/* Bound Source & Rules */}
        <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
          <h3 className="text-lg font-bold text-ink">Bound Policy Terms</h3>
          <div className="flex flex-col gap-3 text-xs font-mono">
            <div className="flex flex-col gap-1 py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">Coverage Term:</span>
              <span className="text-ink font-semibold text-sm">Open until settled or cancelled</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">100% Payout Threshold:</span>
              <span className="text-ink font-semibold">&ge; {policy.min_full_outage_minutes} minutes</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sand-border">
              <span className="text-ink-muted font-sans font-medium">50% Partial Threshold:</span>
              <span className="text-ink font-semibold">&ge; {policy.min_half_outage_minutes} minutes</span>
            </div>
            <div className="flex flex-col gap-1 py-2">
              <span className="text-ink-muted font-sans font-medium">Inception Hash16:</span>
              <span className="text-ink break-all">{policy.buy_norm_hash16}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Evidence URL & Terms Hash */}
      <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
        <h3 className="text-lg font-bold text-ink flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <span>Locked Evidence Source & Terms Hash</span>
        </h3>
        <div className="flex flex-col gap-3 font-mono text-xs">
          <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
            <span className="font-sans font-semibold text-ink-muted">Locked Evidence Source URL:</span>
            <a
              href={policy.evidence_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline break-all flex items-center gap-1.5"
            >
              <span>{policy.evidence_url}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
          <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
            <span className="font-sans font-semibold text-ink-muted">Terms Hash (SHA-256):</span>
            <span className="break-all text-ink">{policy.terms_hash}</span>
          </div>
          <div className="p-3 rounded bg-page border border-sand-border flex flex-col gap-1">
            <span className="font-sans font-semibold text-ink-muted">Deterministic Decision Rule:</span>
            <span className="text-ink font-mono">{policy.decision_rule}</span>
          </div>
        </div>
      </div>

      {/* Actions (Settle & Cancel) */}
      {policy.status === 'ACTIVE' && (
        <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-ink">Execute Claim or Cancellation</h4>
            <p className="text-xs text-ink-muted">
              Triggering settlement executes decentralized web extraction against the bound source URL.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isHolder && (
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
