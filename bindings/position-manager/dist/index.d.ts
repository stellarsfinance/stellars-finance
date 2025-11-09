import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from '@stellar/stellar-sdk/contract';
import type { u32, u64, u128, i128 } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export type DataKey = {
    tag: "Position";
    values: readonly [u64];
} | {
    tag: "NextPositionId";
    values: void;
} | {
    tag: "ConfigManager";
    values: void;
} | {
    tag: "UserPositions";
    values: readonly [string];
};
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
    get_position: ({ position_id }: {
        position_id: u64;
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
    }) => Promise<AssembledTransaction<Position>>;
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
    calculate_pnl: ({ position_id }: {
        position_id: u64;
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
    open_position: ({ trader, market_id, collateral, leverage, is_long }: {
        trader: string;
        market_id: u32;
        collateral: u128;
        leverage: u32;
        is_long: boolean;
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
    close_position: ({ trader, position_id }: {
        trader: string;
        position_id: u64;
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
    decrease_position: ({ trader, position_id, collateral_to_remove, size_to_reduce }: {
        trader: string;
        position_id: u64;
        collateral_to_remove: i128;
        size_to_reduce: i128;
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
    increase_position: ({ trader, position_id, additional_collateral, additional_size }: {
        trader: string;
        position_id: u64;
        additional_collateral: i128;
        additional_size: i128;
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
    liquidate_position: ({ keeper, position_id }: {
        keeper: string;
        position_id: u64;
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
    get_user_open_positions: ({ trader }: {
        trader: string;
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
    }) => Promise<AssembledTransaction<Array<u64>>>;
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
        initialize: (json: string) => AssembledTransaction<null>;
        get_position: (json: string) => AssembledTransaction<Position>;
        calculate_pnl: (json: string) => AssembledTransaction<bigint>;
        open_position: (json: string) => AssembledTransaction<bigint>;
        close_position: (json: string) => AssembledTransaction<bigint>;
        decrease_position: (json: string) => AssembledTransaction<null>;
        increase_position: (json: string) => AssembledTransaction<null>;
        liquidate_position: (json: string) => AssembledTransaction<bigint>;
        get_user_open_positions: (json: string) => AssembledTransaction<bigint[]>;
    };
}
