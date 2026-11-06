import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import {
  PROMPT_SHA256,
  PARSE_EXTRACTION_SHA256,
  BALANCE_SNAPSHOTS_V2,
  TRANSACTION_MATRIX_V2,
  ROBUSTNESS_ITER0,
  ROBUSTNESS_ITER1,
  ROBUSTNESS_ITER2,
} from '../data/evidenceSummary';
import { ACTIVE_DEPLOYMENTS, GENLAYER_STUDIONET } from '../config/deployments';
import { DemoCreditNotice } from '../components/DemoCreditNotice';

export const EvidencePage: React.FC = () => {
  const [filterTx, setFilterTx] = useState<string>('ALL');

  const filteredTx =
    filterTx === 'ALL'
      ? TRANSACTION_MATRIX_V2
      : TRANSACTION_MATRIX_V2.filter((tx) =>
          filterTx === 'SUCCESS' ? tx.expected_success : !tx.expected_success
        );

  const pages = ['s1', 's2', 's3', 's4', 's5', 's7'];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10 overflow-x-hidden">
      {/* Title & Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary text-primary-contrast flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-ink">Contract Verification & Evidence</h1>
        </div>
        <p className="text-ink-muted">
          Complete transparent audit trail of deployments, invariant balance snapshots, transaction executions, and multi-validator robustness iterations on GenLayer Studionet.
        </p>
      </div>

      {/* Deployments & Source Invariants */}
      <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Active Production Contracts (V2)</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sage text-sage-text border border-primary/20">
            ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-page border border-sand-border flex flex-col gap-1.5">
            <span className="font-sans font-bold text-ink">Cover Intelligent Contract (Active V2)</span>
            <a
              href={`${GENLAYER_STUDIONET.explorerUrl}/address/${ACTIVE_DEPLOYMENTS.cover.address}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline break-all flex items-center gap-1"
            >
              <span>{ACTIVE_DEPLOYMENTS.cover.address}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <span className="text-ink-muted text-[11px] pt-1 border-t border-sand-border">
              Source SHA-256: {ACTIVE_DEPLOYMENTS.cover.sourceSha256}
            </span>
            <a
              href={`${GENLAYER_STUDIONET.explorerUrl}/tx/${ACTIVE_DEPLOYMENTS.cover.deployTx}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline text-[11px] break-all flex items-center gap-1"
            >
              <span>Deploy Tx: {ACTIVE_DEPLOYMENTS.cover.deployTx}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            </a>
          </div>

          <div className="p-4 rounded-lg bg-page border border-sand-border flex flex-col gap-1.5">
            <span className="font-sans font-bold text-ink">CoverGuard Contract (Active V2)</span>
            <a
              href={`${GENLAYER_STUDIONET.explorerUrl}/address/${ACTIVE_DEPLOYMENTS.coverGuard.address}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline break-all flex items-center gap-1"
            >
              <span>{ACTIVE_DEPLOYMENTS.coverGuard.address}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <span className="text-ink-muted text-[11px] pt-1 border-t border-sand-border">
              Source SHA-256: {ACTIVE_DEPLOYMENTS.coverGuard.sourceSha256}
            </span>
            <a
              href={`${GENLAYER_STUDIONET.explorerUrl}/tx/${ACTIVE_DEPLOYMENTS.coverGuard.deployTx}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline text-[11px] break-all flex items-center gap-1"
            >
              <span>Deploy Tx: {ACTIVE_DEPLOYMENTS.coverGuard.deployTx}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            </a>
          </div>
        </div>

        {/* Prompt & Parser Byte-for-Byte Fidelity Note */}
        <div className="p-4 rounded-lg bg-page border border-sand-border flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Extraction Prompt & Parser Byte-Fidelity Guarantee</span>
          </div>
          <p className="text-ink-muted leading-relaxed">
            The decentralized web extraction prompt and parser were preserved byte-for-byte between V1 and V2 deployments:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="p-2 rounded bg-sand/60 border border-sand-border">
              <span className="font-sans text-ink-muted block font-medium">Prompt SHA-256:</span>
              <span className="break-all text-ink">{PROMPT_SHA256}</span>
            </div>
            <div className="p-2 rounded bg-sand/60 border border-sand-border">
              <span className="font-sans text-ink-muted block font-medium">Parse Extraction SHA-256:</span>
              <span className="break-all text-ink">{PARSE_EXTRACTION_SHA256}</span>
            </div>
          </div>
        </div>

        {/* Superseded Deployments Table */}
        <div className="pt-2 border-t border-sand-border flex flex-col gap-3">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
            Superseded Deployments (Preserved for Audit History)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-page border-b border-sand-border">
                <tr>
                  <th className="p-2.5 font-sans">Version</th>
                  <th className="p-2.5 font-sans">Cover Contract</th>
                  <th className="p-2.5 font-sans">CoverGuard Contract</th>
                  <th className="p-2.5 font-sans">Status</th>
                  <th className="p-2.5 font-sans">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-border">
                {ACTIVE_DEPLOYMENTS.supersededList.map((sup, idx) => (
                  <tr key={idx} className="hover:bg-page/50">
                    <td className="p-2.5 font-bold">{sup.version}</td>
                    <td className="p-2.5">
                      <a
                        href={sup.explorerUrlCover}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 break-all"
                      >
                        <span>{sup.cover}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </td>
                    <td className="p-2.5">
                      <a
                        href={sup.explorerUrlGuard}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 break-all"
                      >
                        <span>{sup.coverGuard}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-page text-ink-muted border border-sand-border">
                        SUPERSEDED
                      </span>
                    </td>
                    <td className="p-2.5 font-sans text-ink-muted text-[11px]">{sup.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Balance Snapshots Across Scenarios S1-S5 */}
      <div className="p-4 sm:p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-ink">Conservation of Balance Invariant (V2 On-Chain Scenarios)</h2>
            <p className="text-xs text-ink-muted">
              Asserts: <code className="font-mono">underwriter + buyer + pool_1 + pool_2 == total_minted</code> (2,000 CR) and <code className="font-mono">reserved &lt;= pool_balance</code> across all scenario transitions.
            </p>
          </div>
          <DemoCreditNotice variant="inline" />
        </div>

        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-page border-b border-sand-border">
              <tr>
                <th className="p-2.5">Scenario Transition</th>
                <th className="p-2.5">Underwriter</th>
                <th className="p-2.5">Buyer</th>
                <th className="p-2.5">Pool 1 (Balance/Res)</th>
                <th className="p-2.5">Pool 2 (Balance/Res)</th>
                <th className="p-2.5">Total Minted</th>
                <th className="p-2.5">Invariant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border">
              {BALANCE_SNAPSHOTS_V2.map((snap, idx) => {
                const p1 = snap.pool_1_balance ?? snap.pool_balance ?? 0;
                const p1r = snap.pool_1_reserved ?? snap.reserved ?? 0;
                const p2 = snap.pool_2_balance ?? 0;
                const sum = snap.underwriter + snap.buyer + p1 + p2;
                const conserved = sum === snap.total_minted && p1r <= p1;
                return (
                  <tr key={idx} className="hover:bg-page/50">
                    <td className="p-2.5 font-bold">{snap.step}</td>
                    <td className="p-2.5">{snap.underwriter} CR</td>
                    <td className="p-2.5">{snap.buyer} CR</td>
                    <td className="p-2.5 text-primary font-bold">{p1} / {p1r} CR</td>
                    <td className="p-2.5">{p2} CR</td>
                    <td className="p-2.5 font-semibold">{snap.total_minted} CR</td>
                    <td className="p-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          conserved ? 'bg-sage text-sage-text' : 'bg-brick-bg text-brick'
                        }`}
                      >
                        {conserved ? 'CONSERVED' : 'VIOLATED'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* On-Chain Transactions Matrix S1-S5 */}
      <div className="p-4 sm:p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink">On-Chain Scenario Execution Matrix (S1–S5)</h2>
            <p className="text-xs text-ink-muted">
              27 transactions executed on GenLayer Studionet across setup, claim, purchase, source mutation, settlement, attestation, and withdrawal.
            </p>
          </div>
          <div className="flex items-center gap-1 bg-page p-1 rounded-lg border border-sand-border text-xs">
            <button
              onClick={() => setFilterTx('ALL')}
              className={`px-3 py-1 rounded font-semibold ${
                filterTx === 'ALL' ? 'bg-primary text-primary-contrast' : 'text-ink-muted hover:text-ink'
              }`}
            >
              All ({TRANSACTION_MATRIX_V2.length})
            </button>
            <button
              onClick={() => setFilterTx('SUCCESS')}
              className={`px-3 py-1 rounded font-semibold ${
                filterTx === 'SUCCESS' ? 'bg-primary text-primary-contrast' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setFilterTx('ERROR')}
              className={`px-3 py-1 rounded font-semibold ${
                filterTx === 'ERROR' ? 'bg-primary text-primary-contrast' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Expected Errors
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-page border-b border-sand-border">
              <tr>
                <th className="p-2.5 font-sans">Step Label</th>
                <th className="p-2.5 font-sans">Function</th>
                <th className="p-2.5 font-sans">Tx Hash</th>
                <th className="p-2.5 font-sans">Consensus</th>
                <th className="p-2.5 font-sans">Leader Result</th>
                <th className="p-2.5 font-sans">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border">
              {filteredTx.map((tx, idx) => (
                <tr key={idx} className="hover:bg-page/50">
                  <td className="p-2.5 font-bold font-sans">{tx.label}</td>
                  <td className="p-2.5 text-primary">{tx.function}()</td>
                  <td className="p-2.5">
                    <a
                      href={`${GENLAYER_STUDIONET.explorerUrl}/tx/${tx.tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <span>{tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-6)}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                  <td className="p-2.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sage text-sage-text">
                      {tx.status_name} / {tx.result_name}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        tx.leader_result === 'SUCCESS' ? 'bg-sage text-sage-text' : 'bg-brick-bg text-brick'
                      }`}
                    >
                      {tx.leader_result}
                    </span>
                  </td>
                  <td className="p-2.5">{tx.latency_seconds}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Robustness Iteration Comparison */}
      <div className="p-4 sm:p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4 max-w-full overflow-hidden">
        <h2 className="text-xl font-bold text-ink">Multi-Validator Robustness Iteration Comparison</h2>
        <p className="text-xs text-ink-muted">
          Pre-registered rule: parse 10/10 and matches &ge; 9/10 across 6 status page topologies (s1, s2, s3, s4, s5, s7).
        </p>

        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-page border-b border-sand-border">
              <tr>
                <th className="p-2.5">Page</th>
                <th className="p-2.5" colSpan={2}>Iteration 0 (54 Runs)</th>
                <th className="p-2.5" colSpan={2}>Iteration 1 (60 Runs)</th>
                <th className="p-2.5" colSpan={2}>Iteration 2 (60 Runs - Pre-registered)</th>
              </tr>
              <tr className="text-[10px] text-ink-muted border-t border-sand-border">
                <th className="p-2"></th>
                <th className="p-2">Parse</th>
                <th className="p-2">Match</th>
                <th className="p-2">Parse</th>
                <th className="p-2">Match</th>
                <th className="p-2">Parse</th>
                <th className="p-2">Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border">
              {pages.map((p) => {
                const it0 = ROBUSTNESS_ITER0[p] || { parsed: 0, matches: 0, total: 10 };
                const it1 = ROBUSTNESS_ITER1[p] || { parsed: 0, matches: 0, total: 10 };
                const it2 = ROBUSTNESS_ITER2[p] || { parsed: 0, matches: 0, total: 10 };
                return (
                  <tr key={p} className="hover:bg-page/50">
                    <td className="p-2.5 font-bold uppercase">{p}</td>
                    <td className="p-2.5">{it0.parsed}/{it0.total}</td>
                    <td className="p-2.5">{it0.matches}/{it0.total}</td>
                    <td className="p-2.5">{it1.parsed}/{it1.total}</td>
                    <td className="p-2.5">{it1.matches}/{it1.total}</td>
                    <td className="p-2.5 text-primary font-bold">{it2.parsed}/{it2.total}</td>
                    <td className="p-2.5 text-primary font-bold">{it2.matches}/{it2.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
