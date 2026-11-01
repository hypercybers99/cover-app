import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, AlertCircle, Info } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { validateCreateProductInput } from '../lib/validators';
import { TxStatusModal } from '../components/TxStatusModal';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import type { TxState } from '../types/contract';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { walletClient, isConnected, connectWallet } = useWallet();

  const [formData, setFormData] = useState({
    name: 'CloudFlare Status Cover',
    sourceUrl: 'https://www.cloudflarestatus.com',
    ruleText: 'Report 100% outage when Major Outage banner is present across all core edge points.',
    threshold100: 90,
    threshold50: 50,
    threshold25: 25,
    premiumBps: 500, // 5%
    initialDeposit: 100,
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [txState, setTxState] = useState<TxState>({ stage: 'idle' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation mirroring contract
    const validation = validateCreateProductInput({
      name: formData.name,
      sourceUrl: formData.sourceUrl,
      ruleText: formData.ruleText,
      payout100Threshold: formData.threshold100,
      payout50Threshold: formData.threshold50,
      payout25Threshold: formData.threshold25,
      premiumBps: formData.premiumBps,
      initialDeposit: formData.initialDeposit,
    });

    if (!validation.valid) {
      setValidationError(validation.error || 'Form validation failed');
      return;
    }

    if (!walletClient || !isConnected) {
      setValidationError('Please connect your browser wallet first.');
      return;
    }

    try {
      const res = await walletClient.createProduct(
        formData.name,
        formData.sourceUrl,
        formData.ruleText,
        formData.threshold100,
        formData.threshold50,
        formData.threshold25,
        formData.premiumBps,
        formData.initialDeposit,
        (state) => setTxState(state)
      );

      if (res.status === 'SUCCESS') {
        setTimeout(() => {
          navigate('/products');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to create product:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Back link */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-ink">Create Coverage Product</h1>
        <p className="text-ink-muted">
          Define an index product linked to an HTTPS status page with automated payout thresholds.
        </p>
      </div>

      {/* Validation or Wallet Warning */}
      {validationError && (
        <div className="p-4 rounded-lg bg-brick-bg border border-brick text-brick flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {!isConnected && (
        <div className="p-4 rounded-lg bg-sand border border-sand-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-ink">
            <Info className="w-5 h-5 text-clay shrink-0" />
            <span className="text-sm">Connect wallet to underwrite and deploy this product pool.</span>
          </div>
          <button
            type="button"
            onClick={connectWallet}
            className="px-4 py-2 rounded-lg bg-primary text-primary-contrast font-medium hover:bg-primary-hover min-h-[48px]"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 rounded-lg bg-sand border border-sand-border">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-semibold text-ink">
            Product Name (3–64 ASCII characters)
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink focus:border-primary"
            placeholder="e.g. AWS US-East Status Cover"
          />
        </div>

        {/* Source URL */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sourceUrl" className="text-sm font-semibold text-ink">
            Status Page URL (HTTPS only, &lt;256 bytes)
          </label>
          <input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            required
            value={formData.sourceUrl}
            onChange={handleChange}
            className="px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink focus:border-primary font-mono text-sm"
            placeholder="https://example.com/status"
          />
          <span className="text-xs text-ink-muted">
            Must be pure HTTPS without port, user credentials, fragments, or raw IP literals.
          </span>
        </div>

        {/* Rule Text */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ruleText" className="text-sm font-semibold text-ink">
            Incident Rule Text (10–1000 characters)
          </label>
          <textarea
            id="ruleText"
            name="ruleText"
            rows={3}
            required
            value={formData.ruleText}
            onChange={handleChange}
            className="px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink focus:border-primary text-sm"
            placeholder="Describe the condition that constitutes an incident..."
          />
        </div>

        {/* Payout Thresholds */}
        <div className="flex flex-col gap-2 pt-2 border-t border-sand-border">
          <span className="text-sm font-semibold text-ink">
            Payout Thresholds (Ordered: 100% &ge; 50% &ge; 25%)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="threshold100" className="text-xs font-medium text-ink-muted">
                100% Payout Threshold (1–100)
              </label>
              <input
                id="threshold100"
                name="threshold100"
                type="number"
                min="1"
                max="100"
                value={formData.threshold100}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg border border-sand-border bg-page text-ink font-mono"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="threshold50" className="text-xs font-medium text-ink-muted">
                50% Payout Threshold (1–100)
              </label>
              <input
                id="threshold50"
                name="threshold50"
                type="number"
                min="1"
                max="100"
                value={formData.threshold50}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg border border-sand-border bg-page text-ink font-mono"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="threshold25" className="text-xs font-medium text-ink-muted">
                25% Payout Threshold (1–100)
              </label>
              <input
                id="threshold25"
                name="threshold25"
                type="number"
                min="1"
                max="100"
                value={formData.threshold25}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg border border-sand-border bg-page text-ink font-mono"
              />
            </div>
          </div>
        </div>

        {/* Premium BPS and Initial Deposit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-sand-border">
          <div className="flex flex-col gap-1">
            <label htmlFor="premiumBps" className="text-sm font-semibold text-ink">
              Annual Premium BPS (1–10,000)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="premiumBps"
                name="premiumBps"
                type="number"
                min="1"
                max="10000"
                value={formData.premiumBps}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink font-mono"
              />
              <span className="text-sm text-ink-muted font-mono shrink-0">
                = {(formData.premiumBps / 100).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="initialDeposit" className="text-sm font-semibold text-ink">
              Initial Deposit (Demo Credits)
            </label>
            <input
              id="initialDeposit"
              name="initialDeposit"
              type="number"
              min="1"
              value={formData.initialDeposit}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink font-mono"
            />
            <span className="text-xs text-ink-muted">
              Transferred from your demo credits to seed pool liquidity.
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={txState.stage === 'submitting' || txState.stage === 'pending_consensus'}
          className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-contrast font-semibold text-lg hover:bg-primary-hover disabled:opacity-50 min-h-[48px]"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{isConnected ? 'Deploy Coverage Pool' : 'Connect Wallet & Deploy'}</span>
        </button>

        <div className="flex justify-end">
          <DemoCreditNotice variant="inline" />
        </div>
      </form>

      {/* Transaction Modal */}
      <TxStatusModal
        state={txState}
        title="Deploying Coverage Product"
        onClose={() => setTxState({ stage: 'idle' })}
      />
    </div>
  );
};
