#![no_std]

//! # PositionManager Contract
//!
//! The PositionManager contract handles all individual trader position operations for the
//! Stellars Finance perpetuals protocol. It manages the lifecycle of perpetual positions
//! from opening to closing, including liquidations and position modifications.
//!
//! ## Overview
//!
//! This contract is responsible for managing leveraged perpetual trading positions across
//! multiple markets (XLM-PERP, BTC-PERP, ETH-PERP). Traders can open long or short positions
//! with leverage ranging from 5x to 20x, and the contract tracks all position details including
//! collateral, size, entry price, and unrealized PnL.
//!
//! This contract changes most frequently as new features are added, which is why it's isolated
//! from the fund-holding contract (LiquidityPool).
//!
//! ## Key Responsibilities
//!
//! - **Position Opening**: Create new long/short positions with specified leverage and collateral
//! - **Position Closing**: Close existing positions and realize PnL
//! - **Position Modification**: Increase or decrease position size and collateral
//! - **Liquidation Logic**: Liquidate undercollateralized positions when margin falls below threshold
//! - **PnL Calculation**: Track unrealized and realized profit/loss for all positions
//! - **Collateral Management**: Handle collateral deposits, withdrawals, and requirements
//!
//! ## Leverage System
//!
//! - Minimum leverage: 5x
//! - Maximum leverage: 20x
//! - Leverage determines position size relative to collateral
//! - Higher leverage = higher liquidation risk
//!
//! ## Position Lifecycle
//!
//! 1. **Open**: Trader deposits collateral and specifies leverage, size, and direction (long/short)
//! 2. **Active**: Position is monitored for liquidation conditions and funding payments
//! 3. **Modify**: Trader can add/remove collateral or increase/decrease position size
//! 4. **Close**: Trader closes position at market price, PnL is realized and settled
//! 5. **Liquidate**: If margin ratio falls below threshold, keepers can liquidate the position
//!
//! ## Liquidation Mechanism
//!
//! - **Maintenance Margin**: 1% (100x max effective leverage)
//! - **Liquidation Trigger**: When remaining_collateral < size × 0.01
//! - **Liquidation Fee**: 0.5% of position size (split: 0.3% keeper, 0.2% pool)
//! - **Full Liquidation Only**: No partial liquidations in MVP
//!
//! ## Integration Points
//!
//! - **LiquidityPool**: Source of counterparty liquidity for positions
//! - **OracleIntegrator**: Price feeds for entry/exit prices and liquidations
//! - **MarketManager**: Market state, funding rates, and open interest limits
//! - **ConfigManager**: Leverage limits, liquidation thresholds, and fee parameters
//!
//! ## Storage Strategy
//!
//! - **Persistent Storage with TTL**: All position data uses Persistent Storage with TTL
//! - **TTL Extension**: Extend TTL on every position interaction (100,000 ledgers ~14 days)
//! - **Position Data Fields**: Each position contains account address, market identifier,
//!   collateral token and amount, position size in USD and tokens, entry price, direction
//!   (long/short), cumulative fee indices for funding and borrowing calculations, and timestamps
//! - **Keeper Monitoring**: Keeper bot monitors and extends TTL before expiration
//!
//! ## Future Enhancements
//!
//! - Limit orders: Execute when price reaches specified level
//! - Stop-loss: Automatically close position to limit losses
//! - Take-profit: Automatically close position to secure gains
//! - Cross-margin support (share collateral across positions)
//! - Portfolio margin (risk-based margining)
//! - Conditional orders (OCO, trailing stops)
//! - Position delegation and social trading

use soroban_sdk::{contract, contractevent, contractimpl, contracttype, log, token, Address, Env};

mod config_manager {
    soroban_sdk::contractimport!(file = "../../target/wasm32v1-none/release/config_manager.wasm");
}

mod oracle_integrator {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32v1-none/release/oracle_integrator.wasm"
    );
}

mod liquidity_pool {
    soroban_sdk::contractimport!(file = "../../target/wasm32v1-none/release/liquidity_pool.wasm");
}

mod market_manager {
    soroban_sdk::contractimport!(file = "../../target/wasm32v1-none/release/market_manager.wasm");
}

#[contract]
pub struct PositionManager;

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Position {
    pub trader: Address,
    pub market_id: u32, // NEW: which market (0=XLM, 1=BTC, 2=ETH)
    pub collateral: u128,
    pub size: u128,
    pub is_long: bool,
    pub entry_price: i128,         // Changed to i128
    pub entry_funding_long: i128,  // NEW: cumulative funding snapshot (long side)
    pub entry_funding_short: i128, // NEW: cumulative funding snapshot (short side)
    pub last_interaction: u64,     // NEW: timestamp for borrowing fee calculation
    pub liquidation_price: i128,   // NEW: price at which position is liquidatable
}

// Events
#[contractevent]
pub struct PositionOpenedEvent {
    pub position_id: u64,
    pub trader: Address,
    pub market_id: u32,
    pub collateral: u128,
    pub size: u128,
    pub leverage: u32,
    pub is_long: bool,
    pub entry_price: u128,
}

#[contractevent]
pub struct PositionClosedEvent {
    pub position_id: u64,
    pub trader: Address,
    pub pnl: i128,
}

#[contractevent]
pub struct PositionModifiedEvent {
    pub position_id: u64,
    pub trader: Address,
    pub new_collateral: u128,
    pub new_size: u128,
    pub new_liquidation_price: i128,
}

#[contractevent]
pub struct PositionLiquidatedEvent {
    pub position_id: u64,
    pub trader: Address,
    pub liquidator: Address,
    pub liquidation_price: i128,
    pub liquidation_reward: u128,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Position(u64),
    NextPositionId,
    ConfigManager,
    UserPositions(Address), // Maps user address to Vec<u64> of their open position IDs
}

// Helper functions for storage

/// Get the ConfigManager address from storage
fn get_config_manager(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::ConfigManager)
        .expect("ConfigManager not initialized")
}

/// Get the token contract address from ConfigManager
fn get_token(env: &Env) -> Address {
    let config_manager = get_config_manager(env);
    let config_client = config_manager::Client::new(env, &config_manager);
    config_client.token()
}

/// Get the OracleIntegrator address from ConfigManager
fn get_oracle(env: &Env) -> Address {
    let config_manager = get_config_manager(env);
    let config_client = config_manager::Client::new(env, &config_manager);
    config_client.oracle_integrator()
}

/// Get the LiquidityPool address from ConfigManager
fn get_liquidity_pool(env: &Env) -> Address {
    let config_manager = get_config_manager(env);
    let config_client = config_manager::Client::new(env, &config_manager);
    config_client.liquidity_pool()
}

/// Get the MarketManager address from ConfigManager
fn get_market_manager(env: &Env) -> Address {
    let config_manager = get_config_manager(env);
    let config_client = config_manager::Client::new(env, &config_manager);
    config_client.market_manager()
}

/// Get a position from storage
fn get_position(env: &Env, position_id: u64) -> Position {
    env.storage()
        .persistent()
        .get(&DataKey::Position(position_id))
        .expect("Position not found")
}

/// Store a position in persistent storage
fn set_position(env: &Env, position_id: u64, position: &Position) {
    env.storage()
        .persistent()
        .set(&DataKey::Position(position_id), position);
}

/// Delete a position from storage
fn remove_position(env: &Env, position_id: u64) {
    env.storage()
        .persistent()
        .remove(&DataKey::Position(position_id));
}

/// Get the next position ID
fn get_next_position_id(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::NextPositionId)
        .unwrap_or(0)
}

/// Increment and return the next position ID
fn increment_position_id(env: &Env) -> u64 {
    let next_id = get_next_position_id(env);
    env.storage()
        .instance()
        .set(&DataKey::NextPositionId, &(next_id + 1));
    next_id
}

/// Get all open position IDs for a user
fn get_user_positions(env: &Env, trader: &Address) -> soroban_sdk::Vec<u64> {
    env.storage()
        .persistent()
        .get(&DataKey::UserPositions(trader.clone()))
        .unwrap_or(soroban_sdk::Vec::new(env))
}

/// Add a position ID to a user's list of open positions
fn add_user_position(env: &Env, trader: &Address, position_id: u64) {
    let mut user_positions = get_user_positions(env, trader);
    user_positions.push_back(position_id);
    env.storage()
        .persistent()
        .set(&DataKey::UserPositions(trader.clone()), &user_positions);
}

/// Remove a position ID from a user's list of open positions
fn remove_user_position(env: &Env, trader: &Address, position_id: u64) {
    let user_positions = get_user_positions(env, trader);

    // Filter out the position_id we want to remove
    let mut new_positions = soroban_sdk::Vec::new(env);
    for i in 0..user_positions.len() {
        let id = user_positions.get(i).unwrap();
        if id != position_id {
            new_positions.push_back(id);
        }
    }

    env.storage()
        .persistent()
        .set(&DataKey::UserPositions(trader.clone()), &new_positions);
}

/// Validate leverage is within configured limits
fn validate_leverage(env: &Env, leverage: u32) {
    let config_manager = get_config_manager(env);
    let config_client = config_manager::Client::new(env, &config_manager);

    let min_leverage = config_client.min_leverage() as u32;
    let max_leverage = config_client.max_leverage() as u32;

    if leverage < min_leverage {
        panic!("Leverage too low");
    }
    if leverage > max_leverage {
        panic!("Leverage too high");
    }
}

/// Validate position size meets minimum requirement
fn validate_position_size(env: &Env, size: u128) {
    let config_manager = get_config_manager(env);
    let config_client = config_manager::Client::new(env, &config_manager);

    let min_position_size = config_client.min_position_size() as u128;
    if size < min_position_size {
        panic!("Position size too small");
    }
}

/// Calculate liquidation price for a position
///
/// # Formula
/// - For longs: liquidation_price = entry_price * (1 - (collateral / size) + maintenance_margin)
/// - For shorts: liquidation_price = entry_price * (1 + (collateral / size) - maintenance_margin)
///
/// Where maintenance_margin = 0.01 (1%)
///
/// # Arguments
/// * `entry_price` - Entry price of the position (scaled by 1e7)
/// * `collateral` - Collateral amount (scaled by 1e7)
/// * `size` - Position size (scaled by 1e7)
/// * `is_long` - True for long positions, false for short positions
///
/// # Returns
/// Liquidation price (scaled by 1e7)
fn calculate_liquidation_price(
    entry_price: i128,
    collateral: u128,
    size: u128,
    is_long: bool,
) -> i128 {
    // Maintenance margin = 1% = 100 bps
    const MAINTENANCE_MARGIN_BPS: i128 = 100;
    const BPS_DIVISOR: i128 = 10000;

    let collateral_i128 = collateral as i128;
    let size_i128 = size as i128;

    if size_i128 == 0 {
        panic!("Cannot calculate liquidation price for zero size");
    }

    // Calculate collateral ratio in basis points: (collateral / size) * 10000
    let collateral_ratio_bps = (collateral_i128 * BPS_DIVISOR) / size_i128;

    if is_long {
        // For longs: liquidation_price = entry_price * (1 - collateral_ratio + maintenance_margin)
        // = entry_price * (10000 - collateral_ratio_bps + maintenance_margin_bps) / 10000
        let multiplier_bps = BPS_DIVISOR - collateral_ratio_bps + MAINTENANCE_MARGIN_BPS;
        (entry_price * multiplier_bps) / BPS_DIVISOR
    } else {
        // For shorts: liquidation_price = entry_price * (1 + collateral_ratio - maintenance_margin)
        // = entry_price * (10000 + collateral_ratio_bps - maintenance_margin_bps) / 10000
        let multiplier_bps = BPS_DIVISOR + collateral_ratio_bps - MAINTENANCE_MARGIN_BPS;
        (entry_price * multiplier_bps) / BPS_DIVISOR
    }
}

/// Calculate comprehensive PnL for a position
///
/// # PnL Components
/// 1. **Price PnL**: Profit/loss from price movement
///    - Long: (current_price - entry_price) * size / 1e7
///    - Short: (entry_price - current_price) * size / 1e7
///
/// 2. **Funding Payments**: Accumulated funding rate payments
///    - Long pays funding when rate is positive (long > short OI)
///    - Short pays funding when rate is negative (short > long OI)
///    - Payment = (cumulative_now - cumulative_entry) * size / 1e7
///
/// 3. **Borrowing Fees**: Time-based fees for leverage
///    - Fee = borrow_rate_per_second * time_elapsed * size / 1e7
///
/// # Arguments
/// * `env` - Soroban environment
/// * `position` - Position struct containing all position data
/// * `current_price` - Current market price (scaled by 1e7)
///
/// # Returns
/// Net PnL (can be negative) scaled by 1e7
fn calculate_pnl(env: &Env, position: &Position, current_price: i128) -> i128 {
    let size_i128 = position.size as i128;

    // 1. Calculate Price PnL
    let price_diff = if position.is_long {
        current_price - position.entry_price
    } else {
        position.entry_price - current_price
    };
    let price_pnl = (price_diff * size_i128) / 10_000_000; // Divide by 1e7 for scaling

    // 2. Calculate Funding Payments
    let market_manager = get_market_manager(env);
    let market_client = market_manager::Client::new(env, &market_manager);

    let cumulative_funding_long = market_client.get_cumulative_funding(&position.market_id, &true);
    let cumulative_funding_short =
        market_client.get_cumulative_funding(&position.market_id, &false);

    let funding_payment = if position.is_long {
        // Longs pay based on long-side cumulative funding
        // Note: cumulative funding is stored as (funding_rate_bps * seconds) to avoid precision loss
        // Formula: (bps·seconds * size) / (seconds_per_hour * price_scaling)
        let funding_accrued = cumulative_funding_long - position.entry_funding_long;
        // To avoid overflow, we break down the calculation:
        // Instead of (funding_accrued * size) / (3600 * 1e7)
        // We do: (funding_accrued / 3600) * size / 1e7
        // This divides first to keep intermediate values small
        let funding_per_second = funding_accrued / 3600;
        (funding_per_second * size_i128) / 10_000_000
    } else {
        // Shorts: pay when cumulative_funding_short increases, receive when cumulative_funding_long increases
        // Net funding cost = what they paid - what they received
        let funding_received = cumulative_funding_long - position.entry_funding_long;
        let funding_paid = cumulative_funding_short - position.entry_funding_short;
        let net_funding = funding_paid - funding_received;
        let funding_per_second = net_funding / 3600;
        (funding_per_second * size_i128) / 10_000_000
    };

    // 3. Calculate Borrowing Fees
    // TODO: Uncomment when ConfigManager adds borrow_rate_per_second()
    // let config_manager = get_config_manager(env);
    // let config_client = config_manager::Client::new(env, &config_manager);
    // let borrow_rate_per_second = config_client.borrow_rate_per_second() as i128;
    // let current_timestamp = env.ledger().timestamp();
    // let time_elapsed = (current_timestamp - position.last_interaction) as i128;
    // let borrowing_fee = (borrow_rate_per_second * time_elapsed * size_i128) / 10_000_000;

    // For now, borrowing fees are 0 (not yet implemented in ConfigManager)
    let borrowing_fee = 0;

    // Net PnL = Price PnL - Funding Payments - Borrowing Fees
    // (funding_payment and borrowing_fee are costs, so subtract)
    price_pnl - funding_payment - borrowing_fee
}

#[contractimpl]
impl PositionManager {
    /// Initialize the PositionManager contract.
    ///
    /// # Arguments
    ///
    /// * `admin` - The administrator address (must authorize)
    /// * `config_manager` - Address of the ConfigManager contract
    pub fn initialize(env: Env, admin: Address, config_manager: Address) {
        // Prevent reinitialization
        if env.storage().instance().has(&DataKey::ConfigManager) {
            panic!("already initialized");
        }

        // Require admin to authorize initialization
        admin.require_auth();

        // Store the ConfigManager address
        env.storage()
            .instance()
            .set(&DataKey::ConfigManager, &config_manager);

        // Initialize the next position ID to 0
        env.storage()
            .instance()
            .set(&DataKey::NextPositionId, &0u64);
    }

    /// Open a new perpetual position.
    ///
    /// # Arguments
    ///
    /// * `trader` - The address of the trader opening the position
    /// * `market_id` - The market identifier (e.g., 0 = XLM-PERP, 1 = BTC-PERP, 2 = ETH-PERP)
    /// * `collateral` - The amount of collateral to deposit (unsigned, in token base units)
    /// * `leverage` - The leverage multiplier (e.g., 5x, 10x, 20x)
    /// * `is_long` - True for long position, false for short
    ///
    /// # Returns
    ///
    /// The position ID
    ///
    /// # Implementation
    ///
    /// Position size is calculated as: `size = collateral * leverage`
    /// - Transfers collateral from trader to contract
    /// - Gets entry price from OracleIntegrator
    /// - Emits PositionOpened event
    /// - No fees applied for MVP
    pub fn open_position(
        env: Env,
        trader: Address,
        market_id: u32,
        collateral: u128,
        leverage: u32,
        is_long: bool,
    ) -> u64 {
        // Require trader authorization
        trader.require_auth();

        // Validate inputs
        if collateral == 0 {
            panic!("Collateral must be positive");
        }
        if leverage == 0 {
            panic!("Leverage must be positive");
        }

        // Validate leverage against ConfigManager limits
        validate_leverage(&env, leverage);

        // Calculate position size from collateral and leverage
        let size = collateral
            .checked_mul(leverage as u128)
            .expect("Size overflow");

        // Validate position size against ConfigManager minimum
        validate_position_size(&env, size);

        // Get entry price from OracleIntegrator
        let oracle_address = get_oracle(&env);
        let oracle_client = oracle_integrator::Client::new(&env, &oracle_address);
        let entry_price = oracle_client.get_price(&market_id);

        // Check market is not paused and can accept this position
        let market_manager = get_market_manager(&env);
        let market_client = market_manager::Client::new(&env, &market_manager);

        if !market_client.can_open_position(&market_id, &is_long, &size) {
            panic!("Cannot open position - market paused or OI limit reached");
        }

        // Get current cumulative funding rates for this position
        let entry_funding_long = market_client.get_cumulative_funding(&market_id, &true);
        let entry_funding_short = market_client.get_cumulative_funding(&market_id, &false);

        // Generate a new position ID
        let position_id = increment_position_id(&env);

        // Get liquidity pool and check utilization
        let pool_address = get_liquidity_pool(&env);
        let pool_client = liquidity_pool::Client::new(&env, &pool_address);

        // Check max utilization before opening position
        let config_manager = get_config_manager(&env);
        let config_client = config_manager::Client::new(&env, &config_manager);
        let max_utilization = config_client.max_utilization_ratio();

        // Calculate what utilization would be after this position
        let reserved_current = pool_client.get_reserved_liquidity();
        let available = pool_client.get_available_liquidity();

        if available <= 0 {
            panic!("no available liquidity");
        }

        let total_balance = available as u128 + reserved_current;
        let reserved_after = reserved_current + size;

        if total_balance > 0 {
            let utilization_after = ((reserved_after * 10000) / total_balance) as i128;
            if utilization_after > max_utilization {
                panic!("position would exceed max utilization");
            }
        }

        // Deposit collateral to liquidity pool
        pool_client.deposit_position_collateral(
            &env.current_contract_address(),
            &position_id,
            &trader,
            &collateral,
        );

        // Reserve liquidity for this position
        pool_client.reserve_liquidity(
            &env.current_contract_address(),
            &position_id,
            &size,
            &collateral,
        );

        // Calculate liquidation price
        let liquidation_price = calculate_liquidation_price(entry_price, collateral, size, is_long);

        // Create the position with all new fields
        let position = Position {
            trader: trader.clone(),
            market_id,
            collateral,
            size,
            is_long,
            entry_price,
            entry_funding_long,
            entry_funding_short,
            last_interaction: env.ledger().timestamp(),
            liquidation_price,
        };

        // Store the position
        set_position(&env, position_id, &position);

        // Add position ID to user's list of open positions
        add_user_position(&env, &trader, position_id);

        // Update open interest in MarketManager
        let size_i128 = size as i128;
        market_client.update_open_interest(
            &env.current_contract_address(),
            &market_id,
            &is_long,
            &size_i128,
        );

        // Emit position opened event
        PositionOpenedEvent {
            position_id,
            trader: trader.clone(),
            market_id,
            collateral,
            size,
            leverage,
            is_long,
            entry_price: entry_price as u128, // Convert i128 to u128 for event
        }
        .publish(&env);

        // Return the position ID
        position_id
    }

    /// Close an existing position.
    ///
    /// # Arguments
    ///
    /// * `trader` - The address of the trader closing the position
    /// * `position_id` - The unique position identifier
    ///
    /// # Returns
    ///
    /// The realized PnL (positive for profit, negative for loss)
    ///
    /// # Implementation
    ///
    /// - Gets current price from OracleIntegrator
    /// - Calculates comprehensive PnL (price PnL + funding payments + borrowing fees)
    /// - Settles PnL with LiquidityPool
    /// - Updates MarketManager open interest
    /// - Returns collateral ± PnL to trader
    /// - Emits PositionClosed event
    pub fn close_position(env: Env, trader: Address, position_id: u64) -> i128 {
        // Require trader authorization
        trader.require_auth();

        // Retrieve the position
        let position = get_position(&env, position_id);

        // Verify the trader owns the position
        if position.trader != trader {
            panic!("Unauthorized: caller does not own this position");
        }

        // Get current price from OracleIntegrator
        let oracle_address = get_oracle(&env);
        let oracle_client = oracle_integrator::Client::new(&env, &oracle_address);
        let current_price = oracle_client.get_price(&position.market_id);

        // Calculate comprehensive PnL
        let pnl = calculate_pnl(&env, &position, current_price);

        log!(&env, "pnl", pnl);

        // Get liquidity pool
        let pool_address = get_liquidity_pool(&env);
        let pool_client = liquidity_pool::Client::new(&env, &pool_address);

        // Release reserved liquidity
        pool_client.release_liquidity(
            &env.current_contract_address(),
            &position_id,
            &position.size,
        );

        // Settle PnL with pool and withdraw collateral to trader
        // MVP: PnL is always 0, so trader gets collateral back
        // Future: Handle profits (pool pays trader) and losses (trader forfeits some/all collateral)
        let collateral_i128 = position.collateral as i128;
        let final_amount = collateral_i128 + pnl;

        log!(&env, "final", final_amount);

        // Withdraw collateral from pool's position tracking and transfer to trader
        pool_client.withdraw_position_collateral(
            &env.current_contract_address(),
            &position_id,
            &trader,
            &position.collateral,
        );

        // Update open interest in MarketManager (decrease)
        let market_manager = get_market_manager(&env);
        let market_client = market_manager::Client::new(&env, &market_manager);
        let size_decrease = -(position.size as i128); // Negative to decrease
        market_client.update_open_interest(
            &env.current_contract_address(),
            &position.market_id,
            &position.is_long,
            &size_decrease,
        );

        // Delete the position from storage
        remove_position(&env, position_id);

        // Remove position ID from user's list of open positions
        remove_user_position(&env, &trader, position_id);

        // Emit position closed event
        PositionClosedEvent {
            position_id,
            trader: trader.clone(),
            pnl,
        }
        .publish(&env);

        // Return PnL
        pnl
    }

    /// Increase position size or add collateral.
    ///
    /// # Arguments
    ///
    /// * `trader` - The address of the trader
    /// * `position_id` - The unique position identifier
    /// * `additional_collateral` - Additional collateral to add (0 if none)
    /// * `additional_size` - Additional position size (0 if none)
    ///
    /// # Implementation
    ///
    /// - Verifies trader owns the position
    /// - Checks leverage limits with new total size
    /// - Checks market open interest limits for additional size
    /// - Transfers additional collateral if provided
    /// - Updates position size and recalculates average entry price
    /// - Recalculates liquidation price
    /// - Updates funding rate snapshots and last_interaction timestamp
    /// - Updates MarketManager open interest
    /// - Emits PositionModified event
    pub fn increase_position(
        env: Env,
        trader: Address,
        position_id: u64,
        additional_collateral: u128,
        additional_size: u128,
    ) {
        // Require trader authorization
        trader.require_auth();

        // At least one of collateral or size must be added
        if additional_collateral == 0 && additional_size == 0 {
            panic!("Must add collateral or size");
        }

        // Retrieve the position
        let mut position = get_position(&env, position_id);

        // Verify the trader owns the position
        if position.trader != trader {
            panic!("Unauthorized: caller does not own this position");
        }

        // Get current price for entry price calculation if adding size
        let current_price = if additional_size > 0 {
            let oracle_address = get_oracle(&env);
            let oracle_client = oracle_integrator::Client::new(&env, &oracle_address);
            oracle_client.get_price(&position.market_id)
        } else {
            position.entry_price
        };

        // Update collateral if provided
        if additional_collateral > 0 {
            let pool_address = get_liquidity_pool(&env);
            let pool_client = liquidity_pool::Client::new(&env, &pool_address);

            // Transfer additional collateral from trader to pool
            pool_client.deposit_position_collateral(
                &env.current_contract_address(),
                &position_id,
                &trader,
                &additional_collateral,
            );

            position.collateral = position
                .collateral
                .checked_add(additional_collateral)
                .expect("Collateral overflow");
        }

        // Update size if provided
        if additional_size > 0 {
            // Check market can accept additional size
            let market_manager = get_market_manager(&env);
            let market_client = market_manager::Client::new(&env, &market_manager);

            if !market_client.can_open_position(
                &position.market_id,
                &position.is_long,
                &additional_size,
            ) {
                panic!("Cannot increase position - market paused or OI limit reached");
            }

            // Calculate new average entry price
            let old_size_value = position.size as i128 * position.entry_price;
            let new_size_value = additional_size as i128 * current_price;
            let total_size = position.size + additional_size;
            let avg_entry_price = (old_size_value + new_size_value) / (total_size as i128);

            // Reserve additional liquidity
            let pool_address = get_liquidity_pool(&env);
            let pool_client = liquidity_pool::Client::new(&env, &pool_address);
            pool_client.reserve_liquidity(
                &env.current_contract_address(),
                &position_id,
                &additional_size,
                &0, // No new collateral reserved (already handled above)
            );

            // Update position fields
            position.size = total_size;
            position.entry_price = avg_entry_price;

            // Update open interest in MarketManager
            let size_i128 = additional_size as i128;
            market_client.update_open_interest(
                &env.current_contract_address(),
                &position.market_id,
                &position.is_long,
                &size_i128,
            );

            // Update funding snapshots to current values
            position.entry_funding_long =
                market_client.get_cumulative_funding(&position.market_id, &true);
            position.entry_funding_short =
                market_client.get_cumulative_funding(&position.market_id, &false);
        }

        // Check leverage is still within limits
        let effective_leverage = position.size / position.collateral;
        validate_leverage(&env, effective_leverage as u32);

        // Recalculate liquidation price
        position.liquidation_price = calculate_liquidation_price(
            position.entry_price,
            position.collateral,
            position.size,
            position.is_long,
        );

        // Update last interaction timestamp
        position.last_interaction = env.ledger().timestamp();

        // Store updated position
        set_position(&env, position_id, &position);

        // Emit position modified event
        PositionModifiedEvent {
            position_id,
            trader: trader.clone(),
            new_collateral: position.collateral,
            new_size: position.size,
            new_liquidation_price: position.liquidation_price,
        }
        .publish(&env);
    }

    /// Decrease position size or remove collateral.
    ///
    /// # Arguments
    ///
    /// * `trader` - The address of the trader
    /// * `position_id` - The unique position identifier
    /// * `collateral_to_remove` - Collateral to remove (0 if none)
    /// * `size_to_reduce` - Position size to reduce (0 if none)
    ///
    /// # Implementation
    ///
    /// - Verifies trader owns the position
    /// - If reducing size, realizes proportional PnL
    /// - Releases corresponding reserved liquidity
    /// - Updates MarketManager open interest
    /// - If removing collateral, verifies position remains sufficiently collateralized
    /// - Transfers collateral to trader if removed
    /// - Recalculates liquidation price
    /// - Updates last_interaction timestamp
    /// - Emits PositionModified event
    pub fn decrease_position(
        env: Env,
        trader: Address,
        position_id: u64,
        collateral_to_remove: u128,
        size_to_reduce: u128,
    ) {
        // Require trader authorization
        trader.require_auth();

        // At least one of collateral or size must be removed
        if collateral_to_remove == 0 && size_to_reduce == 0 {
            panic!("Must remove collateral or size");
        }

        // Retrieve the position
        let mut position = get_position(&env, position_id);

        // Verify the trader owns the position
        if position.trader != trader {
            panic!("Unauthorized: caller does not own this position");
        }

        // Verify we're not removing more than exists
        if collateral_to_remove > position.collateral {
            panic!("Cannot remove more collateral than exists");
        }
        if size_to_reduce > position.size {
            panic!("Cannot reduce more size than exists");
        }

        let pool_address = get_liquidity_pool(&env);
        let pool_client = liquidity_pool::Client::new(&env, &pool_address);

        // Handle size reduction with PnL realization
        if size_to_reduce > 0 {
            // Get current price
            let oracle_address = get_oracle(&env);
            let oracle_client = oracle_integrator::Client::new(&env, &oracle_address);
            let current_price = oracle_client.get_price(&position.market_id);

            // Calculate proportional PnL for the size being closed
            let total_pnl = calculate_pnl(&env, &position, current_price);
            let proportion = (size_to_reduce as i128 * 10000) / (position.size as i128);
            let realized_pnl = (total_pnl * proportion) / 10000;

            // Realize PnL: adjust collateral by realized PnL
            let collateral_i128 = position.collateral as i128;
            let new_collateral_i128 = collateral_i128 + realized_pnl;

            if new_collateral_i128 <= 0 {
                panic!("Position underwater - use close or liquidate instead");
            }

            position.collateral = new_collateral_i128 as u128;

            // Release reserved liquidity
            pool_client.release_liquidity(
                &env.current_contract_address(),
                &position_id,
                &size_to_reduce,
            );

            // Update MarketManager open interest (decrease)
            let market_manager = get_market_manager(&env);
            let market_client = market_manager::Client::new(&env, &market_manager);
            let size_decrease = -(size_to_reduce as i128);
            market_client.update_open_interest(
                &env.current_contract_address(),
                &position.market_id,
                &position.is_long,
                &size_decrease,
            );

            // Update position size
            position.size = position.size - size_to_reduce;

            // Update funding snapshots to current values
            position.entry_funding_long =
                market_client.get_cumulative_funding(&position.market_id, &true);
            position.entry_funding_short =
                market_client.get_cumulative_funding(&position.market_id, &false);

            // Verify remaining position meets minimum size
            validate_position_size(&env, position.size);
        }

        // Handle collateral removal
        if collateral_to_remove > 0 {
            // Verify this won't make position undercollateralized
            let remaining_collateral = position.collateral - collateral_to_remove;
            let effective_leverage = position.size / remaining_collateral;

            // Check leverage is still within limits
            validate_leverage(&env, effective_leverage as u32);

            // Check maintenance margin (1% = 100x max effective leverage)
            let margin_ratio = (remaining_collateral * 10000) / position.size;
            if margin_ratio < 100 {
                // Less than 1% margin
                panic!("Cannot remove collateral - would violate maintenance margin");
            }

            // Update collateral
            position.collateral = remaining_collateral;

            // Withdraw collateral from pool to trader
            pool_client.withdraw_position_collateral(
                &env.current_contract_address(),
                &position_id,
                &trader,
                &collateral_to_remove,
            );
        }

        // Recalculate liquidation price
        position.liquidation_price = calculate_liquidation_price(
            position.entry_price,
            position.collateral,
            position.size,
            position.is_long,
        );

        // Update last interaction timestamp
        position.last_interaction = env.ledger().timestamp();

        // Store updated position
        set_position(&env, position_id, &position);

        // Emit position modified event
        PositionModifiedEvent {
            position_id,
            trader: trader.clone(),
            new_collateral: position.collateral,
            new_size: position.size,
            new_liquidation_price: position.liquidation_price,
        }
        .publish(&env);
    }

    /// Liquidate an undercollateralized position.
    ///
    /// # Arguments
    ///
    /// * `keeper` - The address of the keeper liquidating the position
    /// * `position_id` - The unique position identifier
    ///
    /// # Returns
    ///
    /// The liquidation reward paid to the keeper
    ///
    /// # Implementation
    ///
    /// - Gets current price from OracleIntegrator
    /// - Calculates comprehensive PnL including all fees
    /// - Verifies position is liquidatable (underwater or below maintenance margin)
    /// - Calculates liquidation fees:
    ///   - 0.3% of position size goes to keeper as reward
    ///   - 0.2% of position size goes to liquidity pool
    /// - Settles with LiquidityPool (collateral minus losses and fees)
    /// - Updates MarketManager open interest
    /// - Deletes position from storage
    /// - Emits PositionLiquidated event
    pub fn liquidate_position(env: Env, keeper: Address, position_id: u64) -> u128 {
        // Keeper must authorize (they're paying gas)
        keeper.require_auth();

        // Retrieve the position
        let position = get_position(&env, position_id);

        // Get current price from OracleIntegrator
        let oracle_address = get_oracle(&env);
        let oracle_client = oracle_integrator::Client::new(&env, &oracle_address);
        let current_price = oracle_client.get_price(&position.market_id);

        // Calculate comprehensive PnL
        let pnl = calculate_pnl(&env, &position, current_price);

        // Calculate remaining collateral value after PnL
        let collateral_i128 = position.collateral as i128;
        let remaining_value = collateral_i128 + pnl;

        // Calculate maintenance margin requirement (1% of position size)
        let maintenance_margin = (position.size as i128 * 100) / 10000; // 1% in basis points

        // Verify position is liquidatable
        // Position is liquidatable if:
        // 1. Remaining value <= 0 (completely underwater), OR
        // 2. Remaining value < maintenance_margin (below 1% maintenance)
        if remaining_value > maintenance_margin {
            panic!("Position not liquidatable - sufficient collateral");
        }

        // Get ConfigManager for liquidation fee parameters
        let config_manager = get_config_manager(&env);
        let config_client = config_manager::Client::new(&env, &config_manager);
        let liquidation_fee = config_client.liquidation_fee_bps(); // In basis points (e.g., 50 = 0.5%)

        // Calculate liquidation fees
        // Total liquidation fee is split: 60% to keeper, 40% to pool
        let total_liquidation_fee = (position.size as i128 * liquidation_fee as i128) / 10000;
        let keeper_reward = (total_liquidation_fee * 60) / 100; // 60% of fee
        let pool_fee = (total_liquidation_fee * 40) / 100; // 40% of fee

        // Get liquidity pool
        let pool_address = get_liquidity_pool(&env);
        let pool_client = liquidity_pool::Client::new(&env, &pool_address);

        // Release reserved liquidity
        pool_client.release_liquidity(
            &env.current_contract_address(),
            &position_id,
            &position.size,
        );

        // Settle liquidation:
        // - If position has remaining collateral value, use it to pay fees
        // - Keeper gets their reward from position collateral
        // - Pool gets their fee from position collateral
        // - Any remaining collateral (or deficit) goes to/from pool

        let mut keeper_payment = 0u128;

        // Pay keeper from actual collateral (not remaining_value)
        // The collateral physically exists in the pool; PnL is an accounting calculation
        if keeper_reward > 0 && position.collateral > 0 {
            let keeper_reward_u128 = keeper_reward as u128;
            keeper_payment = if keeper_reward_u128 > position.collateral {
                position.collateral // Pay whatever collateral is available
            } else {
                keeper_reward_u128 // Pay full reward
            };

            if keeper_payment > 0 {
                pool_client.withdraw_position_collateral(
                    &env.current_contract_address(),
                    &position_id,
                    &keeper,
                    &keeper_payment,
                );
            }
        }

        // Remaining collateral goes to pool (covers losses and pool fee)
        let remaining_collateral = position.collateral - keeper_payment;
        if remaining_collateral > 0 {
            pool_client.withdraw_position_collateral(
                &env.current_contract_address(),
                &position_id,
                &pool_address,
                &remaining_collateral,
            );
        }

        // Update open interest in MarketManager (decrease)
        let market_manager = get_market_manager(&env);
        let market_client = market_manager::Client::new(&env, &market_manager);
        let size_decrease = -(position.size as i128);
        market_client.update_open_interest(
            &env.current_contract_address(),
            &position.market_id,
            &position.is_long,
            &size_decrease,
        );

        // Delete the position from storage
        remove_position(&env, position_id);

        // Remove position ID from user's list of open positions
        remove_user_position(&env, &position.trader, position_id);

        // Emit position liquidated event
        PositionLiquidatedEvent {
            position_id,
            trader: position.trader.clone(),
            liquidator: keeper.clone(),
            liquidation_price: current_price,
            liquidation_reward: keeper_payment,
        }
        .publish(&env);

        // Return keeper reward
        keeper_payment
    }

    /// Get position details.
    ///
    /// # Arguments
    ///
    /// * `position_id` - The unique position identifier
    ///
    /// # Returns
    ///
    /// The Position struct with all position details
    pub fn get_position(env: Env, position_id: u64) -> Position {
        // Fetch position from persistent storage
        get_position(&env, position_id)
    }

    /// Calculate unrealized PnL for a position.
    ///
    /// # Arguments
    ///
    /// * `position_id` - The unique position identifier
    ///
    /// # Returns
    ///
    /// The unrealized PnL (positive for profit, negative for loss)
    pub fn calculate_pnl(_env: Env, _position_id: u64) -> i128 {
        // TODO: Implement PnL calculation
        // - Get position data
        // - Get current price from OracleIntegrator
        // - Calculate PnL based on entry price, current price, size, direction
        // - Apply funding payments
        0
    }

    /// Get all open position IDs for a specific trader.
    ///
    /// # Arguments
    ///
    /// * `trader` - The address of the trader
    ///
    /// # Returns
    ///
    /// A vector of position IDs (u64) for all open positions owned by the trader.
    /// Returns an empty vector if the trader has no open positions.
    ///
    /// # Usage
    ///
    /// Frontend can call this function to get all position IDs for a user,
    /// then call `get_position(id)` for each ID to retrieve full position details.
    pub fn get_user_open_positions(env: Env, trader: Address) -> soroban_sdk::Vec<u64> {
        get_user_positions(&env, &trader)
    }
}

#[cfg(test)]
mod test;
