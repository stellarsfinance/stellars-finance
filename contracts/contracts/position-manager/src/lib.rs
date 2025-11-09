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

use soroban_sdk::{contract, contractevent, contractimpl, contracttype, token, Address, Env};

mod config_manager {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32v1-none/release/config_manager.wasm"
    );
}

mod oracle_integrator {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32v1-none/release/oracle_integrator.wasm"
    );
}

#[contract]
pub struct PositionManager;

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Position {
    pub trader: Address,
    pub collateral: u128,
    pub size: u128,
    pub is_long: bool,
    pub entry_price: u128,
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

#[contractimpl]
impl PositionManager {
    /// Initialize the PositionManager contract.
    ///
    /// # Arguments
    ///
    /// * `config_manager` - Address of the ConfigManager contract
    pub fn initialize(env: Env, config_manager: Address) {
        // Store the ConfigManager address
        env.storage()
            .instance()
            .set(&DataKey::ConfigManager, &config_manager);

        // Initialize the next position ID to 0
        env.storage().instance().set(&DataKey::NextPositionId, &0u64);
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

        // Get the token contract and transfer collateral from trader to this contract
        let token_address = get_token(&env);
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(
            &trader,
            &env.current_contract_address(),
            &(collateral as i128),
        );

        // Get entry price from OracleIntegrator
        let oracle_address = get_oracle(&env);
        let oracle_client = oracle_integrator::Client::new(&env, &oracle_address);
        let entry_price = oracle_client.get_price(&market_id) as u128;

        // Generate a new position ID
        let position_id = increment_position_id(&env);

        // Create the position
        let position = Position {
            trader: trader.clone(),
            collateral,
            size,
            is_long,
            entry_price,
        };

        // Store the position
        set_position(&env, position_id, &position);

        // Add position ID to user's list of open positions
        add_user_position(&env, &trader, position_id);

        // Emit position opened event
        PositionOpenedEvent {
            position_id,
            trader: trader.clone(),
            market_id,
            collateral,
            size,
            leverage,
            is_long,
            entry_price,
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
    /// # MVP Implementation
    ///
    /// For MVP:
    /// - Returns collateral back to trader (no PnL since price doesn't change)
    /// - PnL is always 0
    /// - No fees applied
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

        // Get the token contract
        let token_address = get_token(&env);
        let token_client = token::Client::new(&env, &token_address);

        // Transfer collateral back to trader (convert u128 to i128)
        token_client.transfer(
            &env.current_contract_address(),
            &trader,
            &(position.collateral as i128),
        );

        // Delete the position from storage
        remove_position(&env, position_id);

        // Remove position ID from user's list of open positions
        remove_user_position(&env, &trader, position_id);

        // MVP: PnL is always 0 (no price changes)
        let pnl: i128 = 0;

        // Emit position closed event
        PositionClosedEvent {
            position_id,
            trader: trader.clone(),
            pnl,
        }
        .publish(&env);

        // Return PnL
        // In production, would:
        // - Get current price from OracleIntegrator
        // - Calculate PnL: (exit_price - entry_price) * size * direction
        // - Apply funding payments
        // - Settle with LiquidityPool
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
    pub fn increase_position(
        _env: Env,
        _trader: Address,
        _position_id: u64,
        _additional_collateral: i128,
        _additional_size: i128,
    ) {
        // TODO: Implement position increase logic
        // - Verify trader owns the position
        // - Check leverage limits with additional size
        // - Check market open interest limits
        // - Transfer additional collateral if any
        // - Update position size and average entry price
        // - Update liquidation price
        // - Emit position modified event
    }

    /// Decrease position size or remove collateral.
    ///
    /// # Arguments
    ///
    /// * `trader` - The address of the trader
    /// * `position_id` - The unique position identifier
    /// * `collateral_to_remove` - Collateral to remove (0 if none)
    /// * `size_to_reduce` - Position size to reduce (0 if none)
    pub fn decrease_position(
        _env: Env,
        _trader: Address,
        _position_id: u64,
        _collateral_to_remove: i128,
        _size_to_reduce: i128,
    ) {
        // TODO: Implement position decrease logic
        // - Verify trader owns the position
        // - Verify position remains above minimum margin ratio
        // - Realize partial PnL for size reduction
        // - Transfer collateral to trader if removed
        // - Update position size and liquidation price
        // - Emit position modified event
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
    pub fn liquidate_position(_env: Env, _keeper: Address, _position_id: u64) -> i128 {
        // TODO: Implement liquidation logic
        // - Get current price from OracleIntegrator
        // - Calculate current margin ratio
        // - Verify position is liquidatable (margin < threshold)
        // - Calculate liquidation fee for keeper
        // - Close position at current price
        // - Settle losses with LiquidityPool
        // - Pay liquidation reward to keeper
        // - Update market open interest in MarketManager
        // - Delete position from storage
        // - Remove position ID from user's list: remove_user_position(&env, &position.trader, position_id)
        // - Emit position liquidated event
        0
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
