import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ExternalLink, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { CoverReadClient } from '../services/readClient';
import type { Product } from '../types/contract';
import { DemoCreditNotice } from '../components/DemoCreditNotice';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const client = new CoverReadClient();
      const list = await client.getAllProducts();
      setProducts(list);
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setError(err?.message || 'Failed to load products from GenLayer studionet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString().includes(searchQuery) ||
      (p.url && p.url.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Parametric Products</h1>
          <p className="text-ink-muted mt-1">
            Browse available index products or create a new coverage pool. Zero-wallet readable.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProducts}
            className="p-3 rounded-lg border border-sand-border bg-sand hover:bg-sand-border/50 text-ink min-h-[48px] min-w-[48px] flex items-center justify-center"
            title="Refresh product list"
            aria-label="Refresh product list"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-contrast font-semibold hover:bg-primary-hover min-h-[48px]"
          >
            <Plus className="w-5 h-5" />
            <span>Create Product</span>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-ink-muted" />
        </div>
        <input
          id="product-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name, ID, or URL..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-sand-border bg-sand text-ink placeholder:text-ink-muted focus:bg-page"
        />
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-lg bg-brick-bg border border-brick text-brick flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-6 rounded-lg bg-sand border border-sand-border animate-pulse h-64"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-lg bg-sand border border-sand-border flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 text-ink-muted" />
          <h3 className="text-xl font-bold text-ink">No Products Found</h3>
          <p className="text-ink-muted max-w-md">
            {searchQuery
              ? 'No products matched your search query. Try searching with a different keyword.'
              : 'No parametric coverage products have been created on this contract deployment yet.'}
          </p>
          <Link
            to="/products/new"
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-contrast font-medium hover:bg-primary-hover min-h-[48px]"
          >
            <Plus className="w-5 h-5" />
            <span>Create First Product</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => {
            const availableLiquidity = Math.max(0, product.pool_balance - product.reserved);
            return (
              <div
                key={product.id}
                className="p-6 rounded-lg bg-sand border border-sand-border flex flex-col justify-between gap-5 transition-shadow hover:shadow-md"
              >
                {/* Header */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-page text-ink-muted border border-sand-border">
                      Product #{product.id}
                    </span>
                    <span className="font-mono text-xs text-ink-muted">
                      Creator: {product.creator.slice(0, 6)}...{product.creator.slice(-4)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-ink leading-snug">{product.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted font-mono break-all line-clamp-1">
                    <span>Source: {product.url}</span>
                  </div>
                </div>

                {/* Pool Status Table */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-page border border-sand-border text-center font-mono">
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase text-ink-muted font-sans font-medium">
                      Pool
                    </span>
                    <span className="font-bold text-ink">{product.pool_balance}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase text-ink-muted font-sans font-medium">
                      Reserved
                    </span>
                    <span className="font-bold text-clay">{product.reserved}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase text-ink-muted font-sans font-medium">
                      Available
                    </span>
                    <span className="font-bold text-primary">{availableLiquidity}</span>
                  </div>
                </div>

                {/* Rules & Metrics */}
                <div className="flex items-center justify-between text-xs text-ink-muted pt-1 border-t border-sand-border">
                  <span>Rate: {(product.premium_bps / 100).toFixed(2)}% ({product.premium_bps} bps)</span>
                  <span>Policies: {product.policy_count}</span>
                </div>

                {/* Action Button */}
                <Link
                  to={`/products/${product.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-contrast font-medium hover:bg-primary-hover min-h-[48px]"
                >
                  <span>View Details & Buy</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <DemoCreditNotice variant="inline" />
      </div>
    </div>
  );
};
