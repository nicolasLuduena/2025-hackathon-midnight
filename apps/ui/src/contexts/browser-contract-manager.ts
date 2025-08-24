import {
  ContractAPI,
  type ContractProviders,
  type ContractCircuitKeys,
} from "contract-api";
import { type ContractAddress } from "@midnight-ntwrk/compact-runtime";
import { BehaviorSubject, type Observable } from "rxjs";
import { type Logger } from "pino";
import {
  type DAppConnectorAPI,
  type DAppConnectorWalletAPI,
} from "@midnight-ntwrk/dapp-connector-api";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
// import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import {
  type BalancedTransaction,
  type UnbalancedTransaction,
  createBalancedTx,
} from "@midnight-ntwrk/midnight-js-types";
import {
  type CoinInfo,
  Transaction,
  type TransactionId,
} from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import {
  getLedgerNetworkId,
  getZswapNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";

/**
 * An in-progress contract deployment.
 */
export interface InProgressContractDeployment {
  readonly status: "in-progress";
}

/**
 * A deployed bulletin contract deployment.
 */
export interface DeployedContractDeployment {
  readonly status: "deployed";

  /**
   * The {@link ContractAPI} instance when connected to an on network contract.
   */
  readonly api: ContractAPI;
}

/**
 * A failed contract deployment.
 */
export interface FailedContractDeployment {
  readonly status: "failed";

  /**
   * The error that caused the deployment to fail.
   */
  readonly error: Error;
}

/**
 * A contract deployment.
 */
export type ContractDeployment =
  | InProgressContractDeployment
  | DeployedContractDeployment
  | FailedContractDeployment;

/**
 * Provides access to bulletin board deployments.
 */
export interface DeployedBoardAPIProvider {
  /**
   * Gets the observable set of board deployments.
   *
   * @remarks
   * This property represents an observable array of {@link ContractDeployment}, each also an
   * observable. Changes to the array will be emitted as boards are resolved (deployed or joined),
   * while changes to each underlying board can be observed via each item in the array.
   */
  readonly boardDeployments$: Observable<Array<Observable<ContractDeployment>>>;

  /**
   * Joins or deploys a bulletin board contract.
   *
   * @param contractAddress An optional contract address to use when resolving.
   * @returns An observable board deployment.
   *
   * @remarks
   * For a given `contractAddress`, the method will attempt to find and join the identified bulletin board
   * contract; otherwise it will attempt to deploy a new one.
   */
  readonly resolve: (
    contractAddress?: ContractAddress,
  ) => Observable<ContractDeployment>;
}

/**
 * A {@link DeployedBoardAPIProvider} that manages bulletin board deployments in a browser setting.
 *
 * @remarks
 * {@link BrowserDeployedBoardManager} configures and manages a connection to the Midnight Lace
 * wallet, along with a collection of additional providers that work in a web-browser setting.
 */
export class BrowserDeployedBoardManager implements DeployedBoardAPIProvider {
  private readonly logger: Logger;
  readonly #boardDeploymentsSubject: BehaviorSubject<
    Array<BehaviorSubject<ContractDeployment>>
  >;
  #initializedProviders: Promise<ContractProviders> | undefined;

  /**
   * Initializes a new {@link BrowserDeployedBoardManager} instance.
   *
   * @param logger The `pino` logger to for logging.
   */
  constructor(logger: Logger) {
    this.logger = logger;
    this.#boardDeploymentsSubject = new BehaviorSubject<
      Array<BehaviorSubject<ContractDeployment>>
    >([]);
    this.boardDeployments$ = this.#boardDeploymentsSubject;
  }

  /** @inheritdoc */
  readonly boardDeployments$: Observable<Array<Observable<ContractDeployment>>>;

  /** @inheritdoc */
  resolve(contractAddress?: ContractAddress): Observable<ContractDeployment> {
    const deployments = this.#boardDeploymentsSubject.value;
    let deployment = deployments.find(
      (deployment) =>
        deployment.value.status === "deployed" &&
        deployment.value.api.deployedContractAddress === contractAddress,
    );

    if (deployment) {
      return deployment;
    }

    deployment = new BehaviorSubject<ContractDeployment>({
      status: "in-progress",
    });

    if (contractAddress) {
      void this.joinDeployment(deployment, contractAddress);
    } else {
      void this.deployDeployment(deployment);
    }

    this.#boardDeploymentsSubject.next([...deployments, deployment]);

    return deployment;
  }

  private getProviders(): Promise<ContractProviders> {
    // We use a cached `Promise` to hold the providers. This will:
    //
    // 1. Cache and re-use the providers (including the configured connector API), and
    // 2. Act as a synchronization point if multiple contract deploys or joins run concurrently.
    //    Concurrent calls to `getProviders()` will receive, and ultimately await, the same
    //    `Promise`.
    return (
      this.#initializedProviders ??
      (this.#initializedProviders = initializeProviders(this.logger))
    );
  }

  private async deployDeployment(
    deployment: BehaviorSubject<ContractDeployment>,
  ): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await ContractAPI.deploy(providers, this.logger);

      deployment.next({
        status: "deployed",
        api,
      });
    } catch (error: unknown) {
      deployment.next({
        status: "failed",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  private async joinDeployment(
    deployment: BehaviorSubject<ContractDeployment>,
    contractAddress: ContractAddress,
  ): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await ContractAPI.join(
        providers,
        contractAddress,
        this.logger,
      );

      deployment.next({
        status: "deployed",
        api,
      });
    } catch (error: unknown) {
      deployment.next({
        status: "failed",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}

/** @internal */
const initializeProviders = async (
  logger: Logger,
  wallet: DAppConnectorWalletAPI,
  connectorAPI: DAppConnectorAPI,
): Promise<ContractProviders> => {
  //const { wallet, uris } = await connectToWallet(logger);
  const uris = await connectorAPI.serviceUriConfig();
  const walletState = await wallet.state();
  const zkConfigPath =
    "/home/batman/Documents/work/midnight/2025-hackathon-midnight/packages/contract/src/managed/tokenization";

  console.log(`Connecting to wallet with network ID: ${getLedgerNetworkId()}`);

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: "bboard-private-state",
    }),
    zkConfigProvider: new FetchZkConfigProvider<ContractCircuitKeys>(
      zkConfigPath,
      fetch.bind(window),
    ),
    proofProvider: httpClientProofProvider(uris.proverServerUri),
    publicDataProvider: indexerPublicDataProvider(
      uris.indexerUri,
      uris.indexerWsUri,
    ),
    walletProvider: {
      coinPublicKey: walletState.coinPublicKey,
      encryptionPublicKey: walletState.encryptionPublicKey,
      balanceTx(
        tx: UnbalancedTransaction,
        newCoins: CoinInfo[],
      ): Promise<BalancedTransaction> {
        return wallet
          .balanceAndProveTransaction(
            ZswapTransaction.deserialize(
              tx.serialize(getLedgerNetworkId()),
              getZswapNetworkId(),
            ),
            newCoins,
          )
          .then((zswapTx) =>
            Transaction.deserialize(
              zswapTx.serialize(getZswapNetworkId()),
              getLedgerNetworkId(),
            ),
          )
          .then(createBalancedTx);
      },
    },
    midnightProvider: {
      submitTx(tx: BalancedTransaction): Promise<TransactionId> {
        return wallet.submitTransaction(tx);
      },
    },
  };
};
