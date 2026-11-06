import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import {
  validateCreateProductInput,
  DECISION_RULE_V2,
  COVERAGE_TERM_V2,
  GITHUB_FIXTURE_PRESETS,
  generateDecisionRuleSentence,
} from '../lib/validators';
import { TxStatusModal } from '../components/TxStatusModal';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import type { TxState } from '../types/contract';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { walletClient, isConnected, connectWallet } = useWallet();

  const [formData, setFormData] = useState({
    name: 'Nimbus Cloud Status Cover',
    sourceUrl: GITHUB_FIXTURE_PRESETS[0].url, // s0: Operational Baseline
    minFullOutageMinutes: 30, // 30 min default
    minHalfOutageMinutes: 15, // 15 min default
    premiumBps: 500, // 5% default
    initialDeposit: 400,
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [fundingErrorState, setFundingErrorState] = useState<{
    productId: string;
    errorMessage: string;
  } | null>(null);
  const [txState, setTxState] = useState<TxState>({ stage: 'idle' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    setValidationError(null);
    setFundingErrorState(null);
  };

  const handlePresetSelect = (url: string) => {
    setFormData((prev) => ({ ...prev, sourceUrl: url }));
    setValidationError(null);
    setFundingErrorState(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFundingErrorState(null);

    // Client-side validation mirroring contract
    const validation = validateCreateProductInput({
      name: formData.name,
      sourceUrl: formData.sourceUrl,
      payout100Threshold: formData.minFullOutageMinutes,
      payout50Threshold: formData.minHalfOutageMinutes,
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
        formData.minFullOutageMinutes,
        formData.minHalfOutageMinutes,
        formData.premiumBps,
        formData.initialDeposit,
        (state) => setTxState(state)
      );

      if (res.status === 'PARTIAL_FUND_FAILED') {
        setFundingErrorState({
          productId: res.productId || '1',
          errorMessage: res.fundError || 'Deposit transaction failed to confirm',
        });
      } else if (res.status === 'SUCCESS') {
        const targetId = res.productId || '1';
        setTimeout(() => {
          navigate(`/products/${targetId}`);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to create product:', err);
      setValidationError(err?.message || 'Transaction submission failed');
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
          Define a verifiable index product backed by deterministic terms and multi-validator web extractions on GenLayer Studionet.
        </p>
      </div>

      {/* Validation Warning */}
      {validationError && (
        <div className="p-4 rounded-lg bg-brick-bg border border-brick text-brick flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Funding Warning Banner */}
      {fundingErrorState && (
        <div className="p-5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-ink flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink">
                Product #{fundingErrorState.productId} was created on-chain, but initial pool funding failed:
              </p>
              <p className="text-sm font-mono text-ink-muted mt-1">{fundingErrorState.errorMessage}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Link
              to={`/products/${fundingErrorState.productId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-contrast font-medium text-sm hover:bg-primary-hover min-h-[44px]"
            >
              <span>Fund Product #{fundingErrorState.productId}</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
            <span className="text-xs text-ink-muted">
              You can fund this pool at any time from its management page.
            </span>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="p-4 rounded-lg bg-sand border border-sand-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-ink">
            <Info className="w-5 h-5 text-clay shrink-0" />
            <span className="text-sm">Connect your wallet to deploy and underwrite this coverage pool.</span>
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
            Service Name (3–60 ASCII characters)
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink focus:border-primary text-sm"
            placeholder="e.g. Nimbus Cloud Status Cover"
          />
        </div>

        {/* Evidence Source URL & Fixture Picker */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="sourceUrl" className="text-sm font-semibold text-ink">
              Evidence Source URL (HTTPS endpoint, &le;300 ASCII characters)
            </label>
            <span className="text-xs text-ink-muted">GitHub Raw or Custom HTTPS</span>
          </div>

          {/* Fixture Preset Picker */}
          <div className="p-3 rounded-lg bg-page border border-sand-border flex flex-col gap-2">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">
              Tested Fixture Presets (Studionet Pinned):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GITHUB_FIXTURE_PRESETS.map((preset) => (
                <button
                  key={preset.code}
                  type="button"
                  onClick={() => handlePresetSelect(preset.url)}
                  className={`text-left px-3 py-2 rounded border text-xs flex flex-col gap-0.5 transition-colors ${
                    formData.sourceUrl === preset.url
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-sand-border hover:border-ink-muted text-ink'
                  }`}
                >
                  <span className="font-mono">{preset.label}</span>
                  <span className="text-[11px] text-ink-muted line-clamp-1">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            required
            value={formData.sourceUrl}
            onChange={handleChange}
            className="px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink focus:border-primary font-mono text-xs break-all"
            placeholder="https://raw.githubusercontent.com/..."
          />
          <span className="text-xs text-ink-muted">
            Must be pure HTTPS without port, user credentials, fragments, or raw IP literals.
          </span>
        </div>

        {/* Outage Thresholds */}
        <div className="flex flex-col gap-2 pt-2 border-t border-sand-border">
          <span className="text-sm font-semibold text-ink">
            Outage Payout Thresholds
          </span>
          <span className="text-xs text-ink-muted">
            Ordered threshold requirement: 1 &le; Partial Outage Threshold &lt; Full Outage Threshold &le; 10,080 minutes.
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
            <div className="flex flex-col gap-1">
              <label htmlFor="minFullOutageMinutes" className="text-xs font-medium text-ink-muted">
                Full Payout Threshold (minutes)
              </label>
              <input
                id="minFullOutageMinutes"
                name="minFullOutageMinutes"
                type="number"
                min="2"
                max="10080"
                value={formData.minFullOutageMinutes}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg border border-sand-border bg-page text-ink font-mono"
              />
              <span className="text-[11px] text-ink-muted">Default: 30 minutes (100% coverage payout)</span>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="minHalfOutageMinutes" className="text-xs font-medium text-ink-muted">
                Partial Payout Threshold (minutes)
              </label>
              <input
                id="minHalfOutageMinutes"
                name="minHalfOutageMinutes"
                type="number"
                min="1"
                max={formData.minFullOutageMinutes - 1}
                value={formData.minHalfOutageMinutes}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg border border-sand-border bg-page text-ink font-mono"
              />
              <span className="text-[11px] text-ink-muted">Default: 15 minutes (50% coverage payout)</span>
            </div>
          </div>
        </div>

        {/* Read-Only Deterministic Decision Rule Preview */}
        <div className="p-4 rounded-lg bg-page border border-sand-border flex flex-col gap-2">
          <div className="flex items-center gap-2 text-ink">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Deterministic Decision Rule (On-Chain Preview)
            </span>
          </div>
          <div className="p-3 rounded bg-sand/60 border border-sand-border font-mono text-xs text-ink break-all">
            {DECISION_RULE_V2}
          </div>
          <div className="text-[11px] text-ink-muted flex flex-col gap-1">
            <p>
              <span className="font-semibold text-ink">Evaluated with selected thresholds:</span>{' '}
              {generateDecisionRuleSentence(formData.minFullOutageMinutes, formData.minHalfOutageMinutes)}
            </p>
            <p>
              <span className="font-semibold text-ink">Coverage Term:</span>{' '}
              {COVERAGE_TERM_V2} (Open until settled or cancelled).
            </p>
          </div>
        </div>

        {/* Premium BPS and Initial Deposit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-sand-border">
          <div className="flex flex-col gap-1">
            <label htmlFor="premiumBps" className="text-sm font-semibold text-ink">
              Premium Rate (100–5,000 bps)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="premiumBps"
                name="premiumBps"
                type="number"
                min="100"
                max="5000"
                value={formData.premiumBps}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink font-mono"
              />
              <span className="text-sm text-ink-muted font-mono shrink-0">
                = {(formData.premiumBps / 100).toFixed(2)}%
              </span>
            </div>
            <span className="text-xs text-ink-muted">Default: 500 bps (5.00%).</span>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="initialDeposit" className="text-sm font-semibold text-ink">
              Initial Pool Deposit (Demo Credits)
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
              Transferred from your demo credits to seed pool underwriting liquidity.
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
