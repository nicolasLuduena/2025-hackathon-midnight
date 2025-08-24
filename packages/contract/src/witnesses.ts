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

/*
 * This file defines the shape of the bulletin board's private state,
 * as well as the single witness function that accesses it.
 */

import { Ledger } from "./managed/tokenization/contract/index.cjs";
import { WitnessContext } from "@midnight-ntwrk/compact-runtime";

export type ContractPrivateState = {
  readonly secret_key: Uint8Array;
  readonly salt: Uint8Array;
};

export const createContractPrivateState = (
  secretKey: Uint8Array,
  salt: Uint8Array,
) => {
  return {
    secret_key: secretKey,
    salt,
  };
};
/* **********************************************************************
 * The witnesses object for the bulletin board contract is an object
 * with a field for each witness function, mapping the name of the function
 * to its implementation.
 *
 * The implementation of each function always takes as its first argument
 * a value of type WitnessContext<L, PS>, where L is the ledger object type
 * that corresponds to the ledger declaration in the Compact code, and PS
 *  is the private state type, like BBoardPrivateState defined above.
 *
 * A WitnessContext has three
 * fields:
 *  - ledger: T
 *  - privateState: PS
 *  - contractAddress: string
 *
 * The other arguments (after the first) to each witness function
 * correspond to the ones declared in Compact for the witness function.
 * The function's return value is a tuple of the new private state and
 * the declared return value.  In this case, that's a BBoardPrivateState
 * and a Uint8Array (because the contract declared a return value of Bytes[32],
 * and that's a Uint8Array in TypeScript).
 *
 * The localSecretKey witness does not need the ledger or contractAddress
 * from the WitnessContext, so it uses the parameter notation that puts
 * only the binding for the privateState in scope.
 */
// export const witnesses = {
//   localSecretKey: ({
//     privateState,
//   }: WitnessContext<Ledger, BBoardPrivateState>): [
//     BBoardPrivateState,
//     Uint8Array,
//   ] => [privateState, privateState.secretKey],
// };

export const witnesses = {
  secret_key: ({
    privateState,
  }: WitnessContext<Ledger, ContractPrivateState>): [
      ContractPrivateState,
      Uint8Array,
    ] => [privateState, privateState.secret_key],
  salt: ({
    privateState,
  }: WitnessContext<Ledger, ContractPrivateState>): [
      ContractPrivateState,
      Uint8Array,
    ] => [privateState, privateState.salt],
};
