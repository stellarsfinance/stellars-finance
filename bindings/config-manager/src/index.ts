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




export type DataKey = {tag: "Admin", values: void} | {tag: "LiquidityPoolContract", values: void} | {tag: "PositionManagerContract", values: void} | {tag: "MarketManagerContract", values: void} | {tag: "OracleIntegratorContract", values: void} | {tag: "DiaOracleContract", values: void} | {tag: "ReflectorOracleContract", values: void} | {tag: "TokenContract", values: void} | {tag: "MinLeverage", values: void} | {tag: "MaxLeverage", values: void} | {tag: "MinPositionSize", values: void} | {tag: "MakerFeeBps", values: void} | {tag: "TakerFeeBps", values: void} | {tag: "LiquidationFeeBps", values: void} | {tag: "LiquidationThreshold", values: void} | {tag: "MaintenanceMargin", values: void} | {tag: "MaxPriceDeviationBps", values: void} | {tag: "FundingInterval", values: void} | {tag: "PriceStalenessThreshold", values: void} | {tag: "MaxUtilizationRatio", values: void} | {tag: "MinLiquidityReserveRatio", values: void} | {tag: "BorrowRatePerSecond", values: void};

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
  }) => Promise<AssembledTransaction<string>>

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
  }) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a set_fees transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set fee parameters in basis points.
   * 
   * # Arguments
   * 
   * * `admin` - The administrator address
   * * `maker_fee` - Maker fee in basis points (max 1000 = 10%)
   * * `taker_fee` - Taker fee in basis points (max 1000 = 10%)
   * * `liquidation_fee` - Liquidation fee in basis points (max 1000 = 10%)
   * 
   * # Panics
   * 
   * Panics if caller is not the admin or fees are invalid
   */
  set_fees: ({admin, maker_fee, taker_fee, liquidation_fee}: {admin: string, maker_fee: i128, taker_fee: i128, liquidation_fee: i128}, options?: {
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
  set_admin: ({current_admin, new_admin}: {current_admin: string, new_admin: string}, options?: {
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
  set_token: ({admin, contract}: {admin: string, contract: string}, options?: {
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
   * Construct and simulate a dia_oracle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the DIA Oracle contract address.
   * 
   * # Returns
   * 
   * The DIA Oracle contract address
   */
  dia_oracle: (options?: {
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
  initialize: ({admin}: {admin: string}, options?: {
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
  }) => Promise<AssembledTransaction<i128>>

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
  }) => Promise<AssembledTransaction<i128>>

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
  }) => Promise<AssembledTransaction<i128>>

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
  }) => Promise<AssembledTransaction<i128>>

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
  }) => Promise<AssembledTransaction<string>>

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
  }) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a set_dia_oracle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set the DIA Oracle contract address.
   * 
   * # Arguments
   * 
   * * `admin` - The administrator address
   * * `contract` - The DIA Oracle contract address
   * 
   * # Panics
   * 
   * Panics if caller is not the admin
   */
  set_dia_oracle: ({admin, contract}: {admin: string, contract: string}, options?: {
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
   * Construct and simulate a set_risk_params transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set risk parameters.
   * 
   * # Arguments
   * 
   * * `admin` - The administrator address
   * * `liquidation_threshold` - Liquidation threshold in bps (must be > maintenance_margin)
   * * `maintenance_margin` - Maintenance margin in bps (must be > 0)
   * 
   * # Panics
   * 
   * Panics if caller is not the admin or parameters are invalid
   */
  set_risk_params: ({admin, liquidation_threshold, maintenance_margin}: {admin: string, liquidation_threshold: i128, maintenance_margin: i128}, options?: {
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
   * Construct and simulate a set_time_params transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set time parameters.
   * 
   * # Arguments
   * 
   * * `admin` - The administrator address
   * * `funding_interval` - Funding interval in seconds (must be >= 1)
   * * `staleness_threshold` - Price staleness threshold in seconds (must be >= 1)
   * 
   * # Panics
   * 
   * Panics if caller is not the admin or parameters are invalid
   */
  set_time_params: ({admin, funding_interval, staleness_threshold}: {admin: string, funding_interval: u64, staleness_threshold: u64}, options?: {
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
  }) => Promise<AssembledTransaction<u64>>

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
  }) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a reflector_oracle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the Reflector Oracle contract address.
   * 
   * # Returns
   * 
   * The Reflector Oracle contract address
   */
  reflector_oracle: (options?: {
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
  }) => Promise<AssembledTransaction<i128>>

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
  }) => Promise<AssembledTransaction<string>>

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
  }) => Promise<AssembledTransaction<i128>>

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
  set_liquidity_pool: ({admin, contract}: {admin: string, contract: string}, options?: {
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
  set_market_manager: ({admin, contract}: {admin: string, contract: string}, options?: {
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
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a set_leverage_limits transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set leverage limits.
   * 
   * # Arguments
   * 
   * * `admin` - The administrator address
   * * `min_leverage` - Minimum leverage (must be >= 1)
   * * `max_leverage` - Maximum leverage (must be > min_leverage and <= 100)
   * 
   * # Panics
   * 
   * Panics if caller is not the admin or limits are invalid
   */
  set_leverage_limits: ({admin, min_leverage, max_leverage}: {admin: string, min_leverage: i128, max_leverage: i128}, options?: {
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
  set_position_manager: ({admin, contract}: {admin: string, contract: string}, options?: {
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
   * Construct and simulate a set_reflector_oracle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set the Reflector Oracle contract address.
   * 
   * # Arguments
   * 
   * * `admin` - The administrator address
   * * `contract` - The Reflector Oracle contract address
   * 
   * # Panics
   * 
   * Panics if caller is not the admin
   */
  set_reflector_oracle: ({admin, contract}: {admin: string, contract: string}, options?: {
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
  }) => Promise<AssembledTransaction<i128>>

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
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a set_min_position_size transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set minimum position size.
   * 
   * # Arguments
   * 
   * * `admin` - The administrator address
   * * `size` - Minimum position size in base units (must be > 0)
   * 
   * # Panics
   * 
   * Panics if caller is not the admin or size is invalid
   */
  set_min_position_size: ({admin, size}: {admin: string, size: i128}, options?: {
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
  set_oracle_integrator: ({admin, contract}: {admin: string, contract: string}, options?: {
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
   * Construct and simulate a borrow_rate_per_second transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get borrow rate per second (scaled by 1e7).
   * 
   * # Returns
   * 
   * Borrow rate per second for calculating borrowing fees
   */
  borrow_rate_per_second: (options?: {
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
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a set_max_price_deviation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set maximum price deviation in basis points.
   * 
   * # Arguments
   * 
   * * `admin` - The administrator address
   * * `deviation` - Max price deviation in bps (must be 1-5000)
   * 
   * # Panics
   * 
   * Panics if caller is not the admin or deviation is invalid
   */
  set_max_price_deviation: ({admin, deviation}: {admin: string, deviation: i128}, options?: {
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
  }) => Promise<AssembledTransaction<u64>>

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
  set_max_utilization_ratio: ({admin, ratio}: {admin: string, ratio: i128}, options?: {
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
   * Construct and simulate a set_borrow_rate_per_second transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set borrow rate per second.
   * 
   * # Arguments
   * 
   * * `admin` - The administrator address
   * * `rate` - Borrow rate per second (scaled by 1e7, must be >= 0)
   * 
   * # Panics
   * 
   * Panics if caller is not the admin or rate is negative
   */
  set_borrow_rate_per_second: ({admin, rate}: {admin: string, rate: i128}, options?: {
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
  }) => Promise<AssembledTransaction<i128>>

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
  set_min_liquidity_reserve_ratio: ({admin, ratio}: {admin: string, ratio: i128}, options?: {
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
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAFgAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAVTGlxdWlkaXR5UG9vbENvbnRyYWN0AAAAAAAAAAAAAAAAAAAXUG9zaXRpb25NYW5hZ2VyQ29udHJhY3QAAAAAAAAAAAAAAAAVTWFya2V0TWFuYWdlckNvbnRyYWN0AAAAAAAAAAAAAAAAAAAYT3JhY2xlSW50ZWdyYXRvckNvbnRyYWN0AAAAAAAAAAAAAAARRGlhT3JhY2xlQ29udHJhY3QAAAAAAAAAAAAAAAAAABdSZWZsZWN0b3JPcmFjbGVDb250cmFjdAAAAAAAAAAAAAAAAA1Ub2tlbkNvbnRyYWN0AAAAAAAAAAAAAAAAAAALTWluTGV2ZXJhZ2UAAAAAAAAAAAAAAAALTWF4TGV2ZXJhZ2UAAAAAAAAAAAAAAAAPTWluUG9zaXRpb25TaXplAAAAAAAAAAAAAAAAC01ha2VyRmVlQnBzAAAAAAAAAAAAAAAAC1Rha2VyRmVlQnBzAAAAAAAAAAAAAAAAEUxpcXVpZGF0aW9uRmVlQnBzAAAAAAAAAAAAAAAAAAAUTGlxdWlkYXRpb25UaHJlc2hvbGQAAAAAAAAAAAAAABFNYWludGVuYW5jZU1hcmdpbgAAAAAAAAAAAAAAAAAAFE1heFByaWNlRGV2aWF0aW9uQnBzAAAAAAAAAAAAAAAPRnVuZGluZ0ludGVydmFsAAAAAAAAAAAAAAAAF1ByaWNlU3RhbGVuZXNzVGhyZXNob2xkAAAAAAAAAAAAAAAAE01heFV0aWxpemF0aW9uUmF0aW8AAAAAAAAAAAAAAAAYTWluTGlxdWlkaXR5UmVzZXJ2ZVJhdGlvAAAAAAAAAAAAAAATQm9ycm93UmF0ZVBlclNlY29uZAA=",
        "AAAAAAAAAERHZXQgdGhlIGN1cnJlbnQgYWRtaW4gYWRkcmVzcy4KCiMgUmV0dXJucwoKVGhlIGFkbWluaXN0cmF0b3IgYWRkcmVzcwAAAAVhZG1pbgAAAAAAAAAAAAABAAAAEw==",
        "AAAAAAAAAEZHZXQgdGhlIFRva2VuIGNvbnRyYWN0IGFkZHJlc3MuCgojIFJldHVybnMKClRoZSBUb2tlbiBjb250cmFjdCBhZGRyZXNzAAAAAAAFdG9rZW4AAAAAAAAAAAAAAQAAABM=",
        "AAAAAAAAAVVTZXQgZmVlIHBhcmFtZXRlcnMgaW4gYmFzaXMgcG9pbnRzLgoKIyBBcmd1bWVudHMKCiogYGFkbWluYCAtIFRoZSBhZG1pbmlzdHJhdG9yIGFkZHJlc3MKKiBgbWFrZXJfZmVlYCAtIE1ha2VyIGZlZSBpbiBiYXNpcyBwb2ludHMgKG1heCAxMDAwID0gMTAlKQoqIGB0YWtlcl9mZWVgIC0gVGFrZXIgZmVlIGluIGJhc2lzIHBvaW50cyAobWF4IDEwMDAgPSAxMCUpCiogYGxpcXVpZGF0aW9uX2ZlZWAgLSBMaXF1aWRhdGlvbiBmZWUgaW4gYmFzaXMgcG9pbnRzIChtYXggMTAwMCA9IDEwJSkKCiMgUGFuaWNzCgpQYW5pY3MgaWYgY2FsbGVyIGlzIG5vdCB0aGUgYWRtaW4gb3IgZmVlcyBhcmUgaW52YWxpZAAAAAAAAAhzZXRfZmVlcwAAAAQAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAJbWFrZXJfZmVlAAAAAAAACwAAAAAAAAAJdGFrZXJfZmVlAAAAAAAACwAAAAAAAAAPbGlxdWlkYXRpb25fZmVlAAAAAAsAAAAA",
        "AAAAAAAAAMBVcGRhdGUgdGhlIGFkbWluIGFkZHJlc3MuCgojIEFyZ3VtZW50cwoKKiBgY3VycmVudF9hZG1pbmAgLSBUaGUgY3VycmVudCBhZG1pbmlzdHJhdG9yIGFkZHJlc3MKKiBgbmV3X2FkbWluYCAtIFRoZSBuZXcgYWRtaW5pc3RyYXRvciBhZGRyZXNzCgojIFBhbmljcwoKUGFuaWNzIGlmIGNhbGxlciBpcyBub3QgdGhlIGN1cnJlbnQgYWRtaW4AAAAJc2V0X2FkbWluAAAAAAAAAgAAAAAAAAANY3VycmVudF9hZG1pbgAAAAAAABMAAAAAAAAACW5ld19hZG1pbgAAAAAAABMAAAAA",
        "AAAAAAAAAKpTZXQgdGhlIFRva2VuIGNvbnRyYWN0IGFkZHJlc3MuCgojIEFyZ3VtZW50cwoKKiBgYWRtaW5gIC0gVGhlIGFkbWluaXN0cmF0b3IgYWRkcmVzcwoqIGBjb250cmFjdGAgLSBUaGUgVG9rZW4gY29udHJhY3QgYWRkcmVzcwoKIyBQYW5pY3MKClBhbmljcyBpZiBjYWxsZXIgaXMgbm90IHRoZSBhZG1pbgAAAAAACXNldF90b2tlbgAAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAIY29udHJhY3QAAAATAAAAAA==",
        "AAAAAAAAAFBHZXQgdGhlIERJQSBPcmFjbGUgY29udHJhY3QgYWRkcmVzcy4KCiMgUmV0dXJucwoKVGhlIERJQSBPcmFjbGUgY29udHJhY3QgYWRkcmVzcwAAAApkaWFfb3JhY2xlAAAAAAAAAAAAAQAAABM=",
        "AAAAAAAAAI5Jbml0aWFsaXplIHRoZSBjb25maWd1cmF0aW9uIGNvbnRyYWN0IHdpdGggYWRtaW4uCgojIEFyZ3VtZW50cwoKKiBgYWRtaW5gIC0gVGhlIGFkbWluaXN0cmF0b3IgYWRkcmVzcwoKIyBQYW5pY3MKClBhbmljcyBpZiBhbHJlYWR5IGluaXRpYWxpemVkAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAEZHZXQgbWF4aW11bSBsZXZlcmFnZSBsaW1pdC4KCiMgUmV0dXJucwoKTWF4aW11bSBsZXZlcmFnZSAoZGVmYXVsdDogMjApAAAAAAAMbWF4X2xldmVyYWdlAAAAAAAAAAEAAAAL",
        "AAAAAAAAAEVHZXQgbWluaW11bSBsZXZlcmFnZSBsaW1pdC4KCiMgUmV0dXJucwoKTWluaW11bSBsZXZlcmFnZSAoZGVmYXVsdDogNSkAAAAAAAAMbWluX2xldmVyYWdlAAAAAAAAAAEAAAAL",
        "AAAAAAAAAFFHZXQgbWFrZXIgZmVlIGluIGJhc2lzIHBvaW50cy4KCiMgUmV0dXJucwoKTWFrZXIgZmVlIGluIGJhc2lzIHBvaW50cyAoZGVmYXVsdDogMikAAAAAAAANbWFrZXJfZmVlX2JwcwAAAAAAAAAAAAABAAAACw==",
        "AAAAAAAAAFFHZXQgdGFrZXIgZmVlIGluIGJhc2lzIHBvaW50cy4KCiMgUmV0dXJucwoKVGFrZXIgZmVlIGluIGJhc2lzIHBvaW50cyAoZGVmYXVsdDogNSkAAAAAAAANdGFrZXJfZmVlX2JwcwAAAAAAAAAAAAABAAAACw==",
        "AAAAAAAAAFhHZXQgdGhlIExpcXVpZGl0eSBQb29sIGNvbnRyYWN0IGFkZHJlc3MuCgojIFJldHVybnMKClRoZSBMaXF1aWRpdHkgUG9vbCBjb250cmFjdCBhZGRyZXNzAAAADmxpcXVpZGl0eV9wb29sAAAAAAAAAAAAAQAAABM=",
        "AAAAAAAAAFhHZXQgdGhlIE1hcmtldCBNYW5hZ2VyIGNvbnRyYWN0IGFkZHJlc3MuCgojIFJldHVybnMKClRoZSBNYXJrZXQgTWFuYWdlciBjb250cmFjdCBhZGRyZXNzAAAADm1hcmtldF9tYW5hZ2VyAAAAAAAAAAAAAQAAABM=",
        "AAAAAAAAALRTZXQgdGhlIERJQSBPcmFjbGUgY29udHJhY3QgYWRkcmVzcy4KCiMgQXJndW1lbnRzCgoqIGBhZG1pbmAgLSBUaGUgYWRtaW5pc3RyYXRvciBhZGRyZXNzCiogYGNvbnRyYWN0YCAtIFRoZSBESUEgT3JhY2xlIGNvbnRyYWN0IGFkZHJlc3MKCiMgUGFuaWNzCgpQYW5pY3MgaWYgY2FsbGVyIGlzIG5vdCB0aGUgYWRtaW4AAAAOc2V0X2RpYV9vcmFjbGUAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAIY29udHJhY3QAAAATAAAAAA==",
        "AAAAAAAAAShTZXQgcmlzayBwYXJhbWV0ZXJzLgoKIyBBcmd1bWVudHMKCiogYGFkbWluYCAtIFRoZSBhZG1pbmlzdHJhdG9yIGFkZHJlc3MKKiBgbGlxdWlkYXRpb25fdGhyZXNob2xkYCAtIExpcXVpZGF0aW9uIHRocmVzaG9sZCBpbiBicHMgKG11c3QgYmUgPiBtYWludGVuYW5jZV9tYXJnaW4pCiogYG1haW50ZW5hbmNlX21hcmdpbmAgLSBNYWludGVuYW5jZSBtYXJnaW4gaW4gYnBzIChtdXN0IGJlID4gMCkKCiMgUGFuaWNzCgpQYW5pY3MgaWYgY2FsbGVyIGlzIG5vdCB0aGUgYWRtaW4gb3IgcGFyYW1ldGVycyBhcmUgaW52YWxpZAAAAA9zZXRfcmlza19wYXJhbXMAAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABVsaXF1aWRhdGlvbl90aHJlc2hvbGQAAAAAAAALAAAAAAAAABJtYWludGVuYW5jZV9tYXJnaW4AAAAAAAsAAAAA",
        "AAAAAAAAAR9TZXQgdGltZSBwYXJhbWV0ZXJzLgoKIyBBcmd1bWVudHMKCiogYGFkbWluYCAtIFRoZSBhZG1pbmlzdHJhdG9yIGFkZHJlc3MKKiBgZnVuZGluZ19pbnRlcnZhbGAgLSBGdW5kaW5nIGludGVydmFsIGluIHNlY29uZHMgKG11c3QgYmUgPj0gMSkKKiBgc3RhbGVuZXNzX3RocmVzaG9sZGAgLSBQcmljZSBzdGFsZW5lc3MgdGhyZXNob2xkIGluIHNlY29uZHMgKG11c3QgYmUgPj0gMSkKCiMgUGFuaWNzCgpQYW5pY3MgaWYgY2FsbGVyIGlzIG5vdCB0aGUgYWRtaW4gb3IgcGFyYW1ldGVycyBhcmUgaW52YWxpZAAAAAAPc2V0X3RpbWVfcGFyYW1zAAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAQZnVuZGluZ19pbnRlcnZhbAAAAAYAAAAAAAAAE3N0YWxlbmVzc190aHJlc2hvbGQAAAAABgAAAAA=",
        "AAAAAAAAAFZHZXQgZnVuZGluZyBpbnRlcnZhbCBpbiBzZWNvbmRzLgoKIyBSZXR1cm5zCgpGdW5kaW5nIGludGVydmFsIGluIHNlY29uZHMgKGRlZmF1bHQ6IDYwKQAAAAAAEGZ1bmRpbmdfaW50ZXJ2YWwAAAAAAAAAAQAAAAY=",
        "AAAAAAAAAFxHZXQgdGhlIFBvc2l0aW9uIE1hbmFnZXIgY29udHJhY3QgYWRkcmVzcy4KCiMgUmV0dXJucwoKVGhlIFBvc2l0aW9uIE1hbmFnZXIgY29udHJhY3QgYWRkcmVzcwAAABBwb3NpdGlvbl9tYW5hZ2VyAAAAAAAAAAEAAAAT",
        "AAAAAAAAAFxHZXQgdGhlIFJlZmxlY3RvciBPcmFjbGUgY29udHJhY3QgYWRkcmVzcy4KCiMgUmV0dXJucwoKVGhlIFJlZmxlY3RvciBPcmFjbGUgY29udHJhY3QgYWRkcmVzcwAAABByZWZsZWN0b3Jfb3JhY2xlAAAAAAAAAAEAAAAT",
        "AAAAAAAAAEpHZXQgbWluaW11bSBwb3NpdGlvbiBzaXplLgoKIyBSZXR1cm5zCgpNaW5pbXVtIHBvc2l0aW9uIHNpemUgaW4gYmFzZSB1bml0cwAAAAAAEW1pbl9wb3NpdGlvbl9zaXplAAAAAAAAAAAAAAEAAAAL",
        "AAAAAAAAAF5HZXQgdGhlIE9yYWNsZSBJbnRlZ3JhdG9yIGNvbnRyYWN0IGFkZHJlc3MuCgojIFJldHVybnMKClRoZSBPcmFjbGUgSW50ZWdyYXRvciBjb250cmFjdCBhZGRyZXNzAAAAAAARb3JhY2xlX2ludGVncmF0b3IAAAAAAAAAAAAAAQAAABM=",
        "AAAAAAAAAGZHZXQgbWFpbnRlbmFuY2UgbWFyZ2luIGluIGJhc2lzIHBvaW50cy4KCiMgUmV0dXJucwoKTWFpbnRlbmFuY2UgbWFyZ2luIGluIGJhc2lzIHBvaW50cyAoZGVmYXVsdDogNTAwMCkAAAAAABJtYWludGVuYW5jZV9tYXJnaW4AAAAAAAAAAAABAAAACw==",
        "AAAAAAAAALxTZXQgdGhlIExpcXVpZGl0eSBQb29sIGNvbnRyYWN0IGFkZHJlc3MuCgojIEFyZ3VtZW50cwoKKiBgYWRtaW5gIC0gVGhlIGFkbWluaXN0cmF0b3IgYWRkcmVzcwoqIGBjb250cmFjdGAgLSBUaGUgTGlxdWlkaXR5IFBvb2wgY29udHJhY3QgYWRkcmVzcwoKIyBQYW5pY3MKClBhbmljcyBpZiBjYWxsZXIgaXMgbm90IHRoZSBhZG1pbgAAABJzZXRfbGlxdWlkaXR5X3Bvb2wAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAIY29udHJhY3QAAAATAAAAAA==",
        "AAAAAAAAALxTZXQgdGhlIE1hcmtldCBNYW5hZ2VyIGNvbnRyYWN0IGFkZHJlc3MuCgojIEFyZ3VtZW50cwoKKiBgYWRtaW5gIC0gVGhlIGFkbWluaXN0cmF0b3IgYWRkcmVzcwoqIGBjb250cmFjdGAgLSBUaGUgTWFya2V0IE1hbmFnZXIgY29udHJhY3QgYWRkcmVzcwoKIyBQYW5pY3MKClBhbmljcyBpZiBjYWxsZXIgaXMgbm90IHRoZSBhZG1pbgAAABJzZXRfbWFya2V0X21hbmFnZXIAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAIY29udHJhY3QAAAATAAAAAA==",
        "AAAAAAAAAF5HZXQgbGlxdWlkYXRpb24gZmVlIGluIGJhc2lzIHBvaW50cy4KCiMgUmV0dXJucwoKTGlxdWlkYXRpb24gZmVlIGluIGJhc2lzIHBvaW50cyAoZGVmYXVsdDogNTApAAAAAAATbGlxdWlkYXRpb25fZmVlX2JwcwAAAAAAAAAAAQAAAAs=",
        "AAAAAAAAAQZTZXQgbGV2ZXJhZ2UgbGltaXRzLgoKIyBBcmd1bWVudHMKCiogYGFkbWluYCAtIFRoZSBhZG1pbmlzdHJhdG9yIGFkZHJlc3MKKiBgbWluX2xldmVyYWdlYCAtIE1pbmltdW0gbGV2ZXJhZ2UgKG11c3QgYmUgPj0gMSkKKiBgbWF4X2xldmVyYWdlYCAtIE1heGltdW0gbGV2ZXJhZ2UgKG11c3QgYmUgPiBtaW5fbGV2ZXJhZ2UgYW5kIDw9IDEwMCkKCiMgUGFuaWNzCgpQYW5pY3MgaWYgY2FsbGVyIGlzIG5vdCB0aGUgYWRtaW4gb3IgbGltaXRzIGFyZSBpbnZhbGlkAAAAAAATc2V0X2xldmVyYWdlX2xpbWl0cwAAAAADAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAADG1pbl9sZXZlcmFnZQAAAAsAAAAAAAAADG1heF9sZXZlcmFnZQAAAAsAAAAA",
        "AAAAAAAAAMBTZXQgdGhlIFBvc2l0aW9uIE1hbmFnZXIgY29udHJhY3QgYWRkcmVzcy4KCiMgQXJndW1lbnRzCgoqIGBhZG1pbmAgLSBUaGUgYWRtaW5pc3RyYXRvciBhZGRyZXNzCiogYGNvbnRyYWN0YCAtIFRoZSBQb3NpdGlvbiBNYW5hZ2VyIGNvbnRyYWN0IGFkZHJlc3MKCiMgUGFuaWNzCgpQYW5pY3MgaWYgY2FsbGVyIGlzIG5vdCB0aGUgYWRtaW4AAAAUc2V0X3Bvc2l0aW9uX21hbmFnZXIAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAACGNvbnRyYWN0AAAAEwAAAAA=",
        "AAAAAAAAAMBTZXQgdGhlIFJlZmxlY3RvciBPcmFjbGUgY29udHJhY3QgYWRkcmVzcy4KCiMgQXJndW1lbnRzCgoqIGBhZG1pbmAgLSBUaGUgYWRtaW5pc3RyYXRvciBhZGRyZXNzCiogYGNvbnRyYWN0YCAtIFRoZSBSZWZsZWN0b3IgT3JhY2xlIGNvbnRyYWN0IGFkZHJlc3MKCiMgUGFuaWNzCgpQYW5pY3MgaWYgY2FsbGVyIGlzIG5vdCB0aGUgYWRtaW4AAAAUc2V0X3JlZmxlY3Rvcl9vcmFjbGUAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAACGNvbnRyYWN0AAAAEwAAAAA=",
        "AAAAAAAAAGxHZXQgbGlxdWlkYXRpb24gdGhyZXNob2xkIGluIGJhc2lzIHBvaW50cy4KCiMgUmV0dXJucwoKTGlxdWlkYXRpb24gdGhyZXNob2xkIGluIGJhc2lzIHBvaW50cyAoZGVmYXVsdDogOTAwMCkAAAAVbGlxdWlkYXRpb25fdGhyZXNob2xkAAAAAAAAAAAAAAEAAAAL",
        "AAAAAAAAAH9HZXQgbWF4aW11bSBwb29sIHV0aWxpemF0aW9uIHJhdGlvIGluIGJhc2lzIHBvaW50cy4KCiMgUmV0dXJucwoKTWF4aW11bSB1dGlsaXphdGlvbiByYXRpbyBpbiBiYXNpcyBwb2ludHMgKGRlZmF1bHQ6IDgwMDAgPSA4MCUpAAAAABVtYXhfdXRpbGl6YXRpb25fcmF0aW8AAAAAAAAAAAAAAQAAAAs=",
        "AAAAAAAAAMtTZXQgbWluaW11bSBwb3NpdGlvbiBzaXplLgoKIyBBcmd1bWVudHMKCiogYGFkbWluYCAtIFRoZSBhZG1pbmlzdHJhdG9yIGFkZHJlc3MKKiBgc2l6ZWAgLSBNaW5pbXVtIHBvc2l0aW9uIHNpemUgaW4gYmFzZSB1bml0cyAobXVzdCBiZSA+IDApCgojIFBhbmljcwoKUGFuaWNzIGlmIGNhbGxlciBpcyBub3QgdGhlIGFkbWluIG9yIHNpemUgaXMgaW52YWxpZAAAAAAVc2V0X21pbl9wb3NpdGlvbl9zaXplAAAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAARzaXplAAAACwAAAAA=",
        "AAAAAAAAAMJTZXQgdGhlIE9yYWNsZSBJbnRlZ3JhdG9yIGNvbnRyYWN0IGFkZHJlc3MuCgojIEFyZ3VtZW50cwoKKiBgYWRtaW5gIC0gVGhlIGFkbWluaXN0cmF0b3IgYWRkcmVzcwoqIGBjb250cmFjdGAgLSBUaGUgT3JhY2xlIEludGVncmF0b3IgY29udHJhY3QgYWRkcmVzcwoKIyBQYW5pY3MKClBhbmljcyBpZiBjYWxsZXIgaXMgbm90IHRoZSBhZG1pbgAAAAAAFXNldF9vcmFjbGVfaW50ZWdyYXRvcgAAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAIY29udHJhY3QAAAATAAAAAA==",
        "AAAAAAAAAG1HZXQgYm9ycm93IHJhdGUgcGVyIHNlY29uZCAoc2NhbGVkIGJ5IDFlNykuCgojIFJldHVybnMKCkJvcnJvdyByYXRlIHBlciBzZWNvbmQgZm9yIGNhbGN1bGF0aW5nIGJvcnJvd2luZyBmZWVzAAAAAAAAFmJvcnJvd19yYXRlX3Blcl9zZWNvbmQAAAAAAAAAAAABAAAACw==",
        "AAAAAAAAAG9HZXQgbWF4aW11bSBwcmljZSBkZXZpYXRpb24gaW4gYmFzaXMgcG9pbnRzLgoKIyBSZXR1cm5zCgpNYXhpbXVtIHByaWNlIGRldmlhdGlvbiBpbiBiYXNpcyBwb2ludHMgKGRlZmF1bHQ6IDUwMCkAAAAAF21heF9wcmljZV9kZXZpYXRpb25fYnBzAAAAAAAAAAABAAAACw==",
        "AAAAAAAAAOFTZXQgbWF4aW11bSBwcmljZSBkZXZpYXRpb24gaW4gYmFzaXMgcG9pbnRzLgoKIyBBcmd1bWVudHMKCiogYGFkbWluYCAtIFRoZSBhZG1pbmlzdHJhdG9yIGFkZHJlc3MKKiBgZGV2aWF0aW9uYCAtIE1heCBwcmljZSBkZXZpYXRpb24gaW4gYnBzIChtdXN0IGJlIDEtNTAwMCkKCiMgUGFuaWNzCgpQYW5pY3MgaWYgY2FsbGVyIGlzIG5vdCB0aGUgYWRtaW4gb3IgZGV2aWF0aW9uIGlzIGludmFsaWQAAAAAAAAXc2V0X21heF9wcmljZV9kZXZpYXRpb24AAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAlkZXZpYXRpb24AAAAAAAALAAAAAA==",
        "AAAAAAAAAGhHZXQgcHJpY2Ugc3RhbGVuZXNzIHRocmVzaG9sZCBpbiBzZWNvbmRzLgoKIyBSZXR1cm5zCgpQcmljZSBzdGFsZW5lc3MgdGhyZXNob2xkIGluIHNlY29uZHMgKGRlZmF1bHQ6IDYwKQAAABlwcmljZV9zdGFsZW5lc3NfdGhyZXNob2xkAAAAAAAAAAAAAAEAAAAG",
        "AAAAAAAAAPVTZXQgbWF4aW11bSBwb29sIHV0aWxpemF0aW9uIHJhdGlvIGluIGJhc2lzIHBvaW50cy4KCiMgQXJndW1lbnRzCgoqIGBhZG1pbmAgLSBUaGUgYWRtaW5pc3RyYXRvciBhZGRyZXNzCiogYHJhdGlvYCAtIFRoZSBtYXhpbXVtIHV0aWxpemF0aW9uIHJhdGlvIGluIGJhc2lzIHBvaW50cyAoZS5nLiwgODAwMCA9IDgwJSkKCiMgUGFuaWNzCgpQYW5pY3MgaWYgY2FsbGVyIGlzIG5vdCB0aGUgYWRtaW4gb3IgcmF0aW8gaXMgaW52YWxpZAAAAAAAABlzZXRfbWF4X3V0aWxpemF0aW9uX3JhdGlvAAAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAVyYXRpbwAAAAAAAAsAAAAA",
        "AAAAAAAAANBTZXQgYm9ycm93IHJhdGUgcGVyIHNlY29uZC4KCiMgQXJndW1lbnRzCgoqIGBhZG1pbmAgLSBUaGUgYWRtaW5pc3RyYXRvciBhZGRyZXNzCiogYHJhdGVgIC0gQm9ycm93IHJhdGUgcGVyIHNlY29uZCAoc2NhbGVkIGJ5IDFlNywgbXVzdCBiZSA+PSAwKQoKIyBQYW5pY3MKClBhbmljcyBpZiBjYWxsZXIgaXMgbm90IHRoZSBhZG1pbiBvciByYXRlIGlzIG5lZ2F0aXZlAAAAGnNldF9ib3Jyb3dfcmF0ZV9wZXJfc2Vjb25kAAAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABHJhdGUAAAALAAAAAA==",
        "AAAAAAAAAHxHZXQgbWluaW11bSBsaXF1aWRpdHkgcmVzZXJ2ZSByYXRpbyBpbiBiYXNpcyBwb2ludHMuCgojIFJldHVybnMKCk1pbmltdW0gcmVzZXJ2ZSByYXRpbyBpbiBiYXNpcyBwb2ludHMgKGRlZmF1bHQ6IDIwMDAgPSAyMCUpAAAAG21pbl9saXF1aWRpdHlfcmVzZXJ2ZV9yYXRpbwAAAAAAAAAAAQAAAAs=",
        "AAAAAAAAAPJTZXQgbWluaW11bSBsaXF1aWRpdHkgcmVzZXJ2ZSByYXRpbyBpbiBiYXNpcyBwb2ludHMuCgojIEFyZ3VtZW50cwoKKiBgYWRtaW5gIC0gVGhlIGFkbWluaXN0cmF0b3IgYWRkcmVzcwoqIGByYXRpb2AgLSBUaGUgbWluaW11bSByZXNlcnZlIHJhdGlvIGluIGJhc2lzIHBvaW50cyAoZS5nLiwgMjAwMCA9IDIwJSkKCiMgUGFuaWNzCgpQYW5pY3MgaWYgY2FsbGVyIGlzIG5vdCB0aGUgYWRtaW4gb3IgcmF0aW8gaXMgaW52YWxpZAAAAAAAH3NldF9taW5fbGlxdWlkaXR5X3Jlc2VydmVfcmF0aW8AAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAVyYXRpbwAAAAAAAAsAAAAA" ]),
      options
    )
  }
  public readonly fromJSON = {
    admin: this.txFromJSON<string>,
        token: this.txFromJSON<string>,
        set_fees: this.txFromJSON<null>,
        set_admin: this.txFromJSON<null>,
        set_token: this.txFromJSON<null>,
        dia_oracle: this.txFromJSON<string>,
        initialize: this.txFromJSON<null>,
        max_leverage: this.txFromJSON<i128>,
        min_leverage: this.txFromJSON<i128>,
        maker_fee_bps: this.txFromJSON<i128>,
        taker_fee_bps: this.txFromJSON<i128>,
        liquidity_pool: this.txFromJSON<string>,
        market_manager: this.txFromJSON<string>,
        set_dia_oracle: this.txFromJSON<null>,
        set_risk_params: this.txFromJSON<null>,
        set_time_params: this.txFromJSON<null>,
        funding_interval: this.txFromJSON<u64>,
        position_manager: this.txFromJSON<string>,
        reflector_oracle: this.txFromJSON<string>,
        min_position_size: this.txFromJSON<i128>,
        oracle_integrator: this.txFromJSON<string>,
        maintenance_margin: this.txFromJSON<i128>,
        set_liquidity_pool: this.txFromJSON<null>,
        set_market_manager: this.txFromJSON<null>,
        liquidation_fee_bps: this.txFromJSON<i128>,
        set_leverage_limits: this.txFromJSON<null>,
        set_position_manager: this.txFromJSON<null>,
        set_reflector_oracle: this.txFromJSON<null>,
        liquidation_threshold: this.txFromJSON<i128>,
        max_utilization_ratio: this.txFromJSON<i128>,
        set_min_position_size: this.txFromJSON<null>,
        set_oracle_integrator: this.txFromJSON<null>,
        borrow_rate_per_second: this.txFromJSON<i128>,
        max_price_deviation_bps: this.txFromJSON<i128>,
        set_max_price_deviation: this.txFromJSON<null>,
        price_staleness_threshold: this.txFromJSON<u64>,
        set_max_utilization_ratio: this.txFromJSON<null>,
        set_borrow_rate_per_second: this.txFromJSON<null>,
        min_liquidity_reserve_ratio: this.txFromJSON<i128>,
        set_min_liquidity_reserve_ratio: this.txFromJSON<null>
  }
}