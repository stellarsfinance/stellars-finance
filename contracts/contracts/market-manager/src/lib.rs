#![no_std]

//! # MarketManager Contract
//!
//! The MarketManager contract handles all market-level operations and state management for the
//! Stellars Finance perpetuals protocol. It manages multiple perpetual markets, tracks open
//! interest, calculates funding rates, and controls market availability.
//!
//! ## Overview
//!
//! This contract orchestrates the high-level operations of perpetual markets including XLM-PERP,
//! BTC-PERP, and ETH-PERP. It ensures market health by tracking open interest limits, calculating
//! and applying funding rates, and providing circuit breaker functionality to pause markets during
//! extreme conditions or maintenance.
//!
//! ## Key Responsibilities
//!
//! - **Market Creation**: Initialize new perpetual markets with specific parameters
//! - **Funding Rate Management**: Calculate and update funding rates every 60 seconds
//! - **Open Interest Tracking**: Monitor long/short open interest and enforce OI caps
//! - **Market State Control**: Pause/unpause markets for maintenance or risk management
//! - **Market Parameters**: Manage market-specific configuration (max OI, funding rate bounds)
//!
//!
//! ## Funding Rate Mechanism
//!
//! Funding rates are calculated and applied every 60 seconds to balance long/short positions:
//!
//! - **Positive funding**: Longs pay shorts (when longs > shorts)
//! - **Negative funding**: Shorts pay longs (when shorts > longs)
//! - **Funding formula**: funding_rate = base_rate × (imbalance_ratio)²
//! - **Rate bounds**: Capped at maximum funding rate to prevent extreme payments
//! - **Payment**: Trader-to-trader payment (LPs not involved)
//! - **Settlement**: Continuously accrued and settled on position close or liquidation
//!
//! ## Open Interest Management
//!
//! - **Long OI**: Total notional value of all long positions
//! - **Short OI**: Total notional value of all short positions
//! - **Max OI Cap**: Per-market limit to control risk exposure
//! - **Imbalance Limits**: May restrict opening positions on overweight side
//! - **Dynamic Caps**: OI limits may adjust based on pool TVL and market conditions
//!
//! ## Market Pausing
//!
//! Markets can be paused in several scenarios:
//! - Protocol upgrades or maintenance
//! - Oracle failures or manipulation concerns
//! - Extreme market volatility
//! - Risk management measures
//!
//! When paused:
//! - New positions cannot be opened
//! - Existing positions can still be closed
//! - Liquidations continue to function
//! - Funding rate updates are suspended
//!
//!
//! ## Integration Points
//!
//! - **PositionManager**: Consults market state before opening positions
//! - **OracleIntegrator**: Uses price data for funding rate calculations
//! - **LiquidityPool**: Considers pool TVL for dynamic OI limits
//! - **ConfigManager**: Retrieves market-specific parameters and limits
//!
//! ## Storage Strategy
//!
//! - **Instance Storage**: Stores market configuration and current state (funding rate, total long/short OI) per market
//!
//! ## Future Enhancements
//!
//! - Circuit breakers: Automatic market pausing when price deviation exceeds threshold,
//!   OI imbalance exceeds safety limits, unusual liquidation activity, or pool utilization critical
//! - Dynamic funding rate multipliers based on volatility
//! - Cross-market risk metrics and correlation tracking
//! - Automated market maker (AMM) style funding
//! - Time-weighted average price (TWAP) funding calculations
//! - Multi-asset collateral support per market

use soroban_sdk::{
    contract, contractevent, contractimpl, contracttype, symbol_short, Address, Env,
};

mod config_manager {
    soroban_sdk::contractimport!(file = "../../target/wasm32v1-none/release/config_manager.wasm");
}

// Data Structures

#[contracttype]
#[derive(Clone, Debug)]
pub struct Market {
    pub market_id: u32,
    pub max_open_interest: u128,
    pub long_open_interest: u128,
    pub short_open_interest: u128,
    pub funding_rate: i128, // bps per hour
    pub last_funding_update: u64,
    pub cumulative_funding_long: i128, // Total funding paid by longs
    pub cumulative_funding_short: i128, // Total funding paid by shorts
    pub is_paused: bool,
    pub base_funding_rate: i128, // Default: 100 (0.01% per hour)
    pub max_funding_rate: i128,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    ConfigManager,
    Admin,
    Market(u32),
    MarketCount,
    AuthorizedPositionManager,
}

// Events

#[contractevent]
pub struct MarketCreatedEvent {
    pub market_id: u32,
    pub max_oi: u128,
}

#[contractevent]
pub struct FundingRateUpdatedEvent {
    pub market_id: u32,
    pub funding_rate: i128,
    pub long_oi: u128,
    pub short_oi: u128,
}

#[contractevent]
pub struct OIUpdatedEvent {
    pub market_id: u32,
    pub long_oi: u128,
    pub short_oi: u128,
}

// Helper Functions

fn get_config_manager(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::ConfigManager)
        .expect("ConfigManager not initialized")
}

fn get_admin(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .expect("Admin not set")
}

fn require_admin(env: &Env, admin: &Address) {
    admin.require_auth();
    let stored_admin = get_admin(env);
    if admin != &stored_admin {
        panic!("unauthorized: not admin");
    }
}

fn get_market(env: &Env, market_id: u32) -> Market {
    env.storage()
        .instance()
        .get(&DataKey::Market(market_id))
        .expect("market not found")
}

fn set_market(env: &Env, market: &Market) {
    env.storage()
        .instance()
        .set(&DataKey::Market(market.market_id), market);
}

fn require_position_manager(env: &Env, caller: &Address) {
    caller.require_auth();
    if let Some(authorized) = env
        .storage()
        .instance()
        .get::<DataKey, Address>(&DataKey::AuthorizedPositionManager)
    {
        if caller != &authorized {
            panic!("unauthorized: not position manager");
        }
    } else {
        panic!("position manager not set");
    }
}

#[contract]
pub struct MarketManager;

#[contractimpl]
impl MarketManager {
    /// Initialize the MarketManager contract.
    ///
    /// # Arguments
    ///
    /// * `config_manager` - Address of the ConfigManager contract
    /// * `admin` - Address of the admin
    pub fn initialize(env: Env, config_manager: Address, admin: Address) {
        if env.storage().instance().has(&DataKey::ConfigManager) {
            panic!("already initialized");
        }

        env.storage()
            .instance()
            .set(&DataKey::ConfigManager, &config_manager);
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::MarketCount, &0u32);
    }

    /// Set the authorized PositionManager contract.
    ///
    /// # Arguments
    ///
    /// * `admin` - Address of the admin
    /// * `position_manager` - Address of the PositionManager contract
    pub fn set_position_manager(env: Env, admin: Address, position_manager: Address) {
        require_admin(&env, &admin);
        env.storage()
            .instance()
            .set(&DataKey::AuthorizedPositionManager, &position_manager);
    }

    /// Create a new perpetual market.
    ///
    /// # Arguments
    ///
    /// * `admin` - Address of the admin
    /// * `market_id` - Unique identifier for the market (e.g., 0 = XLM-PERP)
    /// * `max_open_interest` - Maximum total open interest allowed for this market
    /// * `max_funding_rate` - Maximum funding rate per hour (in basis points)
    pub fn create_market(
        env: Env,
        admin: Address,
        market_id: u32,
        max_open_interest: u128,
        max_funding_rate: i128,
    ) {
        require_admin(&env, &admin);

        // Verify market doesn't already exist
        if env.storage().instance().has(&DataKey::Market(market_id)) {
            panic!("market already exists");
        }

        // Create market with defaults
        let market = Market {
            market_id,
            max_open_interest,
            long_open_interest: 0,
            short_open_interest: 0,
            funding_rate: 0,
            last_funding_update: env.ledger().timestamp(),
            cumulative_funding_long: 0,
            cumulative_funding_short: 0,
            is_paused: false,
            base_funding_rate: 100, // 1% per hour = 100 basis points
            max_funding_rate,
        };

        set_market(&env, &market);

        // Increment market count
        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::MarketCount)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::MarketCount, &(count + 1));

        // Emit event
        MarketCreatedEvent {
            market_id,
            max_oi: max_open_interest,
        }
        .publish(&env);
    }

    /// Update the funding rate for a market.
    ///
    /// Called every 60 seconds by the keeper bot.
    /// Calculates funding rate based on market imbalance and updates cumulative funding.
    /// Funding rate is expressed in basis points per hour.
    ///
    /// # Arguments
    ///
    /// * `caller` - Address calling this function
    /// * `market_id` - The market identifier
    ///
    /// TODO: Bot sollte admin sein? oder kann jeder diese function callen?
    pub fn update_funding_rate(env: Env, caller: Address, market_id: u32) {
        caller.require_auth();

        let mut market = get_market(&env, market_id);

        // Verify funding interval has passed (60s from ConfigManager)
        let config_manager = get_config_manager(&env);
        let config_client = config_manager::Client::new(&env, &config_manager);
        let funding_interval = config_client.funding_interval();

        let now = env.ledger().timestamp();
        let time_elapsed = now - market.last_funding_update;

        if time_elapsed < funding_interval {
            panic!("funding interval not elapsed");
        }

        // Calculate total OI
        let total_oi = market
            .long_open_interest
            .checked_add(market.short_open_interest)
            .expect("OI overflow");

        if total_oi == 0 {
            // No open interest, funding rate stays at 0
            market.last_funding_update = now;
            set_market(&env, &market);
            return;
        }

        // Calculate imbalance ratio: (long_oi - short_oi) / total_oi
        let oi_diff = (market.long_open_interest as i128) - (market.short_open_interest as i128);

        // Imbalance ratio in basis points (10000 = 100%)
        let imbalance_ratio_bps = (oi_diff * 10000) / (total_oi as i128);

        // Calculate funding rate: base_rate * (imbalance_ratio)^2
        // imbalance_ratio is in bps, so imbalance^2 needs to be scaled
        let imbalance_squared = (imbalance_ratio_bps * imbalance_ratio_bps) / 10000;

        // funding_rate = base_rate * imbalance_squared / 10000
        let mut funding_rate = (market.base_funding_rate * imbalance_squared) / 10000;

        // Cap at max funding rate
        if funding_rate > market.max_funding_rate {
            funding_rate = market.max_funding_rate;
        } else if funding_rate < -market.max_funding_rate {
            funding_rate = -market.max_funding_rate;
        }

        // Calculate funding payment for this period
        // funding_rate is in basis points per hour
        // Store as (funding_rate * time_elapsed) without dividing by 3600
        // This avoids integer division precision loss
        // The division by 3600 will happen in PnL calculation
        let total_funding = funding_rate * (time_elapsed as i128);

        // Update cumulative funding
        if funding_rate > 0 {
            // Longs pay shorts
            market.cumulative_funding_long += total_funding;
        } else if funding_rate < 0 {
            // Shorts pay longs
            market.cumulative_funding_short += total_funding.abs();
        }

        // Update market state
        market.funding_rate = funding_rate;
        market.last_funding_update = now;
        set_market(&env, &market);

        // Emit event
        FundingRateUpdatedEvent {
            market_id,
            funding_rate,
            long_oi: market.long_open_interest,
            short_oi: market.short_open_interest,
        }
        .publish(&env);
    }

    /// Get the current funding rate for a market.
    ///
    /// # Arguments
    ///
    /// * `market_id` - The market identifier
    ///
    /// # Returns
    ///
    /// The current funding rate (in basis points per hour)
    pub fn get_funding_rate(env: Env, market_id: u32) -> i128 {
        let market = get_market(&env, market_id);
        market.funding_rate
    }

    /// Get cumulative funding for a position side.
    ///
    /// # Arguments
    ///
    /// * `market_id` - The market identifier
    /// * `is_long` - True if long position, false if short
    ///
    /// # Returns
    ///
    /// The cumulative funding paid by the specified side
    pub fn get_cumulative_funding(env: Env, market_id: u32, is_long: bool) -> i128 {
        let market = get_market(&env, market_id);
        if is_long {
            market.cumulative_funding_long
        } else {
            market.cumulative_funding_short
        }
    }

    /// Update open interest when positions are opened or closed.
    ///
    /// # Arguments
    ///
    /// * `position_manager` - Address of the PositionManager contract
    /// * `market_id` - The market identifier
    /// * `is_long` - True if long position, false if short
    /// * `size_delta` - Change in position size (positive = increase, negative = decrease)
    pub fn update_open_interest(
        env: Env,
        position_manager: Address,
        market_id: u32,
        is_long: bool,
        size_delta: i128,
    ) {
        require_position_manager(&env, &position_manager);

        let mut market = get_market(&env, market_id);

        if is_long {
            // Update long OI
            if size_delta > 0 {
                // Opening or increasing position
                let new_long_oi = market
                    .long_open_interest
                    .checked_add(size_delta as u128)
                    .expect("long OI overflow");

                // Check against max OI limit
                if new_long_oi > market.max_open_interest {
                    panic!("exceeds max open interest");
                }

                market.long_open_interest = new_long_oi;
            } else {
                // Closing or decreasing position
                let decrease = (-size_delta) as u128;
                if decrease > market.long_open_interest {
                    panic!("cannot reduce OI below zero");
                }
                market.long_open_interest -= decrease;
            }
        } else {
            // Update short OI
            if size_delta > 0 {
                let new_short_oi = market
                    .short_open_interest
                    .checked_add(size_delta as u128)
                    .expect("short OI overflow");

                if new_short_oi > market.max_open_interest {
                    panic!("exceeds max open interest");
                }

                market.short_open_interest = new_short_oi;
            } else {
                let decrease = (-size_delta) as u128;
                if decrease > market.short_open_interest {
                    panic!("cannot reduce OI below zero");
                }
                market.short_open_interest -= decrease;
            }
        }

        set_market(&env, &market);

        // Emit event
        OIUpdatedEvent {
            market_id,
            long_oi: market.long_open_interest,
            short_oi: market.short_open_interest,
        }
        .publish(&env);
    }

    /// Get the current open interest for a market.
    ///
    /// # Arguments
    ///
    /// * `market_id` - The market identifier
    ///
    /// # Returns
    ///
    /// Tuple of (long_open_interest, short_open_interest)
    pub fn get_open_interest(env: Env, market_id: u32) -> (u128, u128) {
        let market = get_market(&env, market_id);
        (market.long_open_interest, market.short_open_interest)
    }

    /// Pause a market to prevent new positions from being opened.
    ///
    /// # Arguments
    ///
    /// * `admin` - Address of the admin
    /// * `market_id` - The market identifier
    pub fn pause_market(env: Env, admin: Address, market_id: u32) {
        require_admin(&env, &admin);

        let mut market = get_market(&env, market_id);
        market.is_paused = true;
        set_market(&env, &market);

        env.events().publish((symbol_short!("paused"),), market_id);
    }

    /// Unpause a market to allow new positions.
    ///
    /// # Arguments
    ///
    /// * `admin` - Address of the admin
    /// * `market_id` - The market identifier
    pub fn unpause_market(env: Env, admin: Address, market_id: u32) {
        require_admin(&env, &admin);

        let mut market = get_market(&env, market_id);
        market.is_paused = false;
        set_market(&env, &market);

        env.events()
            .publish((symbol_short!("unpaused"),), market_id);
    }

    /// Check if a market is currently paused.
    ///
    /// # Arguments
    ///
    /// * `market_id` - The market identifier
    ///
    /// # Returns
    ///
    /// True if market is paused, false otherwise
    pub fn is_market_paused(env: Env, market_id: u32) -> bool {
        let market = get_market(&env, market_id);
        market.is_paused
    }

    /// Check if a new position can be opened based on OI limits.
    ///
    /// # Arguments
    ///
    /// * `market_id` - The market identifier
    /// * `is_long` - True if long position, false if short
    /// * `size` - The size of the position to open
    ///
    /// # Returns
    ///
    /// True if position can be opened, false otherwise
    pub fn can_open_position(env: Env, market_id: u32, is_long: bool, size: u128) -> bool {
        let market = match env
            .storage()
            .instance()
            .get::<DataKey, Market>(&DataKey::Market(market_id))
        {
            Some(m) => m,
            None => return false, // Market doesn't exist
        };

        // Check if market is paused
        if market.is_paused {
            return false;
        }

        // Check if adding this size would exceed max OI
        let current_oi = if is_long {
            market.long_open_interest
        } else {
            market.short_open_interest
        };

        let new_oi = current_oi + size;
        if new_oi > market.max_open_interest {
            return false;
        }

        true
    }
}

#[cfg(test)]
mod test;
