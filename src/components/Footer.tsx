import React from 'react';
import { ExternalLink, GitBranch, Shield, Code } from 'lucide-react';
import { ACTIVE_DEPLOYMENTS, GENLAYER_STUDIONET } from '../config/deployments';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-sand-border bg-page mt-20 pt-12 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: System Purpose & Status */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-ink font-bold text-lg">
              <Shield className="w-5 h-5 text-primary" />
              <span>Cover on GenLayer Studionet</span>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              Decentralized parametric web uptime coverage powered by intelligent contracts.
              Evaluating real-world status pages through multi-validator consensus.
            </p>
            <p className="text-xs text-ink-muted">
              Status: <span className="font-semibold text-primary">Preview</span> (Chain ID {GENLAYER_STUDIONET.chainId})
            </p>
          </div>

          {/* Column 2: On-Chain Deployed Contracts */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Active Contracts
            </h3>
            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex flex-col">
                <span className="text-ink font-medium">Cover Contract:</span>
                <a
                  href={`${GENLAYER_STUDIONET.explorerUrl}/address/${ACTIVE_DEPLOYMENTS.cover.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 break-all"
                >
                  <span>{ACTIVE_DEPLOYMENTS.cover.address}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-ink font-medium">CoverGuard Contract:</span>
                <a
                  href={`${GENLAYER_STUDIONET.explorerUrl}/address/${ACTIVE_DEPLOYMENTS.coverGuard.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 break-all"
                >
                  <span>{ACTIVE_DEPLOYMENTS.coverGuard.address}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Repositories and Source References */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Source Repositories
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <a
                  href="https://github.com/hypercybers99/cover-genlayer/tree/cover-v1-final"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink hover:text-primary flex items-center gap-1.5"
                >
                  <GitBranch className="w-4 h-4 text-clay" />
                  <span>Contract Repo (tag cover-v1-final)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/hypercybers99/cover-app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink hover:text-primary flex items-center gap-1.5"
                >
                  <Code className="w-4 h-4 text-primary" />
                  <span>Web App Repo (cover-app)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal and Technical Disclaimer */}
        <div className="border-t border-sand-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <p>
            Credits are demo credits on GenLayer studionet, not money. Cover is an experimental preview application.
          </p>
          <p className="font-mono">
            GenLayer RPC: {GENLAYER_STUDIONET.rpcUrl}
          </p>
        </div>
      </div>
    </footer>
  );
};
