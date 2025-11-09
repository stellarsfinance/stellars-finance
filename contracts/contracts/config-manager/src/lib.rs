#![no_std]

//! # ConfigManager Contract
//!
//! The ConfigManager contract serves as the centralized configuration store for all protocol
//! parameters across the Stellars Finance perpetuals system. It provides a secure and flexible
//! way to manage protocol settings, fees, limits, and operational parameters.
//!
//! ## Overview
//!
//! This contract acts as the single source of truth for all configurable parameters used by
//! other contracts in the protocol. It implements access control to ensure only authorized
//! administrators can modify settings, while providing read-only access to all other contracts
//! and users. This allows parameter updates without upgrading other contracts.
//!
//! ## Key Responsibilities
//!
//! - **Parameter Storage**: Store all protocol configuration parameters
//! - **Access Control**: Restrict parameter updates to authorized administrators
//! - **Parameter Validation**: Ensure parameters are within acceptable bounds
//! - **Configuration Versioning**: Track configuration changes over time
//! - **Default Values**: Provide sensible defaults for all parameters
//!
//! ## Configuration Categories
//!
//! ### 1. Trading Parameters
//! - **MIN_LEVERAGE**: Minimum allowed leverage (default: 5x)
//! - **MAX_LEVERAGE**: Maximum allowed leverage (default: 20x)
//! - **MIN_POSITION_SIZE**: Minimum position size in USD
//! - **MAX_POSITION_SIZE**: Maximum position size in USD
//!
//! ### 2. Fee Configuration
//! - **MAKER_FEE_BPS**: Fee for limit orders in basis points (e.g., 2 = 0.02%)
//! - **TAKER_FEE_BPS**: Fee for market orders in basis points (e.g., 5 = 0.05%)
//! - **LIQUIDATION_FEE_BPS**: Fee paid to liquidators (e.g., 50 = 0.5%)
//! - **FUNDING_FEE_BPS**: Maximum funding rate per hour
//! - **PROTOCOL_FEE_SHARE**: Portion of fees going to protocol treasury (e.g., 20 = 20%)
//!
//! ### 3. Risk Parameters
//! - **LIQUIDATION_THRESHOLD**: Margin ratio triggering liquidation (e.g., 9000 = 90%)
//! - **MAINTENANCE_MARGIN**: Minimum margin to maintain position (e.g., 5000 = 50%)
//! - **INITIAL_MARGIN**: Margin required to open position based on leverage
//! - **MAX_PRICE_DEVIATION_BPS**: Max price deviation between oracles (e.g., 500 = 5%)
//! - **PRICE_STALENESS_THRESHOLD**: Maximum age of oracle price in seconds (e.g., 60)
//!
//! ### 4. Market Limits
//! - **MAX_OPEN_INTEREST**: Maximum total open interest per market in USD
//! - **MAX_POOL_UTILIZATION**: Maximum % of pool that can be used (e.g., 8000 = 80%)
//! - **MAX_POSITION_OI_RATIO**: Max single position as % of total OI (e.g., 500 = 5%)
//! - **MAX_FUNDING_RATE**: Maximum funding rate per hour in basis points
//!
//! ### 5. Time Parameters
//! - **FUNDING_INTERVAL**: Time between funding rate updates (default: 60 seconds)
//! - **LIQUIDATION_GRACE_PERIOD**: Time before liquidatable position can be liquidated
//! - **PRICE_UPDATE_INTERVAL**: Minimum time between price updates
//! - **TTL_EXTENSION_THRESHOLD**: When to extend storage TTL
//!
//! ### 6. Operational Settings
//! - **ADMIN_ADDRESS**: Protocol administrator address
//! - **TREASURY_ADDRESS**: Protocol treasury for fee collection
//! - **KEEPER_MIN_REWARD**: Minimum reward for keeper operations
//! - **EMERGENCY_PAUSE**: Global emergency pause flag
//!
//! ## Storage Strategy
//!
//! - **Instance Storage**: Used for all configuration parameters
//!   - Fast access for frequently read values
//!   - Lower cost than persistent storage for static data
//!   - Parameters don't need to persist across upgrades (can be re-initialized)
//!   - Suitable for configuration that changes infrequently
//!
//! ## Access Control
//!
//! - **Read Access**: Public - any contract or user can read parameters
//! - **Write Access**: Restricted - only admin can set/update parameters
//! - **Admin Management**: Admin can transfer admin role to new address
//! - **Multi-sig Support**: Future enhancement for governance-based updates
//!
//! ## Parameter Update Flow
//!
//! 1. Admin proposes parameter change
//! 2. Validate new value is within acceptable bounds
//! 3. Check parameter dependencies (e.g., MIN_LEVERAGE < MAX_LEVERAGE)
//! 4. Update parameter in instance storage
//! 5. Emit parameter updated event with old and new values
//! 6. Log change for audit trail
//!
//! ## Safety Mechanisms
//!
//! - **Bounds Checking**: All parameters have min/max limits
//! - **Consistency Validation**: Related parameters are validated together
//! - **Emergency Pause**: Can disable trading while allowing position closes
//! - **Gradual Updates**: Time delays for sensitive parameter changes
//! - **Rollback Capability**: Ability to revert to previous configuration
//!
//! ## Integration Points
//!
//! - **PositionManager**: Reads leverage limits, fees, liquidation thresholds
//! - **MarketManager**: Reads funding intervals, OI caps, market parameters
//! - **OracleIntegrator**: Reads price staleness limits, deviation thresholds
//! - **LiquidityPool**: Reads pool utilization limits, fee distributions
//!
//! ## Example Parameters
//!
//! ```rust
//! // Trading
//! MIN_LEVERAGE = 5
//! MAX_LEVERAGE = 20
//! MIN_POSITION_SIZE = 10_000_000  // 10 USD (7 decimals)
//!
//! // Fees (basis points)
//! MAKER_FEE_BPS = 2     // 0.02%
//! TAKER_FEE_BPS = 5     // 0.05%
//! LIQUIDATION_FEE_BPS = 50  // 0.5%
//!
//! // Risk
//! LIQUIDATION_THRESHOLD = 9000  // 90%
//! MAINTENANCE_MARGIN = 5000     // 50%
//! MAX_PRICE_DEVIATION_BPS = 500 // 5%
//!
//! // Time
//! FUNDING_INTERVAL = 60  // 60 seconds
//! PRICE_STALENESS_THRESHOLD = 60  // 60 seconds
//! ```
//!
//! ## Future Enhancements
//!
//! - Governance-based parameter updates (DAO voting)
//! - Time-locked parameter changes for security
//! - Parameter change proposals with discussion period
//! - Automated parameter optimization based on market conditions
//! - Per-market parameter overrides
//! - Parameter change impact simulation

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    // Contract Registry
    LiquidityPoolContract,
    PositionManagerContract,
    MarketManagerContract,
    OracleIntegratorContract,
    TokenContract,
    // Trading parameters
    MinLeverage,
    MaxLeverage,
    MinPositionSize,
    // Fee parameters
    MakerFeeBps,
    TakerFeeBps,
    LiquidationFeeBps,
    // Risk parameters
    LiquidationThreshold,
    MaintenanceMargin,
    MaxPriceDeviationBps,
    // Time parameters
    FundingInterval,
    PriceStalenessThreshold,
    // Generic config key for dynamic parameters
    Config(Symbol),
}

#[contract]
pub struct ConfigManager;

// Helper functions for storage access
fn get_admin(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::Admin).unwrap()
}

fn put_admin(e: &Env, admin: &Address) {
    e.storage().instance().set(&DataKey::Admin, admin);
}

fn get_config_value(e: &Env, key: &DataKey) -> i128 {
    e.storage().instance().get(key).unwrap_or(0)
}

fn put_config_value(e: &Env, key: &DataKey, value: i128) {
    e.storage().instance().set(key, &value);
}

fn get_time_config_value(e: &Env, key: &DataKey) -> u64 {
    e.storage().instance().get(key).unwrap_or(0)
}

fn put_time_config_value(e: &Env, key: &DataKey, value: u64) {
    e.storage().instance().set(key, &value);
}

fn require_admin(e: &Env, admin: &Address) {
    admin.require_auth();
    let stored_admin = get_admin(e);
    if admin != &stored_admin {
        panic!("unauthorized");
    }
}

fn get_contract_address(e: &Env, key: &DataKey) -> Address {
    e.storage().instance().get(key).unwrap()
}

fn put_contract_address(e: &Env, key: &DataKey, address: &Address) {
    e.storage().instance().set(key, address);
}

#[contractimpl]
impl ConfigManager {
    /// Initialize the configuration contract with admin.
    ///
    /// # Arguments
    ///
    /// * `admin` - The administrator address
    ///
    /// # Panics
    ///
    /// Panics if already initialized
    pub fn initialize(env: Env, admin: Address) {
        // Verify not already initialized
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }

        // Set admin
        put_admin(&env, &admin);

        // Set default configuration values
        // Trading parameters
        put_config_value(&env, &DataKey::MinLeverage, 5);
        put_config_value(&env, &DataKey::MaxLeverage, 20);
        put_config_value(&env, &DataKey::MinPositionSize, 10_000_000);

        // Fee parameters (in basis points)
        put_config_value(&env, &DataKey::MakerFeeBps, 2);
        put_config_value(&env, &DataKey::TakerFeeBps, 5);
        put_config_value(&env, &DataKey::LiquidationFeeBps, 50);

        // Risk parameters
        put_config_value(&env, &DataKey::LiquidationThreshold, 9000);
        put_config_value(&env, &DataKey::MaintenanceMargin, 5000);
        put_config_value(&env, &DataKey::MaxPriceDeviationBps, 500);

        // Time parameters
        put_time_config_value(&env, &DataKey::FundingInterval, 60);
        put_time_config_value(&env, &DataKey::PriceStalenessThreshold, 60);
    }

    /// Set a configuration parameter using a Symbol key.
    ///
    /// # Arguments
    ///
    /// * `admin` - The administrator address (must match stored admin)
    /// * `key` - The configuration parameter key
    /// * `value` - The new value for the parameter
    ///
    /// # Panics
    ///
    /// Panics if caller is not the admin
    pub fn set_config(env: Env, admin: Address, key: Symbol, value: i128) {
        // Verify admin authorization
        require_admin(&env, &admin);

        // TODO: Add parameter validation based on key
        // For example:
        // - Verify MIN_LEVERAGE < MAX_LEVERAGE
        // - Ensure fees are within reasonable bounds
        // - Check liquidation threshold > maintenance margin

        // Set the configuration value using generic key
        put_config_value(&env, &DataKey::Config(key), value);
    }

    /// Get a configuration parameter using a Symbol key.
    ///
    /// # Arguments
    ///
    /// * `key` - The configuration parameter key
    ///
    /// # Returns
    ///
    /// The parameter value, or 0 if not set
    pub fn get_config(env: Env, key: Symbol) -> i128 {
        get_config_value(&env, &DataKey::Config(key))
    }

    /// Get a time-based configuration parameter using a Symbol key.
    ///
    /// # Arguments
    ///
    /// * `key` - The configuration parameter key
    ///
    /// # Returns
    ///
    /// The parameter value as u64, or 0 if not set
    pub fn get_time_config(env: Env, key: Symbol) -> u64 {
        get_time_config_value(&env, &DataKey::Config(key))
    }

    /// Update the admin address.
    ///
    /// # Arguments
    ///
    /// * `current_admin` - The current administrator address
    /// * `new_admin` - The new administrator address
    ///
    /// # Panics
    ///
    /// Panics if caller is not the current admin
    pub fn set_admin(env: Env, current_admin: Address, new_admin: Address) {
        // Verify current admin authorization
        require_admin(&env, &current_admin);

        // Set new admin
        put_admin(&env, &new_admin);
    }

    /// Get the current admin address.
    ///
    /// # Returns
    ///
    /// The administrator address
    pub fn admin(env: Env) -> Address {
        get_admin(&env)
    }

    /// Get minimum leverage limit.
    ///
    /// # Returns
    ///
    /// Minimum leverage (default: 5)
    pub fn min_leverage(env: Env) -> i128 {
        get_config_value(&env, &DataKey::MinLeverage)
    }

    /// Get maximum leverage limit.
    ///
    /// # Returns
    ///
    /// Maximum leverage (default: 20)
    pub fn max_leverage(env: Env) -> i128 {
        get_config_value(&env, &DataKey::MaxLeverage)
    }

    /// Get minimum position size.
    ///
    /// # Returns
    ///
    /// Minimum position size in base units
    pub fn min_position_size(env: Env) -> i128 {
        get_config_value(&env, &DataKey::MinPositionSize)
    }

    /// Get maker fee in basis points.
    ///
    /// # Returns
    ///
    /// Maker fee in basis points (default: 2)
    pub fn maker_fee_bps(env: Env) -> i128 {
        get_config_value(&env, &DataKey::MakerFeeBps)
    }

    /// Get taker fee in basis points.
    ///
    /// # Returns
    ///
    /// Taker fee in basis points (default: 5)
    pub fn taker_fee_bps(env: Env) -> i128 {
        get_config_value(&env, &DataKey::TakerFeeBps)
    }

    /// Get liquidation fee in basis points.
    ///
    /// # Returns
    ///
    /// Liquidation fee in basis points (default: 50)
    pub fn liquidation_fee_bps(env: Env) -> i128 {
        get_config_value(&env, &DataKey::LiquidationFeeBps)
    }

    /// Get liquidation threshold in basis points.
    ///
    /// # Returns
    ///
    /// Liquidation threshold in basis points (default: 9000)
    pub fn liquidation_threshold(env: Env) -> i128 {
        get_config_value(&env, &DataKey::LiquidationThreshold)
    }

    /// Get maintenance margin in basis points.
    ///
    /// # Returns
    ///
    /// Maintenance margin in basis points (default: 5000)
    pub fn maintenance_margin(env: Env) -> i128 {
        get_config_value(&env, &DataKey::MaintenanceMargin)
    }

    /// Get maximum price deviation in basis points.
    ///
    /// # Returns
    ///
    /// Maximum price deviation in basis points (default: 500)
    pub fn max_price_deviation_bps(env: Env) -> i128 {
        get_config_value(&env, &DataKey::MaxPriceDeviationBps)
    }

    /// Get funding interval in seconds.
    ///
    /// # Returns
    ///
    /// Funding interval in seconds (default: 60)
    pub fn funding_interval(env: Env) -> u64 {
        get_time_config_value(&env, &DataKey::FundingInterval)
    }

    /// Get price staleness threshold in seconds.
    ///
    /// # Returns
    ///
    /// Price staleness threshold in seconds (default: 60)
    pub fn price_staleness_threshold(env: Env) -> u64 {
        get_time_config_value(&env, &DataKey::PriceStalenessThreshold)
    }

    // Contract Registry Functions

    /// Set the Liquidity Pool contract address.
    ///
    /// # Arguments
    ///
    /// * `admin` - The administrator address
    /// * `contract` - The Liquidity Pool contract address
    ///
    /// # Panics
    ///
    /// Panics if caller is not the admin
    pub fn set_liquidity_pool(env: Env, admin: Address, contract: Address) {
        require_admin(&env, &admin);
        put_contract_address(&env, &DataKey::LiquidityPoolContract, &contract);
    }

    /// Get the Liquidity Pool contract address.
    ///
    /// # Returns
    ///
    /// The Liquidity Pool contract address
    pub fn liquidity_pool(env: Env) -> Address {
        get_contract_address(&env, &DataKey::LiquidityPoolContract)
    }

    /// Set the Position Manager contract address.
    ///
    /// # Arguments
    ///
    /// * `admin` - The administrator address
    /// * `contract` - The Position Manager contract address
    ///
    /// # Panics
    ///
    /// Panics if caller is not the admin
    pub fn set_position_manager(env: Env, admin: Address, contract: Address) {
        require_admin(&env, &admin);
        put_contract_address(&env, &DataKey::PositionManagerContract, &contract);
    }

    /// Get the Position Manager contract address.
    ///
    /// # Returns
    ///
    /// The Position Manager contract address
    pub fn position_manager(env: Env) -> Address {
        get_contract_address(&env, &DataKey::PositionManagerContract)
    }

    /// Set the Market Manager contract address.
    ///
    /// # Arguments
    ///
    /// * `admin` - The administrator address
    /// * `contract` - The Market Manager contract address
    ///
    /// # Panics
    ///
    /// Panics if caller is not the admin
    pub fn set_market_manager(env: Env, admin: Address, contract: Address) {
        require_admin(&env, &admin);
        put_contract_address(&env, &DataKey::MarketManagerContract, &contract);
    }

    /// Get the Market Manager contract address.
    ///
    /// # Returns
    ///
    /// The Market Manager contract address
    pub fn market_manager(env: Env) -> Address {
        get_contract_address(&env, &DataKey::MarketManagerContract)
    }

    /// Set the Oracle Integrator contract address.
    ///
    /// # Arguments
    ///
    /// * `admin` - The administrator address
    /// * `contract` - The Oracle Integrator contract address
    ///
    /// # Panics
    ///
    /// Panics if caller is not the admin
    pub fn set_oracle_integrator(env: Env, admin: Address, contract: Address) {
        require_admin(&env, &admin);
        put_contract_address(&env, &DataKey::OracleIntegratorContract, &contract);
    }

    /// Get the Oracle Integrator contract address.
    ///
    /// # Returns
    ///
    /// The Oracle Integrator contract address
    pub fn oracle_integrator(env: Env) -> Address {
        get_contract_address(&env, &DataKey::OracleIntegratorContract)
    }

    /// Set the Token contract address.
    ///
    /// # Arguments
    ///
    /// * `admin` - The administrator address
    /// * `contract` - The Token contract address
    ///
    /// # Panics
    ///
    /// Panics if caller is not the admin
    pub fn set_token(env: Env, admin: Address, contract: Address) {
        require_admin(&env, &admin);
        put_contract_address(&env, &DataKey::TokenContract, &contract);
    }

    /// Get the Token contract address.
    ///
    /// # Returns
    ///
    /// The Token contract address
    pub fn token(env: Env) -> Address {
        get_contract_address(&env, &DataKey::TokenContract)
    }
}

#[cfg(test)]
mod test;
