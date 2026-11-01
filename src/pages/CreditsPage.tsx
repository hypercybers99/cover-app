import React, { useState } from 'react';
import { Coins, RefreshCw, Wallet, Info } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { TxStatusModal } from '../components/TxStatusModal';
import type { TxState } from '../types/contract';

export const CreditsPage: React.FC = () => {
  const { address, isConnected, isConnecting, demoBalance, connectWallet, refreshBalance, walletClient } =
    useWallet();

  const [txState, setTxState] = useState<TxState>({ stage: 'idle' });
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    if (!walletClient) return;
    setClaiming(true);
    try {
      const res = await walletClient.claimDemoCredits(setTxState);
      if (res.status === 'SUCCESS') {
        await refreshBalance();
      }
    } catch (err) {
      console.error('Failed to claim demo credits:', err);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Page Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-ink">Demo Credits Faucet</h1>
        <p className="text-ink-muted">
          Acquire test credits on GenLayer studionet to underwrite pools and purchase parametric policies.
        </p>
      </div>

      {/* Primary Disclaimer Banner */}
      <div className="p-5 rounded-lg bg-sand border-2 border-clay/30 flex items-start gap-4">
        <Info className="w-6 h-6 text-clay shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-ink">Preview Environment Notice</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Credits are demo credits on GenLayer studionet, not money. They have no monetary value, cannot be redeemed for fiat or exchange-traded tokens, and exist solely to test intelligent contract consensus mechanics.
          </p>
        </div>
      </div>

      {/* Wallet Connection / Balance Card */}
      {!isConnected ? (
        <div className="p-8 rounded-lg bg-sand border border-sand-border flex flex-col items-center gap-4 text-center">
          <Wallet className="w-12 h-12 text-ink-muted" />
          <h2 className="text-xl font-bold text-ink">Connect Your Wallet</h2>
          <p className="text-ink-muted max-w-md">
            Connect MetaMask to view your balance and claim 1,000 demo credits directly from the Cover contract.
          </p>
          <button
            type="button"
            onClick={connectWallet}
            disabled={isConnecting}
            className="px-6 py-3 rounded-lg bg-primary text-primary-contrast font-semibold hover:bg-primary-hover min-h-[48px]"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      ) : (
        <div className="p-8 rounded-lg bg-sand border border-sand-border flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand-border">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-semibold text-ink-muted">
                Connected Address
              </span>
              <span className="font-mono text-sm sm:text-base text-ink break-all">
                {address}
              </span>
            </div>
            <button
              type="button"
              onClick={refreshBalance}
              className="p-2.5 rounded-lg border border-sand-border bg-page hover:bg-sand text-ink shrink-0 min-h-[44px] flex items-center gap-2 text-sm"
              title="Refresh Balance"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-semibold text-ink-muted">
                Current Balance
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono text-primary">
                  {demoBalance !== null ? demoBalance : '...'}
                </span>
                <span className="text-lg font-bold font-mono text-ink-muted">CR</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClaim}
              disabled={claiming || txState.stage === 'submitting' || txState.stage === 'pending_consensus'}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-contrast font-bold text-lg hover:bg-primary-hover disabled:opacity-50 min-h-[48px]"
            >
              <Coins className="w-5 h-5 text-sand" />
              <span>Claim 1,000 Demo Credits</span>
            </button>
          </div>
        </div>
      )}

      {/* Contract Integration Info */}
      <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-3 text-sm text-ink-muted">
        <h3 className="font-bold text-ink">Contract Accounting Invariant</h3>
        <p>
          Every demo credit minted on Cover increments the contract&apos;s internal ledger:
        </p>
        <code className="p-3 rounded bg-page border border-sand-border font-mono text-xs text-ink block">
          sum(user_balances) + sum(pool_balances) == total_minted
        </code>
        <p>
          This invariant is preserved across all mint, fund, purchase, settle, and refund execution paths.
        </p>
      </div>

      <TxStatusModal
        state={txState}
        title="Claiming Demo Credits"
        onClose={() => setTxState({ stage: 'idle' })}
      />
    </div>
  );
};
