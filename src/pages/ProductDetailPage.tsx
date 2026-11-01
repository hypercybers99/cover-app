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
} from 'lucide-react';
import { CoverReadClient } from '../services/readClient';
import { useWallet } from '../context/WalletContext';
import { TxStatusModal } from '../components/TxStatusModal';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import type { Product, Policy, TxState } from '../types/contract';
import { validateBuyPolicyInput, validateFundPoolInput, validateWithdrawPoolInput, validateUpdateSourceUrlInput } from '../lib/validators';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { address, isConnected, walletClient } = useWallet();

  const [product, setProduct] = useState<Product | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buy Form State
  const [buyCoverage, setBuyCoverage] = useState(100);
  const [buyDays, setBuyDays] = useState(30);
  const [quotedPremium, setQuotedPremium] = useState<number | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  // Creator Action States
  const [fundAmount, setFundAmount] = useState(50);
  const [fundError, setFundError] = useState<string | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState(50);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [sourceError, setSourceError] = useState<string | null>(null);

  const [txState, setTxState] = useState<TxState>({ stage: 'idle' });
  const [txTitle, setTxTitle] = useState('Transaction in Progress');

  const readClient = useMemo(() => new CoverReadClient(), []);

  const loadData = async () => {
    if (isNaN(productId)) return;
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
        setNewSourceUrl(prod.source_url);
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
    if (!product || isNaN(productId) || buyCoverage <= 0 || buyDays <= 0) {
      setQuotedPremium(null);
      return;
    }

    readClient
      .quotePremium(productId, buyCoverage, buyDays)
      .then((quote) => {
        if (active) setQuotedPremium(quote);
      })
      .catch(() => {
        if (active) setQuotedPremium(null);
      });

    return () => {
      active = false;
    };
  }, [productId, buyCoverage, buyDays, product, readClient]);

  const isCreator =
    isConnected &&
    address &&
    product &&
    address.toLowerCase() === product.creator.toLowerCase();

  const availableLiquidity = product ? Math.max(0, product.pool_balance - product.reserved) : 0;

  // Handlers
  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuyError(null);

    const val = validateBuyPolicyInput(buyCoverage, buyDays, availableLiquidity);
    if (!val.valid) {
      setBuyError(val.error || 'Invalid buy parameters');
      return;
    }

    if (!walletClient) {
      setBuyError('Wallet not connected');
      return;
    }

    setTxTitle('Purchasing Parametric Policy');
    const res = await walletClient.buyPolicy(productId, buyCoverage, buyDays, setTxState);
    if (res.status === 'SUCCESS') {
      await loadData();
    }
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setFundError(null);

    const val = validateFundPoolInput(fundAmount);
    if (!val.valid) {
      setFundError(val.error || 'Invalid fund amount');
      return;
    }

    if (!walletClient) return;
    setTxTitle('Adding Pool Liquidity');
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
      setWithdrawError(val.error || 'Invalid withdrawal amount');
      return;
    }

    if (!walletClient) return;
    setTxTitle('Withdrawing Pool Liquidity');
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
      setSourceError(val.error || 'Invalid URL');
      return;
    }

    if (!walletClient) return;
    setTxTitle('Updating Source URL');
    const res = await walletClient.updateSourceUrl(productId, newSourceUrl, setTxState);
    if (res.status === 'SUCCESS') {
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-ink-muted">Loading product #{productId}...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center gap-4 text-center">
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Top Navigation */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Product Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg bg-sand border border-sand-border">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-page text-xs font-mono uppercase text-ink-muted border border-sand-border">
              Product #{product.id}
            </span>
            {isCreator && (
              <span className="px-2.5 py-0.5 rounded bg-sage text-xs font-semibold text-sage-text border border-primary/20">
                You are the Creator
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-ink">{product.name}</h1>
          <p className="font-mono text-xs text-ink-muted break-all">
            Monitored Source: <a href={product.source_url} target="_blank" rel="noreferrer" className="text-primary underline inline-flex items-center gap-1">{product.source_url} <ExternalLink className="w-3 h-3" /></a>
          </p>
        </div>

        {/* Pool Stat Badges */}
        <div className="grid grid-cols-3 gap-3 text-center font-mono bg-page p-3 rounded-lg border border-sand-border shrink-0">
          <div>
            <div className="text-[11px] text-ink-muted uppercase font-sans">Pool Total</div>
            <div className="text-lg font-bold text-ink">{product.pool_balance} CR</div>
          </div>
          <div>
            <div className="text-[11px] text-ink-muted uppercase font-sans">Reserved</div>
            <div className="text-lg font-bold text-clay">{product.reserved} CR</div>
          </div>
          <div>
            <div className="text-[11px] text-ink-muted uppercase font-sans">Available</div>
            <div className="text-lg font-bold text-primary">{availableLiquidity} CR</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Purchase Cover & Product Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Purchase Policy Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <span>Purchase Parametric Cover</span>
              </h2>
              <DemoCreditNotice variant="inline" />
            </div>

            {buyError && (
              <div className="p-3 rounded-lg bg-brick-bg border border-brick text-brick text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{buyError}</span>
              </div>
            )}

            <form onSubmit={handleBuy} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="buyCoverage" className="text-sm font-semibold text-ink">
                    Desired Coverage (Demo Credits)
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
                    Max available liquidity: {availableLiquidity} CR
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="buyDays" className="text-sm font-semibold text-ink">
                    Coverage Duration (Days)
                  </label>
                  <input
                    id="buyDays"
                    type="number"
                    min="1"
                    max="365"
                    value={buyDays}
                    onChange={(e) => setBuyDays(Number(e.target.value))}
                    className="px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink font-mono"
                  />
                  <span className="text-xs text-ink-muted">Range: 1 to 365 days</span>
                </div>
              </div>

              {/* Quotation Preview */}
              <div className="p-4 rounded-lg bg-page border border-sand-border flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-semibold text-ink-muted">
                    Calculated Premium
                  </span>
                  <div className="text-2xl font-bold font-mono text-primary">
                    {quotedPremium !== null ? `${quotedPremium} CR` : 'Calculating...'}
                  </div>
                </div>
                <div className="text-right text-xs text-ink-muted">
                  <div>Rate: {(product.premium_bps / 100).toFixed(2)}% / yr</div>
                  <div>Coverage: {buyCoverage} CR</div>
                </div>
              </div>

              {/* Action */}
              <button
                type="submit"
                disabled={
                  !isConnected ||
                  availableLiquidity <= 0 ||
                  buyCoverage > availableLiquidity ||
                  txState.stage === 'submitting' ||
                  txState.stage === 'pending_consensus'
                }
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-contrast font-semibold text-lg hover:bg-primary-hover disabled:opacity-50 min-h-[48px]"
              >
                <Shield className="w-5 h-5" />
                <span>
                  {availableLiquidity <= 0
                    ? 'Pool Liquidity Exhausted'
                    : isConnected
                    ? 'Confirm & Purchase Policy'
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
                      <th className="p-2.5">Buyer</th>
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
                          {pol.buyer.slice(0, 6)}...{pol.buyer.slice(-4)}
                        </td>
                        <td className="p-2.5 font-bold text-primary">{pol.coverage_amount} CR</td>
                        <td className="p-2.5">{pol.premium} CR</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold uppercase text-[10px] ${
                              pol.status === 'ACTIVE'
                                ? 'bg-sage text-sage-text'
                                : pol.status === 'SETTLED'
                                ? 'bg-brick-bg text-brick'
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

        {/* Right Column: Rule Text & Underwriter Actions */}
        <div className="flex flex-col gap-6">
          {/* Rule Specs Card */}
          <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
            <h3 className="text-lg font-bold text-ink">Settlement Specs</h3>
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase font-semibold text-ink-muted">Incident Rule:</span>
              <p className="text-sm text-ink bg-page p-3 rounded border border-sand-border leading-relaxed">
                {product.rule_text}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-sand-border">
              <span className="text-xs uppercase font-semibold text-ink-muted">Thresholds:</span>
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div className="p-2 rounded bg-page border border-sand-border">
                  <div className="text-[10px] text-ink-muted">100% Pay</div>
                  <div className="font-bold text-brick">&ge; {product.payout_100_threshold}%</div>
                </div>
                <div className="p-2 rounded bg-page border border-sand-border">
                  <div className="text-[10px] text-ink-muted">50% Pay</div>
                  <div className="font-bold text-clay">&ge; {product.payout_50_threshold}%</div>
                </div>
                <div className="p-2 rounded bg-page border border-sand-border">
                  <div className="text-[10px] text-ink-muted">25% Pay</div>
                  <div className="font-bold text-clay">&ge; {product.payout_25_threshold}%</div>
                </div>
              </div>
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
                      className="px-4 py-2 rounded-lg bg-clay text-white text-sm font-semibold hover:opacity-90 shrink-0 min-h-[44px]"
                    >
                      Withdraw
                    </button>
                  </div>
                  <span className="text-[11px] text-ink-muted">
                    Max withdrawable: {availableLiquidity} CR
                  </span>
                </form>

                {/* Update Source URL Form */}
                <form onSubmit={handleUpdateSource} className="flex flex-col gap-2">
                  <label htmlFor="newSourceUrl" className="text-xs font-semibold text-ink">
                    Update Source URL (Creator Only)
                  </label>
                  {sourceError && <span className="text-xs text-brick">{sourceError}</span>}
                  <div className="flex flex-col gap-2">
                    <input
                      id="newSourceUrl"
                      type="url"
                      value={newSourceUrl}
                      onChange={(e) => setNewSourceUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-sand-border bg-page text-ink font-mono text-xs"
                      placeholder="https://..."
                    />
                    <button
                      type="submit"
                      className="w-full px-4 py-2 rounded-lg bg-primary text-primary-contrast text-sm font-semibold hover:bg-primary-hover min-h-[44px]"
                    >
                      Save New Source URL
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-page border border-sand-border text-xs text-ink-muted flex items-start gap-2">
                <Lock className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
                <span>
                  Withdrawal and URL reconfiguration are reserved for the pool creator ({product.creator.slice(0, 6)}...{product.creator.slice(-4)}).
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
