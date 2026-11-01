import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Moon, Sun, Wallet, Menu, X, Coins } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { DemoCreditNotice } from './DemoCreditNotice';

export const Header: React.FC = () => {
  const location = useLocation();
  const { address, isConnected, isConnecting, demoBalance, connectWallet, disconnectWallet } =
    useWallet();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/products', label: 'Products' },
    { to: '/guard', label: 'CoverGuard' },
    { to: '/credits', label: 'Credits' },
    { to: '/evidence', label: 'Evidence' },
    { to: '/limits', label: 'Limits' },
  ];

  const formatShortAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-page border-b border-sand-border">
      <DemoCreditNotice variant="banner" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Status Badge */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-ink font-bold text-2xl tracking-tight hover:opacity-90 min-h-[44px] items-center"
              aria-label="Cover Home"
            >
              <div className="w-10 h-10 rounded-lg bg-primary text-primary-contrast flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span>Cover</span>
            </Link>

            {/* Preview Status Pill */}
            <span
              className="px-2.5 py-1 text-xs font-semibold font-mono uppercase tracking-wider rounded-lg bg-sage text-sage-text border border-primary/20"
              title="GenLayer studionet preview deployment"
            >
              Preview
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-base font-medium transition-colors min-h-[48px] flex items-center ${
                    active
                      ? 'bg-sand text-ink font-semibold border border-sand-border'
                      : 'text-ink-muted hover:text-ink hover:bg-sand/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Demo Credits Balance Indicator */}
            {isConnected && demoBalance !== null && (
              <Link
                to="/credits"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sand border border-sand-border text-ink font-mono text-sm min-h-[48px] hover:border-sand-border/80"
                title="Demo credit balance (Studionet only, not money)"
              >
                <Coins className="w-4 h-4 text-clay" />
                <span>{demoBalance} CR</span>
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-lg border border-sand-border bg-sand hover:bg-sand-border/50 text-ink min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Wallet Connect Button */}
            {isConnected && address ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm px-3 py-2 bg-sand rounded-lg border border-sand-border text-ink">
                  {formatShortAddress(address)}
                </span>
                <button
                  type="button"
                  onClick={disconnectWallet}
                  className="px-3 py-2 text-sm text-brick hover:bg-brick-bg rounded-lg border border-brick min-h-[48px]"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={connectWallet}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-contrast font-medium hover:bg-primary-hover disabled:opacity-50 min-h-[48px]"
              >
                <Wallet className="w-5 h-5" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-sand-border bg-sand text-ink min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-sand-border bg-sand text-ink min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand-border bg-page px-4 py-4 flex flex-col gap-3">
          <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-lg font-medium text-ink hover:bg-sand"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-sand-border flex flex-col gap-3">
            {isConnected && address ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm text-ink-muted">
                  <span>Connected Address:</span>
                  <span className="font-mono text-ink">{formatShortAddress(address)}</span>
                </div>
                {demoBalance !== null && (
                  <div className="flex items-center justify-between text-sm text-ink-muted">
                    <span>Demo Credits:</span>
                    <span className="font-mono font-bold text-ink">{demoBalance} CR</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    disconnectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-center text-brick font-semibold border border-brick rounded-lg min-h-[48px]"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  connectWallet();
                  setMobileMenuOpen(false);
                }}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-contrast font-medium hover:bg-primary-hover min-h-[48px]"
              >
                <Wallet className="w-5 h-5" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
