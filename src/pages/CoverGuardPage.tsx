import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  FileCheck,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { CoverGuardReadClient } from '../services/readClient';
import { useWallet } from '../context/WalletContext';
import { ACTIVE_DEPLOYMENTS, GENLAYER_STUDIONET } from '../config/deployments';
import { TxStatusModal } from '../components/TxStatusModal';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import type { TxState } from '../types/contract';

export const CoverGuardPage: React.FC = () => {
  const { address, isConnected, walletClient } = useWallet();

  const [queryAddress, setQueryAddress] = useState('');
  const [minCoverage, setMinCoverage] = useState(10);
  const [isCovered, setIsCovered] = useState<boolean | null>(null);
  const [isCoveredForMin, setIsCoveredForMin] = useState<boolean | null>(null);
  const [attestationTime, setAttestationTime] = useState<number | null>(null);
  const [linkedCover, setLinkedCover] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  const [txState, setTxState] = useState<TxState>({ stage: 'idle' });

  // Load linked Cover on mount
  useEffect(() => {
    const client = new CoverGuardReadClient();
    client
      .getCoverContract()
      .then((addr) => setLinkedCover(addr))
      .catch((err) => console.error('Failed to read linked cover:', err));
  }, []);

  const handleLookup = async (addrToQuery?: string) => {
    const target = (addrToQuery || queryAddress).trim();
    if (!target.startsWith('0x') || target.length !== 42) {
      setQueryError('Please enter a valid 42-character Ethereum address (0x...)');
      return;
    }
    setQueryError(null);
    setChecking(true);
    try {
      const client = new CoverGuardReadClient();
      const [covered, coveredFor, attest] = await Promise.all([
        client.isCovered(target),
        client.isCoveredFor(target, minCoverage),
        client.getAttestation(target).catch(() => 0),
      ]);
      setIsCovered(covered);
      setIsCoveredForMin(coveredFor);
      setAttestationTime(attest);
    } catch (err: any) {
      console.error('Failed to query CoverGuard:', err);
      setQueryError(err?.message || 'Failed to query CoverGuard');
    } finally {
      setChecking(false);
    }
  };

  const handleUseMyAddress = () => {
    if (address) {
      setQueryAddress(address);
      handleLookup(address);
    }
  };

  const handleAttest = async () => {
    if (!walletClient || !queryAddress) return;
    try {
      const res = await walletClient.attestCoverGuard(queryAddress, setTxState);
      if (res.status === 'SUCCESS') {
        await handleLookup();
      }
    } catch (err) {
      console.error('Failed to submit attestation:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary text-primary-contrast flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-ink">CoverGuard Verification</h1>
        </div>
        <p className="text-ink-muted">
          On-chain insurance gatekeeper. Allows external protocols and smart contracts to verify that an account holds active parametric coverage before granting access.
        </p>
      </div>

      {/* Contract Details Pill */}
      <div className="p-4 rounded-lg bg-sand border border-sand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-col gap-0.5">
          <span className="text-ink-muted uppercase font-sans font-medium">CoverGuard Contract</span>
          <a
            href={`${GENLAYER_STUDIONET.explorerUrl}/address/${ACTIVE_DEPLOYMENTS.coverGuard.address}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline flex items-center gap-1 break-all"
          >
            <span>{ACTIVE_DEPLOYMENTS.coverGuard.address}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>
        <div className="flex flex-col gap-0.5 sm:text-right">
          <span className="text-ink-muted uppercase font-sans font-medium">Target Cover Contract</span>
          <span className="text-ink break-all">{linkedCover || ACTIVE_DEPLOYMENTS.cover.address}</span>
        </div>
      </div>

      {/* Query Form */}
      <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-6">
        <h2 className="text-xl font-bold text-ink">Check Address Coverage</h2>

        {queryError && (
          <div className="p-3 rounded-lg bg-brick-bg border border-brick text-brick text-sm">
            {queryError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="targetAddress" className="text-sm font-semibold text-ink">
                Wallet / Protocol Address
              </label>
              {isConnected && address && (
                <button
                  type="button"
                  onClick={handleUseMyAddress}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Use my connected address
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                id="targetAddress"
                type="text"
                value={queryAddress}
                onChange={(e) => setQueryAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink font-mono text-sm focus:border-primary"
              />
              <button
                type="button"
                onClick={() => handleLookup()}
                disabled={checking || !queryAddress}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-contrast font-semibold hover:bg-primary-hover disabled:opacity-50 shrink-0 min-h-[48px] flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{checking ? 'Checking...' : 'Verify'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label htmlFor="minCoverage" className="text-sm text-ink-muted font-medium">
              Minimum Required Coverage (CR):
            </label>
            <input
              id="minCoverage"
              type="number"
              min="1"
              value={minCoverage}
              onChange={(e) => setMinCoverage(Number(e.target.value))}
              className="w-28 px-3 py-1.5 rounded-lg border border-sand-border bg-page text-ink font-mono text-sm"
            />
          </div>
        </div>

        {/* Results Display */}
        {isCovered !== null && (
          <div className="pt-6 border-t border-sand-border flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Check 1: is_covered */}
              <div
                className={`p-4 rounded-lg border flex items-center justify-between ${
                  isCovered
                    ? 'bg-sage border-primary/30 text-sage-text'
                    : 'bg-brick-bg border-brick/30 text-brick'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs uppercase font-sans font-bold">Active Coverage</span>
                  <span className="text-lg font-bold font-mono">
                    {isCovered ? 'COVERED' : 'NOT COVERED'}
                  </span>
                </div>
                {isCovered ? <CheckCircle2 className="w-8 h-8 text-primary" /> : <XCircle className="w-8 h-8 text-brick" />}
              </div>

              {/* Check 2: is_covered_for */}
              <div
                className={`p-4 rounded-lg border flex items-center justify-between ${
                  isCoveredForMin
                    ? 'bg-sage border-primary/30 text-sage-text'
                    : 'bg-brick-bg border-brick/30 text-brick'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs uppercase font-sans font-bold">
                    &ge; {minCoverage} CR Liquidity
                  </span>
                  <span className="text-lg font-bold font-mono">
                    {isCoveredForMin ? 'SUFFICIENT' : 'INSUFFICIENT'}
                  </span>
                </div>
                {isCoveredForMin ? (
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                ) : (
                  <XCircle className="w-8 h-8 text-brick" />
                )}
              </div>
            </div>

            {/* Attestation info & submit button */}
            <div className="p-4 rounded-lg bg-page border border-sand-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-ink-muted">
                  On-Chain Attestation Status
                </span>
                <span className="text-sm font-mono text-ink">
                  {attestationTime && attestationTime > 0
                    ? `Attested on-chain at timestamp ${attestationTime} (${new Date(attestationTime * 1000).toLocaleString()})`
                    : 'No prior attestation recorded on CoverGuard for this address.'}
                </span>
              </div>

              {isConnected && isCovered && (
                <button
                  type="button"
                  onClick={handleAttest}
                  className="px-4 py-2.5 rounded-lg bg-primary text-primary-contrast font-medium hover:bg-primary-hover shrink-0 min-h-[48px] flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Attest on CoverGuard</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Integration Guide */}
      <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-3">
        <h3 className="text-lg font-bold text-ink flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          <span>Integration in Intelligent Contracts</span>
        </h3>
        <p className="text-sm text-ink-muted leading-relaxed">
          Smart contracts on GenLayer can call CoverGuard views before executing actions:
        </p>
        <pre className="p-4 rounded-lg bg-page border border-sand-border font-mono text-xs text-ink overflow-x-auto">
{`# In an external GenLayer contract:
guard = gl.get_contract_instance(cover_guard_address)

# Enforce active coverage before proceeding:
if not guard.is_covered_for(user_address, 100):
    raise gl.vm.UserError("Active coverage of at least 100 CR required")`}
        </pre>
      </div>

      <div className="flex justify-end">
        <DemoCreditNotice variant="inline" />
      </div>

      <TxStatusModal
        state={txState}
        title="CoverGuard Attestation"
        onClose={() => setTxState({ stage: 'idle' })}
      />
    </div>
  );
};
