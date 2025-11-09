import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from '@stellar/stellar-sdk/contract';
import type { u32, i128 } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export interface Client {
    /**
     * Construct and simulate a pause_market transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Pause a market to prevent new positions from being opened.
     *
     * # Arguments
     *
     * * `market_id` - The market identifier
     */
    pause_market: ({ market_id }: {
        market_id: u32;
    }, options?: {
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
    }) => Promise<AssembledTransaction<null>>;
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
    create_market: ({ market_id, max_open_interest, max_funding_rate }: {
        market_id: u32;
        max_open_interest: i128;
        max_funding_rate: i128;
    }, options?: {
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
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a unpause_market transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Unpause a market to allow new positions.
     *
     * # Arguments
     *
     * * `market_id` - The market identifier
     */
    unpause_market: ({ market_id }: {
        market_id: u32;
    }, options?: {
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
    }) => Promise<AssembledTransaction<null>>;
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
    get_funding_rate: ({ market_id }: {
        market_id: u32;
    }, options?: {
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
    }) => Promise<AssembledTransaction<i128>>;
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
    is_market_paused: ({ market_id }: {
        market_id: u32;
    }, options?: {
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
    }) => Promise<AssembledTransaction<boolean>>;
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
    can_open_position: ({ market_id, is_long, size }: {
        market_id: u32;
        is_long: boolean;
        size: i128;
    }, options?: {
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
    }) => Promise<AssembledTransaction<boolean>>;
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
    get_open_interest: ({ market_id }: {
        market_id: u32;
    }, options?: {
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
    }) => Promise<AssembledTransaction<readonly [i128, i128]>>;
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
    update_funding_rate: ({ market_id }: {
        market_id: u32;
    }, options?: {
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
    }) => Promise<AssembledTransaction<null>>;
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
    update_open_interest: ({ market_id, is_long, size_delta }: {
        market_id: u32;
        is_long: boolean;
        size_delta: i128;
    }, options?: {
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
    }) => Promise<AssembledTransaction<null>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        pause_market: (json: string) => AssembledTransaction<null>;
        create_market: (json: string) => AssembledTransaction<null>;
        unpause_market: (json: string) => AssembledTransaction<null>;
        get_funding_rate: (json: string) => AssembledTransaction<bigint>;
        is_market_paused: (json: string) => AssembledTransaction<boolean>;
        can_open_position: (json: string) => AssembledTransaction<boolean>;
        get_open_interest: (json: string) => AssembledTransaction<readonly [bigint, bigint]>;
        update_funding_rate: (json: string) => AssembledTransaction<null>;
        update_open_interest: (json: string) => AssembledTransaction<null>;
    };
}
