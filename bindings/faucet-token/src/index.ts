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




export type DataKey = {tag: "Name", values: void} | {tag: "Symbol", values: void} | {tag: "Decimals", values: void} | {tag: "TotalSupply", values: void} | {tag: "Balance", values: readonly [string]} | {tag: "Allowance", values: readonly [AllowanceDataKey]};


export interface AllowanceValue {
  amount: i128;
  live_until_ledger: u32;
}


export interface AllowanceDataKey {
  from: string;
  spender: string;
}

export interface Client {
  /**
   * Construct and simulate a burn transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Burn tokens from an address, reducing total supply.
   * 
   * # Arguments
   * 
   * * `from` - The address to burn tokens from
   * * `amount` - The amount of tokens to burn
   * 
   * # Panics
   * 
   * Panics if amount is not positive or if address has insufficient balance
   */
  burn: ({from, amount}: {from: string, amount: i128}, options?: {
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
   * Construct and simulate a mint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Mint tokens to any address. Anyone can call this function.
   * 
   * # Arguments
   * 
   * * `to` - The address to receive the tokens
   * * `amount` - The amount of tokens to mint
   * 
   * # Panics
   * 
   * Panics if amount is not positive
   */
  mint: ({to, amount}: {to: string, amount: i128}, options?: {
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
   * Construct and simulate a name transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the token name.
   * 
   * # Returns
   * 
   * The token name
   */
  name: (options?: {
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
   * Construct and simulate a symbol transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the token symbol.
   * 
   * # Returns
   * 
   * The token symbol
   */
  symbol: (options?: {
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
   * Construct and simulate a approve transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Approve a spender to spend tokens on behalf of the owner.
   * 
   * # Arguments
   * 
   * * `from` - The address that owns the tokens
   * * `spender` - The address authorized to spend
   * * `amount` - The amount the spender is allowed to spend
   * * `live_until_ledger` - The ledger sequence number when the allowance expires
   * 
   * # Panics
   * 
   * Panics if amount is negative or if expiration is in the past
   */
  approve: ({from, spender, amount, live_until_ledger}: {from: string, spender: string, amount: i128, live_until_ledger: u32}, options?: {
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
   * Construct and simulate a balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the balance of a specific address.
   * 
   * # Arguments
   * 
   * * `addr` - The address to query
   * 
   * # Returns
   * 
   * The token balance of the address
   */
  balance: ({addr}: {addr: string}, options?: {
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
   * Construct and simulate a decimals transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the number of decimals.
   * 
   * # Returns
   * 
   * The number of decimal places
   */
  decimals: (options?: {
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
   * Construct and simulate a transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Transfer tokens from one address to another.
   * 
   * # Arguments
   * 
   * * `from` - The address sending tokens
   * * `to` - The address receiving tokens
   * * `amount` - The amount of tokens to transfer
   * 
   * # Panics
   * 
   * Panics if amount is not positive or if sender has insufficient balance
   */
  transfer: ({from, to, amount}: {from: string, to: string, amount: i128}, options?: {
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
   * Construct and simulate a allowance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the allowance for a spender.
   * 
   * # Arguments
   * 
   * * `from` - The address that owns the tokens
   * * `spender` - The address authorized to spend
   * 
   * # Returns
   * 
   * The amount the spender is allowed to spend
   */
  allowance: ({from, spender}: {from: string, spender: string}, options?: {
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
   * Construct and simulate a burn_from transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Burn tokens from an address on behalf of the owner.
   * Requires proper allowance to be set via approve().
   * 
   * # Arguments
   * 
   * * `spender` - The address authorized to burn
   * * `from` - The address to burn tokens from
   * * `amount` - The amount of tokens to burn
   * 
   * # Panics
   * 
   * Panics if amount is not positive, if address has insufficient balance,
   * or if allowance is insufficient or expired
   */
  burn_from: ({spender, from, amount}: {spender: string, from: string, amount: i128}, options?: {
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
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the token with name, symbol, and decimals.
   * 
   * # Arguments
   * 
   * * `name` - The token name (e.g., "Test USDC")
   * * `symbol` - The token symbol (e.g., "USDC")
   * * `decimals` - The number of decimal places (typically 7 for Stellar)
   * 
   * # Panics
   * 
   * Panics if the token is already initialized
   */
  initialize: ({name, symbol, decimals}: {name: string, symbol: string, decimals: u32}, options?: {
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
   * Construct and simulate a total_supply transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the total token supply.
   * 
   * # Returns
   * 
   * The total number of tokens minted
   */
  total_supply: (options?: {
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
   * Construct and simulate a transfer_from transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Transfer tokens from one address to another on behalf of the owner.
   * Requires proper allowance to be set via approve().
   * 
   * # Arguments
   * 
   * * `spender` - The address authorized to spend
   * * `from` - The address sending tokens
   * * `to` - The address receiving tokens
   * * `amount` - The amount of tokens to transfer
   * 
   * # Panics
   * 
   * Panics if amount is not positive, if sender has insufficient balance,
   * or if allowance is insufficient or expired
   */
  transfer_from: ({spender, from, to, amount}: {spender: string, from: string, to: string, amount: i128}, options?: {
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
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABgAAAAAAAAAAAAAABE5hbWUAAAAAAAAAAAAAAAZTeW1ib2wAAAAAAAAAAAAAAAAACERlY2ltYWxzAAAAAAAAAAAAAAALVG90YWxTdXBwbHkAAAAAAQAAAAAAAAAHQmFsYW5jZQAAAAABAAAAEwAAAAEAAAAAAAAACUFsbG93YW5jZQAAAAAAAAEAAAfQAAAAEEFsbG93YW5jZURhdGFLZXk=",
        "AAAAAAAAAOlCdXJuIHRva2VucyBmcm9tIGFuIGFkZHJlc3MsIHJlZHVjaW5nIHRvdGFsIHN1cHBseS4KCiMgQXJndW1lbnRzCgoqIGBmcm9tYCAtIFRoZSBhZGRyZXNzIHRvIGJ1cm4gdG9rZW5zIGZyb20KKiBgYW1vdW50YCAtIFRoZSBhbW91bnQgb2YgdG9rZW5zIHRvIGJ1cm4KCiMgUGFuaWNzCgpQYW5pY3MgaWYgYW1vdW50IGlzIG5vdCBwb3NpdGl2ZSBvciBpZiBhZGRyZXNzIGhhcyBpbnN1ZmZpY2llbnQgYmFsYW5jZQAAAAAAAARidXJuAAAAAgAAAAAAAAAEZnJvbQAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAA=",
        "AAAAAAAAAMlNaW50IHRva2VucyB0byBhbnkgYWRkcmVzcy4gQW55b25lIGNhbiBjYWxsIHRoaXMgZnVuY3Rpb24uCgojIEFyZ3VtZW50cwoKKiBgdG9gIC0gVGhlIGFkZHJlc3MgdG8gcmVjZWl2ZSB0aGUgdG9rZW5zCiogYGFtb3VudGAgLSBUaGUgYW1vdW50IG9mIHRva2VucyB0byBtaW50CgojIFBhbmljcwoKUGFuaWNzIGlmIGFtb3VudCBpcyBub3QgcG9zaXRpdmUAAAAAAAAEbWludAAAAAIAAAAAAAAAAnRvAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAA",
        "AAAAAAAAAC5HZXQgdGhlIHRva2VuIG5hbWUuCgojIFJldHVybnMKClRoZSB0b2tlbiBuYW1lAAAAAAAEbmFtZQAAAAAAAAABAAAAEA==",
        "AAAAAAAAADJHZXQgdGhlIHRva2VuIHN5bWJvbC4KCiMgUmV0dXJucwoKVGhlIHRva2VuIHN5bWJvbAAAAAAABnN5bWJvbAAAAAAAAAAAAAEAAAAQ",
        "AAAAAAAAAW9BcHByb3ZlIGEgc3BlbmRlciB0byBzcGVuZCB0b2tlbnMgb24gYmVoYWxmIG9mIHRoZSBvd25lci4KCiMgQXJndW1lbnRzCgoqIGBmcm9tYCAtIFRoZSBhZGRyZXNzIHRoYXQgb3ducyB0aGUgdG9rZW5zCiogYHNwZW5kZXJgIC0gVGhlIGFkZHJlc3MgYXV0aG9yaXplZCB0byBzcGVuZAoqIGBhbW91bnRgIC0gVGhlIGFtb3VudCB0aGUgc3BlbmRlciBpcyBhbGxvd2VkIHRvIHNwZW5kCiogYGxpdmVfdW50aWxfbGVkZ2VyYCAtIFRoZSBsZWRnZXIgc2VxdWVuY2UgbnVtYmVyIHdoZW4gdGhlIGFsbG93YW5jZSBleHBpcmVzCgojIFBhbmljcwoKUGFuaWNzIGlmIGFtb3VudCBpcyBuZWdhdGl2ZSBvciBpZiBleHBpcmF0aW9uIGlzIGluIHRoZSBwYXN0AAAAAAdhcHByb3ZlAAAAAAQAAAAAAAAABGZyb20AAAATAAAAAAAAAAdzcGVuZGVyAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAARbGl2ZV91bnRpbF9sZWRnZXIAAAAAAAAEAAAAAA==",
        "AAAAAAAAAIFHZXQgdGhlIGJhbGFuY2Ugb2YgYSBzcGVjaWZpYyBhZGRyZXNzLgoKIyBBcmd1bWVudHMKCiogYGFkZHJgIC0gVGhlIGFkZHJlc3MgdG8gcXVlcnkKCiMgUmV0dXJucwoKVGhlIHRva2VuIGJhbGFuY2Ugb2YgdGhlIGFkZHJlc3MAAAAAAAAHYmFsYW5jZQAAAAABAAAAAAAAAARhZGRyAAAAEwAAAAEAAAAL",
        "AAAAAAAAAERHZXQgdGhlIG51bWJlciBvZiBkZWNpbWFscy4KCiMgUmV0dXJucwoKVGhlIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcwAAAAhkZWNpbWFscwAAAAAAAAABAAAABA==",
        "AAAAAAAAAQZUcmFuc2ZlciB0b2tlbnMgZnJvbSBvbmUgYWRkcmVzcyB0byBhbm90aGVyLgoKIyBBcmd1bWVudHMKCiogYGZyb21gIC0gVGhlIGFkZHJlc3Mgc2VuZGluZyB0b2tlbnMKKiBgdG9gIC0gVGhlIGFkZHJlc3MgcmVjZWl2aW5nIHRva2VucwoqIGBhbW91bnRgIC0gVGhlIGFtb3VudCBvZiB0b2tlbnMgdG8gdHJhbnNmZXIKCiMgUGFuaWNzCgpQYW5pY3MgaWYgYW1vdW50IGlzIG5vdCBwb3NpdGl2ZSBvciBpZiBzZW5kZXIgaGFzIGluc3VmZmljaWVudCBiYWxhbmNlAAAAAAAIdHJhbnNmZXIAAAADAAAAAAAAAARmcm9tAAAAEwAAAAAAAAACdG8AAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAA=",
        "AAAAAAAAAL9HZXQgdGhlIGFsbG93YW5jZSBmb3IgYSBzcGVuZGVyLgoKIyBBcmd1bWVudHMKCiogYGZyb21gIC0gVGhlIGFkZHJlc3MgdGhhdCBvd25zIHRoZSB0b2tlbnMKKiBgc3BlbmRlcmAgLSBUaGUgYWRkcmVzcyBhdXRob3JpemVkIHRvIHNwZW5kCgojIFJldHVybnMKClRoZSBhbW91bnQgdGhlIHNwZW5kZXIgaXMgYWxsb3dlZCB0byBzcGVuZAAAAAAJYWxsb3dhbmNlAAAAAAAAAgAAAAAAAAAEZnJvbQAAABMAAAAAAAAAB3NwZW5kZXIAAAAAEwAAAAEAAAAL",
        "AAAAAAAAAXNCdXJuIHRva2VucyBmcm9tIGFuIGFkZHJlc3Mgb24gYmVoYWxmIG9mIHRoZSBvd25lci4KUmVxdWlyZXMgcHJvcGVyIGFsbG93YW5jZSB0byBiZSBzZXQgdmlhIGFwcHJvdmUoKS4KCiMgQXJndW1lbnRzCgoqIGBzcGVuZGVyYCAtIFRoZSBhZGRyZXNzIGF1dGhvcml6ZWQgdG8gYnVybgoqIGBmcm9tYCAtIFRoZSBhZGRyZXNzIHRvIGJ1cm4gdG9rZW5zIGZyb20KKiBgYW1vdW50YCAtIFRoZSBhbW91bnQgb2YgdG9rZW5zIHRvIGJ1cm4KCiMgUGFuaWNzCgpQYW5pY3MgaWYgYW1vdW50IGlzIG5vdCBwb3NpdGl2ZSwgaWYgYWRkcmVzcyBoYXMgaW5zdWZmaWNpZW50IGJhbGFuY2UsCm9yIGlmIGFsbG93YW5jZSBpcyBpbnN1ZmZpY2llbnQgb3IgZXhwaXJlZAAAAAAJYnVybl9mcm9tAAAAAAAAAwAAAAAAAAAHc3BlbmRlcgAAAAATAAAAAAAAAARmcm9tAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
        "AAAAAQAAAAAAAAAAAAAADkFsbG93YW5jZVZhbHVlAAAAAAACAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAEWxpdmVfdW50aWxfbGVkZ2VyAAAAAAAABA==",
        "AAAAAAAAARpJbml0aWFsaXplIHRoZSB0b2tlbiB3aXRoIG5hbWUsIHN5bWJvbCwgYW5kIGRlY2ltYWxzLgoKIyBBcmd1bWVudHMKCiogYG5hbWVgIC0gVGhlIHRva2VuIG5hbWUgKGUuZy4sICJUZXN0IFVTREMiKQoqIGBzeW1ib2xgIC0gVGhlIHRva2VuIHN5bWJvbCAoZS5nLiwgIlVTREMiKQoqIGBkZWNpbWFsc2AgLSBUaGUgbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzICh0eXBpY2FsbHkgNyBmb3IgU3RlbGxhcikKCiMgUGFuaWNzCgpQYW5pY3MgaWYgdGhlIHRva2VuIGlzIGFscmVhZHkgaW5pdGlhbGl6ZWQAAAAAAAppbml0aWFsaXplAAAAAAADAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAGc3ltYm9sAAAAAAAQAAAAAAAAAAhkZWNpbWFscwAAAAQAAAAA",
        "AAAAAQAAAAAAAAAAAAAAEEFsbG93YW5jZURhdGFLZXkAAAACAAAAAAAAAARmcm9tAAAAEwAAAAAAAAAHc3BlbmRlcgAAAAAT",
        "AAAAAAAAAElHZXQgdGhlIHRvdGFsIHRva2VuIHN1cHBseS4KCiMgUmV0dXJucwoKVGhlIHRvdGFsIG51bWJlciBvZiB0b2tlbnMgbWludGVkAAAAAAAADHRvdGFsX3N1cHBseQAAAAAAAAABAAAACw==",
        "AAAAAAAAAahUcmFuc2ZlciB0b2tlbnMgZnJvbSBvbmUgYWRkcmVzcyB0byBhbm90aGVyIG9uIGJlaGFsZiBvZiB0aGUgb3duZXIuClJlcXVpcmVzIHByb3BlciBhbGxvd2FuY2UgdG8gYmUgc2V0IHZpYSBhcHByb3ZlKCkuCgojIEFyZ3VtZW50cwoKKiBgc3BlbmRlcmAgLSBUaGUgYWRkcmVzcyBhdXRob3JpemVkIHRvIHNwZW5kCiogYGZyb21gIC0gVGhlIGFkZHJlc3Mgc2VuZGluZyB0b2tlbnMKKiBgdG9gIC0gVGhlIGFkZHJlc3MgcmVjZWl2aW5nIHRva2VucwoqIGBhbW91bnRgIC0gVGhlIGFtb3VudCBvZiB0b2tlbnMgdG8gdHJhbnNmZXIKCiMgUGFuaWNzCgpQYW5pY3MgaWYgYW1vdW50IGlzIG5vdCBwb3NpdGl2ZSwgaWYgc2VuZGVyIGhhcyBpbnN1ZmZpY2llbnQgYmFsYW5jZSwKb3IgaWYgYWxsb3dhbmNlIGlzIGluc3VmZmljaWVudCBvciBleHBpcmVkAAAADXRyYW5zZmVyX2Zyb20AAAAAAAAEAAAAAAAAAAdzcGVuZGVyAAAAABMAAAAAAAAABGZyb20AAAATAAAAAAAAAAJ0bwAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    burn: this.txFromJSON<null>,
        mint: this.txFromJSON<null>,
        name: this.txFromJSON<string>,
        symbol: this.txFromJSON<string>,
        approve: this.txFromJSON<null>,
        balance: this.txFromJSON<i128>,
        decimals: this.txFromJSON<u32>,
        transfer: this.txFromJSON<null>,
        allowance: this.txFromJSON<i128>,
        burn_from: this.txFromJSON<null>,
        initialize: this.txFromJSON<null>,
        total_supply: this.txFromJSON<i128>,
        transfer_from: this.txFromJSON<null>
  }
}