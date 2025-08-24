import {
  ContractAPI,
  type ContractCircuitKeys,
  type ContractProviders,
} from "contract-api";
import { type ContractAddress } from "@midnight-ntwrk/compact-runtime";
import {
  BehaviorSubject,
  type Observable,
  concatMap,
  filter,
  firstValueFrom,
  interval,
  map,
  of,
  take,
  tap,
  throwError,
  timeout,
  catchError,
} from "rxjs";
import { pipe as fnPipe } from "fp-ts/function";
import { type Logger } from "pino";
import {
  type DAppConnectorAPI,
  type DAppConnectorWalletAPI,
  type ServiceUriConfig,
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
import semver from "semver";
import {
  getLedgerNetworkId,
  getZswapNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";

/**
 * An in-progress contract deploy
 */

export interface InProgressContractDeployment {
  readonly status: "in-progress";
}

/**
 * A deployed contract deployment.
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
 * Provides access to contract deployments.
 */
export interface ContractAPIProvider {
  /**
   * Gets the observable set of contract deployments.
   *
   * @remarks
   * This property represents an observable array of {@link ContractDeployment}, each also an
   * observable. Changes to the array will be emitted as contracts are resolved (deployed or joined),
   * while changes to each underlying contract can be observed via each item in the array.
   */
  readonly boardDeployments$: Observable<Array<Observable<ContractDeployment>>>;

  /**
   * Joins or deploys a contract.
   *
   * @param contractAddress An optional contract address to use when resolving.
   * @returns An observable contract deployment.
   *
   * @remarks
   * For a given `contractAddress`, the method will attempt to find and join the identified contract
   * contract; otherwise it will attempt to deploy a new one.
   */
  readonly resolve: (
    contractAddress?: ContractAddress,
  ) => Observable<ContractDeployment>;
}

/**
 * A {@link ContractAPIProvider} that manages contract deployments in a browser setting.
 *
 * @remarks
 * {@link BrowserContractManager} configures and manages a connection to the Midnight Lace
 * wallet, along with a collection of additional providers that work in a web-browser setting.
 */
export class BrowserContractManager implements ContractAPIProvider {
  private readonly logger: Logger;
  readonly #boardDeploymentsSubject: BehaviorSubject<
    Array<BehaviorSubject<ContractDeployment>>
  >;
  #initializedProviders: Promise<ContractProviders> | undefined;

  /**
   * Initializes a new {@link BrowserContractManager} instance.
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
): Promise<ContractProviders> => {
  const { wallet, uris } = await connectToWallet(logger);
  const walletState = await wallet.state();
  const zkConfigPath = window.location.origin; // '../../../contract/src/managed/bboard';

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

/** @internal */
const connectToWallet = (
  logger: Logger,
): Promise<{ wallet: DAppConnectorWalletAPI; uris: ServiceUriConfig }> => {
  const COMPATIBLE_CONNECTOR_API_VERSION = "1.x";

  return firstValueFrom(
    fnPipe(
      interval(100),
      map(() => window.midnight?.mnLace),
      tap((connectorAPI) => {
        logger.info(connectorAPI, "Check for wallet connector API");
      }),
      filter(
        (connectorAPI): connectorAPI is DAppConnectorAPI => !!connectorAPI,
      ),
      concatMap((connectorAPI) =>
        semver.satisfies(
          connectorAPI.apiVersion,
          COMPATIBLE_CONNECTOR_API_VERSION,
        )
          ? of(connectorAPI)
          : throwError(() => {
            logger.error(
              {
                expected: COMPATIBLE_CONNECTOR_API_VERSION,
                actual: connectorAPI.apiVersion,
              },
              "Incompatible version of wallet connector API",
            );

            return new Error(
              `Incompatible version of Midnight Lace wallet found. Require '${COMPATIBLE_CONNECTOR_API_VERSION}', got '${connectorAPI.apiVersion}'.`,
            );
          }),
      ),
      tap((connectorAPI) => {
        logger.info(
          connectorAPI,
          "Compatible wallet connector API found. Connecting.",
        );
      }),
      take(1),
      timeout({
        first: 1_000,
        with: () =>
          throwError(() => {
            logger.error("Could not find wallet connector API");

            return new Error(
              "Could not find Midnight Lace wallet. Extension installed?",
            );
          }),
      }),
      concatMap(async (connectorAPI) => {
        const isEnabled = await connectorAPI.isEnabled();

        logger.info(isEnabled, "Wallet connector API enabled status");

        return connectorAPI;
      }),
      timeout({
        first: 5_000,
        with: () =>
          throwError(() => {
            logger.error("Wallet connector API has failed to respond");

            return new Error(
              "Midnight Lace wallet has failed to respond. Extension enabled?",
            );
          }),
      }),
      concatMap(async (connectorAPI) => ({
        walletConnectorAPI: await connectorAPI.enable(),
        connectorAPI,
      })),
      catchError((error, apis) =>
        error
          ? throwError(() => {
            logger.error("Unable to enable connector API");
            return new Error("Application is not authorized");
          })
          : apis,
      ),
      concatMap(async ({ walletConnectorAPI, connectorAPI }) => {
        const uris = await connectorAPI.serviceUriConfig();

        logger.info(
          "Connected to wallet connector API and retrieved service configuration",
        );

        return { wallet: walletConnectorAPI, uris };
      }),
    ),
  );
};
