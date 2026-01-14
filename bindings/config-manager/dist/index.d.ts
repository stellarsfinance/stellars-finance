import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from '@stellar/stellar-sdk/contract';
import type { u64, i128 } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export type DataKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "LiquidityPoolContract";
    values: void;
} | {
    tag: "PositionManagerContract";
    values: void;
} | {
    tag: "MarketManagerContract";
    values: void;
} | {
    tag: "OracleIntegratorContract";
    values: void;
} | {
    tag: "TokenContract";
    values: void;
} | {
    tag: "MinLeverage";
    values: void;
} | {
    tag: "MaxLeverage";
    values: void;
} | {
    tag: "MinPositionSize";
    values: void;
} | {
    tag: "MakerFeeBps";
    values: void;
} | {
    tag: "TakerFeeBps";
    values: void;
} | {
    tag: "LiquidationFeeBps";
    values: void;
} | {
    tag: "LiquidationThreshold";
    values: void;
} | {
    tag: "MaintenanceMargin";
    values: void;
} | {
    tag: "MaxPriceDeviationBps";
    values: void;
} | {
    tag: "FundingInterval";
    values: void;
} | {
    tag: "PriceStalenessThreshold";
    values: void;
} | {
    tag: "MaxUtilizationRatio";
    values: void;
} | {
    tag: "MinLiquidityReserveRatio";
    values: void;
} | {
    tag: "Config";
    values: readonly [string];
};
export interface Client {
    /**
     * Construct and simulate a admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the current admin address.
     *
     * # Returns
     *
     * The administrator address
     */
    admin: (options?: {
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
    }) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a token transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the Token contract address.
     *
     * # Returns
     *
     * The Token contract address
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
    }) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a set_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Update the admin address.
     *
     * # Arguments
     *
     * * `current_admin` - The current administrator address
     * * `new_admin` - The new administrator address
     *
     * # Panics
     *
     * Panics if caller is not the current admin
     */
    set_admin: ({ current_admin, new_admin }: {
        current_admin: string;
        new_admin: string;
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
     * Construct and simulate a set_token transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Set the Token contract address.
     *
     * # Arguments
     *
     * * `admin` - The administrator address
     * * `contract` - The Token contract address
     *
     * # Panics
     *
     * Panics if caller is not the admin
     */
    set_token: ({ admin, contract }: {
        admin: string;
        contract: string;
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
     * Construct and simulate a get_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get a configuration parameter using a Symbol key.
     *
     * # Arguments
     *
     * * `key` - The configuration parameter key
     *
     * # Returns
     *
     * The parameter value, or 0 if not set
     */
    get_config: ({ key }: {
        key: string;
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
     * Initialize the configuration contract with admin.
     *
     * # Arguments
     *
     * * `admin` - The administrator address
     *
     * # Panics
     *
     * Panics if already initialized
     */
    initialize: ({ admin }: {
        admin: string;
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
     * Construct and simulate a set_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Set a configuration parameter using a Symbol key.
     *
     * # Arguments
     *
     * * `admin` - The administrator address (must match stored admin)
     * * `key` - The configuration parameter key
     * * `value` - The new value for the parameter
     *
     * # Panics
     *
     * Panics if caller is not the admin
     */
    set_config: ({ admin, key, value }: {
        admin: string;
        key: string;
        value: i128;
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
     * Construct and simulate a max_leverage transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get maximum leverage limit.
     *
     * # Returns
     *
     * Maximum leverage (default: 20)
     */
    max_leverage: (options?: {
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
     * Construct and simulate a min_leverage transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get minimum leverage limit.
     *
     * # Returns
     *
     * Minimum leverage (default: 5)
     */
    min_leverage: (options?: {
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
     * Construct and simulate a maker_fee_bps transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get maker fee in basis points.
     *
     * # Returns
     *
     * Maker fee in basis points (default: 2)
     */
    maker_fee_bps: (options?: {
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
     * Construct and simulate a taker_fee_bps transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get taker fee in basis points.
     *
     * # Returns
     *
     * Taker fee in basis points (default: 5)
     */
    taker_fee_bps: (options?: {
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
     * Construct and simulate a liquidity_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the Liquidity Pool contract address.
     *
     * # Returns
     *
     * The Liquidity Pool contract address
     */
    liquidity_pool: (options?: {
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
    }) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a market_manager transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the Market Manager contract address.
     *
     * # Returns
     *
     * The Market Manager contract address
     */
    market_manager: (options?: {
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
    }) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a get_time_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get a time-based configuration parameter using a Symbol key.
     *
     * # Arguments
     *
     * * `key` - The configuration parameter key
     *
     * # Returns
     *
     * The parameter value as u64, or 0 if not set
     */
    get_time_config: ({ key }: {
        key: string;
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
    }) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a funding_interval transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get funding interval in seconds.
     *
     * # Returns
     *
     * Funding interval in seconds (default: 60)
     */
    funding_interval: (options?: {
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
    }) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a position_manager transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the Position Manager contract address.
     *
     * # Returns
     *
     * The Position Manager contract address
     */
    position_manager: (options?: {
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
    }) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a min_position_size transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get minimum position size.
     *
     * # Returns
     *
     * Minimum position size in base units
     */
    min_position_size: (options?: {
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
     * Construct and simulate a oracle_integrator transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the Oracle Integrator contract address.
     *
     * # Returns
     *
     * The Oracle Integrator contract address
     */
    oracle_integrator: (options?: {
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
    }) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a maintenance_margin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get maintenance margin in basis points.
     *
     * # Returns
     *
     * Maintenance margin in basis points (default: 5000)
     */
    maintenance_margin: (options?: {
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
     * Construct and simulate a set_liquidity_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Set the Liquidity Pool contract address.
     *
     * # Arguments
     *
     * * `admin` - The administrator address
     * * `contract` - The Liquidity Pool contract address
     *
     * # Panics
     *
     * Panics if caller is not the admin
     */
    set_liquidity_pool: ({ admin, contract }: {
        admin: string;
        contract: string;
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
     * Construct and simulate a set_market_manager transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Set the Market Manager contract address.
     *
     * # Arguments
     *
     * * `admin` - The administrator address
     * * `contract` - The Market Manager contract address
     *
     * # Panics
     *
     * Panics if caller is not the admin
     */
    set_market_manager: ({ admin, contract }: {
        admin: string;
        contract: string;
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
     * Construct and simulate a liquidation_fee_bps transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get liquidation fee in basis points.
     *
     * # Returns
     *
     * Liquidation fee in basis points (default: 50)
     */
    liquidation_fee_bps: (options?: {
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
     * Construct and simulate a set_position_manager transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Set the Position Manager contract address.
     *
     * # Arguments
     *
     * * `admin` - The administrator address
     * * `contract` - The Position Manager contract address
     *
     * # Panics
     *
     * Panics if caller is not the admin
     */
    set_position_manager: ({ admin, contract }: {
        admin: string;
        contract: string;
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
     * Construct and simulate a liquidation_threshold transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get liquidation threshold in basis points.
     *
     * # Returns
     *
     * Liquidation threshold in basis points (default: 9000)
     */
    liquidation_threshold: (options?: {
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
     * Construct and simulate a max_utilization_ratio transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get maximum pool utilization ratio in basis points.
     *
     * # Returns
     *
     * Maximum utilization ratio in basis points (default: 8000 = 80%)
     */
    max_utilization_ratio: (options?: {
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
     * Construct and simulate a set_oracle_integrator transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Set the Oracle Integrator contract address.
     *
     * # Arguments
     *
     * * `admin` - The administrator address
     * * `contract` - The Oracle Integrator contract address
     *
     * # Panics
     *
     * Panics if caller is not the admin
     */
    set_oracle_integrator: ({ admin, contract }: {
        admin: string;
        contract: string;
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
     * Construct and simulate a max_price_deviation_bps transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get maximum price deviation in basis points.
     *
     * # Returns
     *
     * Maximum price deviation in basis points (default: 500)
     */
    max_price_deviation_bps: (options?: {
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
     * Construct and simulate a price_staleness_threshold transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get price staleness threshold in seconds.
     *
     * # Returns
     *
     * Price staleness threshold in seconds (default: 60)
     */
    price_staleness_threshold: (options?: {
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
    }) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a set_max_utilization_ratio transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Set maximum pool utilization ratio in basis points.
     *
     * # Arguments
     *
     * * `admin` - The administrator address
     * * `ratio` - The maximum utilization ratio in basis points (e.g., 8000 = 80%)
     *
     * # Panics
     *
     * Panics if caller is not the admin or ratio is invalid
     */
    set_max_utilization_ratio: ({ admin, ratio }: {
        admin: string;
        ratio: i128;
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
     * Construct and simulate a min_liquidity_reserve_ratio transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get minimum liquidity reserve ratio in basis points.
     *
     * # Returns
     *
     * Minimum reserve ratio in basis points (default: 2000 = 20%)
     */
    min_liquidity_reserve_ratio: (options?: {
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
     * Construct and simulate a set_min_liquidity_reserve_ratio transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Set minimum liquidity reserve ratio in basis points.
     *
     * # Arguments
     *
     * * `admin` - The administrator address
     * * `ratio` - The minimum reserve ratio in basis points (e.g., 2000 = 20%)
     *
     * # Panics
     *
     * Panics if caller is not the admin or ratio is invalid
     */
    set_min_liquidity_reserve_ratio: ({ admin, ratio }: {
        admin: string;
        ratio: i128;
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
        admin: (json: string) => AssembledTransaction<string>;
        token: (json: string) => AssembledTransaction<string>;
        set_admin: (json: string) => AssembledTransaction<null>;
        set_token: (json: string) => AssembledTransaction<null>;
        get_config: (json: string) => AssembledTransaction<bigint>;
        initialize: (json: string) => AssembledTransaction<null>;
        set_config: (json: string) => AssembledTransaction<null>;
        max_leverage: (json: string) => AssembledTransaction<bigint>;
        min_leverage: (json: string) => AssembledTransaction<bigint>;
        maker_fee_bps: (json: string) => AssembledTransaction<bigint>;
        taker_fee_bps: (json: string) => AssembledTransaction<bigint>;
        liquidity_pool: (json: string) => AssembledTransaction<string>;
        market_manager: (json: string) => AssembledTransaction<string>;
        get_time_config: (json: string) => AssembledTransaction<bigint>;
        funding_interval: (json: string) => AssembledTransaction<bigint>;
        position_manager: (json: string) => AssembledTransaction<string>;
        min_position_size: (json: string) => AssembledTransaction<bigint>;
        oracle_integrator: (json: string) => AssembledTransaction<string>;
        maintenance_margin: (json: string) => AssembledTransaction<bigint>;
        set_liquidity_pool: (json: string) => AssembledTransaction<null>;
        set_market_manager: (json: string) => AssembledTransaction<null>;
        liquidation_fee_bps: (json: string) => AssembledTransaction<bigint>;
        set_position_manager: (json: string) => AssembledTransaction<null>;
        liquidation_threshold: (json: string) => AssembledTransaction<bigint>;
        max_utilization_ratio: (json: string) => AssembledTransaction<bigint>;
        set_oracle_integrator: (json: string) => AssembledTransaction<null>;
        max_price_deviation_bps: (json: string) => AssembledTransaction<bigint>;
        price_staleness_threshold: (json: string) => AssembledTransaction<bigint>;
        set_max_utilization_ratio: (json: string) => AssembledTransaction<null>;
        min_liquidity_reserve_ratio: (json: string) => AssembledTransaction<bigint>;
        set_min_liquidity_reserve_ratio: (json: string) => AssembledTransaction<null>;
    };
}
