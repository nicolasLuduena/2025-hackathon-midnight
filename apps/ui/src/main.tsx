import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ContractProvider } from "./contexts/contract.tsx";
import pino from "pino";
import { WalletProvider } from "./hooks/useWallet.tsx";
import {
  setNetworkId,
  NetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";

const logger = pino.pino({ level: "debug" });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WalletProvider>
      <ContractProvider logger={logger}>
        <App />
      </ContractProvider>
    </WalletProvider>
    ,
  </StrictMode>,
);
const networkId = import.meta.env.VITE_NETWORK_ID as NetworkId;
setNetworkId(networkId);
