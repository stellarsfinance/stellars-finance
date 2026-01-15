#![no_std]

//! # OracleIntegrator Contract
//!
//! The OracleIntegrator contract is responsible for fetching, validating, and aggregating price
//! data from multiple oracle sources for the Stellars Finance perpetuals protocol. It ensures
//! accurate and manipulation-resistant pricing for all trading operations.
//!
//! ## Overview
//!
//! This contract integrates with multiple decentralized oracle networks to obtain reliable price
//! feeds for all supported perpetual markets (XLM-PERP, BTC-PERP, ETH-PERP). By aggregating prices
//! from multiple sources and using median calculation, it provides robust protection against
//! oracle manipulation and single points of failure.
//!
//! ## Key Responsibilities
//!
//! - **Price Fetching**: Query multiple oracle sources for current asset prices
//! - **Price Validation**: Verify price freshness, bounds, and consistency across sources
//! - **Price Aggregation**: Calculate median price from multiple oracle feeds
//! - **Deviation Detection**: Identify and handle excessive price deviations between sources
//! - **Oracle Health Monitoring**: Track oracle availability and reliability
//! - **Fallback Logic**: Gracefully handle oracle failures with backup sources
//!
//! ## Supported Oracle Networks
//!
//! ### 2. DIA Oracle (Secondary)
//! - **Priority**: Medium
//! - **Features**: Transparent data sourcing, customizable feeds, historical data
//! - **Update Frequency**: Configurable (typically 1-5 minutes)
//! - **Asset Coverage**: 20,000+ assets, full source transparency
//! - **Use Case**: Secondary validation and fallback source
//!
//! ### 3. Reflector Oracle (Tertiary)
//! - **Priority**: Lowest
//! - **Features**: Stellar-native oracle, community-driven, multi-source aggregation
//! - **Update Frequency**: Variable, Stellar DEX integration
//! - **Use Case**: Tertiary fallback and cross-validation
//!
//! ## Price Aggregation Strategy
//!
//! The contract uses a **median-based aggregation** approach with bid/ask model:
//!
//! 1. Fetch prices from all available oracles (Pyth, DIA, Reflector)
//! 2. Validate each price:
//!    - Check timestamp freshness (reject stale prices)
//!    - Verify price is within reasonable bounds
//!    - Validate signatures using Ed25519 (Stellar native)
//!    - Ensure oracle is responding correctly
//!    - Timestamp-based replay protection (no blockhash dependency)
//! 3. Calculate median of valid prices
//! 4. Implement min/max price spread capture (bid/ask model from GMX)
//! 5. Apply conservative pricing:
//!    - Longs pay max price when opening, receive min when closing
//!    - Shorts pay min price when opening, receive max when closing
//!    - Protects LPs from unfavorable price execution
//! 6. Compare median against individual sources:
//!    - If any price deviates >X% from median, flag as potential issue
//!    - If majority of sources are unavailable, pause trading
//! 7. Return median price with confidence indicator
//!
//! ## Price Validation Rules
//!
//! - **Staleness Check**: Prices older than 60 seconds are rejected
//! - **Deviation Threshold**: If price sources differ by >5%, trigger alert
//! - **Minimum Sources**: Require at least 2 valid sources for trading
//! - **Circuit Breaker**: If price moves >20% in single update, pause market
//! - **Confidence Intervals**: Use Pyth confidence data to assess price quality
//!
//! ## Oracle Failure Handling
//!
//! When oracles fail or become unavailable:
//!
//! 1. **Single Oracle Failure**: Continue with remaining sources if ≥2 available
//! 2. **Multiple Oracle Failure**: Pause new position opening, allow closes/liquidations
//! 3. **Complete Oracle Failure**: Emergency pause all trading operations
//! 4. **Inconsistent Prices**: If deviation exceeds threshold, use most conservative price
//!
//! ## Storage Strategy
//!
//! - **Temporary Storage**: Stores latest validated prices with timestamps (prices are frequently updated)
//! - **Instance Storage**: Stores oracle signer addresses for signature validation
//!
//! Temporary storage is ideal because:
//! - Prices are frequently updated (60s or less)
//! - Historical prices not needed (PositionManager stores entry prices)
//! - Reduces storage costs significantly
//! - Automatic cleanup via TTL mechanism
//!
//! ## Integration Points
//!
//! - **PositionManager**: Provides prices for position entry, exit, and liquidations
//! - **MarketManager**: Supplies price data for funding rate calculations
//! - **ConfigManager**: Retrieves oracle configuration (staleness limits, deviation thresholds)
//!
//! ## Security Considerations
//!
//! - **Oracle Manipulation**: Median aggregation prevents single-source manipulation
//! - **Front-Running**: Use commit-reveal or signed prices where possible
//! - **Staleness**: Strict timestamp validation prevents replay attacks
//! - **Flash Crashes**: Circuit breakers prevent exploitation of temporary price anomalies
//! - **Oracle Collusion**: Multiple independent oracle networks reduce collusion risk
//!
//! ## Performance Optimization
//!
//! - Batch oracle queries when possible to reduce cross-contract call overhead
//! - Cache aggregated prices with short TTL (5-10 seconds) to minimize computation
//! - Use temporary storage to minimize ledger space costs
//! - Implement lazy validation (validate on-demand rather than continuously)
//!
//! ## Future Enhancements
//!
//! - Time-weighted average price (TWAP) calculation
//! - Volatility-adjusted staleness thresholds
//! - On-chain oracle reputation scoring
//! - Automated oracle source rotation based on reliability
//! - Support for additional oracle networks (Chainlink, Band, etc.)
//! - Historical price data retention for analytics

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String};

#[cfg(not(test))]
mod config_manager {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32v1-none/release/config_manager.wasm"
    );
}

#[contracttype]
pub enum DataKey {
    ConfigManager,
    TestMode,           // bool: test mode enabled/disabled
    TestBasePrice(u32), // i128: base price per market_id for simulation
}

/// Get the ConfigManager address from storage
fn get_config_manager(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::ConfigManager)
        .expect("ConfigManager not initialized")
}

/// Get asset symbols for oracle queries
/// Returns (dia_symbol, reflector_symbol)
fn get_asset_symbol(env: &Env, market_id: u32) -> (String, String) {
    match market_id {
        0 => (
            String::from_str(env, "XLM/USD"),
            String::from_str(env, "XLM"),
        ),
        1 => (
            String::from_str(env, "BTC/USD"),
            String::from_str(env, "Bitcoin"),
        ),
        2 => (
            String::from_str(env, "ETH/USD"),
            String::from_str(env, "Ethereum"),
        ),
        _ => panic!("unsupported market_id: {}", market_id),
    }
}

/// Check if test mode is enabled
fn is_test_mode(env: &Env) -> bool {
    env.storage()
        .instance()
        .get(&DataKey::TestMode)
        .unwrap_or(false)
}

/// Get simulated price for testing
/// Returns (price, timestamp)
fn get_simulated_price(env: &Env, market_id: u32) -> (i128, u64) {
    let base_price = env
        .storage()
        .instance()
        .get(&DataKey::TestBasePrice(market_id))
        .unwrap_or(100_000_000);

    let timestamp = env.ledger().timestamp();

    // Create predictable price oscillation: ±10% per hour
    let time_in_hour = (timestamp % 3600) as i128;
    let variation = (base_price * time_in_hour) / 36000; // Max ±10%
    let oscillating_multiplier = if (timestamp / 1800) % 2 == 0 { 1 } else { -1 };

    let price = base_price + (variation * oscillating_multiplier);
    (price, timestamp)
}

/// Validate oracle price for staleness and bounds
#[cfg(not(test))]
fn validate_oracle_price(env: &Env, price: i128, timestamp: u64) {
    // Staleness check
    let config_manager = get_config_manager(env);
    let config_client = config_manager::Client::new(env, &config_manager);
    let staleness_threshold = config_client.price_staleness_threshold();
    let current_time = env.ledger().timestamp();

    if current_time - timestamp > staleness_threshold {
        panic!(
            "stale price: age {} seconds exceeds threshold {}",
            current_time - timestamp,
            staleness_threshold
        );
    }

    // Bounds check
    if price <= 0 {
        panic!("invalid price: must be positive");
    }

    // Sanity check: price should be reasonable (< $1 trillion)
    if price > 1_000_000_000_000_000_000 {
        panic!("invalid price: exceeds maximum bound");
    }
}

/// Validate price deviation between oracles
#[cfg(not(test))]
fn validate_price_deviation(env: &Env, price1: i128, price2: i128) {
    let config_manager = get_config_manager(env);
    let config_client = config_manager::Client::new(env, &config_manager);
    let max_deviation_bps = config_client.max_price_deviation_bps();

    // Calculate percentage deviation
    let diff = if price1 > price2 {
        price1 - price2
    } else {
        price2 - price1
    };
    let avg = (price1 + price2) / 2;
    let deviation_bps = (diff * 10000) / avg;

    if deviation_bps > max_deviation_bps {
        panic!(
            "excessive price deviation: {}bps exceeds threshold {}bps - possible manipulation",
            deviation_bps, max_deviation_bps
        );
    }
}

#[contract]
pub struct OracleIntegrator;

#[contractimpl]
impl OracleIntegrator {
    /// Initialize the OracleIntegrator contract.
    ///
    /// # Arguments
    ///
    /// * `config_manager` - Address of the ConfigManager contract
    pub fn initialize(env: Env, config_manager: Address) {
        // Prevent reinitialization
        if env.storage().instance().has(&DataKey::ConfigManager) {
            panic!("already initialized");
        }

        // Store the ConfigManager address
        env.storage()
            .instance()
            .set(&DataKey::ConfigManager, &config_manager);
    }

    /// Enable or disable test mode with base prices.
    ///
    /// # Arguments
    ///
    /// * `admin` - The administrator address (must match ConfigManager admin)
    /// * `enabled` - Whether to enable test mode
    /// * `base_prices` - Map of market_id to base price for simulation
    ///
    /// # Panics
    ///
    /// Panics if caller is not the admin
    pub fn set_test_mode(env: Env, admin: Address, enabled: bool, base_prices: Map<u32, i128>) {
        admin.require_auth();

        // Verify admin through ConfigManager (only in non-test environments)
        #[cfg(not(test))]
        {
            let config_manager = get_config_manager(&env);
            let config_client = config_manager::Client::new(&env, &config_manager);
            let admin_addr = config_client.admin();
            if admin != admin_addr {
                panic!("unauthorized");
            }
        }

        // Set test mode flag
        env.storage().instance().set(&DataKey::TestMode, &enabled);

        // Store base prices for each market
        for (market_id, price) in base_prices.iter() {
            env.storage()
                .instance()
                .set(&DataKey::TestBasePrice(market_id), &price);
        }
    }

    /// Check if test mode is enabled.
    ///
    /// # Returns
    ///
    /// True if test mode is enabled, false otherwise
    pub fn get_test_mode(env: Env) -> bool {
        env.storage()
            .instance()
            .get(&DataKey::TestMode)
            .unwrap_or(false)
    }

    /// Get the current price for a specific asset from all oracle sources.
    ///
    /// # Arguments
    ///
    /// * `market_id` - The market identifier (0=XLM, 1=BTC, 2=ETH)
    ///
    /// # Returns
    ///
    /// The aggregated (median) price
    ///
    /// # Implementation
    ///
    /// In test mode: Returns time-based simulated price
    /// In production mode: Fetches from DIA and Reflector, validates, returns median
    pub fn get_price(env: Env, market_id: u32) -> i128 {
        // Test mode bypass
        if is_test_mode(&env) {
            let (price, _) = get_simulated_price(&env, market_id);
            return price;
        }

        // Production mode: fetch from both oracles
        #[cfg(not(test))]
        {
            let (dia_price, dia_timestamp) = Self::fetch_dia_price(env.clone(), market_id);
            let (reflector_price, reflector_timestamp) =
                Self::fetch_reflector_price(env.clone(), market_id);

            // Validate each price
            validate_oracle_price(&env, dia_price, dia_timestamp);
            validate_oracle_price(&env, reflector_price, reflector_timestamp);

            // Check deviation between oracles
            validate_price_deviation(&env, dia_price, reflector_price);

            // Calculate median (average of 2 prices)
            let median_price = (dia_price + reflector_price) / 2;

            median_price
        }

        #[cfg(test)]
        {
            // In test builds, if not in test mode, panic with clear message
            panic!("Production oracle integration not available in test mode - use set_test_mode");
        }
    }

    /// Fetch price from Pyth Network oracle.
    ///
    /// # Arguments
    ///
    /// * `asset_id` - The asset identifier
    ///
    /// # Returns
    ///
    /// Tuple of (price, confidence, timestamp)
    pub fn fetch_pyth_price(_env: Env, _asset_id: u32) -> (i128, i128, u64) {
        // TODO: Implement Pyth price fetching
        // - Call Pyth oracle contract
        // - Parse price feed data
        // - Extract price, confidence interval, and timestamp
        // - Return price data
        (0, 0, 0)
    }

    /// Fetch price from DIA oracle.
    ///
    /// # Arguments
    ///
    /// * `market_id` - The market identifier
    ///
    /// # Returns
    ///
    /// Tuple of (price, timestamp)
    pub fn fetch_dia_price(env: Env, market_id: u32) -> (i128, u64) {
        #[cfg(not(test))]
        {
            let config_manager = get_config_manager(&env);
            let config_client = config_manager::Client::new(&env, &config_manager);
            let _dia_address = config_client.dia_oracle();

            let (dia_symbol, _) = get_asset_symbol(&env, market_id);

            // TODO: Replace with actual DIA oracle contract call
            // This requires DIA oracle WASM interface
            // For now, panic with clear error message
            panic!(
                "DIA oracle integration not yet implemented - requires DIA contract interface for symbol: {:?}",
                dia_symbol
            );
        }

        #[cfg(test)]
        {
            // Test stub - should not be called in test mode
            panic!(
                "fetch_dia_price should not be called in test builds - market_id: {}",
                market_id
            );
        }
    }

    /// Fetch price from Reflector oracle.
    ///
    /// # Arguments
    ///
    /// * `market_id` - The market identifier
    ///
    /// # Returns
    ///
    /// Tuple of (price, timestamp)
    pub fn fetch_reflector_price(env: Env, market_id: u32) -> (i128, u64) {
        #[cfg(not(test))]
        {
            let config_manager = get_config_manager(&env);
            let config_client = config_manager::Client::new(&env, &config_manager);
            let _reflector_address = config_client.reflector_oracle();

            let (_, reflector_symbol) = get_asset_symbol(&env, market_id);

            // TODO: Use sep-40-oracle crate for Reflector integration
            // This requires proper sep-40-oracle client setup
            // For now, panic with clear error message
            panic!(
                "Reflector oracle integration not yet implemented - requires sep-40-oracle setup for symbol: {:?}",
                reflector_symbol
            );
        }

        #[cfg(test)]
        {
            // Test stub - should not be called in test mode
            panic!(
                "fetch_reflector_price should not be called in test builds - market_id: {}",
                market_id
            );
        }
    }

    /// Validate a price feed for staleness and bounds.
    ///
    /// # Arguments
    ///
    /// * `price` - The price to validate
    /// * `timestamp` - The price timestamp
    /// * `min_price` - Minimum acceptable price
    /// * `max_price` - Maximum acceptable price
    ///
    /// # Returns
    ///
    /// True if price is valid, false otherwise
    pub fn validate_price(
        _env: Env,
        _price: i128,
        _timestamp: u64,
        _min_price: i128,
        _max_price: i128,
    ) -> bool {
        // TODO: Implement price validation
        // - Check timestamp is within staleness limit (60 seconds)
        // - Verify price is within min/max bounds
        // - Ensure price is positive and reasonable
        // - Return validation result
        true
    }

    /// Calculate median price from multiple oracle sources.
    ///
    /// # Arguments
    ///
    /// * `price1` - Price from first oracle
    /// * `price2` - Price from second oracle
    ///
    /// # Returns
    ///
    /// The median price (average of 2 prices)
    pub fn calculate_median(_env: Env, price1: i128, price2: i128) -> i128 {
        // With 2 oracles, median equals average
        // Use checked arithmetic to prevent overflow
        price1
            .checked_add(price2)
            .expect("price addition overflow")
            .checked_div(2)
            .expect("division error")
    }

    /// Check if price deviation between sources exceeds threshold.
    ///
    /// # Arguments
    ///
    /// * `prices` - Array of prices from different oracles
    /// * `threshold_bps` - Maximum allowed deviation in basis points
    ///
    /// # Returns
    ///
    /// True if deviation is acceptable, false if excessive
    pub fn check_price_deviation(_env: Env, _threshold_bps: u32) -> bool {
        // TODO: Implement deviation check
        // - Calculate max and min prices
        // - Calculate deviation percentage
        // - Compare against threshold
        // - Return result
        true
    }

    /// Get the health status of all oracle sources.
    ///
    /// # Returns
    ///
    /// Tuple of (pyth_healthy, dia_healthy, reflector_healthy)
    pub fn get_oracle_health(_env: Env) -> (bool, bool, bool) {
        // TODO: Implement oracle health check
        // - Check last successful update time for each oracle
        // - Verify oracles are responding
        // - Return health status for each
        (true, true, true)
    }

    /// Update the cached price for an asset.
    ///
    /// Called periodically by keeper bots to maintain fresh prices.
    ///
    /// # Arguments
    ///
    /// * `asset_id` - The asset identifier
    pub fn update_cached_price(_env: Env, _asset_id: u32) {
        // TODO: Implement price cache update
        // - Fetch fresh prices from all oracles
        // - Calculate and validate median
        // - Update temporary storage with new price
        // - Set TTL for cache entry (10-60 seconds)
        // - Emit price updated event
    }
}

#[cfg(test)]
mod test;
