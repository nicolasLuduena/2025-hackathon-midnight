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
 * Bulletin board common types and abstractions.
 *
 * @module
 */

import { type MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
import { type FoundContract } from "@midnight-ntwrk/midnight-js-contracts";
import type {
  ContractPrivateState,
  Contract,
  Witnesses,
  AssetPublicInfo,
  QualifiedCoinInfo,
  Offer,
} from "contract-primitives";

export const contractPrivateStateKey = "contractPrivateState";
export type PrivateStateId = typeof contractPrivateStateKey;

/**
 * The private states consumed throughout the application.
 *
 * @remarks
 * {@link PrivateStates} can be thought of as a type that describes a schema for all
 * private states for all contracts used in the application. Each key represents
 * the type of private state consumed by a particular type of contract.
 * The key is used by the deployed contract when interacting with a private state provider,
 * and the type (i.e., `typeof PrivateStates[K]`) represents the type of private state
 * expected to be returned.
 *
 * Since there is only one contract type for the bulletin board example, we only define a
 * single key/type in the schema.
 *
 * @public
 */
export type PrivateStates = {
  /**
   * Key used to provide the private state for {@link BBoardContract} deployments.
   */
  readonly contractPrivateState: ContractPrivateState;
};

/**
 * Represents a bulletin board contract and its private state.
 *
 * @public
 */
export type ContractContract = Contract<
  ContractPrivateState,
  Witnesses<ContractPrivateState>
>;

/**
 * The keys of the circuits exported from {@link BBoardContract}.
 *
 * @public
 */
export type ContractCircuitKeys = Exclude<
  keyof ContractContract["impureCircuits"],
  number | symbol
>;

/**
 * The providers required by {@link BBoardContract}.
 *
 * @public
 */
export type ContractProviders = MidnightProviders<
  ContractCircuitKeys,
  PrivateStateId,
  ContractPrivateState
>;

/**
 * A {@link BBoardContract} that has been deployed to the network.
 *
 * @public
 */
export type DeployedContractContract = FoundContract<ContractContract>;

export type DerivedProtocolTotal = {
  id: string;
  treasury: {
    nonce: Uint8Array;
    color: Uint8Array;
    value: bigint;
    mt_index: bigint;
  };
};

export type ContractDerivedState = {
  readonly assetInfo: AssetPublicInfo;
  readonly expectedCoinType: string;
  readonly unitPrice: bigint;
  readonly availableShares: bigint;
  readonly sells: Map<Offer, QualifiedCoinInfo>;
  readonly claimables: Map<Offer, QualifiedCoinInfo>;
};


export function parseTreasury(treasury: {
  isEmpty(): boolean;
  size(): bigint;
  member(key_0: Uint8Array): boolean;
  lookup(key_0: Uint8Array): QualifiedCoinInfo;
  [Symbol.iterator](): Iterator<[Uint8Array, QualifiedCoinInfo]>;
}): DerivedProtocolTotal[] {
  return Array.from(treasury).map(([key, bal]) => ({
    id: uint8arraytostring(key),
    treasury: Object.fromEntries(
      Object.entries(bal).map(([k, v]) => {
        if (k === "nonce" || k === "color") {
          return [k, uint8arraytostring(v as Uint8Array)];
        }
        return [k, v];
      })
    ),
  }));
}

export function parseMapCoso(treasury: {
  isEmpty(): boolean;
  size(): bigint;
  member(key_0: Uint8Array): boolean;
  lookup(key_0: Uint8Array): QualifiedCoinInfo;
  [Symbol.iterator](): Iterator<[Uint8Array, QualifiedCoinInfo]>;
}): DerivedProtocolTotal[] {
  return Array.from(treasury).map(([key, bal]) => ({
    id: uint8arraytostring(key),
    treasury: Object.fromEntries(
      Object.entries(bal).map(([k, v]) => {
        if (k === "nonce" || k === "color") {
          return [k, uint8arraytostring(v as Uint8Array)];
        }
        return [k, v];
      })
    ),
  }));
}

//// HELPERS

export function uint8arraytostring(array: Uint8Array): string {
  // Debug logging
  console.log(
    "Converting array:",
    Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
  console.log("Array length:", array.length);

  if (array.length < 16) {
    throw new Error(
      `Array too short for UUID conversion: ${array.length} bytes`
    );
  }

  // Take first 16 bytes and check if they contain actual data
  const uuidBytes = array.slice(0, 16);

  // Check if all bytes are zero (invalid UUID)
  if (uuidBytes.every((byte) => byte === 0)) {
    // Instead of throwing, return a default or handle gracefully
    console.warn(
      "Received all-zero UUID bytes, this might indicate uninitialized data"
    );
    return "00000000-0000-0000-0000-000000000000"; // Return null UUID
    // Or throw with more context:
    // throw new Error(`Invalid UUID: all bytes are zero. Full array: ${Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')}`);
  }

  const hex = Array.from(uuidBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const formatted = [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(formatted)) {
    throw new Error(`Invalid UUID format: ${formatted}`);
  }

  return formatted;
}
