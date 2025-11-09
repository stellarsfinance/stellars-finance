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




export type DataKey = {tag: "ConfigManager", values: void} | {tag: "Token", values: void} | {tag: "TotalShares", values: void} | {tag: "TotalDeposits", values: void} | {tag: "Shares", values: readonly [string]};

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
   * Panics if shares is not positive or if total_shares is zero
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
   * * `config_manager` - The Config Manager contract address
   * * `token` - The token contract address for this pool
   * 
   * # Panics
   * 
   * Panics if the pool is already initialized
   */
  initialize: ({config_manager, token}: {config_manager: string, token: string}, options?: {
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
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAADUNvbmZpZ01hbmFnZXIAAAAAAAAAAAAAAAAAAAVUb2tlbgAAAAAAAAAAAAAAAAAAC1RvdGFsU2hhcmVzAAAAAAAAAAAAAAAADVRvdGFsRGVwb3NpdHMAAAAAAAABAAAAAAAAAAZTaGFyZXMAAAAAAAEAAAAT",
        "AAAAAAAAAEtHZXQgdGhlIHRva2VuIGFkZHJlc3MgZm9yIHRoaXMgcG9vbC4KCiMgUmV0dXJucwoKVGhlIHRva2VuIGNvbnRyYWN0IGFkZHJlc3MAAAAABXRva2VuAAAAAAAAAAAAAAEAAAAT",
        "AAAAAAAAAQNEZXBvc2l0IHRva2VucyBpbnRvIHRoZSBsaXF1aWRpdHkgcG9vbCBhbmQgcmVjZWl2ZSBMUCBzaGFyZXMuCgojIEFyZ3VtZW50cwoKKiBgdXNlcmAgLSBUaGUgYWRkcmVzcyBvZiB0aGUgZGVwb3NpdG9yCiogYGFtb3VudGAgLSBUaGUgYW1vdW50IG9mIHRva2VucyB0byBkZXBvc2l0CgojIFJldHVybnMKClRoZSBudW1iZXIgb2YgTFAgc2hhcmVzIG1pbnRlZCB0byB0aGUgdXNlcgoKIyBQYW5pY3MKClBhbmljcyBpZiBhbW91bnQgaXMgbm90IHBvc2l0aXZlAAAAAAdkZXBvc2l0AAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAACw==",
        "AAAAAAAAAR5XaXRoZHJhdyB0b2tlbnMgZnJvbSB0aGUgbGlxdWlkaXR5IHBvb2wgYnkgYnVybmluZyBMUCBzaGFyZXMuCgojIEFyZ3VtZW50cwoKKiBgdXNlcmAgLSBUaGUgYWRkcmVzcyBvZiB0aGUgd2l0aGRyYXdlcgoqIGBzaGFyZXNgIC0gVGhlIG51bWJlciBvZiBMUCBzaGFyZXMgdG8gYnVybgoKIyBSZXR1cm5zCgpUaGUgYW1vdW50IG9mIHRva2VucyByZXR1cm5lZCB0byB0aGUgdXNlcgoKIyBQYW5pY3MKClBhbmljcyBpZiBzaGFyZXMgaXMgbm90IHBvc2l0aXZlIG9yIGlmIHRvdGFsX3NoYXJlcyBpcyB6ZXJvAAAAAAAId2l0aGRyYXcAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAGc2hhcmVzAAAAAAALAAAAAQAAAAs=",
        "AAAAAAAAAIhHZXQgdGhlIExQIHNoYXJlIGJhbGFuY2UgZm9yIGEgdXNlci4KCiMgQXJndW1lbnRzCgoqIGB1c2VyYCAtIFRoZSBhZGRyZXNzIHRvIHF1ZXJ5CgojIFJldHVybnMKClRoZSBudW1iZXIgb2YgTFAgc2hhcmVzIG93bmVkIGJ5IHRoZSB1c2VyAAAACmdldF9zaGFyZXMAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAAAs=",
        "AAAAAAAAAPdJbml0aWFsaXplIHRoZSBsaXF1aWRpdHkgcG9vbCB3aXRoIGNvbmZpZyBtYW5hZ2VyIGFuZCB0b2tlbiBhZGRyZXNzZXMuCgojIEFyZ3VtZW50cwoKKiBgY29uZmlnX21hbmFnZXJgIC0gVGhlIENvbmZpZyBNYW5hZ2VyIGNvbnRyYWN0IGFkZHJlc3MKKiBgdG9rZW5gIC0gVGhlIHRva2VuIGNvbnRyYWN0IGFkZHJlc3MgZm9yIHRoaXMgcG9vbAoKIyBQYW5pY3MKClBhbmljcyBpZiB0aGUgcG9vbCBpcyBhbHJlYWR5IGluaXRpYWxpemVkAAAAAAppbml0aWFsaXplAAAAAAACAAAAAAAAAA5jb25maWdfbWFuYWdlcgAAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAE9HZXQgdGhlIENvbmZpZyBNYW5hZ2VyIGFkZHJlc3MuCgojIFJldHVybnMKClRoZSBDb25maWcgTWFuYWdlciBjb250cmFjdCBhZGRyZXNzAAAAAA5jb25maWdfbWFuYWdlcgAAAAAAAAAAAAEAAAAT",
        "AAAAAAAAAFtHZXQgdGhlIHRvdGFsIG51bWJlciBvZiBMUCBzaGFyZXMgaW4gY2lyY3VsYXRpb24uCgojIFJldHVybnMKClRoZSB0b3RhbCBudW1iZXIgb2YgTFAgc2hhcmVzAAAAABBnZXRfdG90YWxfc2hhcmVzAAAAAAAAAAEAAAAL",
        "AAAAAAAAAGJHZXQgdGhlIHRvdGFsIGFtb3VudCBvZiB0b2tlbnMgZGVwb3NpdGVkIGluIHRoZSBwb29sLgoKIyBSZXR1cm5zCgpUaGUgdG90YWwgZGVwb3NpdGVkIHRva2VuIGFtb3VudAAAAAAAEmdldF90b3RhbF9kZXBvc2l0cwAAAAAAAAAAAAEAAAAL" ]),
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
        get_total_deposits: this.txFromJSON<i128>
  }
}