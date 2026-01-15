import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export type DataKey = {tag: "ConfigManager", values: void} | {tag: "Token", values: void} | {tag: "TotalShares", values: void} | {tag: "TotalDeposits", values: void} | {tag: "Shares", values: readonly [string]} | {tag: "ReservedLiquidity", values: void} | {tag: "AuthorizedPositionManager", values: void} | {tag: "PositionCollateral", values: readonly [u64]};

export interface Client {
  /**
   * Construct and simulate a token transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the token address for this pool.
   * 
   * # Returns
   * 
   * The token contract address
   */
  token: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deposit tokens into the liquidity pool and receive LP shares.
   * 
   * # Arguments
   * 
   * * `user` - The address of the depositor
   * * `amount` - The amount of tokens to deposit
   * 
   * # Returns
   * 
   * The number of LP shares minted to the user
   * 
   * # Panics
   * 
   * Panics if amount is not positive
   */
  deposit: ({user, amount}: {user: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraw tokens from the liquidity pool by burning LP shares.
   * 
   * # Arguments
   * 
   * * `user` - The address of the withdrawer
   * * `shares` - The number of LP shares to burn
   * 
   * # Returns
   * 
   * The amount of tokens returned to the user
   * 
   * # Panics
   * 
   * Panics if shares is not positive, if total_shares is zero,
   * or if withdrawal would violate liquidity constraints
   */
  withdraw: ({user, shares}: {user: string, shares: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_shares transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the LP share balance for a user.
   * 
   * # Arguments
   * 
   * * `user` - The address to query
   * 
   * # Returns
   * 
   * The number of LP shares owned by the user
   */
  get_shares: ({user}: {user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the liquidity pool with config manager and token addresses.
   * 
   * # Arguments
   * 
   * * `admin` - The administrator address (must authorize)
   * * `config_manager` - The Config Manager contract address
   * * `token` - The token contract address for this pool
   * 
   * # Panics
   * 
   * Panics if the pool is already initialized or admin doesn't authorize
   */
  initialize: ({admin, config_manager, token}: {admin: string, config_manager: string, token: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a config_manager transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the Config Manager address.
   * 
   * # Returns
   * 
   * The Config Manager contract address
   */
  config_manager: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_total_shares transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the total number of LP shares in circulation.
   * 
   * # Returns
   * 
   * The total number of LP shares
   */
  get_total_shares: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a release_liquidity transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Release liquidity when a position is closed.
   * 
   * # Arguments
   * 
   * * `position_manager` - The Position Manager contract address
   * * `position_id` - The position ID
   * * `size` - The position size (notional value) to release
   * 
   * # Panics
   * 
   * Panics if caller is not the authorized position manager
   */
  release_liquidity: ({position_manager, position_id, size}: {position_manager: string, position_id: u64, size: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a reserve_liquidity transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Reserve liquidity when a position is opened.
   * 
   * # Arguments
   * 
   * * `position_manager` - The Position Manager contract address
   * * `position_id` - The position ID
   * * `size` - The position size (notional value) to reserve
   * * `collateral` - The collateral amount deposited
   * 
   * # Panics
   * 
   * Panics if caller is not the authorized position manager
   */
  reserve_liquidity: ({position_manager, position_id, size, collateral}: {position_manager: string, position_id: u64, size: u128, collateral: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_total_deposits transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the total amount of tokens deposited in the pool.
   * 
   * # Returns
   * 
   * The total deposited token amount
   */
  get_total_deposits: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a set_position_manager transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set the authorized position manager that can reserve/release liquidity.
   * 
   * # Arguments
   * 
   * * `admin` - The admin address (must match ConfigManager admin)
   * * `position_manager` - The Position Manager contract address
   * 
   * # Panics
   * 
   * Panics if caller is not authorized
   */
  set_position_manager: ({admin, position_manager}: {admin: string, position_manager: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_utilization_ratio transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the pool utilization ratio in basis points.
   * 
   * # Returns
   * 
   * The utilization ratio in basis points (e.g., 8000 = 80%)
   */
  get_utilization_ratio: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_reserved_liquidity transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the total reserved liquidity.
   * 
   * # Returns
   * 
   * The total liquidity reserved for open positions
   */
  get_reserved_liquidity: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u128>>

  /**
   * Construct and simulate a get_available_liquidity transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the available liquidity (total balance - reserved).
   * 
   * # Returns
   * 
   * The liquidity available for withdrawal or new positions
   */
  get_available_liquidity: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_position_collateral transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the collateral deposited for a specific position.
   * 
   * # Arguments
   * 
   * * `position_id` - The position ID
   * 
   * # Returns
   * 
   * The collateral amount for the position
   */
  get_position_collateral: ({position_id}: {position_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u128>>

  /**
   * Construct and simulate a deposit_position_collateral transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deposit collateral for a position.
   * 
   * # Arguments
   * 
   * * `position_manager` - The Position Manager contract address
   * * `position_id` - The position ID
   * * `trader` - The trader's address
   * * `amount` - The collateral amount to deposit
   * 
   * # Panics
   * 
   * Panics if caller is not the authorized position manager
   */
  deposit_position_collateral: ({position_manager, position_id, trader, amount}: {position_manager: string, position_id: u64, trader: string, amount: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a withdraw_position_collateral transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraw collateral for a position (when closing).
   * 
   * # Arguments
   * 
   * * `position_manager` - The Position Manager contract address
   * * `position_id` - The position ID
   * * `trader` - The trader's address
   * * `amount` - The collateral amount to withdraw
   * 
   * # Panics
   * 
   * Panics if caller is not the authorized position manager
   */
  withdraw_position_collateral: ({position_manager, position_id, trader, amount}: {position_manager: string, position_id: u64, trader: string, amount: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAACAAAAAAAAAAAAAAADUNvbmZpZ01hbmFnZXIAAAAAAAAAAAAAAAAAAAVUb2tlbgAAAAAAAAAAAAAAAAAAC1RvdGFsU2hhcmVzAAAAAAAAAAAAAAAADVRvdGFsRGVwb3NpdHMAAAAAAAABAAAAAAAAAAZTaGFyZXMAAAAAAAEAAAATAAAAAAAAAAAAAAARUmVzZXJ2ZWRMaXF1aWRpdHkAAAAAAAAAAAAAAAAAABlBdXRob3JpemVkUG9zaXRpb25NYW5hZ2VyAAAAAAAAAQAAAAAAAAASUG9zaXRpb25Db2xsYXRlcmFsAAAAAAABAAAABg==",
        "AAAAAAAAAEtHZXQgdGhlIHRva2VuIGFkZHJlc3MgZm9yIHRoaXMgcG9vbC4KCiMgUmV0dXJucwoKVGhlIHRva2VuIGNvbnRyYWN0IGFkZHJlc3MAAAAABXRva2VuAAAAAAAAAAAAAAEAAAAT",
        "AAAAAAAAAQNEZXBvc2l0IHRva2VucyBpbnRvIHRoZSBsaXF1aWRpdHkgcG9vbCBhbmQgcmVjZWl2ZSBMUCBzaGFyZXMuCgojIEFyZ3VtZW50cwoKKiBgdXNlcmAgLSBUaGUgYWRkcmVzcyBvZiB0aGUgZGVwb3NpdG9yCiogYGFtb3VudGAgLSBUaGUgYW1vdW50IG9mIHRva2VucyB0byBkZXBvc2l0CgojIFJldHVybnMKClRoZSBudW1iZXIgb2YgTFAgc2hhcmVzIG1pbnRlZCB0byB0aGUgdXNlcgoKIyBQYW5pY3MKClBhbmljcyBpZiBhbW91bnQgaXMgbm90IHBvc2l0aXZlAAAAAAdkZXBvc2l0AAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAACw==",
        "AAAAAAAAAVJXaXRoZHJhdyB0b2tlbnMgZnJvbSB0aGUgbGlxdWlkaXR5IHBvb2wgYnkgYnVybmluZyBMUCBzaGFyZXMuCgojIEFyZ3VtZW50cwoKKiBgdXNlcmAgLSBUaGUgYWRkcmVzcyBvZiB0aGUgd2l0aGRyYXdlcgoqIGBzaGFyZXNgIC0gVGhlIG51bWJlciBvZiBMUCBzaGFyZXMgdG8gYnVybgoKIyBSZXR1cm5zCgpUaGUgYW1vdW50IG9mIHRva2VucyByZXR1cm5lZCB0byB0aGUgdXNlcgoKIyBQYW5pY3MKClBhbmljcyBpZiBzaGFyZXMgaXMgbm90IHBvc2l0aXZlLCBpZiB0b3RhbF9zaGFyZXMgaXMgemVybywKb3IgaWYgd2l0aGRyYXdhbCB3b3VsZCB2aW9sYXRlIGxpcXVpZGl0eSBjb25zdHJhaW50cwAAAAAACHdpdGhkcmF3AAAAAgAAAAAAAAAEdXNlcgAAABMAAAAAAAAABnNoYXJlcwAAAAAACwAAAAEAAAAL",
        "AAAAAAAAAIhHZXQgdGhlIExQIHNoYXJlIGJhbGFuY2UgZm9yIGEgdXNlci4KCiMgQXJndW1lbnRzCgoqIGB1c2VyYCAtIFRoZSBhZGRyZXNzIHRvIHF1ZXJ5CgojIFJldHVybnMKClRoZSBudW1iZXIgb2YgTFAgc2hhcmVzIG93bmVkIGJ5IHRoZSB1c2VyAAAACmdldF9zaGFyZXMAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAAAs=",
        "AAAAAAAAAUlJbml0aWFsaXplIHRoZSBsaXF1aWRpdHkgcG9vbCB3aXRoIGNvbmZpZyBtYW5hZ2VyIGFuZCB0b2tlbiBhZGRyZXNzZXMuCgojIEFyZ3VtZW50cwoKKiBgYWRtaW5gIC0gVGhlIGFkbWluaXN0cmF0b3IgYWRkcmVzcyAobXVzdCBhdXRob3JpemUpCiogYGNvbmZpZ19tYW5hZ2VyYCAtIFRoZSBDb25maWcgTWFuYWdlciBjb250cmFjdCBhZGRyZXNzCiogYHRva2VuYCAtIFRoZSB0b2tlbiBjb250cmFjdCBhZGRyZXNzIGZvciB0aGlzIHBvb2wKCiMgUGFuaWNzCgpQYW5pY3MgaWYgdGhlIHBvb2wgaXMgYWxyZWFkeSBpbml0aWFsaXplZCBvciBhZG1pbiBkb2Vzbid0IGF1dGhvcml6ZQAAAAAAAAppbml0aWFsaXplAAAAAAADAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAADmNvbmZpZ19tYW5hZ2VyAAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAA",
        "AAAAAAAAAE9HZXQgdGhlIENvbmZpZyBNYW5hZ2VyIGFkZHJlc3MuCgojIFJldHVybnMKClRoZSBDb25maWcgTWFuYWdlciBjb250cmFjdCBhZGRyZXNzAAAAAA5jb25maWdfbWFuYWdlcgAAAAAAAAAAAAEAAAAT",
        "AAAAAAAAAFtHZXQgdGhlIHRvdGFsIG51bWJlciBvZiBMUCBzaGFyZXMgaW4gY2lyY3VsYXRpb24uCgojIFJldHVybnMKClRoZSB0b3RhbCBudW1iZXIgb2YgTFAgc2hhcmVzAAAAABBnZXRfdG90YWxfc2hhcmVzAAAAAAAAAAEAAAAL",
        "AAAAAAAAARVSZWxlYXNlIGxpcXVpZGl0eSB3aGVuIGEgcG9zaXRpb24gaXMgY2xvc2VkLgoKIyBBcmd1bWVudHMKCiogYHBvc2l0aW9uX21hbmFnZXJgIC0gVGhlIFBvc2l0aW9uIE1hbmFnZXIgY29udHJhY3QgYWRkcmVzcwoqIGBwb3NpdGlvbl9pZGAgLSBUaGUgcG9zaXRpb24gSUQKKiBgc2l6ZWAgLSBUaGUgcG9zaXRpb24gc2l6ZSAobm90aW9uYWwgdmFsdWUpIHRvIHJlbGVhc2UKCiMgUGFuaWNzCgpQYW5pY3MgaWYgY2FsbGVyIGlzIG5vdCB0aGUgYXV0aG9yaXplZCBwb3NpdGlvbiBtYW5hZ2VyAAAAAAAAEXJlbGVhc2VfbGlxdWlkaXR5AAAAAAAAAwAAAAAAAAAQcG9zaXRpb25fbWFuYWdlcgAAABMAAAAAAAAAC3Bvc2l0aW9uX2lkAAAAAAYAAAAAAAAABHNpemUAAAAKAAAAAA==",
        "AAAAAAAAAUZSZXNlcnZlIGxpcXVpZGl0eSB3aGVuIGEgcG9zaXRpb24gaXMgb3BlbmVkLgoKIyBBcmd1bWVudHMKCiogYHBvc2l0aW9uX21hbmFnZXJgIC0gVGhlIFBvc2l0aW9uIE1hbmFnZXIgY29udHJhY3QgYWRkcmVzcwoqIGBwb3NpdGlvbl9pZGAgLSBUaGUgcG9zaXRpb24gSUQKKiBgc2l6ZWAgLSBUaGUgcG9zaXRpb24gc2l6ZSAobm90aW9uYWwgdmFsdWUpIHRvIHJlc2VydmUKKiBgY29sbGF0ZXJhbGAgLSBUaGUgY29sbGF0ZXJhbCBhbW91bnQgZGVwb3NpdGVkCgojIFBhbmljcwoKUGFuaWNzIGlmIGNhbGxlciBpcyBub3QgdGhlIGF1dGhvcml6ZWQgcG9zaXRpb24gbWFuYWdlcgAAAAAAEXJlc2VydmVfbGlxdWlkaXR5AAAAAAAABAAAAAAAAAAQcG9zaXRpb25fbWFuYWdlcgAAABMAAAAAAAAAC3Bvc2l0aW9uX2lkAAAAAAYAAAAAAAAABHNpemUAAAAKAAAAAAAAAApjb2xsYXRlcmFsAAAAAAAKAAAAAA==",
        "AAAAAAAAAGJHZXQgdGhlIHRvdGFsIGFtb3VudCBvZiB0b2tlbnMgZGVwb3NpdGVkIGluIHRoZSBwb29sLgoKIyBSZXR1cm5zCgpUaGUgdG90YWwgZGVwb3NpdGVkIHRva2VuIGFtb3VudAAAAAAAEmdldF90b3RhbF9kZXBvc2l0cwAAAAAAAAAAAAEAAAAL",
        "AAAAAAAAAP9TZXQgdGhlIGF1dGhvcml6ZWQgcG9zaXRpb24gbWFuYWdlciB0aGF0IGNhbiByZXNlcnZlL3JlbGVhc2UgbGlxdWlkaXR5LgoKIyBBcmd1bWVudHMKCiogYGFkbWluYCAtIFRoZSBhZG1pbiBhZGRyZXNzIChtdXN0IG1hdGNoIENvbmZpZ01hbmFnZXIgYWRtaW4pCiogYHBvc2l0aW9uX21hbmFnZXJgIC0gVGhlIFBvc2l0aW9uIE1hbmFnZXIgY29udHJhY3QgYWRkcmVzcwoKIyBQYW5pY3MKClBhbmljcyBpZiBjYWxsZXIgaXMgbm90IGF1dGhvcml6ZWQAAAAAFHNldF9wb3NpdGlvbl9tYW5hZ2VyAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABBwb3NpdGlvbl9tYW5hZ2VyAAAAEwAAAAA=",
        "AAAAAAAAAHRHZXQgdGhlIHBvb2wgdXRpbGl6YXRpb24gcmF0aW8gaW4gYmFzaXMgcG9pbnRzLgoKIyBSZXR1cm5zCgpUaGUgdXRpbGl6YXRpb24gcmF0aW8gaW4gYmFzaXMgcG9pbnRzIChlLmcuLCA4MDAwID0gODAlKQAAABVnZXRfdXRpbGl6YXRpb25fcmF0aW8AAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAF1HZXQgdGhlIHRvdGFsIHJlc2VydmVkIGxpcXVpZGl0eS4KCiMgUmV0dXJucwoKVGhlIHRvdGFsIGxpcXVpZGl0eSByZXNlcnZlZCBmb3Igb3BlbiBwb3NpdGlvbnMAAAAAAAAWZ2V0X3Jlc2VydmVkX2xpcXVpZGl0eQAAAAAAAAAAAAEAAAAK",
        "AAAAAAAAAHtHZXQgdGhlIGF2YWlsYWJsZSBsaXF1aWRpdHkgKHRvdGFsIGJhbGFuY2UgLSByZXNlcnZlZCkuCgojIFJldHVybnMKClRoZSBsaXF1aWRpdHkgYXZhaWxhYmxlIGZvciB3aXRoZHJhd2FsIG9yIG5ldyBwb3NpdGlvbnMAAAAAF2dldF9hdmFpbGFibGVfbGlxdWlkaXR5AAAAAAAAAAABAAAACw==",
        "AAAAAAAAAJhHZXQgdGhlIGNvbGxhdGVyYWwgZGVwb3NpdGVkIGZvciBhIHNwZWNpZmljIHBvc2l0aW9uLgoKIyBBcmd1bWVudHMKCiogYHBvc2l0aW9uX2lkYCAtIFRoZSBwb3NpdGlvbiBJRAoKIyBSZXR1cm5zCgpUaGUgY29sbGF0ZXJhbCBhbW91bnQgZm9yIHRoZSBwb3NpdGlvbgAAABdnZXRfcG9zaXRpb25fY29sbGF0ZXJhbAAAAAABAAAAAAAAAAtwb3NpdGlvbl9pZAAAAAAGAAAAAQAAAAo=",
        "AAAAAAAAASJEZXBvc2l0IGNvbGxhdGVyYWwgZm9yIGEgcG9zaXRpb24uCgojIEFyZ3VtZW50cwoKKiBgcG9zaXRpb25fbWFuYWdlcmAgLSBUaGUgUG9zaXRpb24gTWFuYWdlciBjb250cmFjdCBhZGRyZXNzCiogYHBvc2l0aW9uX2lkYCAtIFRoZSBwb3NpdGlvbiBJRAoqIGB0cmFkZXJgIC0gVGhlIHRyYWRlcidzIGFkZHJlc3MKKiBgYW1vdW50YCAtIFRoZSBjb2xsYXRlcmFsIGFtb3VudCB0byBkZXBvc2l0CgojIFBhbmljcwoKUGFuaWNzIGlmIGNhbGxlciBpcyBub3QgdGhlIGF1dGhvcml6ZWQgcG9zaXRpb24gbWFuYWdlcgAAAAAAG2RlcG9zaXRfcG9zaXRpb25fY29sbGF0ZXJhbAAAAAAEAAAAAAAAABBwb3NpdGlvbl9tYW5hZ2VyAAAAEwAAAAAAAAALcG9zaXRpb25faWQAAAAABgAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAA",
        "AAAAAAAAATNXaXRoZHJhdyBjb2xsYXRlcmFsIGZvciBhIHBvc2l0aW9uICh3aGVuIGNsb3NpbmcpLgoKIyBBcmd1bWVudHMKCiogYHBvc2l0aW9uX21hbmFnZXJgIC0gVGhlIFBvc2l0aW9uIE1hbmFnZXIgY29udHJhY3QgYWRkcmVzcwoqIGBwb3NpdGlvbl9pZGAgLSBUaGUgcG9zaXRpb24gSUQKKiBgdHJhZGVyYCAtIFRoZSB0cmFkZXIncyBhZGRyZXNzCiogYGFtb3VudGAgLSBUaGUgY29sbGF0ZXJhbCBhbW91bnQgdG8gd2l0aGRyYXcKCiMgUGFuaWNzCgpQYW5pY3MgaWYgY2FsbGVyIGlzIG5vdCB0aGUgYXV0aG9yaXplZCBwb3NpdGlvbiBtYW5hZ2VyAAAAABx3aXRoZHJhd19wb3NpdGlvbl9jb2xsYXRlcmFsAAAABAAAAAAAAAAQcG9zaXRpb25fbWFuYWdlcgAAABMAAAAAAAAAC3Bvc2l0aW9uX2lkAAAAAAYAAAAAAAAABnRyYWRlcgAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    token: this.txFromJSON<string>,
        deposit: this.txFromJSON<i128>,
        withdraw: this.txFromJSON<i128>,
        get_shares: this.txFromJSON<i128>,
        initialize: this.txFromJSON<null>,
        config_manager: this.txFromJSON<string>,
        get_total_shares: this.txFromJSON<i128>,
        release_liquidity: this.txFromJSON<null>,
        reserve_liquidity: this.txFromJSON<null>,
        get_total_deposits: this.txFromJSON<i128>,
        set_position_manager: this.txFromJSON<null>,
        get_utilization_ratio: this.txFromJSON<u32>,
        get_reserved_liquidity: this.txFromJSON<u128>,
        get_available_liquidity: this.txFromJSON<i128>,
        get_position_collateral: this.txFromJSON<u128>,
        deposit_position_collateral: this.txFromJSON<null>,
        withdraw_position_collateral: this.txFromJSON<null>
  }
}