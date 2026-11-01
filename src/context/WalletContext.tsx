import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { getBalanceOf } from '../services/readClient';
import {
  ensureStudionetChain,
  getClientForAccount,
  claimDemoCredits,
  createProduct,
  fundProduct,
  withdrawUnreserved,
  updateSource,
  buyPolicy,
  settlePolicy,
  cancelPolicy,
  attestCoverage,
} from '../services/walletClient';
import { createAccount } from 'genlayer-js';
import type { TxState } from '../types/contract';

interface WalletClientOps {
  claimDemoCredits: (onState?: (s: TxState) => void) => Promise<any>;
  createProduct: (
    name: string,
    url: string,
    ruleText: string,
    thresh100: number,
    thresh50: number,
    thresh25: number,
    premiumBps: number,
    deposit?: number,
    onState?: (s: TxState) => void
  ) => Promise<any>;
  fundPool: (productId: number | string, amount: number, onState?: (s: TxState) => void) => Promise<any>;
  withdrawPool: (productId: number | string, amount: number, onState?: (s: TxState) => void) => Promise<any>;
  updateSourceUrl: (productId: number | string, newUrl: string, onState?: (s: TxState) => void) => Promise<any>;
  buyPolicy: (productId: number | string, coverage: number, days?: number, onState?: (s: TxState) => void) => Promise<any>;
  settlePolicy: (policyId: number | string, onState?: (s: TxState) => void) => Promise<any>;
  cancelPolicy: (policyId: number | string, onState?: (s: TxState) => void) => Promise<any>;
  attestCoverGuard: (policyId: number | string, onState?: (s: TxState) => void) => Promise<any>;
}

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | null;
  demoBalance: string | null;
  client: any | null;
  walletClient: WalletClientOps | null;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  error: string | null;
  isTestSigner: boolean;
  initTestSigner: (privateKey: string) => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  balance: null,
  demoBalance: null,
  client: null,
  walletClient: null,
  connectWallet: async () => {},
  disconnect: () => {},
  disconnectWallet: () => {},
  refreshBalance: async () => {},
  error: null,
  isTestSigner: false,
  initTestSigner: () => {},
});


export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [client, setClient] = useState<any | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTestSigner, setIsTestSigner] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (address) {
      try {
        const bal = await getBalanceOf(address);
        setBalance(bal);
      } catch {
        setBalance('0');
      }
    } else {
      setBalance(null);
    }
  }, [address]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // Support for injected automated test signer (e.g. Playwright E2E or window.__TEST_SIGNER_KEY__)
  const initTestSigner = useCallback((privateKey: string) => {
    try {
      const formatted = (privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`) as `0x${string}`;
      const acc = createAccount(formatted);
      const testClient = getClientForAccount(acc);
      setAddress(acc.address.toLowerCase());
      setClient(testClient);
      setIsTestSigner(true);
      setError(null);
    } catch (err: any) {
      console.error('Failed to initialize test signer:', err);
      setError(err?.message || 'Invalid test signer private key');
    }
  }, []);

  // Check if test key injected via window
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__COVER_TEST_KEY__) {
      initTestSigner((window as any).__COVER_TEST_KEY__);
    }
  }, [initTestSigner]);

  const connectWallet = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const provider = (window as any).ethereum;
      if (!provider) {
        throw new Error('MetaMask or browser wallet not detected. Please install MetaMask.');
      }

      await ensureStudionetChain(provider);

      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No account authorized from wallet.');
      }

      const userAddr = accounts[0].toLowerCase();
      const userClient = getClientForAccount(userAddr, provider);

      setAddress(userAddr);
      setClient(userClient);
      setIsTestSigner(false);

      // Listen for account change
      if (provider.on) {
        provider.on('accountsChanged', (newAccounts: string[]) => {
          if (!newAccounts || newAccounts.length === 0) {
            disconnect();
          } else {
            const nextAddr = newAccounts[0].toLowerCase();
            setAddress(nextAddr);
            setClient(getClientForAccount(nextAddr, provider));
          }
        });

        provider.on('chainChanged', () => {
          window.location.reload();
        });
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err?.message || 'Failed to connect browser wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setClient(null);
    setBalance(null);
    setError(null);
    setIsTestSigner(false);
  };

  const wrapTx = useCallback(
    async (
      fn: (callbacks: any) => Promise<any>,
      onState?: (s: TxState) => void
    ) => {
      if (onState) onState({ stage: 'submitting' });
      try {
        const res = await fn({
          onSubmitted: (txHash: string) => {
            if (onState) onState({ stage: 'pending_consensus', txHash });
          },
          onTick: () => {},
        });
        const classification = res.check?.classification || (res.check?.isSuccess ? 'SUCCESS' : 'FAILED');
        const errorMsg = res.check?.decodedError || res.check?.summary || 'Transaction failed';

        if (classification === 'SUCCESS') {
          if (onState) onState({ stage: 'finalized', txHash: res.txHash });
          await refreshBalance();
          return { status: 'SUCCESS', ...res };
        } else if (classification === 'USER_ERROR') {
          if (onState)
            onState({
              stage: 'user_error',
              txHash: res.txHash,
              errorMessage: errorMsg,
            });
          return { status: 'USER_ERROR', ...res };
        } else {
          if (onState)
            onState({
              stage: 'failed',
              txHash: res.txHash,
              errorMessage: errorMsg,
            });
          return { status: 'FAILED', ...res };
        }
      } catch (err: any) {
        if (onState)
          onState({
            stage: 'failed',
            errorMessage: err?.message || 'Transaction submission failed',
          });
        return { status: 'FAILED', error: err };
      }
    },
    [refreshBalance]
  );

  const walletClient: WalletClientOps | null = useMemo(() => {
    if (!client) return null;
    return {
      claimDemoCredits: (onState) =>
        wrapTx((cb) => claimDemoCredits(client, cb), onState),
      createProduct: async (
        name,
        url,
        ruleText,
        thresh100,
        thresh50,
        _thresh25,
        premiumBps,
        deposit,
        onState
      ) => {
        const createRes = await wrapTx(
          (cb) =>
            createProduct(
              client,
              name,
              url,
              ruleText,
              thresh100,
              thresh50,
              premiumBps,
              cb
            ),
          onState
        );
        if (createRes.status === 'SUCCESS' && deposit && deposit > 0) {
          // If initial deposit specified, fund product #1 or newly created product
          try {
            await fundProduct(client, '1', deposit);
          } catch {}
        }
        return createRes;
      },
      fundPool: (productId, amount, onState) =>
        wrapTx((cb) => fundProduct(client, String(productId), amount, cb), onState),
      withdrawPool: (productId, amount, onState) =>
        wrapTx((cb) => withdrawUnreserved(client, String(productId), amount, cb), onState),
      updateSourceUrl: (productId, newUrl, onState) =>
        wrapTx((cb) => updateSource(client, String(productId), newUrl, cb), onState),
      buyPolicy: (productId, coverage, _days, onState) =>
        wrapTx((cb) => buyPolicy(client, String(productId), coverage, cb), onState),
      settlePolicy: (policyId, onState) =>
        wrapTx((cb) => settlePolicy(client, String(policyId), cb), onState),
      cancelPolicy: (policyId, onState) =>
        wrapTx((cb) => cancelPolicy(client, String(policyId), cb), onState),
      attestCoverGuard: (policyId, onState) =>
        wrapTx((cb) => attestCoverage(client, String(policyId), cb), onState),
    };
  }, [client, wrapTx]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        balance,
        demoBalance: balance,
        client,
        walletClient,
        connectWallet,
        disconnect,
        disconnectWallet: disconnect,
        refreshBalance,
        error,
        isTestSigner,
        initTestSigner,
      }}
    >
      {children}
    </WalletContext.Provider>
  );

};

export const useWallet = () => useContext(WalletContext);
