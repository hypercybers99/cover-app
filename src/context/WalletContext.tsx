import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getBalanceOf } from '../services/readClient';
import { ensureStudionetChain, getClientForAccount } from '../services/walletClient';
import { createAccount } from 'genlayer-js';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | null;
  client: any | null;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
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
  client: null,
  connectWallet: async () => {},
  disconnect: () => {},
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

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        balance,
        client,
        connectWallet,
        disconnect,
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
