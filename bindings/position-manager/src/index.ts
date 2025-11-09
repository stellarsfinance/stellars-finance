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




export type DataKey = {tag: "Position", values: readonly [u64]} | {tag: "NextPositionId", values: void} | {tag: "ConfigManager", values: void} | {tag: "UserPositions", values: readonly [string]};


export interface Position {
  collateral: u128;
  entry_price: u128;
  is_long: boolean;
  size: u128;
  trader: string;
}



export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the PositionManager contract.
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
   * Construct and simulate a get_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get position details.
   * 
   * # Arguments
   * 
   * * `position_id` - The unique position identifier
   * 
   * # Returns
   * 
   * The Position struct with all position details
   */
  get_position: ({position_id}: {position_id: u64}, options?: {
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
  }) => Promise<AssembledTransaction<Position>>

  /**
   * Construct and simulate a calculate_pnl transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Calculate unrealized PnL for a position.
   * 
   * # Arguments
   * 
   * * `position_id` - The unique position identifier
   * 
   * # Returns
   * 
   * The unrealized PnL (positive for profit, negative for loss)
   */
  calculate_pnl: ({position_id}: {position_id: u64}, options?: {
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
   * Construct and simulate a open_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Open a new perpetual position.
   * 
   * # Arguments
   * 
   * * `trader` - The address of the trader opening the position
   * * `market_id` - The market identifier (e.g., 0 = XLM-PERP, 1 = BTC-PERP, 2 = ETH-PERP)
   * * `collateral` - The amount of collateral to deposit (unsigned, in token base units)
   * * `leverage` - The leverage multiplier (e.g., 5x, 10x, 20x)
   * * `is_long` - True for long position, false for short
   * 
   * # Returns
   * 
   * The position ID
   * 
   * # Implementation
   * 
   * Position size is calculated as: `size = collateral * leverage`
   * - Transfers collateral from trader to contract
   * - Gets entry price from OracleIntegrator
   * - Emits PositionOpened event
   * - No fees applied for MVP
   */
  open_position: ({trader, market_id, collateral, leverage, is_long}: {trader: string, market_id: u32, collateral: u128, leverage: u32, is_long: boolean}, options?: {
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
  }) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a close_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Close an existing position.
   * 
   * # Arguments
   * 
   * * `trader` - The address of the trader closing the position
   * * `position_id` - The unique position identifier
   * 
   * # Returns
   * 
   * The realized PnL (positive for profit, negative for loss)
   * 
   * # MVP Implementation
   * 
   * For MVP:
   * - Returns collateral back to trader (no PnL since price doesn't change)
   * - PnL is always 0
   * - No fees applied
   * - Emits PositionClosed event
   */
  close_position: ({trader, position_id}: {trader: string, position_id: u64}, options?: {
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
   * Construct and simulate a decrease_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Decrease position size or remove collateral.
   * 
   * # Arguments
   * 
   * * `trader` - The address of the trader
   * * `position_id` - The unique position identifier
   * * `collateral_to_remove` - Collateral to remove (0 if none)
   * * `size_to_reduce` - Position size to reduce (0 if none)
   */
  decrease_position: ({trader, position_id, collateral_to_remove, size_to_reduce}: {trader: string, position_id: u64, collateral_to_remove: i128, size_to_reduce: i128}, options?: {
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
   * Construct and simulate a increase_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Increase position size or add collateral.
   * 
   * # Arguments
   * 
   * * `trader` - The address of the trader
   * * `position_id` - The unique position identifier
   * * `additional_collateral` - Additional collateral to add (0 if none)
   * * `additional_size` - Additional position size (0 if none)
   */
  increase_position: ({trader, position_id, additional_collateral, additional_size}: {trader: string, position_id: u64, additional_collateral: i128, additional_size: i128}, options?: {
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
   * Construct and simulate a liquidate_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Liquidate an undercollateralized position.
   * 
   * # Arguments
   * 
   * * `keeper` - The address of the keeper liquidating the position
   * * `position_id` - The unique position identifier
   * 
   * # Returns
   * 
   * The liquidation reward paid to the keeper
   */
  liquidate_position: ({keeper, position_id}: {keeper: string, position_id: u64}, options?: {
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
   * Construct and simulate a get_user_open_positions transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all open position IDs for a specific trader.
   * 
   * # Arguments
   * 
   * * `trader` - The address of the trader
   * 
   * # Returns
   * 
   * A vector of position IDs (u64) for all open positions owned by the trader.
   * Returns an empty vector if the trader has no open positions.
   * 
   * # Usage
   * 
   * Frontend can call this function to get all position IDs for a user,
   * then call `get_position(id)` for each ID to retrieve full position details.
   */
  get_user_open_positions: ({trader}: {trader: string}, options?: {
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
  }) => Promise<AssembledTransaction<Array<u64>>>

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
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAEAAAAAAAAACFBvc2l0aW9uAAAAAQAAAAYAAAAAAAAAAAAAAA5OZXh0UG9zaXRpb25JZAAAAAAAAAAAAAAAAAANQ29uZmlnTWFuYWdlcgAAAAAAAAEAAAAAAAAADVVzZXJQb3NpdGlvbnMAAAAAAAABAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAACFBvc2l0aW9uAAAABQAAAAAAAAAKY29sbGF0ZXJhbAAAAAAACgAAAAAAAAALZW50cnlfcHJpY2UAAAAACgAAAAAAAAAHaXNfbG9uZwAAAAABAAAAAAAAAARzaXplAAAACgAAAAAAAAAGdHJhZGVyAAAAAAAT",
        "AAAAAAAAAHFJbml0aWFsaXplIHRoZSBQb3NpdGlvbk1hbmFnZXIgY29udHJhY3QuCgojIEFyZ3VtZW50cwoKKiBgY29uZmlnX21hbmFnZXJgIC0gQWRkcmVzcyBvZiB0aGUgQ29uZmlnTWFuYWdlciBjb250cmFjdAAAAAAAAAppbml0aWFsaXplAAAAAAABAAAAAAAAAA5jb25maWdfbWFuYWdlcgAAAAAAEwAAAAA=",
        "AAAABQAAAAAAAAAAAAAAE1Bvc2l0aW9uQ2xvc2VkRXZlbnQAAAAAAQAAABVwb3NpdGlvbl9jbG9zZWRfZXZlbnQAAAAAAAADAAAAAAAAAAtwb3NpdGlvbl9pZAAAAAAGAAAAAAAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAAAAAADcG5sAAAAAAsAAAAAAAAAAg==",
        "AAAABQAAAAAAAAAAAAAAE1Bvc2l0aW9uT3BlbmVkRXZlbnQAAAAAAQAAABVwb3NpdGlvbl9vcGVuZWRfZXZlbnQAAAAAAAAIAAAAAAAAAAtwb3NpdGlvbl9pZAAAAAAGAAAAAAAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAAAAAAJbWFya2V0X2lkAAAAAAAABAAAAAAAAAAAAAAACmNvbGxhdGVyYWwAAAAAAAoAAAAAAAAAAAAAAARzaXplAAAACgAAAAAAAAAAAAAACGxldmVyYWdlAAAABAAAAAAAAAAAAAAAB2lzX2xvbmcAAAAAAQAAAAAAAAAAAAAAC2VudHJ5X3ByaWNlAAAAAAoAAAAAAAAAAg==",
        "AAAAAAAAAI5HZXQgcG9zaXRpb24gZGV0YWlscy4KCiMgQXJndW1lbnRzCgoqIGBwb3NpdGlvbl9pZGAgLSBUaGUgdW5pcXVlIHBvc2l0aW9uIGlkZW50aWZpZXIKCiMgUmV0dXJucwoKVGhlIFBvc2l0aW9uIHN0cnVjdCB3aXRoIGFsbCBwb3NpdGlvbiBkZXRhaWxzAAAAAAAMZ2V0X3Bvc2l0aW9uAAAAAQAAAAAAAAALcG9zaXRpb25faWQAAAAABgAAAAEAAAfQAAAACFBvc2l0aW9u",
        "AAAAAAAAAK9DYWxjdWxhdGUgdW5yZWFsaXplZCBQbkwgZm9yIGEgcG9zaXRpb24uCgojIEFyZ3VtZW50cwoKKiBgcG9zaXRpb25faWRgIC0gVGhlIHVuaXF1ZSBwb3NpdGlvbiBpZGVudGlmaWVyCgojIFJldHVybnMKClRoZSB1bnJlYWxpemVkIFBuTCAocG9zaXRpdmUgZm9yIHByb2ZpdCwgbmVnYXRpdmUgZm9yIGxvc3MpAAAAAA1jYWxjdWxhdGVfcG5sAAAAAAAAAQAAAAAAAAALcG9zaXRpb25faWQAAAAABgAAAAEAAAAL",
        "AAAAAAAAAoNPcGVuIGEgbmV3IHBlcnBldHVhbCBwb3NpdGlvbi4KCiMgQXJndW1lbnRzCgoqIGB0cmFkZXJgIC0gVGhlIGFkZHJlc3Mgb2YgdGhlIHRyYWRlciBvcGVuaW5nIHRoZSBwb3NpdGlvbgoqIGBtYXJrZXRfaWRgIC0gVGhlIG1hcmtldCBpZGVudGlmaWVyIChlLmcuLCAwID0gWExNLVBFUlAsIDEgPSBCVEMtUEVSUCwgMiA9IEVUSC1QRVJQKQoqIGBjb2xsYXRlcmFsYCAtIFRoZSBhbW91bnQgb2YgY29sbGF0ZXJhbCB0byBkZXBvc2l0ICh1bnNpZ25lZCwgaW4gdG9rZW4gYmFzZSB1bml0cykKKiBgbGV2ZXJhZ2VgIC0gVGhlIGxldmVyYWdlIG11bHRpcGxpZXIgKGUuZy4sIDV4LCAxMHgsIDIweCkKKiBgaXNfbG9uZ2AgLSBUcnVlIGZvciBsb25nIHBvc2l0aW9uLCBmYWxzZSBmb3Igc2hvcnQKCiMgUmV0dXJucwoKVGhlIHBvc2l0aW9uIElECgojIEltcGxlbWVudGF0aW9uCgpQb3NpdGlvbiBzaXplIGlzIGNhbGN1bGF0ZWQgYXM6IGBzaXplID0gY29sbGF0ZXJhbCAqIGxldmVyYWdlYAotIFRyYW5zZmVycyBjb2xsYXRlcmFsIGZyb20gdHJhZGVyIHRvIGNvbnRyYWN0Ci0gR2V0cyBlbnRyeSBwcmljZSBmcm9tIE9yYWNsZUludGVncmF0b3IKLSBFbWl0cyBQb3NpdGlvbk9wZW5lZCBldmVudAotIE5vIGZlZXMgYXBwbGllZCBmb3IgTVZQAAAAAA1vcGVuX3Bvc2l0aW9uAAAAAAAABQAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAltYXJrZXRfaWQAAAAAAAAEAAAAAAAAAApjb2xsYXRlcmFsAAAAAAAKAAAAAAAAAAhsZXZlcmFnZQAAAAQAAAAAAAAAB2lzX2xvbmcAAAAAAQAAAAEAAAAG",
        "AAAAAAAAAYVDbG9zZSBhbiBleGlzdGluZyBwb3NpdGlvbi4KCiMgQXJndW1lbnRzCgoqIGB0cmFkZXJgIC0gVGhlIGFkZHJlc3Mgb2YgdGhlIHRyYWRlciBjbG9zaW5nIHRoZSBwb3NpdGlvbgoqIGBwb3NpdGlvbl9pZGAgLSBUaGUgdW5pcXVlIHBvc2l0aW9uIGlkZW50aWZpZXIKCiMgUmV0dXJucwoKVGhlIHJlYWxpemVkIFBuTCAocG9zaXRpdmUgZm9yIHByb2ZpdCwgbmVnYXRpdmUgZm9yIGxvc3MpCgojIE1WUCBJbXBsZW1lbnRhdGlvbgoKRm9yIE1WUDoKLSBSZXR1cm5zIGNvbGxhdGVyYWwgYmFjayB0byB0cmFkZXIgKG5vIFBuTCBzaW5jZSBwcmljZSBkb2Vzbid0IGNoYW5nZSkKLSBQbkwgaXMgYWx3YXlzIDAKLSBObyBmZWVzIGFwcGxpZWQKLSBFbWl0cyBQb3NpdGlvbkNsb3NlZCBldmVudAAAAAAAAA5jbG9zZV9wb3NpdGlvbgAAAAAAAgAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAtwb3NpdGlvbl9pZAAAAAAGAAAAAQAAAAs=",
        "AAAAAAAAAQdEZWNyZWFzZSBwb3NpdGlvbiBzaXplIG9yIHJlbW92ZSBjb2xsYXRlcmFsLgoKIyBBcmd1bWVudHMKCiogYHRyYWRlcmAgLSBUaGUgYWRkcmVzcyBvZiB0aGUgdHJhZGVyCiogYHBvc2l0aW9uX2lkYCAtIFRoZSB1bmlxdWUgcG9zaXRpb24gaWRlbnRpZmllcgoqIGBjb2xsYXRlcmFsX3RvX3JlbW92ZWAgLSBDb2xsYXRlcmFsIHRvIHJlbW92ZSAoMCBpZiBub25lKQoqIGBzaXplX3RvX3JlZHVjZWAgLSBQb3NpdGlvbiBzaXplIHRvIHJlZHVjZSAoMCBpZiBub25lKQAAAAARZGVjcmVhc2VfcG9zaXRpb24AAAAAAAAEAAAAAAAAAAZ0cmFkZXIAAAAAABMAAAAAAAAAC3Bvc2l0aW9uX2lkAAAAAAYAAAAAAAAAFGNvbGxhdGVyYWxfdG9fcmVtb3ZlAAAACwAAAAAAAAAOc2l6ZV90b19yZWR1Y2UAAAAAAAsAAAAA",
        "AAAAAAAAAQ9JbmNyZWFzZSBwb3NpdGlvbiBzaXplIG9yIGFkZCBjb2xsYXRlcmFsLgoKIyBBcmd1bWVudHMKCiogYHRyYWRlcmAgLSBUaGUgYWRkcmVzcyBvZiB0aGUgdHJhZGVyCiogYHBvc2l0aW9uX2lkYCAtIFRoZSB1bmlxdWUgcG9zaXRpb24gaWRlbnRpZmllcgoqIGBhZGRpdGlvbmFsX2NvbGxhdGVyYWxgIC0gQWRkaXRpb25hbCBjb2xsYXRlcmFsIHRvIGFkZCAoMCBpZiBub25lKQoqIGBhZGRpdGlvbmFsX3NpemVgIC0gQWRkaXRpb25hbCBwb3NpdGlvbiBzaXplICgwIGlmIG5vbmUpAAAAABFpbmNyZWFzZV9wb3NpdGlvbgAAAAAAAAQAAAAAAAAABnRyYWRlcgAAAAAAEwAAAAAAAAALcG9zaXRpb25faWQAAAAABgAAAAAAAAAVYWRkaXRpb25hbF9jb2xsYXRlcmFsAAAAAAAACwAAAAAAAAAPYWRkaXRpb25hbF9zaXplAAAAAAsAAAAA",
        "AAAAAAAAAN9MaXF1aWRhdGUgYW4gdW5kZXJjb2xsYXRlcmFsaXplZCBwb3NpdGlvbi4KCiMgQXJndW1lbnRzCgoqIGBrZWVwZXJgIC0gVGhlIGFkZHJlc3Mgb2YgdGhlIGtlZXBlciBsaXF1aWRhdGluZyB0aGUgcG9zaXRpb24KKiBgcG9zaXRpb25faWRgIC0gVGhlIHVuaXF1ZSBwb3NpdGlvbiBpZGVudGlmaWVyCgojIFJldHVybnMKClRoZSBsaXF1aWRhdGlvbiByZXdhcmQgcGFpZCB0byB0aGUga2VlcGVyAAAAABJsaXF1aWRhdGVfcG9zaXRpb24AAAAAAAIAAAAAAAAABmtlZXBlcgAAAAAAEwAAAAAAAAALcG9zaXRpb25faWQAAAAABgAAAAEAAAAL",
        "AAAAAAAAAZNHZXQgYWxsIG9wZW4gcG9zaXRpb24gSURzIGZvciBhIHNwZWNpZmljIHRyYWRlci4KCiMgQXJndW1lbnRzCgoqIGB0cmFkZXJgIC0gVGhlIGFkZHJlc3Mgb2YgdGhlIHRyYWRlcgoKIyBSZXR1cm5zCgpBIHZlY3RvciBvZiBwb3NpdGlvbiBJRHMgKHU2NCkgZm9yIGFsbCBvcGVuIHBvc2l0aW9ucyBvd25lZCBieSB0aGUgdHJhZGVyLgpSZXR1cm5zIGFuIGVtcHR5IHZlY3RvciBpZiB0aGUgdHJhZGVyIGhhcyBubyBvcGVuIHBvc2l0aW9ucy4KCiMgVXNhZ2UKCkZyb250ZW5kIGNhbiBjYWxsIHRoaXMgZnVuY3Rpb24gdG8gZ2V0IGFsbCBwb3NpdGlvbiBJRHMgZm9yIGEgdXNlciwKdGhlbiBjYWxsIGBnZXRfcG9zaXRpb24oaWQpYCBmb3IgZWFjaCBJRCB0byByZXRyaWV2ZSBmdWxsIHBvc2l0aW9uIGRldGFpbHMuAAAAABdnZXRfdXNlcl9vcGVuX3Bvc2l0aW9ucwAAAAABAAAAAAAAAAZ0cmFkZXIAAAAAABMAAAABAAAD6gAAAAY=" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        get_position: this.txFromJSON<Position>,
        calculate_pnl: this.txFromJSON<i128>,
        open_position: this.txFromJSON<u64>,
        close_position: this.txFromJSON<i128>,
        decrease_position: this.txFromJSON<null>,
        increase_position: this.txFromJSON<null>,
        liquidate_position: this.txFromJSON<i128>,
        get_user_open_positions: this.txFromJSON<Array<u64>>
  }
}