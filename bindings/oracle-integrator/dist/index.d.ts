import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from '@stellar/stellar-sdk/contract';
import type { u32, u64, i128 } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export type DataKey = {
    tag: "ConfigManager";
    values: void;
};
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
    get_price: ({ asset_id }: {
        asset_id: u32;
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
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Initialize the OracleIntegrator contract.
     *
     * # Arguments
     *
     * * `config_manager` - Address of the ConfigManager contract
     */
    initialize: ({ config_manager }: {
        config_manager: string;
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
    validate_price: ({ price, timestamp, min_price, max_price }: {
        price: i128;
        timestamp: u64;
        min_price: i128;
        max_price: i128;
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
    fetch_dia_price: ({ asset_id }: {
        asset_id: u32;
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
    }) => Promise<AssembledTransaction<readonly [i128, u64]>>;
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
    }) => Promise<AssembledTransaction<i128>>;
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
    fetch_pyth_price: ({ asset_id }: {
        asset_id: u32;
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
    }) => Promise<AssembledTransaction<readonly [i128, i128, u64]>>;
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
    }) => Promise<AssembledTransaction<readonly [boolean, boolean, boolean]>>;
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
    update_cached_price: ({ asset_id }: {
        asset_id: u32;
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
    check_price_deviation: ({ threshold_bps }: {
        threshold_bps: u32;
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
    fetch_reflector_price: ({ asset_id }: {
        asset_id: u32;
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
    }) => Promise<AssembledTransaction<readonly [i128, u64]>>;
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
        get_price: (json: string) => AssembledTransaction<bigint>;
        initialize: (json: string) => AssembledTransaction<null>;
        validate_price: (json: string) => AssembledTransaction<boolean>;
        fetch_dia_price: (json: string) => AssembledTransaction<readonly [bigint, bigint]>;
        calculate_median: (json: string) => AssembledTransaction<bigint>;
        fetch_pyth_price: (json: string) => AssembledTransaction<readonly [bigint, bigint, bigint]>;
        get_oracle_health: (json: string) => AssembledTransaction<readonly [boolean, boolean, boolean]>;
        update_cached_price: (json: string) => AssembledTransaction<null>;
        check_price_deviation: (json: string) => AssembledTransaction<boolean>;
        fetch_reflector_price: (json: string) => AssembledTransaction<readonly [bigint, bigint]>;
    };
}
