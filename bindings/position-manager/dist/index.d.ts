import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from '@stellar/stellar-sdk/contract';
import type { u32, u64, u128, i128 } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export interface Order {
    acceptable_price: i128;
    close_percentage: u32;
    collateral: u128;
    created_at: u64;
    execution_fee: u128;
    expiration: u64;
    is_long: boolean;
    leverage: u32;
    market_id: u32;
    order_id: u64;
    order_type: OrderType;
    position_id: u64;
    size: u128;
    trader: string;
    trigger_price: i128;
}
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
} | {
    tag: "Order";
    values: readonly [u64];
} | {
    tag: "NextOrderId";
    values: void;
} | {
    tag: "UserOrders";
    values: readonly [string];
} | {
    tag: "PositionOrders";
    values: readonly [u64];
} | {
    tag: "ActiveOrdersByMarket";
    values: readonly [u32];
} | {
    tag: "MinExecutionFee";
    values: void;
};
export interface Position {
    collateral: u128;
    entry_funding_long: i128;
    entry_funding_short: i128;
    entry_price: i128;
    is_long: boolean;
    last_interaction: u64;
    liquidation_price: i128;
    market_id: u32;
    size: u128;
    trader: string;
}
export type OrderType = {
    tag: "Limit";
    values: void;
} | {
    tag: "StopLoss";
    values: void;
} | {
    tag: "TakeProfit";
    values: void;
};
export type OrderCancelReason = {
    tag: "UserCancelled";
    values: void;
} | {
    tag: "PositionClosed";
    values: void;
} | {
    tag: "PositionLiquidated";
    values: void;
} | {
    tag: "Expired";
    values: void;
};
export interface Client {
    /**
     * Construct and simulate a get_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get order details by ID.
     *
     * # Arguments
     * * `order_id` - The order identifier
     *
     * # Returns
     * The full Order struct with all order parameters
     *
     * # Panics
     * Panics if order does not exist
     */
    get_order: ({ order_id }: {
        order_id: u64;
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
    }) => Promise<AssembledTransaction<Order>>;
    /**
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Initialize the PositionManager contract.
     *
     * # Arguments
     *
     * * `admin` - The administrator address (must authorize)
     * * `config_manager` - Address of the ConfigManager contract
     */
    initialize: ({ admin, config_manager }: {
        admin: string;
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
     * Construct and simulate a cancel_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Cancel an active order.
     *
     * # Arguments
     * * `trader` - The order owner
     * * `order_id` - The order to cancel
     */
    cancel_order: ({ trader, order_id }: {
        trader: string;
        order_id: u64;
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
     * Construct and simulate a execute_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Execute an order when conditions are met. Called by keeper bots.
     *
     * # Arguments
     * * `keeper` - The keeper executing the order
     * * `order_id` - The order to execute
     *
     * # Returns
     * For Limit: the new position_id as i128
     * For SL/TP: the realized PnL
     */
    execute_order: ({ keeper, order_id }: {
        keeper: string;
        order_id: u64;
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
     * # Implementation
     *
     * - Gets current price from OracleIntegrator
     * - Calculates comprehensive PnL (price PnL + funding payments + borrowing fees)
     * - Settles PnL with LiquidityPool
     * - Updates MarketManager open interest
     * - Returns collateral ± PnL to trader
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
     * Construct and simulate a get_user_orders transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get all active order IDs for a user.
     *
     * # Arguments
     * * `trader` - The trader address
     *
     * # Returns
     * Vector of order IDs (use `get_order()` to fetch full details for each)
     */
    get_user_orders: ({ trader }: {
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
    /**
     * Construct and simulate a create_stop_loss transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Create a stop-loss order attached to an existing position.
     *
     * # Arguments
     * * `trader` - The position owner
     * * `position_id` - The position to protect
     * * `trigger_price` - Price at which to close position
     * * `acceptable_price` - Minimum acceptable price for closure (0 = any)
     * * `close_percentage` - Percentage to close (10000 = 100%)
     * * `execution_fee` - Fee to pay keeper
     * * `expiration` - Order expiration (0 = no expiry)
     *
     * # Returns
     * The order ID
     */
    create_stop_loss: ({ trader, position_id, trigger_price, acceptable_price, close_percentage, execution_fee, expiration }: {
        trader: string;
        position_id: u64;
        trigger_price: i128;
        acceptable_price: i128;
        close_percentage: u32;
        execution_fee: u128;
        expiration: u64;
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
     * Construct and simulate a can_execute_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Check if an order can be executed at current price.
     * Used by keepers to filter executable orders before calling `execute_order()`.
     *
     * # Arguments
     * * `order_id` - The order identifier
     *
     * # Returns
     * True if the order exists, is not expired, market is not paused,
     * position still exists (for SL/TP), and trigger condition is met
     */
    can_execute_order: ({ order_id }: {
        order_id: u64;
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
     * Construct and simulate a decrease_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Decrease position size or remove collateral.
     *
     * # Arguments
     *
     * * `trader` - The address of the trader
     * * `position_id` - The unique position identifier
     * * `collateral_to_remove` - Collateral to remove (0 if none)
     * * `size_to_reduce` - Position size to reduce (0 if none)
     *
     * # Implementation
     *
     * - Verifies trader owns the position
     * - If reducing size, realizes proportional PnL
     * - Releases corresponding reserved liquidity
     * - Updates MarketManager open interest
     * - If removing collateral, verifies position remains sufficiently collateralized
     * - Transfers collateral to trader if removed
     * - Recalculates liquidation price
     * - Updates last_interaction timestamp
     * - Emits PositionModified event
     */
    decrease_position: ({ trader, position_id, collateral_to_remove, size_to_reduce }: {
        trader: string;
        position_id: u64;
        collateral_to_remove: u128;
        size_to_reduce: u128;
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
     * Construct and simulate a get_market_orders transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get all active orders for a market. Used by keeper bots to discover
     * executable orders.
     *
     * # Arguments
     * * `market_id` - The market identifier (0=XLM, 1=BTC, 2=ETH)
     *
     * # Returns
     * Vector of all active order IDs in this market
     */
    get_market_orders: ({ market_id }: {
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
    }) => Promise<AssembledTransaction<Array<u64>>>;
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
     *
     * # Implementation
     *
     * - Verifies trader owns the position
     * - Checks leverage limits with new total size
     * - Checks market open interest limits for additional size
     * - Transfers additional collateral if provided
     * - Updates position size and recalculates average entry price
     * - Recalculates liquidation price
     * - Updates funding rate snapshots and last_interaction timestamp
     * - Updates MarketManager open interest
     * - Emits PositionModified event
     */
    increase_position: ({ trader, position_id, additional_collateral, additional_size }: {
        trader: string;
        position_id: u64;
        additional_collateral: u128;
        additional_size: u128;
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
     * Construct and simulate a min_execution_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the minimum execution fee required for orders.
     *
     * # Returns
     * The minimum fee in token base units (default: 1_000_000 = 0.1 tokens)
     */
    min_execution_fee: (options?: {
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
    }) => Promise<AssembledTransaction<u128>>;
    /**
     * Construct and simulate a create_limit_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Create a limit order to open a position when price reaches target.
     *
     * # Arguments
     * * `trader` - The address creating the order
     * * `market_id` - The market identifier (0=XLM, 1=BTC, 2=ETH)
     * * `trigger_price` - Price at which to execute (scaled 1e7)
     * * `acceptable_price` - Maximum slippage from trigger (0 = any price)
     * * `collateral` - Collateral for the new position
     * * `leverage` - Leverage for the new position
     * * `is_long` - True for long, false for short
     * * `execution_fee` - Fee to pay keeper on execution
     * * `expiration` - Timestamp when order expires (0 = no expiry)
     *
     * # Returns
     * The order ID
     */
    create_limit_order: ({ trader, market_id, trigger_price, acceptable_price, collateral, leverage, is_long, execution_fee, expiration }: {
        trader: string;
        market_id: u32;
        trigger_price: i128;
        acceptable_price: i128;
        collateral: u128;
        leverage: u32;
        is_long: boolean;
        execution_fee: u128;
        expiration: u64;
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
     * Construct and simulate a create_take_profit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Create a take-profit order attached to an existing position.
     *
     * # Arguments
     * * `trader` - The position owner
     * * `position_id` - The position to take profit from
     * * `trigger_price` - Price at which to close position
     * * `acceptable_price` - Minimum acceptable price for closure (0 = any)
     * * `close_percentage` - Percentage to close (10000 = 100%)
     * * `execution_fee` - Fee to pay keeper
     * * `expiration` - Order expiration (0 = no expiry)
     *
     * # Returns
     * The order ID
     */
    create_take_profit: ({ trader, position_id, trigger_price, acceptable_price, close_percentage, execution_fee, expiration }: {
        trader: string;
        position_id: u64;
        trigger_price: i128;
        acceptable_price: i128;
        close_percentage: u32;
        execution_fee: u128;
        expiration: u64;
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
     *
     * # Implementation
     *
     * - Gets current price from OracleIntegrator
     * - Calculates comprehensive PnL including all fees
     * - Verifies position is liquidatable (underwater or below maintenance margin)
     * - Calculates liquidation fees:
     * - 0.3% of position size goes to keeper as reward
     * - 0.2% of position size goes to liquidity pool
     * - Settles with LiquidityPool (collateral minus losses and fees)
     * - Updates MarketManager open interest
     * - Deletes position from storage
     * - Emits PositionLiquidated event
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
    }) => Promise<AssembledTransaction<u128>>;
    /**
     * Construct and simulate a get_position_orders transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get all orders (SL/TP) attached to a position.
     *
     * # Arguments
     * * `position_id` - The position identifier
     *
     * # Returns
     * Vector of order IDs for stop-loss and take-profit orders on this position
     */
    get_position_orders: ({ position_id }: {
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
    }) => Promise<AssembledTransaction<Array<u64>>>;
    /**
     * Construct and simulate a set_min_execution_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Set minimum execution fee required for orders (admin only).
     * The execution fee incentivizes keeper bots to execute orders.
     *
     * # Arguments
     * * `admin` - The admin address (must match ConfigManager admin)
     * * `fee` - The minimum fee in token base units (e.g., 1_000_000 = 0.1 tokens with 7 decimals)
     *
     * # Panics
     * Panics if caller is not the admin
     */
    set_min_execution_fee: ({ admin, fee }: {
        admin: string;
        fee: u128;
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
        get_order: (json: string) => AssembledTransaction<Order>;
        initialize: (json: string) => AssembledTransaction<null>;
        cancel_order: (json: string) => AssembledTransaction<null>;
        get_position: (json: string) => AssembledTransaction<Position>;
        calculate_pnl: (json: string) => AssembledTransaction<bigint>;
        execute_order: (json: string) => AssembledTransaction<bigint>;
        open_position: (json: string) => AssembledTransaction<bigint>;
        close_position: (json: string) => AssembledTransaction<bigint>;
        get_user_orders: (json: string) => AssembledTransaction<bigint[]>;
        create_stop_loss: (json: string) => AssembledTransaction<bigint>;
        can_execute_order: (json: string) => AssembledTransaction<boolean>;
        decrease_position: (json: string) => AssembledTransaction<null>;
        get_market_orders: (json: string) => AssembledTransaction<bigint[]>;
        increase_position: (json: string) => AssembledTransaction<null>;
        min_execution_fee: (json: string) => AssembledTransaction<bigint>;
        create_limit_order: (json: string) => AssembledTransaction<bigint>;
        create_take_profit: (json: string) => AssembledTransaction<bigint>;
        liquidate_position: (json: string) => AssembledTransaction<bigint>;
        get_position_orders: (json: string) => AssembledTransaction<bigint[]>;
        set_min_execution_fee: (json: string) => AssembledTransaction<null>;
        get_user_open_positions: (json: string) => AssembledTransaction<bigint[]>;
    };
}
