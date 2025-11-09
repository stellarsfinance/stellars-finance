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





export interface Client {
  /**
   * Construct and simulate a pause_market transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Pause a market to prevent new positions from being opened.
   * 
   * # Arguments
   * 
   * * `market_id` - The market identifier
   */
  pause_market: ({market_id}: {market_id: u32}, options?: {
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
   * Construct and simulate a create_market transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize a new perpetual market.
   * 
   * # Arguments
   * 
   * * `market_id` - Unique identifier for the market (e.g., 0 = XLM-PERP)
   * * `max_open_interest` - Maximum total open interest allowed for this market
   * * `max_funding_rate` - Maximum funding rate per hour (in basis points)
   */
  create_market: ({market_id, max_open_interest, max_funding_rate}: {market_id: u32, max_open_interest: i128, max_funding_rate: i128}, options?: {
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
   * Construct and simulate a unpause_market transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Unpause a market to allow new positions.
   * 
   * # Arguments
   * 
   * * `market_id` - The market identifier
   */
  unpause_market: ({market_id}: {market_id: u32}, options?: {
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
   * Construct and simulate a get_funding_rate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the current funding rate for a market.
   * 
   * # Arguments
   * 
   * * `market_id` - The market identifier
   * 
   * # Returns
   * 
   * The current funding rate (in basis points per hour)
   */
  get_funding_rate: ({market_id}: {market_id: u32}, options?: {
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
   * Construct and simulate a is_market_paused transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if a market is currently paused.
   * 
   * # Arguments
   * 
   * * `market_id` - The market identifier
   * 
   * # Returns
   * 
   * True if market is paused, false otherwise
   */
  is_market_paused: ({market_id}: {market_id: u32}, options?: {
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
   * Construct and simulate a can_open_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if a new position can be opened based on OI limits.
   * 
   * # Arguments
   * 
   * * `market_id` - The market identifier
   * * `is_long` - True if long position, false if short
   * * `size` - The size of the position to open
   * 
   * # Returns
   * 
   * True if position can be opened, false otherwise
   */
  can_open_position: ({market_id, is_long, size}: {market_id: u32, is_long: boolean, size: i128}, options?: {
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
   * Construct and simulate a get_open_interest transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the current open interest for a market.
   * 
   * # Arguments
   * 
   * * `market_id` - The market identifier
   * 
   * # Returns
   * 
   * Tuple of (long_open_interest, short_open_interest)
   */
  get_open_interest: ({market_id}: {market_id: u32}, options?: {
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
  }) => Promise<AssembledTransaction<readonly [i128, i128]>>

  /**
   * Construct and simulate a update_funding_rate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update the funding rate for a market.
   * 
   * Called every 60 seconds by the keeper bot.
   * 
   * # Arguments
   * 
   * * `market_id` - The market identifier
   */
  update_funding_rate: ({market_id}: {market_id: u32}, options?: {
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
   * Construct and simulate a update_open_interest transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update open interest when positions are opened or closed.
   * 
   * # Arguments
   * 
   * * `market_id` - The market identifier
   * * `is_long` - True if long position, false if short
   * * `size_delta` - Change in position size (positive = increase, negative = decrease)
   */
  update_open_interest: ({market_id, is_long, size_delta}: {market_id: u32, is_long: boolean, size_delta: i128}, options?: {
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
      new ContractSpec([ "AAAAAAAAAG5QYXVzZSBhIG1hcmtldCB0byBwcmV2ZW50IG5ldyBwb3NpdGlvbnMgZnJvbSBiZWluZyBvcGVuZWQuCgojIEFyZ3VtZW50cwoKKiBgbWFya2V0X2lkYCAtIFRoZSBtYXJrZXQgaWRlbnRpZmllcgAAAAAADHBhdXNlX21hcmtldAAAAAEAAAAAAAAACW1hcmtldF9pZAAAAAAAAAQAAAAA",
        "AAAAAAAAAQlJbml0aWFsaXplIGEgbmV3IHBlcnBldHVhbCBtYXJrZXQuCgojIEFyZ3VtZW50cwoKKiBgbWFya2V0X2lkYCAtIFVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgbWFya2V0IChlLmcuLCAwID0gWExNLVBFUlApCiogYG1heF9vcGVuX2ludGVyZXN0YCAtIE1heGltdW0gdG90YWwgb3BlbiBpbnRlcmVzdCBhbGxvd2VkIGZvciB0aGlzIG1hcmtldAoqIGBtYXhfZnVuZGluZ19yYXRlYCAtIE1heGltdW0gZnVuZGluZyByYXRlIHBlciBob3VyIChpbiBiYXNpcyBwb2ludHMpAAAAAAAADWNyZWF0ZV9tYXJrZXQAAAAAAAADAAAAAAAAAAltYXJrZXRfaWQAAAAAAAAEAAAAAAAAABFtYXhfb3Blbl9pbnRlcmVzdAAAAAAAAAsAAAAAAAAAEG1heF9mdW5kaW5nX3JhdGUAAAALAAAAAA==",
        "AAAAAAAAAFxVbnBhdXNlIGEgbWFya2V0IHRvIGFsbG93IG5ldyBwb3NpdGlvbnMuCgojIEFyZ3VtZW50cwoKKiBgbWFya2V0X2lkYCAtIFRoZSBtYXJrZXQgaWRlbnRpZmllcgAAAA51bnBhdXNlX21hcmtldAAAAAAAAQAAAAAAAAAJbWFya2V0X2lkAAAAAAAABAAAAAA=",
        "AAAAAAAAAJ5HZXQgdGhlIGN1cnJlbnQgZnVuZGluZyByYXRlIGZvciBhIG1hcmtldC4KCiMgQXJndW1lbnRzCgoqIGBtYXJrZXRfaWRgIC0gVGhlIG1hcmtldCBpZGVudGlmaWVyCgojIFJldHVybnMKClRoZSBjdXJyZW50IGZ1bmRpbmcgcmF0ZSAoaW4gYmFzaXMgcG9pbnRzIHBlciBob3VyKQAAAAAAEGdldF9mdW5kaW5nX3JhdGUAAAABAAAAAAAAAAltYXJrZXRfaWQAAAAAAAAEAAAAAQAAAAs=",
        "AAAAAAAAAJBDaGVjayBpZiBhIG1hcmtldCBpcyBjdXJyZW50bHkgcGF1c2VkLgoKIyBBcmd1bWVudHMKCiogYG1hcmtldF9pZGAgLSBUaGUgbWFya2V0IGlkZW50aWZpZXIKCiMgUmV0dXJucwoKVHJ1ZSBpZiBtYXJrZXQgaXMgcGF1c2VkLCBmYWxzZSBvdGhlcndpc2UAAAAQaXNfbWFya2V0X3BhdXNlZAAAAAEAAAAAAAAACW1hcmtldF9pZAAAAAAAAAQAAAABAAAAAQ==",
        "AAAAAAAAAQlDaGVjayBpZiBhIG5ldyBwb3NpdGlvbiBjYW4gYmUgb3BlbmVkIGJhc2VkIG9uIE9JIGxpbWl0cy4KCiMgQXJndW1lbnRzCgoqIGBtYXJrZXRfaWRgIC0gVGhlIG1hcmtldCBpZGVudGlmaWVyCiogYGlzX2xvbmdgIC0gVHJ1ZSBpZiBsb25nIHBvc2l0aW9uLCBmYWxzZSBpZiBzaG9ydAoqIGBzaXplYCAtIFRoZSBzaXplIG9mIHRoZSBwb3NpdGlvbiB0byBvcGVuCgojIFJldHVybnMKClRydWUgaWYgcG9zaXRpb24gY2FuIGJlIG9wZW5lZCwgZmFsc2Ugb3RoZXJ3aXNlAAAAAAAAEWNhbl9vcGVuX3Bvc2l0aW9uAAAAAAAAAwAAAAAAAAAJbWFya2V0X2lkAAAAAAAABAAAAAAAAAAHaXNfbG9uZwAAAAABAAAAAAAAAARzaXplAAAACwAAAAEAAAAB",
        "AAAAAAAAAJ5HZXQgdGhlIGN1cnJlbnQgb3BlbiBpbnRlcmVzdCBmb3IgYSBtYXJrZXQuCgojIEFyZ3VtZW50cwoKKiBgbWFya2V0X2lkYCAtIFRoZSBtYXJrZXQgaWRlbnRpZmllcgoKIyBSZXR1cm5zCgpUdXBsZSBvZiAobG9uZ19vcGVuX2ludGVyZXN0LCBzaG9ydF9vcGVuX2ludGVyZXN0KQAAAAAAEWdldF9vcGVuX2ludGVyZXN0AAAAAAAAAQAAAAAAAAAJbWFya2V0X2lkAAAAAAAABAAAAAEAAAPtAAAAAgAAAAsAAAAL",
        "AAAAAAAAAIVVcGRhdGUgdGhlIGZ1bmRpbmcgcmF0ZSBmb3IgYSBtYXJrZXQuCgpDYWxsZWQgZXZlcnkgNjAgc2Vjb25kcyBieSB0aGUga2VlcGVyIGJvdC4KCiMgQXJndW1lbnRzCgoqIGBtYXJrZXRfaWRgIC0gVGhlIG1hcmtldCBpZGVudGlmaWVyAAAAAAAAE3VwZGF0ZV9mdW5kaW5nX3JhdGUAAAAAAQAAAAAAAAAJbWFya2V0X2lkAAAAAAAABAAAAAA=",
        "AAAAAAAAAPVVcGRhdGUgb3BlbiBpbnRlcmVzdCB3aGVuIHBvc2l0aW9ucyBhcmUgb3BlbmVkIG9yIGNsb3NlZC4KCiMgQXJndW1lbnRzCgoqIGBtYXJrZXRfaWRgIC0gVGhlIG1hcmtldCBpZGVudGlmaWVyCiogYGlzX2xvbmdgIC0gVHJ1ZSBpZiBsb25nIHBvc2l0aW9uLCBmYWxzZSBpZiBzaG9ydAoqIGBzaXplX2RlbHRhYCAtIENoYW5nZSBpbiBwb3NpdGlvbiBzaXplIChwb3NpdGl2ZSA9IGluY3JlYXNlLCBuZWdhdGl2ZSA9IGRlY3JlYXNlKQAAAAAAABR1cGRhdGVfb3Blbl9pbnRlcmVzdAAAAAMAAAAAAAAACW1hcmtldF9pZAAAAAAAAAQAAAAAAAAAB2lzX2xvbmcAAAAAAQAAAAAAAAAKc2l6ZV9kZWx0YQAAAAAACwAAAAA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    pause_market: this.txFromJSON<null>,
        create_market: this.txFromJSON<null>,
        unpause_market: this.txFromJSON<null>,
        get_funding_rate: this.txFromJSON<i128>,
        is_market_paused: this.txFromJSON<boolean>,
        can_open_position: this.txFromJSON<boolean>,
        get_open_interest: this.txFromJSON<readonly [i128, i128]>,
        update_funding_rate: this.txFromJSON<null>,
        update_open_interest: this.txFromJSON<null>
  }
}