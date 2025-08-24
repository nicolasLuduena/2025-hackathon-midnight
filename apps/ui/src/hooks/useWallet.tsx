import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  type DAppConnectorWalletAPI,
  type DAppConnectorWalletState,
} from "@midnight-ntwrk/dapp-connector-api";

interface WalletContextType {
  wallet: DAppConnectorWalletAPI | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
  state: DAppConnectorWalletState | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<DAppConnectorWalletAPI | null>(null);
  const [state, setState] = useState<DAppConnectorWalletState | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      if (window.midnight && window.midnight.mnLace) {
        const walletApi: DAppConnectorWalletAPI =
          await window.midnight.mnLace.enable();
        const newState = await walletApi.state();
        setState(newState);
        setWallet(walletApi);
      } else {
        throw new Error(
          "Midnight wallet extension not found. Please install the Lace wallet extension.",
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const disconnect = useCallback(() => {
    setWallet(null);
    setError(null);
  }, []);

  const isConnected = wallet !== null;

  const value: WalletContextType = {
    wallet,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    error,
    state,
  };

  return (
    <WalletContext.Provider value= { value } > { children } </WalletContext.Provider>
  );
};
