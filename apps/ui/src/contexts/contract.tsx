import React, { type PropsWithChildren, createContext } from "react";
import {
  type DeployedBoardAPIProvider,
  BrowserDeployedBoardManager,
} from "./browser-contract-manager";
import { type Logger } from "pino";

/**
 * Encapsulates a deployed contract provider as a context object.
 */
export const ContractContext = createContext<
  DeployedBoardAPIProvider | undefined
>(undefined);

/**
 * The props required by the {@link ContractProvider} component.
 */
export type ContractProviderProps = PropsWithChildren<{
  /** The `pino` logger to use. */
  logger: Logger;
}>;

/**
 * A React component that sets a new {@link BrowserContractManager} object as the currently
 * in-scope deployed contract provider.
 */
export const ContractProvider: React.FC<Readonly<ContractProviderProps>> = ({
  logger,
  children,
}) => (
  <ContractContext.Provider value={new BrowserDeployedBoardManager(logger)}>
    {children}
  </ContractContext.Provider>
);
