use soroban_sdk::Env;

use crate::common::{assertions::*, liquidity_pool, market_manager, position_manager, setup::*, time_helpers::*};

#[test]
fn test_liquidation_with_funding_payments() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let market_client = market_manager::Client::new(&env, &test_env.market_manager_id);
    let pool_client = liquidity_pool::Client::new(&env, &test_env.liquidity_pool_id);

    let market_id = 0u32;
    let collateral = 1_000_000_000u128; // 100 tokens
    let leverage = 20u32; // Max leverage

    // Trader opens highly leveraged long position
    let trader = test_env.traders.get(0).unwrap();
    let keeper = test_env.traders.get(1).unwrap();

    let position_id =
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);

    // Create imbalanced market (more longs) to trigger funding against this position
    for i in 2..5 {
        let other_trader = test_env.traders.get(i).unwrap();
        position_client.open_position(&other_trader, &market_id, &collateral, &leverage, &true);
    }

    // Get initial reserved liquidity
    let initial_reserved = pool_client.get_reserved_liquidity();

    // Simulate time passing: 10000 funding intervals to accumulate enough funding fees
    advance_funding_intervals(&env, 10000);
    market_client.update_funding_rate(&test_env.admin, &market_id);

    // Get position state before liquidation
    let position_before = position_client.get_position(&position_id);
    let position_size = position_before.size;

    // Record keeper balance before liquidation
    let keeper_balance_before = test_env.token_client.balance(&keeper);

    // Keeper liquidates position
    let keeper_reward = position_client.liquidate_position(&keeper, &position_id);

    // Verify keeper received reward
    assert!(keeper_reward > 0, "Keeper should receive liquidation reward");

    // Verify keeper balance increased
    let keeper_balance_after = test_env.token_client.balance(&keeper);
    assert_eq!(
        keeper_balance_after,
        keeper_balance_before + (keeper_reward as i128),
        "Keeper balance should increase by reward amount"
    );

    // Verify OI decreased by liquidated position size
    let (long_oi_after, _) = market_client.get_open_interest(&market_id);
    let expected_remaining_oi = position_size * 3; // 3 remaining positions
    assert_eq!(
        long_oi_after, expected_remaining_oi,
        "OI should decrease by liquidated position size"
    );

    // Verify liquidity was released
    let final_reserved = pool_client.get_reserved_liquidity();
    assert!(
        final_reserved < initial_reserved,
        "Reserved liquidity should decrease after liquidation"
    );

    // Verify trader no longer has this position
    assert_user_positions_tracked(&env, &position_client, &trader, 0);
}

#[test]
#[should_panic]
fn test_cannot_liquidate_healthy_position() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);

    let market_id = 0u32;
    let collateral = 1_000_000_000u128;
    let leverage = 5u32; // Low leverage - very safe

    // Trader opens conservative position
    let trader = test_env.traders.get(0).unwrap();
    let keeper = test_env.traders.get(1).unwrap();

    let position_id =
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);

    // Try to liquidate immediately (should fail - position is healthy)
    position_client.liquidate_position(&keeper, &position_id);
}

#[test]
fn test_multiple_concurrent_liquidations() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let market_client = market_manager::Client::new(&env, &test_env.market_manager_id);

    let market_id = 0u32;
    let collateral = 1_000_000_000u128;
    let leverage = 20u32;

    // Open 4 highly leveraged positions
    let mut position_ids = soroban_sdk::Vec::new(&env);
    for i in 0..4 {
        let trader = test_env.traders.get(i).unwrap();
        let pos_id =
            position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);
        position_ids.push_back(pos_id);
    }

    // Create one more long to make market imbalanced
    let extra_trader = test_env.traders.get(4).unwrap();
    position_client.open_position(&extra_trader, &market_id, &collateral, &leverage, &true);

    // Simulate time to make positions liquidatable
    advance_funding_intervals(&env, 10000);
    market_client.update_funding_rate(&test_env.admin, &market_id);

    // Keeper liquidates all 4 positions
    let keeper = test_env.lps.get(0).unwrap();
    let mut total_rewards = 0u128;

    for i in 0..4 {
        let pos_id = position_ids.get(i).unwrap();
        let reward = position_client.liquidate_position(&keeper, &pos_id);
        total_rewards += reward;
    }

    // Verify keeper received cumulative rewards
    assert!(
        total_rewards > 0,
        "Keeper should receive rewards for all liquidations"
    );

    // Verify all traders have 0 positions
    for i in 0..4 {
        let trader = test_env.traders.get(i).unwrap();
        assert_user_positions_tracked(&env, &position_client, &trader, 0);
    }

    // Verify OI only includes the extra position
    let (long_oi_after, _) = market_client.get_open_interest(&market_id);
    let expected_oi = collateral * (leverage as u128);
    assert_eq!(
        long_oi_after, expected_oi,
        "Only extra position should remain in OI"
    );
}

#[test]
fn test_liquidation_releases_liquidity() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let market_client = market_manager::Client::new(&env, &test_env.market_manager_id);
    let pool_client = liquidity_pool::Client::new(&env, &test_env.liquidity_pool_id);

    let market_id = 0u32;
    let collateral = 1_000_000_000u128;
    let leverage = 20u32;

    // Open position
    let trader = test_env.traders.get(0).unwrap();
    let keeper = test_env.traders.get(1).unwrap();

    let position_id =
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);

    // Create imbalance
    for i in 2..5 {
        let other = test_env.traders.get(i).unwrap();
        position_client.open_position(&other, &market_id, &collateral, &leverage, &true);
    }

    let position = position_client.get_position(&position_id);
    let position_size = position.size;

    // Record liquidity state
    let reserved_before = pool_client.get_reserved_liquidity();
    let available_before = pool_client.get_available_liquidity();

    // Simulate time to make liquidatable
    advance_funding_intervals(&env, 10000);
    market_client.update_funding_rate(&test_env.admin, &market_id);

    // Liquidate
    position_client.liquidate_position(&keeper, &position_id);

    // Verify liquidity released
    let reserved_after = pool_client.get_reserved_liquidity();
    let available_after = pool_client.get_available_liquidity();

    assert_eq!(
        reserved_before - reserved_after,
        position_size,
        "Reserved liquidity should decrease by position size"
    );

    assert!(
        available_after > available_before,
        "Available liquidity should increase after liquidation"
    );
}

#[test]
fn test_liquidation_oi_tracking() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let market_client = market_manager::Client::new(&env, &test_env.market_manager_id);

    let market_id = 0u32;
    let collateral = 1_000_000_000u128;
    let leverage = 20u32;

    // Open 3 long positions (will pay funding and become liquidatable)
    let mut long_ids = soroban_sdk::Vec::new(&env);
    for i in 0..3 {
        let trader = test_env.traders.get(i).unwrap();
        let pos_id =
            position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);
        long_ids.push_back(pos_id);
    }

    // Open 2 short positions (will receive funding - not liquidatable in this setup)
    for i in 3..5 {
        let trader = test_env.traders.get(i).unwrap();
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &false);
    }

    let initial_long_oi = collateral * (leverage as u128) * 3;
    let initial_short_oi = collateral * (leverage as u128) * 2;

    // Verify initial OI
    assert_market_oi(&env, &market_client, market_id, initial_long_oi, initial_short_oi);

    // Make long positions liquidatable (longs pay funding to shorts in this imbalanced market)
    advance_funding_intervals(&env, 10000);
    market_client.update_funding_rate(&test_env.admin, &market_id);

    // Liquidate first long position
    let keeper = test_env.lps.get(0).unwrap();
    position_client.liquidate_position(&keeper, &long_ids.get(0).unwrap());

    // Verify long OI decreased
    let expected_long_oi_after_first = collateral * (leverage as u128) * 2;
    assert_market_oi(
        &env,
        &market_client,
        market_id,
        expected_long_oi_after_first,
        initial_short_oi,
    );

    // Liquidate second long position
    position_client.liquidate_position(&keeper, &long_ids.get(1).unwrap());

    // Verify long OI decreased again
    let expected_long_oi_after_second = collateral * (leverage as u128);
    assert_market_oi(&env, &market_client, market_id, expected_long_oi_after_second, initial_short_oi);
}
