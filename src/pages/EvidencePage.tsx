import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  ExternalLink,
  GitBranch,
  Hash,
} from 'lucide-react';
import {
  EVIDENCE_META,
  PROMPT_SHA256,
  BALANCE_SNAPSHOTS,
  TRANSACTION_MATRIX,
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
      ? TRANSACTION_MATRIX
      : TRANSACTION_MATRIX.filter((tx) =>
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
          Complete transparent audit trail of deployments, invariant balance snapshots, transaction executions, and multi-validator robustness iterations on GenLayer studionet.
        </p>
      </div>

      {/* Deployments & Source Invariants */}
      <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-5">
        <h2 className="text-xl font-bold text-ink flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span>Active Contracts on Studionet</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-page border border-sand-border flex flex-col gap-1.5">
            <span className="font-sans font-bold text-ink">Cover Intelligent Contract (Active)</span>
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
            <span className="text-ink-muted text-[11px]">
              Deploy Tx: {ACTIVE_DEPLOYMENTS.cover.deployTx}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-page border border-sand-border flex flex-col gap-1.5">
            <span className="font-sans font-bold text-ink">CoverGuard Contract (Active)</span>
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
            <span className="text-ink-muted text-[11px]">
              Deploy Tx: {ACTIVE_DEPLOYMENTS.coverGuard.deployTx}
            </span>
          </div>
        </div>

        {/* Superseded contract pair line - strictly formatted */}
        <div className="pt-2 border-t border-sand-border text-xs text-ink-muted font-mono break-all">
          Superseded pair: Cover 0x41f8c399e2709333AEAD1F8Ac0B1E5248eC288Bd, CoverGuard 0x85C0F67F1Cd82aBcCfABb289E6c215c78D17b3eF (superseded)
        </div>

        {/* Source metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted pt-2 border-t border-sand-border">
          <span className="inline-flex items-center gap-1">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Contract Tag: <strong>{EVIDENCE_META.source_tag}</strong> ({EVIDENCE_META.source_commit.slice(0, 7)})</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Hash className="w-3.5 h-3.5" />
            <span>Settlement Prompt SHA-256: <code className="font-mono">{PROMPT_SHA256.slice(0, 16)}...</code></span>
          </span>
        </div>
      </div>

      {/* Balance Snapshots Across Matrix */}
      <div className="p-4 sm:p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-ink">Conservation of Balance Invariant</h2>
            <p className="text-xs text-ink-muted">
              Asserts: <code className="font-mono">underwriter + buyer + pool_balance == total_minted</code> and <code className="font-mono">reserved &lt;= pool_balance</code> across all 39 lifecycle steps.
            </p>
          </div>
          <DemoCreditNotice variant="inline" />
        </div>

        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-page border-b border-sand-border">
              <tr>
                <th className="p-2.5">Step</th>
                <th className="p-2.5">Underwriter</th>
                <th className="p-2.5">Buyer</th>
                <th className="p-2.5">Pool Balance</th>
                <th className="p-2.5">Reserved</th>
                <th className="p-2.5">Total Minted</th>
                <th className="p-2.5">Conservation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border">
              {BALANCE_SNAPSHOTS.map((snap, idx) => {
                const sum = snap.underwriter + snap.buyer + snap.pool_balance;
                const conserved = sum === snap.total_minted && snap.reserved <= snap.pool_balance;
                return (
                  <tr key={idx} className="hover:bg-page/50">
                    <td className="p-2.5 font-bold">{snap.step}</td>
                    <td className="p-2.5">{snap.underwriter}</td>
                    <td className="p-2.5">{snap.buyer}</td>
                    <td className="p-2.5 text-primary font-bold">{snap.pool_balance}</td>
                    <td className="p-2.5 text-clay">{snap.reserved}</td>
                    <td className="p-2.5 font-semibold">{snap.total_minted}</td>
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

      {/* Robustness Iterations Side-by-Side Table */}
      <div className="p-4 sm:p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4 max-w-full overflow-hidden">
        <h2 className="text-xl font-bold text-ink">Robustness Iteration Comparison</h2>
        <p className="text-xs text-ink-muted">
          60-run evaluation across 6 status page topologies (s1, s2, s3, s4, s5, s7) testing parser integrity and multi-validator consensus decision agreement.
        </p>

        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-page border-b border-sand-border">
              <tr>
                <th className="p-2.5">Page</th>
                <th className="p-2.5" colSpan={2}>
                  Iteration 0 (54 Runs)
                </th>
                <th className="p-2.5" colSpan={2}>
                  Iteration 1 (60 Runs)
                </th>
                <th className="p-2.5" colSpan={2}>
                  Iteration 2 (60 Runs)
                </th>
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
                const r0 = (ROBUSTNESS_ITER0 as any)[p] || { parsed: 0, matches: 0, total: 10 };
                const r1 = (ROBUSTNESS_ITER1 as any)[p] || { parsed: 0, matches: 0, total: 10 };
                const r2 = (ROBUSTNESS_ITER2 as any)[p] || { parsed: 0, matches: 0, total: 10 };

                return (
                  <tr key={p} className="hover:bg-page/50">
                    <td className="p-2.5 font-bold uppercase">{p}</td>
                    <td className="p-2.5">{r0.parsed}/{r0.total}</td>
                    <td className="p-2.5 font-bold text-primary">{r0.matches}/{r0.total}</td>
                    <td className="p-2.5">{r1.parsed}/{r1.total}</td>
                    <td className="p-2.5 font-bold text-primary">{r1.matches}/{r1.total}</td>
                    <td className="p-2.5">{r2.parsed}/{r2.total}</td>
                    <td className="p-2.5 font-bold text-primary">{r2.matches}/{r2.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 39-Step Transaction Matrix */}
      <div className="p-4 sm:p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink">39-Step Transaction Matrix</h2>
            <p className="text-xs text-ink-muted">
              Recorded executions against GenLayer studionet (success and expected revert paths).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterTx('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filterTx === 'ALL' ? 'bg-primary text-primary-contrast' : 'bg-page text-ink'
              }`}
            >
              All ({TRANSACTION_MATRIX.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTx('SUCCESS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filterTx === 'SUCCESS' ? 'bg-primary text-primary-contrast' : 'bg-page text-ink'
              }`}
            >
              Success
            </button>
            <button
              type="button"
              onClick={() => setFilterTx('ERROR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filterTx === 'ERROR' ? 'bg-primary text-primary-contrast' : 'bg-page text-ink'
              }`}
            >
              Rejection Paths
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px] max-w-full">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-page border-b border-sand-border sticky top-0">
              <tr>
                <th className="p-2.5">Label</th>
                <th className="p-2.5">Function</th>
                <th className="p-2.5">Tx Hash</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Result</th>
                <th className="p-2.5">Latency</th>
                <th className="p-2.5">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border">
              {filteredTx.map((tx, idx) => (
                <tr key={idx} className="hover:bg-page/50">
                  <td className="p-2.5 font-bold font-sans">{tx.label}</td>
                  <td className="p-2.5">{tx.function}</td>
                  <td className="p-2.5">
                    <a
                      href={`${GENLAYER_STUDIONET.explorerUrl}/tx/${tx.tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {tx.tx_hash.slice(0, 8)}...{tx.tx_hash.slice(-6)}
                    </a>
                  </td>
                  <td className="p-2.5">{tx.status_name}</td>
                  <td className="p-2.5">{tx.result_name}</td>
                  <td className="p-2.5">{tx.latency_seconds}s</td>
                  <td className="p-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        tx.expected_success
                          ? 'bg-sage text-sage-text'
                          : 'bg-brick-bg text-brick'
                      }`}
                    >
                      {tx.expected_success ? 'SUCCESS' : 'USER_ERROR'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
