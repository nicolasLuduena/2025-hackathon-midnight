import { useContext } from "react";
import { ContractContext } from "../contexts/contract";
import { type ContractAPIProvider } from "../contexts/browser-contract-manager";

/**
 * Retrieves the currently in-scope deployed boards provider.
 *
 * @returns The currently in-scope {@link DeployedBBoardAPIProvider} implementation.
 *
 * @internal
 */
export const useContractContext = (): ContractAPIProvider => {
  const context = useContext(ContractContext);

  if (!context) {
    throw new Error("A <ContractProvider /> is required.");
  }

  return context;
};
