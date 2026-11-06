import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Coins,
  ExternalLink,
  AlertCircle,
  ShoppingCart,
  Lock,
  History,
  CheckCircle2,
} from 'lucide-react';
import { CoverReadClient, quotePremium } from '../services/readClient';
import { useWallet } from '../context/WalletContext';
import { TxStatusModal } from '../components/TxStatusModal';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import type { Product, Policy, TxState } from '../types/contract';
import {
  validateBuyPolicyInput,
  validateFundPoolInput,
  validateWithdrawPoolInput,
  validateUpdateSourceUrlInput,
  generateDecisionRuleSentence,
} from '../lib/validators';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = String(id);

  const { address, isConnected, walletClient } = useWallet();

  const [product, setProduct] = useState<Product | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buy Form State (No duration or days - open until settled or cancelled)
  const [buyCoverage, setBuyCoverage] = useState(100);
  const [quotedPremium, setQuotedPremium] = useState<number | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  // Underwriter Action States
  const [fundAmount, setFundAmount] = useState(100);
  const [fundError, setFundError] = useState<string | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState(50);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [sourceError, setSourceError] = useState<string | null>(null);

  const [txState, setTxState] = useState<TxState>({ stage: 'idle' });
  const [txTitle, setTxTitle] = useState('Transaction in Progress');

  const readClient = useMemo(() => new CoverReadClient(), []);

  const loadData = async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const [prod, pols] = await Promise.all([
        readClient.getProduct(productId),
        readClient.getProductPolicies(productId).catch(() => []),
      ]);
      setProduct(prod);
      setPolicies(pols);
      if (prod) {
        setNewSourceUrl(prod.url);
      }
    } catch (err: any) {
      console.error('Failed to load product details:', err);
      setError(err?.message || 'Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [productId]);

  // Real-time Premium Calculation
  useEffect(() => {
    let active = true;
    if (!product || buyCoverage <= 0) {
      setQuotedPremium(null);
      return;
    }
    quotePremium(buyCoverage, product.premium_bps)
      .then((prem) => {
        if (active) setQuotedPremium(prem);
      })
      .catch(() => {
        if (active) setQuotedPremium(null);
      });

    return () => {
      active = false;
    };
  }, [productId, buyCoverage, product]);

  const isCreator =
    isConnected &&
    address &&
    product &&
    address.toLowerCase() === product.creator.toLowerCase();

  const availableLiquidity = product ? Math.max(0, product.pool_balance - product.reserved) : 0;

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuyError(null);

    const val = validateBuyPolicyInput(buyCoverage, undefined, availableLiquidity);
    if (!val.valid) {
      setBuyError(val.error || 'Invalid coverage request.');
      return;
    }

    if (!walletClient || !isConnected) {
      setBuyError('Connect wallet to buy policy.');
      return;
    }

    setTxTitle('Purchasing Protection Policy');
    const res = await walletClient.buyPolicy(productId, buyCoverage, setTxState);
    if (res.status === 'SUCCESS') {
      await loadData();
    }
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setFundError(null);

    const val = validateFundPoolInput(fundAmount);
    if (!val.valid) {
      setFundError(val.error || 'Invalid deposit amount.');
      return;
    }

    if (!walletClient || !isConnected) {
      setFundError('Connect wallet first.');
      return;
    }

    setTxTitle('Funding Product Pool');
    const res = await walletClient.fundPool(productId, fundAmount, setTxState);
    if (res.status === 'SUCCESS') {
      await loadData();
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);

    const val = validateWithdrawPoolInput(withdrawAmount, availableLiquidity);
    if (!val.valid) {
      setWithdrawError(val.error || 'Invalid withdrawal amount.');
      return;
    }

    if (!walletClient || !isConnected) {
      setWithdrawError('Connect wallet first.');
      return;
    }

    setTxTitle('Withdrawing Unreserved Capital');
    const res = await walletClient.withdrawPool(productId, withdrawAmount, setTxState);
    if (res.status === 'SUCCESS') {
      await loadData();
    }
  };

  const handleUpdateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSourceError(null);

    const val = validateUpdateSourceUrlInput(newSourceUrl);
    if (!val.valid) {
      setSourceError(val.error || 'Invalid source URL.');
      return;
    }

    if (!walletClient || !isConnected) {
      setSourceError('Connect wallet first.');
      return;
    }

    setTxTitle('Updating Product Evidence Source');
    const res = await walletClient.updateSourceUrl(productId, newSourceUrl, setTxState);
    if (res.status === 'SUCCESS') {
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-ink-muted">Reading product #{productId}...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-brick" />
        <h2 className="text-2xl font-bold text-ink">Product Not Found</h2>
        <p className="text-ink-muted">{error || `Product #${productId} does not exist.`}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-contrast font-medium hover:bg-primary-hover min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const updateCount = Math.max(0, (product.source_history?.length || 1) - 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Back Link */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Main Product Header Card */}
      <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-ink">{product.name}</h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-page text-ink-muted border border-sand-border">
                Product #{product.id}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <span>Creator:</span>
              <span className="font-mono text-xs text-ink">{product.creator}</span>
            </div>
          </div>
          <DemoCreditNotice variant="inline" />
        </div>

        {/* Source URL Display with External Link */}
        <div className="flex flex-col gap-1 text-xs font-mono pt-3 border-t border-sand-border">
          <span className="font-sans font-semibold text-ink-muted">Active Evidence Source URL:</span>
          <a
            href={product.url}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline break-all flex items-center gap-1.5 text-sm"
          >
            <span>{product.url}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>

        {/* Source Update History Badge */}
        {updateCount > 0 ? (
          <div className="p-3.5 rounded-lg bg-page border border-primary/30 flex items-start gap-3">
            <History className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-ink">
                Source updated {updateCount} {updateCount === 1 ? 'time' : 'times'}. Policies bought before an update remain bound to their purchase-time source.
              </span>
              <div className="mt-1 flex flex-col gap-1 font-mono text-[11px] text-ink-muted">
                {product.source_history.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-sand font-bold">
                      {idx === product.source_history.length - 1 ? 'Current' : `v${idx + 1}`}
                    </span>
                    <span className="break-all">{url}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-ink-muted flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Source unchanged from inception terms.</span>
          </div>
        )}

        {/* High-level Pool Capital Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-sand-border font-mono">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-ink-muted font-sans">Pool Capital</span>
            <span className="text-xl font-bold text-ink">{product.pool_balance} CR</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-ink-muted font-sans">Reserved (Active)</span>
            <span className="text-xl font-bold text-clay">{product.reserved} CR</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-ink-muted font-sans">Free Underwriting</span>
            <span className="text-xl font-bold text-primary">{availableLiquidity} CR</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-ink-muted font-sans">Policies Issued</span>
            <span className="text-xl font-bold text-ink">{product.policy_count}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Buy Policy + Policies Table vs Settlement Specs + Liquidity Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Purchase Form & Policies */}
        <div className="flex flex-col gap-6">
          {/* Purchase Cover Form */}
          <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-ink">Buy Coverage</h2>
            </div>

            {buyError && (
              <div className="p-3 rounded bg-brick-bg border border-brick text-brick text-xs">
                {buyError}
              </div>
            )}

            <form onSubmit={handleBuy} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="buyCoverage" className="text-sm font-semibold text-ink">
                  Coverage Amount (Demo Credits)
                </label>
                <input
                  id="buyCoverage"
                  type="number"
                  min="1"
                  max={availableLiquidity}
                  value={buyCoverage}
                  onChange={(e) => setBuyCoverage(Number(e.target.value))}
                  className="px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink font-mono"
                />
                <span className="text-xs text-ink-muted">
                  Max available in pool: {availableLiquidity} CR
                </span>
              </div>

              {/* Term Duration Card */}
              <div className="p-3.5 rounded-lg bg-page border border-sand-border flex flex-col gap-1 text-xs">
                <span className="font-semibold text-ink">Coverage Term:</span>
                <span className="text-ink-muted">
                  Open until settled or cancelled. There is no artificial clock expiry.
                </span>
              </div>

              {/* Quoted Premium Summary */}
              <div className="p-4 rounded-lg bg-page border border-sand-border flex flex-col gap-2 font-mono text-sm">
                <div className="flex justify-between items-center text-xs text-ink-muted font-sans">
                  <span>Premium Rate:</span>
                  <span className="font-mono">{product.premium_bps} bps ({(product.premium_bps / 100).toFixed(2)}%)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-sand-border font-bold">
                  <span className="font-sans">Quoted Premium:</span>
                  <span className="text-lg text-primary">
                    {quotedPremium !== null ? `${quotedPremium} CR` : 'Calculating...'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isConnected || availableLiquidity <= 0 || buyCoverage > availableLiquidity}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-contrast font-semibold hover:bg-primary-hover disabled:opacity-50 min-h-[48px]"
              >
                <Shield className="w-5 h-5" />
                <span>
                  {isConnected
                    ? availableLiquidity <= 0
                      ? 'Pool Liquidity Exhausted'
                      : 'Purchase Protection'
                    : 'Connect Wallet to Purchase'}
                </span>
              </button>
            </form>
          </div>

          {/* Active Policies Table for this Product */}
          <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
            <h3 className="text-lg font-bold text-ink">
              Policies on this Product ({policies.length})
            </h3>
            {policies.length === 0 ? (
              <p className="text-sm text-ink-muted">No policies issued on this product yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-page border-b border-sand-border">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Holder</th>
                      <th className="p-2.5">Coverage</th>
                      <th className="p-2.5">Premium</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-border">
                    {policies.map((pol) => (
                      <tr key={pol.id} className="hover:bg-page/50">
                        <td className="p-2.5 font-bold">#{pol.id}</td>
                        <td className="p-2.5">
                          {pol.holder.slice(0, 6)}...{pol.holder.slice(-4)}
                        </td>
                        <td className="p-2.5 font-bold text-primary">{pol.coverage} CR</td>
                        <td className="p-2.5">{pol.premium} CR</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold uppercase text-[10px] ${
                              pol.status === 'ACTIVE'
                                ? 'bg-sage text-sage-text'
                                : pol.status === 'SETTLED'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-sand text-ink-muted'
                            }`}
                          >
                            {pol.status}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <Link
                            to={`/policies/${pol.id}`}
                            className="text-primary hover:underline font-sans font-medium"
                          >
                            Inspect
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settlement Specs & Underwriting Controls */}
        <div className="flex flex-col gap-6">
          {/* Rule Specs Card */}
          <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
            <h3 className="text-lg font-bold text-ink">Settlement Specifications</h3>
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase font-semibold text-ink-muted">Deterministic Decision Rule:</span>
              <p className="text-xs text-ink font-mono bg-page p-3 rounded border border-sand-border leading-relaxed break-all">
                {product.decision_rule}
              </p>
              <p className="text-xs text-ink-muted">
                {generateDecisionRuleSentence(product.min_full, product.min_half)}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-sand-border">
              <span className="text-xs uppercase font-semibold text-ink-muted">Thresholds:</span>
              <div className="grid grid-cols-2 gap-3 text-center font-mono text-xs">
                <div className="p-3 rounded bg-page border border-sand-border">
                  <div className="text-[11px] text-ink-muted font-sans font-medium">100% Full Payout</div>
                  <div className="font-bold text-primary text-sm mt-1">&ge; {product.min_full} min</div>
                </div>
                <div className="p-3 rounded bg-page border border-sand-border">
                  <div className="text-[11px] text-ink-muted font-sans font-medium">50% Partial Payout</div>
                  <div className="font-bold text-clay text-sm mt-1">&ge; {product.min_half} min</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-2 border-t border-sand-border text-xs font-mono">
              <span className="text-ink-muted font-sans font-semibold">Terms Hash (SHA-256):</span>
              <span className="text-ink break-all text-[11px]">{product.terms_hash}</span>
            </div>
          </div>

          {/* Underwriter Management Card */}
          <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-5">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Coins className="w-5 h-5 text-clay" />
              <span>Pool Liquidity Controls</span>
            </h3>

            {/* Fund Pool Form */}
            <form onSubmit={handleFund} className="flex flex-col gap-2">
              <label htmlFor="fundAmount" className="text-xs font-semibold text-ink">
                Add Liquidity (Any Underwriter)
              </label>
              {fundError && <span className="text-xs text-brick">{fundError}</span>}
              <div className="flex gap-2">
                <input
                  id="fundAmount"
                  type="number"
                  min="1"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-sand-border bg-page text-ink font-mono text-sm"
                  placeholder="Amount"
                />
                <button
                  type="submit"
                  disabled={!isConnected}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-contrast text-sm font-semibold hover:bg-primary-hover shrink-0 min-h-[44px]"
                >
                  Fund
                </button>
              </div>
            </form>

            {/* Creator-only Actions */}
            {isCreator ? (
              <div className="flex flex-col gap-5 pt-3 border-t border-sand-border">
                {/* Withdraw Form */}
                <form onSubmit={handleWithdraw} className="flex flex-col gap-2">
                  <label htmlFor="withdrawAmount" className="text-xs font-semibold text-ink">
                    Withdraw Liquidity (Creator Only)
                  </label>
                  {withdrawError && <span className="text-xs text-brick">{withdrawError}</span>}
                  <div className="flex gap-2">
                    <input
                      id="withdrawAmount"
                      type="number"
                      min="1"
                      max={availableLiquidity}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-sand-border bg-page text-ink font-mono text-sm"
                      placeholder="Amount"
                    />
                    <button
                      type="submit"
                      disabled={availableLiquidity <= 0}
                      className="px-4 py-2 rounded-lg border border-sand-border text-ink text-sm font-semibold hover:bg-page shrink-0 min-h-[44px]"
                    >
                      Withdraw
                    </button>
                  </div>
                  <span className="text-[11px] text-ink-muted">
                    Unreserved available: {availableLiquidity} CR
                  </span>
                </form>

                {/* Update Source URL Form */}
                <form onSubmit={handleUpdateSource} className="flex flex-col gap-2">
                  <label htmlFor="newSourceUrl" className="text-xs font-semibold text-ink">
                    Update Source URL (Creator Only)
                  </label>
                  <span className="text-[11px] text-ink-muted">
                    Must share exact host and directory path as original terms. Affects only policies bought afterwards.
                  </span>
                  {sourceError && <span className="text-xs text-brick">{sourceError}</span>}
                  <div className="flex gap-2">
                    <input
                      id="newSourceUrl"
                      type="url"
                      required
                      value={newSourceUrl}
                      onChange={(e) => setNewSourceUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-sand-border bg-page text-ink font-mono text-xs"
                      placeholder="https://..."
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-primary text-primary-contrast text-sm font-semibold hover:bg-primary-hover shrink-0 min-h-[44px]"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-3 rounded bg-page border border-sand-border text-xs text-ink-muted flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-ink-muted" />
                <span>
                  Withdrawal and source updating controls are restricted to the product creator.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <TxStatusModal
        state={txState}
        title={txTitle}
        onClose={() => setTxState({ stage: 'idle' })}
      />
    </div>
  );
};
