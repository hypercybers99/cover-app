import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  FileCheck,
  ExternalLink,
  Code,
  Info,
  Lock,
} from 'lucide-react';
import { CoverGuardReadClient, CoverReadClient } from '../services/readClient';
import { useWallet } from '../context/WalletContext';
import { ACTIVE_DEPLOYMENTS, GENLAYER_STUDIONET } from '../config/deployments';
import { TxStatusModal } from '../components/TxStatusModal';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import type { AttestationRecord, Policy, TxState } from '../types/contract';

export const CoverGuardPage: React.FC = () => {
  const { address, isConnected, walletClient } = useWallet();

  // Inputs
  const [selectedPolicyId, setSelectedPolicyId] = useState('1');
  const [targetAccount, setTargetAccount] = useState('');
  const [minCoverage, setMinCoverage] = useState(100);

  // Loaded Verified Policy State from Cover V2
  const [loadedPolicy, setLoadedPolicy] = useState<Policy | null>(null);
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  const [policyLoadError, setPolicyLoadError] = useState<string | null>(null);

  // Verification Results
  const [verifiedResult, setVerifiedResult] = useState<boolean | null>(null);
  const [attestationRecord, setAttestationRecord] = useState<AttestationRecord | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const [txState, setTxState] = useState<TxState>({ stage: 'idle' });

  // Load policy details whenever selectedPolicyId changes
  const loadPolicyDetails = async (pid: string) => {
    if (!pid || pid.trim() === '') return;
    setLoadingPolicy(true);
    setPolicyLoadError(null);
    setVerifiedResult(null);
    setAttestationRecord(null);
    try {
      const coverClient = new CoverReadClient();
      const pol = await coverClient.getPolicy(pid.trim());
      if (pol) {
        setLoadedPolicy(pol);
        if (!targetAccount) {
          setTargetAccount(pol.holder);
        }
        setMinCoverage(pol.coverage);
      } else {
        setLoadedPolicy(null);
        setPolicyLoadError(`Policy #${pid} not found on Cover contract.`);
      }
    } catch (err: any) {
      console.warn('Error reading policy:', err);
      setLoadedPolicy(null);
      setPolicyLoadError(err?.message || `Policy #${pid} does not exist.`);
    } finally {
      setLoadingPolicy(false);
    }
  };

  useEffect(() => {
    loadPolicyDetails(selectedPolicyId);
  }, []);

  // Set default target account when wallet connects
  useEffect(() => {
    if (isConnected && address && !targetAccount) {
      setTargetAccount(address);
    }
  }, [isConnected, address]);

  const handlePolicyChange = (pid: string) => {
    setSelectedPolicyId(pid);
    loadPolicyDetails(pid);
  };

  // Run the real 5-argument CoverGuard verification
  const handleVerify = async () => {
    if (!loadedPolicy) {
      setCheckError('Please select a valid policy first.');
      return;
    }
    const target = targetAccount.trim().toLowerCase();
    if (!target.startsWith('0x') || target.length !== 42) {
      setCheckError('Target account must be a valid 42-character 0x address.');
      return;
    }

    setCheckError(null);
    setChecking(true);
    setVerifiedResult(null);
    try {
      const guardClient = new CoverGuardReadClient();
      const result = await guardClient.isCoveredFor(
        target,
        loadedPolicy.id,
        loadedPolicy.product_id,
        loadedPolicy.terms_hash,
        minCoverage
      );
      setVerifiedResult(result);

      // Also query get_attestation(policy_id)
      const attest = await guardClient.getAttestation(loadedPolicy.id).catch(() => null);
      setAttestationRecord(attest);
    } catch (err: any) {
      console.error('Failed to verify with CoverGuard:', err);
      setCheckError(err?.message || 'Failed to query CoverGuard contract.');
    } finally {
      setChecking(false);
    }
  };

  const handleAttest = async () => {
    if (!walletClient || !loadedPolicy) return;
    try {
      const res = await walletClient.attestCoverGuard(loadedPolicy.id, setTxState);
      if (res.status === 'SUCCESS') {
        await handleVerify();
      }
    } catch (err) {
      console.error('Failed to submit attestation:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary text-primary-contrast flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-ink">CoverGuard V2 Gatekeeper</h1>
        </div>
        <p className="text-ink-muted">
          On-chain insurance gatekeeper with 5-parameter purchase-time term binding. Validates holder identity, policy ID, product ID, terms hash, and required coverage before granting protocol access.
        </p>
      </div>

      {/* Contract Details Card */}
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
          <a
            href={`${GENLAYER_STUDIONET.explorerUrl}/address/${ACTIVE_DEPLOYMENTS.cover.address}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline flex items-center gap-1 break-all sm:justify-end"
          >
            <span>{ACTIVE_DEPLOYMENTS.cover.address}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>
      </div>

      {/* Verification Query Form */}
      <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-6">
        <h2 className="text-xl font-bold text-ink">5-Parameter Policy-Bound Verification</h2>

        {checkError && (
          <div className="p-3 rounded-lg bg-brick-bg border border-brick text-brick text-sm">
            {checkError}
          </div>
        )}

        <div className="flex flex-col gap-5">
          {/* Step 1: Select Policy ID */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="policyIdInput" className="text-sm font-semibold text-ink">
              1. Policy ID to Verify
            </label>
            <div className="flex gap-2">
              <input
                id="policyIdInput"
                type="number"
                min="1"
                value={selectedPolicyId}
                onChange={(e) => handlePolicyChange(e.target.value)}
                placeholder="e.g. 1"
                className="w-32 px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => loadPolicyDetails(selectedPolicyId)}
                disabled={loadingPolicy}
                className="px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink text-sm font-semibold hover:bg-sand min-h-[44px]"
              >
                {loadingPolicy ? 'Loading...' : 'Load Policy Terms'}
              </button>
            </div>
            {policyLoadError && (
              <span className="text-xs text-brick">{policyLoadError}</span>
            )}
          </div>

          {/* Verified Policy Inputs (Read-Only from Cover V2) */}
          {loadedPolicy ? (
            <div className="p-4 rounded-lg bg-page border border-sand-border flex flex-col gap-3 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-sand-border">
                <span className="font-sans font-semibold text-ink flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span>Locked Terms Read from Cover Contract (Read-Only)</span>
                </span>
                <Link
                  to={`/policies/${loadedPolicy.id}`}
                  className="text-primary hover:underline font-sans font-medium flex items-center gap-1"
                >
                  <span>Inspect Policy #{loadedPolicy.id}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-ink-muted font-sans font-medium block">Product ID:</span>
                  <span className="text-ink font-bold">Product #{loadedPolicy.product_id}</span>
                </div>
                <div>
                  <span className="text-ink-muted font-sans font-medium block">Policy Status:</span>
                  <span className="text-ink font-bold">{loadedPolicy.status}</span>
                </div>
                <div>
                  <span className="text-ink-muted font-sans font-medium block">Policy Coverage:</span>
                  <span className="text-primary font-bold text-sm">{loadedPolicy.coverage} CR</span>
                </div>
                <div>
                  <span className="text-ink-muted font-sans font-medium block">Terms Hash:</span>
                  <span className="text-ink break-all text-[11px]">{loadedPolicy.terms_hash}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-page/50 border border-sand-border text-xs text-ink-muted flex items-center gap-2">
              <Info className="w-4 h-4 text-clay shrink-0" />
              <span>Enter a valid policy ID to populate read-only terms from the Cover contract.</span>
            </div>
          )}

          {/* User Inputs: Target Account and Min Coverage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-sand-border">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="targetAccount" className="text-sm font-semibold text-ink">
                  Target Account to Check (Holder)
                </label>
                {isConnected && address && (
                  <button
                    type="button"
                    onClick={() => setTargetAccount(address)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Use my address
                  </button>
                )}
              </div>
              <input
                id="targetAccount"
                type="text"
                value={targetAccount}
                onChange={(e) => setTargetAccount(e.target.value)}
                placeholder="0x..."
                className="px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink font-mono text-xs break-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="minCoverage" className="text-sm font-semibold text-ink">
                Min Required Coverage (CR)
              </label>
              <input
                id="minCoverage"
                type="number"
                min="1"
                value={minCoverage}
                onChange={(e) => setMinCoverage(Number(e.target.value))}
                className="px-4 py-2.5 rounded-lg border border-sand-border bg-page text-ink font-mono text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={checking || !loadedPolicy || !targetAccount}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-contrast font-semibold text-base hover:bg-primary-hover disabled:opacity-50 min-h-[48px]"
          >
            <Search className="w-5 h-5" />
            <span>{checking ? 'Evaluating 5-Arg Signature...' : 'Execute CoverGuard.is_covered_for(...) Check'}</span>
          </button>
        </div>

        {/* Real Boolean Result & Attestation Card */}
        {verifiedResult !== null && (
          <div className="pt-6 border-t border-sand-border flex flex-col gap-4">
            <div
              className={`p-5 rounded-lg border flex items-center justify-between ${
                verifiedResult
                  ? 'bg-sage border-primary/30 text-sage-text'
                  : 'bg-brick-bg border-brick/30 text-brick'
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase font-sans font-bold tracking-wider">
                  CoverGuard V2 Verification Outcome
                </span>
                <span className="text-2xl font-bold font-mono">
                  {verifiedResult ? 'VERIFIED: ACCESS GRANTED' : 'REJECTED: NOT COVERED'}
                </span>
                <span className="text-xs font-mono mt-1">
                  is_covered_for({targetAccount.slice(0, 8)}..., pol #{loadedPolicy?.id}, prod #{loadedPolicy?.product_id}, {loadedPolicy?.terms_hash.slice(0, 8)}..., {minCoverage}) -&gt; {String(verifiedResult)}
                </span>
              </div>
              {verifiedResult ? (
                <CheckCircle2 className="w-10 h-10 text-primary shrink-0" />
              ) : (
                <XCircle className="w-10 h-10 text-brick shrink-0" />
              )}
            </div>

            {/* Attestation Details & Action */}
            <div className="p-4 rounded-lg bg-page border border-sand-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1 text-xs font-mono">
                <span className="text-ink-muted uppercase font-sans font-semibold">
                  On-Chain Attestation Record (Policy #{loadedPolicy?.id})
                </span>
                {attestationRecord ? (
                  <div className="flex flex-col gap-0.5 text-ink">
                    <span>Attestation ID: #{attestationRecord.id}</span>
                    <span>Attester: {attestationRecord.attester}</span>
                    <span className="text-[11px] text-ink-muted break-all">
                      Evidence URL Hash: {attestationRecord.evidence_url_hash}
                    </span>
                  </div>
                ) : (
                  <span className="text-ink-muted">
                    No attestation yet recorded on CoverGuard for Policy #{loadedPolicy?.id}.
                  </span>
                )}
              </div>

              {isConnected && loadedPolicy && (
                <button
                  type="button"
                  onClick={handleAttest}
                  className="px-4 py-2.5 rounded-lg bg-primary text-primary-contrast font-medium hover:bg-primary-hover shrink-0 min-h-[48px] flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Attest Policy #{loadedPolicy.id}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Integration Code Snippets (Updated to 5-Argument Signature) */}
      <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
        <h3 className="text-lg font-bold text-ink flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          <span>Integration Code Snippets (5-Argument Signature)</span>
        </h3>
        <p className="text-xs text-ink-muted leading-relaxed">
          External intelligent contracts and decentralized applications call `is_covered_for` with all 5 purchase-time bound parameters:
        </p>

        {/* Python / Intelligent Contract Snippet */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink uppercase tracking-wide">
            Intelligent Contract (GenLayer Python):
          </span>
          <pre className="p-4 rounded-lg bg-page border border-sand-border font-mono text-xs text-ink overflow-x-auto">
{`# Connect to deployed CoverGuard V2 contract:
guard = gl.get_contract_at("${ACTIVE_DEPLOYMENTS.coverGuard.address}")

# 5-argument check: holder, policy_id, product_id, terms_hash, min_coverage
is_valid = guard.view().is_covered_for(
    user_address,
    policy_id,
    product_id,
    terms_hash,
    min_required_coverage
)
if not is_valid:
    raise gl.vm.UserError("Active coverage requirement not satisfied")`}
          </pre>
        </div>

        {/* TypeScript Client Snippet */}
        <div className="flex flex-col gap-1.5 mt-2">
          <span className="text-xs font-semibold text-ink uppercase tracking-wide">
            TypeScript / Frontend Web3:
          </span>
          <pre className="p-4 rounded-lg bg-page border border-sand-border font-mono text-xs text-ink overflow-x-auto">
{`import { createClient, chains } from 'genlayer-js';

const client = createClient({ chain: chains.studionet });
const isCovered = await client.readContract({
  address: '${ACTIVE_DEPLOYMENTS.coverGuard.address}',
  functionName: 'is_covered_for',
  args: [holderAddress, policyId, productId, termsHash, minCoverage],
});`}
          </pre>
        </div>
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
