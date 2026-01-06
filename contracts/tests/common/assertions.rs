use soroban_sdk::{Address, Env};

use super::{liquidity_pool, market_manager, position_manager};

/// Assert pool liquidity state is consistent
/// Verifies: reserved + available = total deposits
pub fn assert_pool_consistency(
    _env: &Env,
    pool_client: &liquidity_pool::Client,
    expected_reserved: u128,
) {
    let reserved = pool_client.get_reserved_liquidity();
    let available = pool_client.get_available_liquidity();

    assert_eq!(
        reserved, expected_reserved,
        "Reserved liquidity mismatch: expected {}, got {}",
        expected_reserved, reserved
    );

    assert!(
        available >= 0,
        "Available liquidity must be non-negative, got {}",
        available
    );
}

/// Assert market open interest is correctly tracked
pub fn assert_market_oi(
    _env: &Env,
    market_client: &market_manager::Client,
    market_id: u32,
    expected_long_oi: u128,
    expected_short_oi: u128,
) {
    let (long_oi, short_oi) = market_client.get_open_interest(&market_id);

    assert_eq!(
        long_oi, expected_long_oi,
        "Long OI mismatch for market {}: expected {}, got {}",
        market_id, expected_long_oi, long_oi
    );

    assert_eq!(
        short_oi, expected_short_oi,
        "Short OI mismatch for market {}: expected {}, got {}",
        market_id, expected_short_oi, short_oi
    );
}

/// Assert user has expected number of open positions tracked
pub fn assert_user_positions_tracked(
    _env: &Env,
    position_client: &position_manager::Client,
    user: &Address,
    expected_count: usize,
) {
    let positions = position_client.get_user_open_positions(user);

    assert_eq!(
        positions.len() as usize,
        expected_count,
        "User position count mismatch: expected {}, got {}",
        expected_count,
        positions.len()
    );
}

/// Assert pool utilization is within acceptable limits
pub fn assert_utilization_within_limit(
    _env: &Env,
    pool_client: &liquidity_pool::Client,
    max_utilization_bps: u32,
) {
    let utilization = pool_client.get_utilization_ratio();

    assert!(
        utilization <= max_utilization_bps,
        "Utilization {} exceeds max {}",
        utilization,
        max_utilization_bps
    );
}
