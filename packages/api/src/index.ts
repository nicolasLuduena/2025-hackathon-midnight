// This file is part of midnightntwrk/example-counter.
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Provides types and utilities for working with bulletin board contracts.
 *
 * @packageDocumentation
 */

import {
  CoinInfo,
  QualifiedCoinInfo,
  Contract,
  ledger,
  pureCircuits,
  AssetPublicInfo,
  Offer,
} from 'contract-primitives';

import { type ContractAddress, encodeTokenType } from '@midnight-ntwrk/compact-runtime';
import { type Logger } from 'pino';
import {
  type ContractDerivedState,
  type ContractContract,
  type ContractProviders,
  type DeployedContractContract,
  contractPrivateStateKey,
  uint8ArrayToString,
} from './common-types.js';
// import { Contract, ledger, pureCircuits, STATE } from '../../contract/src/managed/bboard/contract/index.cjs';
import {
  type ContractPrivateState,
  createContractPrivateState,
  witnesses,
  ZswapCoinPublicKey,
} from 'contract-primitives';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { combineLatest, map, tap, from, type Observable } from 'rxjs';
import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-utils';
import * as utils from './utils';
import { nativeToken } from '@midnight-ntwrk/ledger';
import { pad } from './utils';

const ownerSecretKey = '8c358fc3df48a8159758a8a3bf24b4133c2276fc15aeb4dd69b6af4867e3ef03';
const buyerSecretKey = '2af7a3a7439ccb558703f1d1285e6839cb36ec4df6d831c200e532803cd2d5b2';
const publicKey = fromHex('7cd3976fad87ce476baedfbbacd86ff0074fe3c228594c83091aec5fc2817886');
const ownerKey = pureCircuits.publicKey(fromHex(ownerSecretKey));
const buyerKey = pureCircuits.publicKey(fromHex(buyerSecretKey));

/** @internal */
const contractContractInstance: ContractContract = new Contract(witnesses);

/**
 * An API for a deployed bulletin board.
 */
export interface DeployedContractAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<ContractDerivedState>;

  doStuff: () => Promise<void>;
}

/**
 * Provides an implementation of {@link DeployedBBoardAPI} by adapting a deployed bulletin board
 * contract.
 *
 * @remarks
 * The `BBoardPrivateState` is managed at the DApp level by a private state provider. As such, this
 * private state is shared between all instances of {@link BBoardAPI}, and their underlying deployed
 * contracts. The private state defines a `'secretKey'` property that effectively identifies the current
 * user, and is used to determine if the current user is the poster of the message as the observable
 * contract state changes.
 *
 * In the future, Midnight.js will provide a private state provider that supports private state storage
 * keyed by contract address. This will remove the current workaround of sharing private state across
 * the deployed bulletin board contracts, and allows for a unique secret key to be generated for each bulletin
 * board that the user interacts with.
 */
// TODO: Update BBoardAPI to use contract level private state storage.
export class ContractAPI implements DeployedContractAPI {
  /**
   * Gets the address of the current deployed contract.
   */
  readonly deployedContractAddress: ContractAddress;

  /**
   * Gets an observable stream of state changes based on the current public (ledger),
   * and private state data.
   */
  readonly state$: Observable<ContractDerivedState>;

  /** @internal */
  private constructor(
    public readonly deployedContract: DeployedContractContract,
    providers: ContractProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    this.state$ = combineLatest(
      [
        // Combine public (ledger) state with...
        providers.publicDataProvider
          .contractStateObservable(this.deployedContractAddress, {
            type: 'latest',
          })
          .pipe(
            map((contractState) => ledger(contractState.data)),
            tap((ledgerState) =>
              logger?.trace({
                ledgerStateChanged: {
                  ledgerState: {
                    ...ledgerState,
                  },
                },
              }),
            ),
          ),
        // ...private state...
        //    since the private state of the bulletin board application never changes, we can query the
        //    private state once and always use the same value with `combineLatest`. In applications
        //    where the private state is expected to change, we would need to make this an `Observable`.
        from(providers.privateStateProvider.get(contractPrivateStateKey) as Promise<ContractPrivateState>),
      ],
      // ...and combine them to produce the required derived state.
      (ledgerState, privateState) => {
        const sells: Map<Offer, QualifiedCoinInfo> = new Map();
        const claimables: Map<Offer, QualifiedCoinInfo> = new Map();
        for (const [k, v] of ledgerState.sells) {
          const parsedQCI = Object.fromEntries(
            Object.entries(v).map(([k1, v1]) => {
              if (k1 === 'nonce' || k1 === 'color') {
                return [k1, uint8ArrayToString(v1 as Uint8Array)];
              }
              return [k1, v1];
            }),
          );
          sells.set(k, parsedQCI);
        }
        for (const [k, v] of ledgerState.claimables) {
          const parsedQCI = Object.fromEntries(
            Object.entries(v).map(([k1, v1]) => {
              if (k1 === 'nonce' || k1 === 'color') {
                return [k1, uint8ArrayToString(v1 as Uint8Array)];
              }
              return [k1, v1];
            }),
          );
          claimables.set(k, parsedQCI);
        }
        return {
          assetInfo: ledgerState.assetInfo,
          expectedCoinType: uint8ArrayToString(ledgerState.expectedCoinType),
          unitPrice: ledgerState.unitPrice,
          availableShares: ledgerState.availableShares,
          sells: sells,
          claimables: claimables,
        };
      },
    );
  }

  coin(amount: number): CoinInfo {
    return {
      color: encodeTokenType(nativeToken()),
      nonce: utils.randomBytes(32),
      value: BigInt(amount),
    };
  }

  /**
   * Attempts to post a given message to the bulletin board.
   *
   * @param message The message to post.
   *
   * @remarks
   * This method can fail during local circuit execution if the bulletin board is currently occupied.
   */
  async doStuff(): Promise<void> {
    this.logger?.info(`doing stuff...`);

    const coin = this.coin(10000);
    const dom_sep = pad('holaholaholaholaholaholaholahola', 32); //"hola" // utils.randomBytes(32);
    console.dir({
      nonce: toHex(coin.nonce),
      color: toHex(coin.color),
      value: coin.value,
    });
    const txData = await this.deployedContract.callTx.mintShare(10n, coin);

    this.logger?.trace({
      transactionAdded: {
        circuit: 'doStuff',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  /**
   * Deploys a new bulletin board contract to the network.
   *
   * @param providers The bulletin board providers.
   * @param logger An optional 'pino' logger to use for logging.
   * @returns A `Promise` that resolves with a {@link BBoardAPI} instance that manages the newly deployed
   * {@link DeployedBBoardContract}; or rejects with a deployment error.
   */
  static async deploy(providers: ContractProviders, logger?: Logger): Promise<ContractAPI> {
    logger?.info('deployContract');
    const owner: ZswapCoinPublicKey = {
      bytes: ownerKey,
    };
    const assetInfo: AssetPublicInfo = {
      kind: 'plots',
      description: 'my plots',
    };
    const coinType = encodeTokenType(nativeToken());
    const unitPrice = 1000n;
    const availableShares = 1000n;
    const domain_sep = pad('holaholaholaholaholaholaholahola', 32); //"hola" // utils.randomBytes(32);

    const deployedContractContract = await deployContract(providers, {
      privateStateId: contractPrivateStateKey,
      contract: contractContractInstance,
      initialPrivateState: await ContractAPI.getPrivateState(providers),
      args: [owner, assetInfo, coinType, unitPrice, availableShares, domain_sep],
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedContractContract.deployTxData.public,
      },
    });

    return new ContractAPI(deployedContractContract, providers, logger);
  }

  /**
   * Finds an already deployed bulletin board contract on the network, and joins it.
   *
   * @param providers The bulletin board providers.
   * @param contractAddress The contract address of the deployed bulletin board contract to search for and join.
   * @param logger An optional 'pino' logger to use for logging.
   * @returns A `Promise` that resolves with a {@link BBoardAPI} instance that manages the joined
   * {@link DeployedBBoardContract}; or rejects with an error.
   */
  static async join(
    providers: ContractProviders,
    contractAddress: ContractAddress,
    logger?: Logger,
  ): Promise<ContractAPI> {
    logger?.info({
      joinContract: {
        contractAddress,
      },
    });

    const deployedBBoardContract = await findDeployedContract<ContractContract>(providers, {
      contractAddress,
      contract: contractContractInstance,
      privateStateId: contractPrivateStateKey,
      initialPrivateState: await ContractAPI.getPrivateState(providers),
    });

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedBBoardContract.deployTxData.public,
      },
    });

    return new ContractAPI(deployedBBoardContract, providers, logger);
  }

  private static async getPrivateState(providers: ContractProviders): Promise<ContractPrivateState> {
    const existingPrivateState = await providers.privateStateProvider.get(contractPrivateStateKey);
    return existingPrivateState ?? createContractPrivateState(utils.randomBytes(32), utils.randomBytes(32));
  }
}

/**
 * A namespace that represents the exports from the `'utils'` sub-package.
 *
 * @public
 */
export * from './common-types';
export * as utils from './utils';
