import React, { createContext, useState, useEffect, ReactNode } from "react";
import {
  isConnected as isFreighterConnected,
  getAddress,
  setAllowed,
} from "@stellar/freighter-api";

interface WalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
  error: string | null;
}

export const WalletContext = createContext<WalletContextType>({
  publicKey: null,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isLoading: false,
  error: null,
});

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing Freighter connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { isConnected: connected } = await isFreighterConnected();
        if (connected) {
          const { address } = await getAddress();
          setPublicKey(address);
        }
      } catch (err) {
        console.error("Error checking Freighter connection:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Freighter is installed
      const { isConnected: connected } = await isFreighterConnected();
      if (!connected) {
        alert("Please install Freighter wallet extension from https://www.freighter.app/");
        setIsLoading(false);
        return;
      }

      // Request permission to access wallet
      const { isAllowed } = await setAllowed();

      if (!isAllowed) {
        setError("User denied wallet access");
        setIsLoading(false);
        return;
      }

      // Get the wallet address
      const { address } = await getAddress();
      setPublicKey(address);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      console.error("Wallet connection error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setError(null);
  };

  const value: WalletContextType = {
    publicKey,
    isConnected: !!publicKey,
    connectWallet,
    disconnectWallet,
    isLoading,
    error,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
