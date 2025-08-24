import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ContractProvider } from "./contexts/contract.tsx";
import pino from "pino";
import { WalletProvider } from "./hooks/useWallet.tsx";

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
