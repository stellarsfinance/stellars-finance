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

export type DataKey = {tag: "Position", values: readonly [u64]} | {tag: "NextPositionId", values: void} | {tag: "ConfigManager", values: void} | {tag: "UserPositions", values: readonly [string]} | {tag: "Order", values: readonly [u64]} | {tag: "NextOrderId", values: void} | {tag: "UserOrders", values: readonly [string]} | {tag: "PositionOrders", values: readonly [u64]} | {tag: "ActiveOrdersByMarket", values: readonly [u32]} | {tag: "MinExecutionFee", values: void};


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

export type OrderType = {tag: "Limit", values: void} | {tag: "StopLoss", values: void} | {tag: "TakeProfit", values: void};

export type OrderCancelReason = {tag: "UserCancelled", values: void} | {tag: "PositionClosed", values: void} | {tag: "PositionLiquidated", values: void} | {tag: "Expired", values: void};








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
  get_order: ({order_id}: {order_id: u64}, options?: {
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
  }) => Promise<AssembledTransaction<Order>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the PositionManager contract.
   * 
   * # Arguments
   * 
   * * `admin` - The administrator address (must authorize)
   * * `config_manager` - Address of the ConfigManager contract
   */
  initialize: ({admin, config_manager}: {admin: string, config_manager: string}, options?: {
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
   * Construct and simulate a cancel_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cancel an active order.
   * 
   * # Arguments
   * * `trader` - The order owner
   * * `order_id` - The order to cancel
   */
  cancel_order: ({trader, order_id}: {trader: string, order_id: u64}, options?: {
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
  execute_order: ({keeper, order_id}: {keeper: string, order_id: u64}, options?: {
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
   * # Implementation
   * 
   * - Gets current price from OracleIntegrator
   * - Calculates comprehensive PnL (price PnL + funding payments + borrowing fees)
   * - Settles PnL with LiquidityPool
   * - Updates MarketManager open interest
   * - Returns collateral ± PnL to trader
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
   * Construct and simulate a get_user_orders transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all active order IDs for a user.
   * 
   * # Arguments
   * * `trader` - The trader address
   * 
   * # Returns
   * Vector of order IDs (use `get_order()` to fetch full details for each)
   */
  get_user_orders: ({trader}: {trader: string}, options?: {
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
  create_stop_loss: ({trader, position_id, trigger_price, acceptable_price, close_percentage, execution_fee, expiration}: {trader: string, position_id: u64, trigger_price: i128, acceptable_price: i128, close_percentage: u32, execution_fee: u128, expiration: u64}, options?: {
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
  can_execute_order: ({order_id}: {order_id: u64}, options?: {
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
  decrease_position: ({trader, position_id, collateral_to_remove, size_to_reduce}: {trader: string, position_id: u64, collateral_to_remove: u128, size_to_reduce: u128}, options?: {
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
  get_market_orders: ({market_id}: {market_id: u32}, options?: {
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
  increase_position: ({trader, position_id, additional_collateral, additional_size}: {trader: string, position_id: u64, additional_collateral: u128, additional_size: u128}, options?: {
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
  }) => Promise<AssembledTransaction<u128>>

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
  create_limit_order: ({trader, market_id, trigger_price, acceptable_price, collateral, leverage, is_long, execution_fee, expiration}: {trader: string, market_id: u32, trigger_price: i128, acceptable_price: i128, collateral: u128, leverage: u32, is_long: boolean, execution_fee: u128, expiration: u64}, options?: {
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
  create_take_profit: ({trader, position_id, trigger_price, acceptable_price, close_percentage, execution_fee, expiration}: {trader: string, position_id: u64, trigger_price: i128, acceptable_price: i128, close_percentage: u32, execution_fee: u128, expiration: u64}, options?: {
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
  }) => Promise<AssembledTransaction<u128>>

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
  get_position_orders: ({position_id}: {position_id: u64}, options?: {
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
  set_min_execution_fee: ({admin, fee}: {admin: string, fee: u128}, options?: {
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
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABU9yZGVyAAAAAAAADwAAAAAAAAAQYWNjZXB0YWJsZV9wcmljZQAAAAsAAAAAAAAAEGNsb3NlX3BlcmNlbnRhZ2UAAAAEAAAAAAAAAApjb2xsYXRlcmFsAAAAAAAKAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAA1leGVjdXRpb25fZmVlAAAAAAAACgAAAAAAAAAKZXhwaXJhdGlvbgAAAAAABgAAAAAAAAAHaXNfbG9uZwAAAAABAAAAAAAAAAhsZXZlcmFnZQAAAAQAAAAAAAAACW1hcmtldF9pZAAAAAAAAAQAAAAAAAAACG9yZGVyX2lkAAAABgAAAAAAAAAKb3JkZXJfdHlwZQAAAAAH0AAAAAlPcmRlclR5cGUAAAAAAAAAAAAAC3Bvc2l0aW9uX2lkAAAAAAYAAAAAAAAABHNpemUAAAAKAAAAAAAAAAZ0cmFkZXIAAAAAABMAAAAAAAAADXRyaWdnZXJfcHJpY2UAAAAAAAAL",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAACgAAAAEAAAAAAAAACFBvc2l0aW9uAAAAAQAAAAYAAAAAAAAAAAAAAA5OZXh0UG9zaXRpb25JZAAAAAAAAAAAAAAAAAANQ29uZmlnTWFuYWdlcgAAAAAAAAEAAAAAAAAADVVzZXJQb3NpdGlvbnMAAAAAAAABAAAAEwAAAAEAAAAAAAAABU9yZGVyAAAAAAAAAQAAAAYAAAAAAAAAAAAAAAtOZXh0T3JkZXJJZAAAAAABAAAAAAAAAApVc2VyT3JkZXJzAAAAAAABAAAAEwAAAAEAAAAAAAAADlBvc2l0aW9uT3JkZXJzAAAAAAABAAAABgAAAAEAAAAAAAAAFEFjdGl2ZU9yZGVyc0J5TWFya2V0AAAAAQAAAAQAAAAAAAAAAAAAAA9NaW5FeGVjdXRpb25GZWUA",
        "AAAAAQAAAAAAAAAAAAAACFBvc2l0aW9uAAAACgAAAAAAAAAKY29sbGF0ZXJhbAAAAAAACgAAAAAAAAASZW50cnlfZnVuZGluZ19sb25nAAAAAAALAAAAAAAAABNlbnRyeV9mdW5kaW5nX3Nob3J0AAAAAAsAAAAAAAAAC2VudHJ5X3ByaWNlAAAAAAsAAAAAAAAAB2lzX2xvbmcAAAAAAQAAAAAAAAAQbGFzdF9pbnRlcmFjdGlvbgAAAAYAAAAAAAAAEWxpcXVpZGF0aW9uX3ByaWNlAAAAAAAACwAAAAAAAAAJbWFya2V0X2lkAAAAAAAABAAAAAAAAAAEc2l6ZQAAAAoAAAAAAAAABnRyYWRlcgAAAAAAEw==",
        "AAAAAgAAAAAAAAAAAAAACU9yZGVyVHlwZQAAAAAAAAMAAAAAAAAAAAAAAAVMaW1pdAAAAAAAAAAAAAAAAAAACFN0b3BMb3NzAAAAAAAAAAAAAAAKVGFrZVByb2ZpdAAA",
        "AAAAAgAAAAAAAAAAAAAAEU9yZGVyQ2FuY2VsUmVhc29uAAAAAAAABAAAAAAAAAAAAAAADVVzZXJDYW5jZWxsZWQAAAAAAAAAAAAAAAAAAA5Qb3NpdGlvbkNsb3NlZAAAAAAAAAAAAAAAAAASUG9zaXRpb25MaXF1aWRhdGVkAAAAAAAAAAAAAAAAAAdFeHBpcmVkAA==",
        "AAAAAAAAAK1HZXQgb3JkZXIgZGV0YWlscyBieSBJRC4KCiMgQXJndW1lbnRzCiogYG9yZGVyX2lkYCAtIFRoZSBvcmRlciBpZGVudGlmaWVyCgojIFJldHVybnMKVGhlIGZ1bGwgT3JkZXIgc3RydWN0IHdpdGggYWxsIG9yZGVyIHBhcmFtZXRlcnMKCiMgUGFuaWNzClBhbmljcyBpZiBvcmRlciBkb2VzIG5vdCBleGlzdAAAAAAAAAlnZXRfb3JkZXIAAAAAAAABAAAAAAAAAAhvcmRlcl9pZAAAAAYAAAABAAAH0AAAAAVPcmRlcgAAAA==",
        "AAAABQAAAAAAAAAAAAAAEU9yZGVyQ3JlYXRlZEV2ZW50AAAAAAAAAQAAABNvcmRlcl9jcmVhdGVkX2V2ZW50AAAAAAkAAAAAAAAACG9yZGVyX2lkAAAABgAAAAAAAAAAAAAACm9yZGVyX3R5cGUAAAAAB9AAAAAJT3JkZXJUeXBlAAAAAAAAAAAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAAAAAAJbWFya2V0X2lkAAAAAAAABAAAAAAAAAAAAAAAC3Bvc2l0aW9uX2lkAAAAAAYAAAAAAAAAAAAAAA10cmlnZ2VyX3ByaWNlAAAAAAAACwAAAAAAAAAAAAAABHNpemUAAAAKAAAAAAAAAAAAAAAHaXNfbG9uZwAAAAABAAAAAAAAAAAAAAAKZXhwaXJhdGlvbgAAAAAABgAAAAAAAAAC",
        "AAAAAAAAAKhJbml0aWFsaXplIHRoZSBQb3NpdGlvbk1hbmFnZXIgY29udHJhY3QuCgojIEFyZ3VtZW50cwoKKiBgYWRtaW5gIC0gVGhlIGFkbWluaXN0cmF0b3IgYWRkcmVzcyAobXVzdCBhdXRob3JpemUpCiogYGNvbmZpZ19tYW5hZ2VyYCAtIEFkZHJlc3Mgb2YgdGhlIENvbmZpZ01hbmFnZXIgY29udHJhY3QAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAA5jb25maWdfbWFuYWdlcgAAAAAAEwAAAAA=",
        "AAAABQAAAAAAAAAAAAAAEk9yZGVyRXhlY3V0ZWRFdmVudAAAAAAAAQAAABRvcmRlcl9leGVjdXRlZF9ldmVudAAAAAgAAAAAAAAACG9yZGVyX2lkAAAABgAAAAAAAAAAAAAACm9yZGVyX3R5cGUAAAAAB9AAAAAJT3JkZXJUeXBlAAAAAAAAAAAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAAAAAAGa2VlcGVyAAAAAAATAAAAAAAAAAAAAAAPZXhlY3V0aW9uX3ByaWNlAAAAAAsAAAAAAAAAAAAAAAtwb3NpdGlvbl9pZAAAAAAGAAAAAAAAAAAAAAADcG5sAAAAAAsAAAAAAAAAAAAAAA1leGVjdXRpb25fZmVlAAAAAAAACgAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAAE09yZGVyQ2FuY2VsbGVkRXZlbnQAAAAAAQAAABVvcmRlcl9jYW5jZWxsZWRfZXZlbnQAAAAAAAAEAAAAAAAAAAhvcmRlcl9pZAAAAAYAAAAAAAAAAAAAAApvcmRlcl90eXBlAAAAAAfQAAAACU9yZGVyVHlwZQAAAAAAAAAAAAAAAAAABnRyYWRlcgAAAAAAEwAAAAAAAAAAAAAABnJlYXNvbgAAAAAH0AAAABFPcmRlckNhbmNlbFJlYXNvbgAAAAAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAAE1Bvc2l0aW9uQ2xvc2VkRXZlbnQAAAAAAQAAABVwb3NpdGlvbl9jbG9zZWRfZXZlbnQAAAAAAAADAAAAAAAAAAtwb3NpdGlvbl9pZAAAAAAGAAAAAAAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAAAAAADcG5sAAAAAAsAAAAAAAAAAg==",
        "AAAABQAAAAAAAAAAAAAAE1Bvc2l0aW9uT3BlbmVkRXZlbnQAAAAAAQAAABVwb3NpdGlvbl9vcGVuZWRfZXZlbnQAAAAAAAAIAAAAAAAAAAtwb3NpdGlvbl9pZAAAAAAGAAAAAAAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAAAAAAJbWFya2V0X2lkAAAAAAAABAAAAAAAAAAAAAAACmNvbGxhdGVyYWwAAAAAAAoAAAAAAAAAAAAAAARzaXplAAAACgAAAAAAAAAAAAAACGxldmVyYWdlAAAABAAAAAAAAAAAAAAAB2lzX2xvbmcAAAAAAQAAAAAAAAAAAAAAC2VudHJ5X3ByaWNlAAAAAAoAAAAAAAAAAg==",
        "AAAAAAAAAGRDYW5jZWwgYW4gYWN0aXZlIG9yZGVyLgoKIyBBcmd1bWVudHMKKiBgdHJhZGVyYCAtIFRoZSBvcmRlciBvd25lcgoqIGBvcmRlcl9pZGAgLSBUaGUgb3JkZXIgdG8gY2FuY2VsAAAADGNhbmNlbF9vcmRlcgAAAAIAAAAAAAAABnRyYWRlcgAAAAAAEwAAAAAAAAAIb3JkZXJfaWQAAAAGAAAAAA==",
        "AAAAAAAAAI5HZXQgcG9zaXRpb24gZGV0YWlscy4KCiMgQXJndW1lbnRzCgoqIGBwb3NpdGlvbl9pZGAgLSBUaGUgdW5pcXVlIHBvc2l0aW9uIGlkZW50aWZpZXIKCiMgUmV0dXJucwoKVGhlIFBvc2l0aW9uIHN0cnVjdCB3aXRoIGFsbCBwb3NpdGlvbiBkZXRhaWxzAAAAAAAMZ2V0X3Bvc2l0aW9uAAAAAQAAAAAAAAALcG9zaXRpb25faWQAAAAABgAAAAEAAAfQAAAACFBvc2l0aW9u",
        "AAAAAAAAAK9DYWxjdWxhdGUgdW5yZWFsaXplZCBQbkwgZm9yIGEgcG9zaXRpb24uCgojIEFyZ3VtZW50cwoKKiBgcG9zaXRpb25faWRgIC0gVGhlIHVuaXF1ZSBwb3NpdGlvbiBpZGVudGlmaWVyCgojIFJldHVybnMKClRoZSB1bnJlYWxpemVkIFBuTCAocG9zaXRpdmUgZm9yIHByb2ZpdCwgbmVnYXRpdmUgZm9yIGxvc3MpAAAAAA1jYWxjdWxhdGVfcG5sAAAAAAAAAQAAAAAAAAALcG9zaXRpb25faWQAAAAABgAAAAEAAAAL",
        "AAAAAAAAAOtFeGVjdXRlIGFuIG9yZGVyIHdoZW4gY29uZGl0aW9ucyBhcmUgbWV0LiBDYWxsZWQgYnkga2VlcGVyIGJvdHMuCgojIEFyZ3VtZW50cwoqIGBrZWVwZXJgIC0gVGhlIGtlZXBlciBleGVjdXRpbmcgdGhlIG9yZGVyCiogYG9yZGVyX2lkYCAtIFRoZSBvcmRlciB0byBleGVjdXRlCgojIFJldHVybnMKRm9yIExpbWl0OiB0aGUgbmV3IHBvc2l0aW9uX2lkIGFzIGkxMjgKRm9yIFNML1RQOiB0aGUgcmVhbGl6ZWQgUG5MAAAAAA1leGVjdXRlX29yZGVyAAAAAAAAAgAAAAAAAAAGa2VlcGVyAAAAAAATAAAAAAAAAAhvcmRlcl9pZAAAAAYAAAABAAAACw==",
        "AAAAAAAAAoNPcGVuIGEgbmV3IHBlcnBldHVhbCBwb3NpdGlvbi4KCiMgQXJndW1lbnRzCgoqIGB0cmFkZXJgIC0gVGhlIGFkZHJlc3Mgb2YgdGhlIHRyYWRlciBvcGVuaW5nIHRoZSBwb3NpdGlvbgoqIGBtYXJrZXRfaWRgIC0gVGhlIG1hcmtldCBpZGVudGlmaWVyIChlLmcuLCAwID0gWExNLVBFUlAsIDEgPSBCVEMtUEVSUCwgMiA9IEVUSC1QRVJQKQoqIGBjb2xsYXRlcmFsYCAtIFRoZSBhbW91bnQgb2YgY29sbGF0ZXJhbCB0byBkZXBvc2l0ICh1bnNpZ25lZCwgaW4gdG9rZW4gYmFzZSB1bml0cykKKiBgbGV2ZXJhZ2VgIC0gVGhlIGxldmVyYWdlIG11bHRpcGxpZXIgKGUuZy4sIDV4LCAxMHgsIDIweCkKKiBgaXNfbG9uZ2AgLSBUcnVlIGZvciBsb25nIHBvc2l0aW9uLCBmYWxzZSBmb3Igc2hvcnQKCiMgUmV0dXJucwoKVGhlIHBvc2l0aW9uIElECgojIEltcGxlbWVudGF0aW9uCgpQb3NpdGlvbiBzaXplIGlzIGNhbGN1bGF0ZWQgYXM6IGBzaXplID0gY29sbGF0ZXJhbCAqIGxldmVyYWdlYAotIFRyYW5zZmVycyBjb2xsYXRlcmFsIGZyb20gdHJhZGVyIHRvIGNvbnRyYWN0Ci0gR2V0cyBlbnRyeSBwcmljZSBmcm9tIE9yYWNsZUludGVncmF0b3IKLSBFbWl0cyBQb3NpdGlvbk9wZW5lZCBldmVudAotIE5vIGZlZXMgYXBwbGllZCBmb3IgTVZQAAAAAA1vcGVuX3Bvc2l0aW9uAAAAAAAABQAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAltYXJrZXRfaWQAAAAAAAAEAAAAAAAAAApjb2xsYXRlcmFsAAAAAAAKAAAAAAAAAAhsZXZlcmFnZQAAAAQAAAAAAAAAB2lzX2xvbmcAAAAAAQAAAAEAAAAG",
        "AAAABQAAAAAAAAAAAAAAFVBvc2l0aW9uTW9kaWZpZWRFdmVudAAAAAAAAAEAAAAXcG9zaXRpb25fbW9kaWZpZWRfZXZlbnQAAAAABQAAAAAAAAALcG9zaXRpb25faWQAAAAABgAAAAAAAAAAAAAABnRyYWRlcgAAAAAAEwAAAAAAAAAAAAAADm5ld19jb2xsYXRlcmFsAAAAAAAKAAAAAAAAAAAAAAAIbmV3X3NpemUAAAAKAAAAAAAAAAAAAAAVbmV3X2xpcXVpZGF0aW9uX3ByaWNlAAAAAAAACwAAAAAAAAAC",
        "AAAAAAAAAfNDbG9zZSBhbiBleGlzdGluZyBwb3NpdGlvbi4KCiMgQXJndW1lbnRzCgoqIGB0cmFkZXJgIC0gVGhlIGFkZHJlc3Mgb2YgdGhlIHRyYWRlciBjbG9zaW5nIHRoZSBwb3NpdGlvbgoqIGBwb3NpdGlvbl9pZGAgLSBUaGUgdW5pcXVlIHBvc2l0aW9uIGlkZW50aWZpZXIKCiMgUmV0dXJucwoKVGhlIHJlYWxpemVkIFBuTCAocG9zaXRpdmUgZm9yIHByb2ZpdCwgbmVnYXRpdmUgZm9yIGxvc3MpCgojIEltcGxlbWVudGF0aW9uCgotIEdldHMgY3VycmVudCBwcmljZSBmcm9tIE9yYWNsZUludGVncmF0b3IKLSBDYWxjdWxhdGVzIGNvbXByZWhlbnNpdmUgUG5MIChwcmljZSBQbkwgKyBmdW5kaW5nIHBheW1lbnRzICsgYm9ycm93aW5nIGZlZXMpCi0gU2V0dGxlcyBQbkwgd2l0aCBMaXF1aWRpdHlQb29sCi0gVXBkYXRlcyBNYXJrZXRNYW5hZ2VyIG9wZW4gaW50ZXJlc3QKLSBSZXR1cm5zIGNvbGxhdGVyYWwgwrEgUG5MIHRvIHRyYWRlcgotIEVtaXRzIFBvc2l0aW9uQ2xvc2VkIGV2ZW50AAAAAA5jbG9zZV9wb3NpdGlvbgAAAAAAAgAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAtwb3NpdGlvbl9pZAAAAAAGAAAAAQAAAAs=",
        "AAAAAAAAAKNHZXQgYWxsIGFjdGl2ZSBvcmRlciBJRHMgZm9yIGEgdXNlci4KCiMgQXJndW1lbnRzCiogYHRyYWRlcmAgLSBUaGUgdHJhZGVyIGFkZHJlc3MKCiMgUmV0dXJucwpWZWN0b3Igb2Ygb3JkZXIgSURzICh1c2UgYGdldF9vcmRlcigpYCB0byBmZXRjaCBmdWxsIGRldGFpbHMgZm9yIGVhY2gpAAAAAA9nZXRfdXNlcl9vcmRlcnMAAAAAAQAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAQAAA+oAAAAG",
        "AAAABQAAAAAAAAAAAAAAF1Bvc2l0aW9uTGlxdWlkYXRlZEV2ZW50AAAAAAEAAAAZcG9zaXRpb25fbGlxdWlkYXRlZF9ldmVudAAAAAAAAAUAAAAAAAAAC3Bvc2l0aW9uX2lkAAAAAAYAAAAAAAAAAAAAAAZ0cmFkZXIAAAAAABMAAAAAAAAAAAAAAApsaXF1aWRhdG9yAAAAAAATAAAAAAAAAAAAAAARbGlxdWlkYXRpb25fcHJpY2UAAAAAAAALAAAAAAAAAAAAAAASbGlxdWlkYXRpb25fcmV3YXJkAAAAAAAKAAAAAAAAAAI=",
        "AAAAAAAAAbZDcmVhdGUgYSBzdG9wLWxvc3Mgb3JkZXIgYXR0YWNoZWQgdG8gYW4gZXhpc3RpbmcgcG9zaXRpb24uCgojIEFyZ3VtZW50cwoqIGB0cmFkZXJgIC0gVGhlIHBvc2l0aW9uIG93bmVyCiogYHBvc2l0aW9uX2lkYCAtIFRoZSBwb3NpdGlvbiB0byBwcm90ZWN0CiogYHRyaWdnZXJfcHJpY2VgIC0gUHJpY2UgYXQgd2hpY2ggdG8gY2xvc2UgcG9zaXRpb24KKiBgYWNjZXB0YWJsZV9wcmljZWAgLSBNaW5pbXVtIGFjY2VwdGFibGUgcHJpY2UgZm9yIGNsb3N1cmUgKDAgPSBhbnkpCiogYGNsb3NlX3BlcmNlbnRhZ2VgIC0gUGVyY2VudGFnZSB0byBjbG9zZSAoMTAwMDAgPSAxMDAlKQoqIGBleGVjdXRpb25fZmVlYCAtIEZlZSB0byBwYXkga2VlcGVyCiogYGV4cGlyYXRpb25gIC0gT3JkZXIgZXhwaXJhdGlvbiAoMCA9IG5vIGV4cGlyeSkKCiMgUmV0dXJucwpUaGUgb3JkZXIgSUQAAAAAABBjcmVhdGVfc3RvcF9sb3NzAAAABwAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAtwb3NpdGlvbl9pZAAAAAAGAAAAAAAAAA10cmlnZ2VyX3ByaWNlAAAAAAAACwAAAAAAAAAQYWNjZXB0YWJsZV9wcmljZQAAAAsAAAAAAAAAEGNsb3NlX3BlcmNlbnRhZ2UAAAAEAAAAAAAAAA1leGVjdXRpb25fZmVlAAAAAAAACgAAAAAAAAAKZXhwaXJhdGlvbgAAAAAABgAAAAEAAAAG",
        "AAAAAAAAAT1DaGVjayBpZiBhbiBvcmRlciBjYW4gYmUgZXhlY3V0ZWQgYXQgY3VycmVudCBwcmljZS4KVXNlZCBieSBrZWVwZXJzIHRvIGZpbHRlciBleGVjdXRhYmxlIG9yZGVycyBiZWZvcmUgY2FsbGluZyBgZXhlY3V0ZV9vcmRlcigpYC4KCiMgQXJndW1lbnRzCiogYG9yZGVyX2lkYCAtIFRoZSBvcmRlciBpZGVudGlmaWVyCgojIFJldHVybnMKVHJ1ZSBpZiB0aGUgb3JkZXIgZXhpc3RzLCBpcyBub3QgZXhwaXJlZCwgbWFya2V0IGlzIG5vdCBwYXVzZWQsCnBvc2l0aW9uIHN0aWxsIGV4aXN0cyAoZm9yIFNML1RQKSwgYW5kIHRyaWdnZXIgY29uZGl0aW9uIGlzIG1ldAAAAAAAABFjYW5fZXhlY3V0ZV9vcmRlcgAAAAAAAAEAAAAAAAAACG9yZGVyX2lkAAAABgAAAAEAAAAB",
        "AAAAAAAAAp9EZWNyZWFzZSBwb3NpdGlvbiBzaXplIG9yIHJlbW92ZSBjb2xsYXRlcmFsLgoKIyBBcmd1bWVudHMKCiogYHRyYWRlcmAgLSBUaGUgYWRkcmVzcyBvZiB0aGUgdHJhZGVyCiogYHBvc2l0aW9uX2lkYCAtIFRoZSB1bmlxdWUgcG9zaXRpb24gaWRlbnRpZmllcgoqIGBjb2xsYXRlcmFsX3RvX3JlbW92ZWAgLSBDb2xsYXRlcmFsIHRvIHJlbW92ZSAoMCBpZiBub25lKQoqIGBzaXplX3RvX3JlZHVjZWAgLSBQb3NpdGlvbiBzaXplIHRvIHJlZHVjZSAoMCBpZiBub25lKQoKIyBJbXBsZW1lbnRhdGlvbgoKLSBWZXJpZmllcyB0cmFkZXIgb3ducyB0aGUgcG9zaXRpb24KLSBJZiByZWR1Y2luZyBzaXplLCByZWFsaXplcyBwcm9wb3J0aW9uYWwgUG5MCi0gUmVsZWFzZXMgY29ycmVzcG9uZGluZyByZXNlcnZlZCBsaXF1aWRpdHkKLSBVcGRhdGVzIE1hcmtldE1hbmFnZXIgb3BlbiBpbnRlcmVzdAotIElmIHJlbW92aW5nIGNvbGxhdGVyYWwsIHZlcmlmaWVzIHBvc2l0aW9uIHJlbWFpbnMgc3VmZmljaWVudGx5IGNvbGxhdGVyYWxpemVkCi0gVHJhbnNmZXJzIGNvbGxhdGVyYWwgdG8gdHJhZGVyIGlmIHJlbW92ZWQKLSBSZWNhbGN1bGF0ZXMgbGlxdWlkYXRpb24gcHJpY2UKLSBVcGRhdGVzIGxhc3RfaW50ZXJhY3Rpb24gdGltZXN0YW1wCi0gRW1pdHMgUG9zaXRpb25Nb2RpZmllZCBldmVudAAAAAARZGVjcmVhc2VfcG9zaXRpb24AAAAAAAAEAAAAAAAAAAZ0cmFkZXIAAAAAABMAAAAAAAAAC3Bvc2l0aW9uX2lkAAAAAAYAAAAAAAAAFGNvbGxhdGVyYWxfdG9fcmVtb3ZlAAAACgAAAAAAAAAOc2l6ZV90b19yZWR1Y2UAAAAAAAoAAAAA",
        "AAAAAAAAANhHZXQgYWxsIGFjdGl2ZSBvcmRlcnMgZm9yIGEgbWFya2V0LiBVc2VkIGJ5IGtlZXBlciBib3RzIHRvIGRpc2NvdmVyCmV4ZWN1dGFibGUgb3JkZXJzLgoKIyBBcmd1bWVudHMKKiBgbWFya2V0X2lkYCAtIFRoZSBtYXJrZXQgaWRlbnRpZmllciAoMD1YTE0sIDE9QlRDLCAyPUVUSCkKCiMgUmV0dXJucwpWZWN0b3Igb2YgYWxsIGFjdGl2ZSBvcmRlciBJRHMgaW4gdGhpcyBtYXJrZXQAAAARZ2V0X21hcmtldF9vcmRlcnMAAAAAAAABAAAAAAAAAAltYXJrZXRfaWQAAAAAAAAEAAAAAQAAA+oAAAAG",
        "AAAAAAAAAr1JbmNyZWFzZSBwb3NpdGlvbiBzaXplIG9yIGFkZCBjb2xsYXRlcmFsLgoKIyBBcmd1bWVudHMKCiogYHRyYWRlcmAgLSBUaGUgYWRkcmVzcyBvZiB0aGUgdHJhZGVyCiogYHBvc2l0aW9uX2lkYCAtIFRoZSB1bmlxdWUgcG9zaXRpb24gaWRlbnRpZmllcgoqIGBhZGRpdGlvbmFsX2NvbGxhdGVyYWxgIC0gQWRkaXRpb25hbCBjb2xsYXRlcmFsIHRvIGFkZCAoMCBpZiBub25lKQoqIGBhZGRpdGlvbmFsX3NpemVgIC0gQWRkaXRpb25hbCBwb3NpdGlvbiBzaXplICgwIGlmIG5vbmUpCgojIEltcGxlbWVudGF0aW9uCgotIFZlcmlmaWVzIHRyYWRlciBvd25zIHRoZSBwb3NpdGlvbgotIENoZWNrcyBsZXZlcmFnZSBsaW1pdHMgd2l0aCBuZXcgdG90YWwgc2l6ZQotIENoZWNrcyBtYXJrZXQgb3BlbiBpbnRlcmVzdCBsaW1pdHMgZm9yIGFkZGl0aW9uYWwgc2l6ZQotIFRyYW5zZmVycyBhZGRpdGlvbmFsIGNvbGxhdGVyYWwgaWYgcHJvdmlkZWQKLSBVcGRhdGVzIHBvc2l0aW9uIHNpemUgYW5kIHJlY2FsY3VsYXRlcyBhdmVyYWdlIGVudHJ5IHByaWNlCi0gUmVjYWxjdWxhdGVzIGxpcXVpZGF0aW9uIHByaWNlCi0gVXBkYXRlcyBmdW5kaW5nIHJhdGUgc25hcHNob3RzIGFuZCBsYXN0X2ludGVyYWN0aW9uIHRpbWVzdGFtcAotIFVwZGF0ZXMgTWFya2V0TWFuYWdlciBvcGVuIGludGVyZXN0Ci0gRW1pdHMgUG9zaXRpb25Nb2RpZmllZCBldmVudAAAAAAAABFpbmNyZWFzZV9wb3NpdGlvbgAAAAAAAAQAAAAAAAAABnRyYWRlcgAAAAAAEwAAAAAAAAALcG9zaXRpb25faWQAAAAABgAAAAAAAAAVYWRkaXRpb25hbF9jb2xsYXRlcmFsAAAAAAAACgAAAAAAAAAPYWRkaXRpb25hbF9zaXplAAAAAAoAAAAA",
        "AAAAAAAAAINHZXQgdGhlIG1pbmltdW0gZXhlY3V0aW9uIGZlZSByZXF1aXJlZCBmb3Igb3JkZXJzLgoKIyBSZXR1cm5zClRoZSBtaW5pbXVtIGZlZSBpbiB0b2tlbiBiYXNlIHVuaXRzIChkZWZhdWx0OiAxXzAwMF8wMDAgPSAwLjEgdG9rZW5zKQAAAAARbWluX2V4ZWN1dGlvbl9mZWUAAAAAAAAAAAAAAQAAAAo=",
        "AAAAAAAAAktDcmVhdGUgYSBsaW1pdCBvcmRlciB0byBvcGVuIGEgcG9zaXRpb24gd2hlbiBwcmljZSByZWFjaGVzIHRhcmdldC4KCiMgQXJndW1lbnRzCiogYHRyYWRlcmAgLSBUaGUgYWRkcmVzcyBjcmVhdGluZyB0aGUgb3JkZXIKKiBgbWFya2V0X2lkYCAtIFRoZSBtYXJrZXQgaWRlbnRpZmllciAoMD1YTE0sIDE9QlRDLCAyPUVUSCkKKiBgdHJpZ2dlcl9wcmljZWAgLSBQcmljZSBhdCB3aGljaCB0byBleGVjdXRlIChzY2FsZWQgMWU3KQoqIGBhY2NlcHRhYmxlX3ByaWNlYCAtIE1heGltdW0gc2xpcHBhZ2UgZnJvbSB0cmlnZ2VyICgwID0gYW55IHByaWNlKQoqIGBjb2xsYXRlcmFsYCAtIENvbGxhdGVyYWwgZm9yIHRoZSBuZXcgcG9zaXRpb24KKiBgbGV2ZXJhZ2VgIC0gTGV2ZXJhZ2UgZm9yIHRoZSBuZXcgcG9zaXRpb24KKiBgaXNfbG9uZ2AgLSBUcnVlIGZvciBsb25nLCBmYWxzZSBmb3Igc2hvcnQKKiBgZXhlY3V0aW9uX2ZlZWAgLSBGZWUgdG8gcGF5IGtlZXBlciBvbiBleGVjdXRpb24KKiBgZXhwaXJhdGlvbmAgLSBUaW1lc3RhbXAgd2hlbiBvcmRlciBleHBpcmVzICgwID0gbm8gZXhwaXJ5KQoKIyBSZXR1cm5zClRoZSBvcmRlciBJRAAAAAASY3JlYXRlX2xpbWl0X29yZGVyAAAAAAAJAAAAAAAAAAZ0cmFkZXIAAAAAABMAAAAAAAAACW1hcmtldF9pZAAAAAAAAAQAAAAAAAAADXRyaWdnZXJfcHJpY2UAAAAAAAALAAAAAAAAABBhY2NlcHRhYmxlX3ByaWNlAAAACwAAAAAAAAAKY29sbGF0ZXJhbAAAAAAACgAAAAAAAAAIbGV2ZXJhZ2UAAAAEAAAAAAAAAAdpc19sb25nAAAAAAEAAAAAAAAADWV4ZWN1dGlvbl9mZWUAAAAAAAAKAAAAAAAAAApleHBpcmF0aW9uAAAAAAAGAAAAAQAAAAY=",
        "AAAAAAAAAcFDcmVhdGUgYSB0YWtlLXByb2ZpdCBvcmRlciBhdHRhY2hlZCB0byBhbiBleGlzdGluZyBwb3NpdGlvbi4KCiMgQXJndW1lbnRzCiogYHRyYWRlcmAgLSBUaGUgcG9zaXRpb24gb3duZXIKKiBgcG9zaXRpb25faWRgIC0gVGhlIHBvc2l0aW9uIHRvIHRha2UgcHJvZml0IGZyb20KKiBgdHJpZ2dlcl9wcmljZWAgLSBQcmljZSBhdCB3aGljaCB0byBjbG9zZSBwb3NpdGlvbgoqIGBhY2NlcHRhYmxlX3ByaWNlYCAtIE1pbmltdW0gYWNjZXB0YWJsZSBwcmljZSBmb3IgY2xvc3VyZSAoMCA9IGFueSkKKiBgY2xvc2VfcGVyY2VudGFnZWAgLSBQZXJjZW50YWdlIHRvIGNsb3NlICgxMDAwMCA9IDEwMCUpCiogYGV4ZWN1dGlvbl9mZWVgIC0gRmVlIHRvIHBheSBrZWVwZXIKKiBgZXhwaXJhdGlvbmAgLSBPcmRlciBleHBpcmF0aW9uICgwID0gbm8gZXhwaXJ5KQoKIyBSZXR1cm5zClRoZSBvcmRlciBJRAAAAAAAABJjcmVhdGVfdGFrZV9wcm9maXQAAAAAAAcAAAAAAAAABnRyYWRlcgAAAAAAEwAAAAAAAAALcG9zaXRpb25faWQAAAAABgAAAAAAAAANdHJpZ2dlcl9wcmljZQAAAAAAAAsAAAAAAAAAEGFjY2VwdGFibGVfcHJpY2UAAAALAAAAAAAAABBjbG9zZV9wZXJjZW50YWdlAAAABAAAAAAAAAANZXhlY3V0aW9uX2ZlZQAAAAAAAAoAAAAAAAAACmV4cGlyYXRpb24AAAAAAAYAAAABAAAABg==",
        "AAAAAAAAAsJMaXF1aWRhdGUgYW4gdW5kZXJjb2xsYXRlcmFsaXplZCBwb3NpdGlvbi4KCiMgQXJndW1lbnRzCgoqIGBrZWVwZXJgIC0gVGhlIGFkZHJlc3Mgb2YgdGhlIGtlZXBlciBsaXF1aWRhdGluZyB0aGUgcG9zaXRpb24KKiBgcG9zaXRpb25faWRgIC0gVGhlIHVuaXF1ZSBwb3NpdGlvbiBpZGVudGlmaWVyCgojIFJldHVybnMKClRoZSBsaXF1aWRhdGlvbiByZXdhcmQgcGFpZCB0byB0aGUga2VlcGVyCgojIEltcGxlbWVudGF0aW9uCgotIEdldHMgY3VycmVudCBwcmljZSBmcm9tIE9yYWNsZUludGVncmF0b3IKLSBDYWxjdWxhdGVzIGNvbXByZWhlbnNpdmUgUG5MIGluY2x1ZGluZyBhbGwgZmVlcwotIFZlcmlmaWVzIHBvc2l0aW9uIGlzIGxpcXVpZGF0YWJsZSAodW5kZXJ3YXRlciBvciBiZWxvdyBtYWludGVuYW5jZSBtYXJnaW4pCi0gQ2FsY3VsYXRlcyBsaXF1aWRhdGlvbiBmZWVzOgotIDAuMyUgb2YgcG9zaXRpb24gc2l6ZSBnb2VzIHRvIGtlZXBlciBhcyByZXdhcmQKLSAwLjIlIG9mIHBvc2l0aW9uIHNpemUgZ29lcyB0byBsaXF1aWRpdHkgcG9vbAotIFNldHRsZXMgd2l0aCBMaXF1aWRpdHlQb29sIChjb2xsYXRlcmFsIG1pbnVzIGxvc3NlcyBhbmQgZmVlcykKLSBVcGRhdGVzIE1hcmtldE1hbmFnZXIgb3BlbiBpbnRlcmVzdAotIERlbGV0ZXMgcG9zaXRpb24gZnJvbSBzdG9yYWdlCi0gRW1pdHMgUG9zaXRpb25MaXF1aWRhdGVkIGV2ZW50AAAAAAASbGlxdWlkYXRlX3Bvc2l0aW9uAAAAAAACAAAAAAAAAAZrZWVwZXIAAAAAABMAAAAAAAAAC3Bvc2l0aW9uX2lkAAAAAAYAAAABAAAACg==",
        "AAAAAAAAALpHZXQgYWxsIG9yZGVycyAoU0wvVFApIGF0dGFjaGVkIHRvIGEgcG9zaXRpb24uCgojIEFyZ3VtZW50cwoqIGBwb3NpdGlvbl9pZGAgLSBUaGUgcG9zaXRpb24gaWRlbnRpZmllcgoKIyBSZXR1cm5zClZlY3RvciBvZiBvcmRlciBJRHMgZm9yIHN0b3AtbG9zcyBhbmQgdGFrZS1wcm9maXQgb3JkZXJzIG9uIHRoaXMgcG9zaXRpb24AAAAAABNnZXRfcG9zaXRpb25fb3JkZXJzAAAAAAEAAAAAAAAAC3Bvc2l0aW9uX2lkAAAAAAYAAAABAAAD6gAAAAY=",
        "AAAAAAAAAU5TZXQgbWluaW11bSBleGVjdXRpb24gZmVlIHJlcXVpcmVkIGZvciBvcmRlcnMgKGFkbWluIG9ubHkpLgpUaGUgZXhlY3V0aW9uIGZlZSBpbmNlbnRpdml6ZXMga2VlcGVyIGJvdHMgdG8gZXhlY3V0ZSBvcmRlcnMuCgojIEFyZ3VtZW50cwoqIGBhZG1pbmAgLSBUaGUgYWRtaW4gYWRkcmVzcyAobXVzdCBtYXRjaCBDb25maWdNYW5hZ2VyIGFkbWluKQoqIGBmZWVgIC0gVGhlIG1pbmltdW0gZmVlIGluIHRva2VuIGJhc2UgdW5pdHMgKGUuZy4sIDFfMDAwXzAwMCA9IDAuMSB0b2tlbnMgd2l0aCA3IGRlY2ltYWxzKQoKIyBQYW5pY3MKUGFuaWNzIGlmIGNhbGxlciBpcyBub3QgdGhlIGFkbWluAAAAAAAVc2V0X21pbl9leGVjdXRpb25fZmVlAAAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAANmZWUAAAAACgAAAAA=",
        "AAAAAAAAAZNHZXQgYWxsIG9wZW4gcG9zaXRpb24gSURzIGZvciBhIHNwZWNpZmljIHRyYWRlci4KCiMgQXJndW1lbnRzCgoqIGB0cmFkZXJgIC0gVGhlIGFkZHJlc3Mgb2YgdGhlIHRyYWRlcgoKIyBSZXR1cm5zCgpBIHZlY3RvciBvZiBwb3NpdGlvbiBJRHMgKHU2NCkgZm9yIGFsbCBvcGVuIHBvc2l0aW9ucyBvd25lZCBieSB0aGUgdHJhZGVyLgpSZXR1cm5zIGFuIGVtcHR5IHZlY3RvciBpZiB0aGUgdHJhZGVyIGhhcyBubyBvcGVuIHBvc2l0aW9ucy4KCiMgVXNhZ2UKCkZyb250ZW5kIGNhbiBjYWxsIHRoaXMgZnVuY3Rpb24gdG8gZ2V0IGFsbCBwb3NpdGlvbiBJRHMgZm9yIGEgdXNlciwKdGhlbiBjYWxsIGBnZXRfcG9zaXRpb24oaWQpYCBmb3IgZWFjaCBJRCB0byByZXRyaWV2ZSBmdWxsIHBvc2l0aW9uIGRldGFpbHMuAAAAABdnZXRfdXNlcl9vcGVuX3Bvc2l0aW9ucwAAAAABAAAAAAAAAAZ0cmFkZXIAAAAAABMAAAABAAAD6gAAAAY=" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_order: this.txFromJSON<Order>,
        initialize: this.txFromJSON<null>,
        cancel_order: this.txFromJSON<null>,
        get_position: this.txFromJSON<Position>,
        calculate_pnl: this.txFromJSON<i128>,
        execute_order: this.txFromJSON<i128>,
        open_position: this.txFromJSON<u64>,
        close_position: this.txFromJSON<i128>,
        get_user_orders: this.txFromJSON<Array<u64>>,
        create_stop_loss: this.txFromJSON<u64>,
        can_execute_order: this.txFromJSON<boolean>,
        decrease_position: this.txFromJSON<null>,
        get_market_orders: this.txFromJSON<Array<u64>>,
        increase_position: this.txFromJSON<null>,
        min_execution_fee: this.txFromJSON<u128>,
        create_limit_order: this.txFromJSON<u64>,
        create_take_profit: this.txFromJSON<u64>,
        liquidate_position: this.txFromJSON<u128>,
        get_position_orders: this.txFromJSON<Array<u64>>,
        set_min_execution_fee: this.txFromJSON<null>,
        get_user_open_positions: this.txFromJSON<Array<u64>>
  }
}