import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle, Zap, Scale, Layers } from 'lucide-react';
import { CoverReadClient } from '../services/readClient';
import { ACTIVE_DEPLOYMENTS } from '../config/deployments';
import { DemoCreditNotice } from '../components/DemoCreditNotice';

export const LandingPage: React.FC = () => {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      try {
        const client = new CoverReadClient();
        const count = await client.getProductCount().catch(() => 0);
        if (mounted) {
          setProductCount(count);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    }
    loadStats();
    return () => {
      mounted = false;
    };
  }, []);


  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sage text-sage-text text-sm font-semibold border border-primary/20">
          <Zap className="w-4 h-4 text-primary" />
          <span>GenLayer Intelligent Contract Preview</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight leading-tight">
          Parametric Web Service Protection Evaluated by Intelligent Consensus
        </h1>

        <p className="text-lg sm:text-xl text-ink-muted leading-relaxed max-w-2xl">
          Decentralized cover for critical cloud infrastructure and APIs. Consensus validators inspect live web status pages to settle payouts without centralized oracles or subjective human arbiters.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-white font-semibold text-lg hover:bg-primary-hover min-h-[48px]"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/credits"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-sand border-2 border-sand-border text-ink font-semibold text-lg hover:bg-sand-border/50 min-h-[48px]"
          >
            <span>Claim Demo Credits</span>
          </Link>
          <Link
            to="/guard"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-sand border border-sand-border text-ink font-medium text-base hover:bg-sand-border/50 min-h-[48px]"
          >
            <span>Check CoverGuard</span>
          </Link>
        </div>

        <div className="mt-2">
          <DemoCreditNotice variant="inline" />
        </div>
      </section>

      {/* Live System Metric Snapshot */}
      <section className="max-w-5xl mx-auto w-full px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-lg bg-sand border border-sand-border">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-semibold text-ink-muted tracking-wider">
              Active Cover Contract
            </span>
            <span className="font-mono text-sm text-ink break-all">
              {ACTIVE_DEPLOYMENTS.cover.address}
            </span>
            <span className="text-xs text-primary font-medium mt-1">Verified on Studionet</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-semibold text-ink-muted tracking-wider">
              Total Index Products
            </span>
            <span className="text-2xl font-bold font-mono text-ink">
              {loading ? '...' : (productCount ?? 0)}
            </span>
            <span className="text-xs text-ink-muted mt-1">Zero-wallet readable</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-semibold text-ink-muted tracking-wider">
              Operational Gate
            </span>
            <span className="text-2xl font-bold font-mono text-ink">Tripwire & Consensus</span>
            <span className="text-xs text-ink-muted mt-1">Deterministic cache-bypass checks</span>
          </div>
        </div>
      </section>

      {/* 3-Step Explainer */}
      <section className="max-w-5xl mx-auto w-full px-4 flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">How Cover Operates</h2>
          <p className="text-ink-muted mt-2">
            No subjective claims adjusters. Payout rules are locked into intelligent contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xl">
              1
            </div>
            <h3 className="text-xl font-bold text-ink">Define Coverage Product</h3>
            <p className="text-ink-muted text-base leading-relaxed">
              Underwriters publish an index product pointing to an HTTPS status page or outage report. Underwriters deposit initial liquidity to back potential claim payouts.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xl">
              2
            </div>
            <h3 className="text-xl font-bold text-ink">Purchase Protection</h3>
            <p className="text-ink-muted text-base leading-relaxed">
              Users purchase parametric policies covering specific terms and durations. Fixed premiums are calculated transparently and added directly to the pool reserves.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xl">
              3
            </div>
            <h3 className="text-xl font-bold text-ink">Consensus Settlement</h3>
            <p className="text-ink-muted text-base leading-relaxed">
              When an outage occurs, anyone can trigger settlement. GenLayer validators inspect live web data, apply strict equivalence principles, and release payouts immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="max-w-5xl mx-auto w-full px-4">
        <div className="p-8 rounded-lg bg-sand border border-sand-border flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-ink">Core Guarantees</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-ink">Full Reserve Backing</h4>
                <p className="text-sm text-ink-muted mt-1">
                  Policies can only be issued if the pool holds 100% of the coverage amount in unreserved liquidity. Over-issuance is strictly forbidden by the contract.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Scale className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-ink">Multi-Tier Payouts</h4>
                <p className="text-sm text-ink-muted mt-1">
                  Supports graduated payouts (100%, 50%, 25%, 0%) configured per product, matching outage severity thresholds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Layers className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-ink">CoverGuard Interoperability</h4>
                <p className="text-sm text-ink-muted mt-1">
                  External contracts query CoverGuard to verify active coverage before executing high-value operations or granting credit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-ink">Zero-Wallet Transparency</h4>
                <p className="text-sm text-ink-muted mt-1">
                  Every product, policy, balance snapshot, and settlement decision can be audited freely in the browser without connecting a wallet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
