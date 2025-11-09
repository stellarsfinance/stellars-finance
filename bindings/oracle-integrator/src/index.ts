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




export type DataKey = {tag: "ConfigManager", values: void};

export interface Client {
  /**
   * Construct and simulate a get_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the current price for a specific asset from all oracle sources.
   * 
   * # Arguments
   * 
   * * `asset_id` - The asset identifier (e.g., "XLM", "BTC", "ETH")
   * 
   * # Returns
   * 
   * The aggregated (median) price with confidence indicator
   * 
   * # MVP Implementation
   * 
   * Returns a fixed mock price of 100_000_000 (representing $1.00 with 7 decimals).
   * This ensures consistent pricing for MVP testing without price fluctuations.
   */
  get_price: ({asset_id}: {asset_id: u32}, options?: {
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
   * Initialize the OracleIntegrator contract.
   * 
   * # Arguments
   * 
   * * `config_manager` - Address of the ConfigManager contract
   */
  initialize: ({config_manager}: {config_manager: string}, options?: {
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
   * Construct and simulate a validate_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Validate a price feed for staleness and bounds.
   * 
   * # Arguments
   * 
   * * `price` - The price to validate
   * * `timestamp` - The price timestamp
   * * `min_price` - Minimum acceptable price
   * * `max_price` - Maximum acceptable price
   * 
   * # Returns
   * 
   * True if price is valid, false otherwise
   */
  validate_price: ({price, timestamp, min_price, max_price}: {price: i128, timestamp: u64, min_price: i128, max_price: i128}, options?: {
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
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a fetch_dia_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Fetch price from DIA oracle.
   * 
   * # Arguments
   * 
   * * `asset_id` - The asset identifier
   * 
   * # Returns
   * 
   * Tuple of (price, timestamp)
   */
  fetch_dia_price: ({asset_id}: {asset_id: u32}, options?: {
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
  }) => Promise<AssembledTransaction<readonly [i128, u64]>>

  /**
   * Construct and simulate a calculate_median transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Calculate median price from multiple oracle sources.
   * 
   * # Arguments
   * 
   * * `prices` - Array of prices from different oracles
   * 
   * # Returns
   * 
   * The median price
   */
  calculate_median: (options?: {
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
   * Construct and simulate a fetch_pyth_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Fetch price from Pyth Network oracle.
   * 
   * # Arguments
   * 
   * * `asset_id` - The asset identifier
   * 
   * # Returns
   * 
   * Tuple of (price, confidence, timestamp)
   */
  fetch_pyth_price: ({asset_id}: {asset_id: u32}, options?: {
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
  }) => Promise<AssembledTransaction<readonly [i128, i128, u64]>>

  /**
   * Construct and simulate a get_oracle_health transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the health status of all oracle sources.
   * 
   * # Returns
   * 
   * Tuple of (pyth_healthy, dia_healthy, reflector_healthy)
   */
  get_oracle_health: (options?: {
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
  }) => Promise<AssembledTransaction<readonly [boolean, boolean, boolean]>>

  /**
   * Construct and simulate a update_cached_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update the cached price for an asset.
   * 
   * Called periodically by keeper bots to maintain fresh prices.
   * 
   * # Arguments
   * 
   * * `asset_id` - The asset identifier
   */
  update_cached_price: ({asset_id}: {asset_id: u32}, options?: {
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
   * Construct and simulate a check_price_deviation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if price deviation between sources exceeds threshold.
   * 
   * # Arguments
   * 
   * * `prices` - Array of prices from different oracles
   * * `threshold_bps` - Maximum allowed deviation in basis points
   * 
   * # Returns
   * 
   * True if deviation is acceptable, false if excessive
   */
  check_price_deviation: ({threshold_bps}: {threshold_bps: u32}, options?: {
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
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a fetch_reflector_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Fetch price from Reflector oracle.
   * 
   * # Arguments
   * 
   * * `asset_id` - The asset identifier
   * 
   * # Returns
   * 
   * Tuple of (price, timestamp)
   */
  fetch_reflector_price: ({asset_id}: {asset_id: u32}, options?: {
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
  }) => Promise<AssembledTransaction<readonly [i128, u64]>>

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
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAQAAAAAAAAAAAAAADUNvbmZpZ01hbmFnZXIAAAA=",
        "AAAAAAAAAYhHZXQgdGhlIGN1cnJlbnQgcHJpY2UgZm9yIGEgc3BlY2lmaWMgYXNzZXQgZnJvbSBhbGwgb3JhY2xlIHNvdXJjZXMuCgojIEFyZ3VtZW50cwoKKiBgYXNzZXRfaWRgIC0gVGhlIGFzc2V0IGlkZW50aWZpZXIgKGUuZy4sICJYTE0iLCAiQlRDIiwgIkVUSCIpCgojIFJldHVybnMKClRoZSBhZ2dyZWdhdGVkIChtZWRpYW4pIHByaWNlIHdpdGggY29uZmlkZW5jZSBpbmRpY2F0b3IKCiMgTVZQIEltcGxlbWVudGF0aW9uCgpSZXR1cm5zIGEgZml4ZWQgbW9jayBwcmljZSBvZiAxMDBfMDAwXzAwMCAocmVwcmVzZW50aW5nICQxLjAwIHdpdGggNyBkZWNpbWFscykuClRoaXMgZW5zdXJlcyBjb25zaXN0ZW50IHByaWNpbmcgZm9yIE1WUCB0ZXN0aW5nIHdpdGhvdXQgcHJpY2UgZmx1Y3R1YXRpb25zLgAAAAlnZXRfcHJpY2UAAAAAAAABAAAAAAAAAAhhc3NldF9pZAAAAAQAAAABAAAACw==",
        "AAAAAAAAAHJJbml0aWFsaXplIHRoZSBPcmFjbGVJbnRlZ3JhdG9yIGNvbnRyYWN0LgoKIyBBcmd1bWVudHMKCiogYGNvbmZpZ19tYW5hZ2VyYCAtIEFkZHJlc3Mgb2YgdGhlIENvbmZpZ01hbmFnZXIgY29udHJhY3QAAAAAAAppbml0aWFsaXplAAAAAAABAAAAAAAAAA5jb25maWdfbWFuYWdlcgAAAAAAEwAAAAA=",
        "AAAAAAAAAQlWYWxpZGF0ZSBhIHByaWNlIGZlZWQgZm9yIHN0YWxlbmVzcyBhbmQgYm91bmRzLgoKIyBBcmd1bWVudHMKCiogYHByaWNlYCAtIFRoZSBwcmljZSB0byB2YWxpZGF0ZQoqIGB0aW1lc3RhbXBgIC0gVGhlIHByaWNlIHRpbWVzdGFtcAoqIGBtaW5fcHJpY2VgIC0gTWluaW11bSBhY2NlcHRhYmxlIHByaWNlCiogYG1heF9wcmljZWAgLSBNYXhpbXVtIGFjY2VwdGFibGUgcHJpY2UKCiMgUmV0dXJucwoKVHJ1ZSBpZiBwcmljZSBpcyB2YWxpZCwgZmFsc2Ugb3RoZXJ3aXNlAAAAAAAADnZhbGlkYXRlX3ByaWNlAAAAAAAEAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAYAAAAAAAAACW1pbl9wcmljZQAAAAAAAAsAAAAAAAAACW1heF9wcmljZQAAAAAAAAsAAAABAAAAAQ==",
        "AAAAAAAAAHZGZXRjaCBwcmljZSBmcm9tIERJQSBvcmFjbGUuCgojIEFyZ3VtZW50cwoKKiBgYXNzZXRfaWRgIC0gVGhlIGFzc2V0IGlkZW50aWZpZXIKCiMgUmV0dXJucwoKVHVwbGUgb2YgKHByaWNlLCB0aW1lc3RhbXApAAAAAAAPZmV0Y2hfZGlhX3ByaWNlAAAAAAEAAAAAAAAACGFzc2V0X2lkAAAABAAAAAEAAAPtAAAAAgAAAAsAAAAG",
        "AAAAAAAAAJNDYWxjdWxhdGUgbWVkaWFuIHByaWNlIGZyb20gbXVsdGlwbGUgb3JhY2xlIHNvdXJjZXMuCgojIEFyZ3VtZW50cwoKKiBgcHJpY2VzYCAtIEFycmF5IG9mIHByaWNlcyBmcm9tIGRpZmZlcmVudCBvcmFjbGVzCgojIFJldHVybnMKClRoZSBtZWRpYW4gcHJpY2UAAAAAEGNhbGN1bGF0ZV9tZWRpYW4AAAAAAAAAAQAAAAs=",
        "AAAAAAAAAItGZXRjaCBwcmljZSBmcm9tIFB5dGggTmV0d29yayBvcmFjbGUuCgojIEFyZ3VtZW50cwoKKiBgYXNzZXRfaWRgIC0gVGhlIGFzc2V0IGlkZW50aWZpZXIKCiMgUmV0dXJucwoKVHVwbGUgb2YgKHByaWNlLCBjb25maWRlbmNlLCB0aW1lc3RhbXApAAAAABBmZXRjaF9weXRoX3ByaWNlAAAAAQAAAAAAAAAIYXNzZXRfaWQAAAAEAAAAAQAAA+0AAAADAAAACwAAAAsAAAAG",
        "AAAAAAAAAHBHZXQgdGhlIGhlYWx0aCBzdGF0dXMgb2YgYWxsIG9yYWNsZSBzb3VyY2VzLgoKIyBSZXR1cm5zCgpUdXBsZSBvZiAocHl0aF9oZWFsdGh5LCBkaWFfaGVhbHRoeSwgcmVmbGVjdG9yX2hlYWx0aHkpAAAAEWdldF9vcmFjbGVfaGVhbHRoAAAAAAAAAAAAAAEAAAPtAAAAAwAAAAEAAAABAAAAAQ==",
        "AAAAAAAAAJVVcGRhdGUgdGhlIGNhY2hlZCBwcmljZSBmb3IgYW4gYXNzZXQuCgpDYWxsZWQgcGVyaW9kaWNhbGx5IGJ5IGtlZXBlciBib3RzIHRvIG1haW50YWluIGZyZXNoIHByaWNlcy4KCiMgQXJndW1lbnRzCgoqIGBhc3NldF9pZGAgLSBUaGUgYXNzZXQgaWRlbnRpZmllcgAAAAAAABN1cGRhdGVfY2FjaGVkX3ByaWNlAAAAAAEAAAAAAAAACGFzc2V0X2lkAAAABAAAAAA=",
        "AAAAAAAAAPtDaGVjayBpZiBwcmljZSBkZXZpYXRpb24gYmV0d2VlbiBzb3VyY2VzIGV4Y2VlZHMgdGhyZXNob2xkLgoKIyBBcmd1bWVudHMKCiogYHByaWNlc2AgLSBBcnJheSBvZiBwcmljZXMgZnJvbSBkaWZmZXJlbnQgb3JhY2xlcwoqIGB0aHJlc2hvbGRfYnBzYCAtIE1heGltdW0gYWxsb3dlZCBkZXZpYXRpb24gaW4gYmFzaXMgcG9pbnRzCgojIFJldHVybnMKClRydWUgaWYgZGV2aWF0aW9uIGlzIGFjY2VwdGFibGUsIGZhbHNlIGlmIGV4Y2Vzc2l2ZQAAAAAVY2hlY2tfcHJpY2VfZGV2aWF0aW9uAAAAAAAAAQAAAAAAAAANdGhyZXNob2xkX2JwcwAAAAAAAAQAAAABAAAAAQ==",
        "AAAAAAAAAHxGZXRjaCBwcmljZSBmcm9tIFJlZmxlY3RvciBvcmFjbGUuCgojIEFyZ3VtZW50cwoKKiBgYXNzZXRfaWRgIC0gVGhlIGFzc2V0IGlkZW50aWZpZXIKCiMgUmV0dXJucwoKVHVwbGUgb2YgKHByaWNlLCB0aW1lc3RhbXApAAAAFWZldGNoX3JlZmxlY3Rvcl9wcmljZQAAAAAAAAEAAAAAAAAACGFzc2V0X2lkAAAABAAAAAEAAAPtAAAAAgAAAAsAAAAG" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_price: this.txFromJSON<i128>,
        initialize: this.txFromJSON<null>,
        validate_price: this.txFromJSON<boolean>,
        fetch_dia_price: this.txFromJSON<readonly [i128, u64]>,
        calculate_median: this.txFromJSON<i128>,
        fetch_pyth_price: this.txFromJSON<readonly [i128, i128, u64]>,
        get_oracle_health: this.txFromJSON<readonly [boolean, boolean, boolean]>,
        update_cached_price: this.txFromJSON<null>,
        check_price_deviation: this.txFromJSON<boolean>,
        fetch_reflector_price: this.txFromJSON<readonly [i128, u64]>
  }
}