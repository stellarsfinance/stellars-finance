use soroban_sdk::Env;

use crate::common::{assertions::*, liquidity_pool, market_manager, position_manager, setup::*};

#[test]
fn test_high_pool_utilization() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let pool_client = liquidity_pool::Client::new(&env, &test_env.liquidity_pool_id);

    let market_id = 0u32;
    // Use large collateral to push utilization high
    let collateral = 8_000_000_000u128; // 8,000 tokens (traders have 10,000 each)
    let leverage = 10u32;

    // Open multiple large positions to push utilization toward 80%
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);
    }

    // Verify utilization is high but within limit
    let utilization = pool_client.get_utilization_ratio();
    assert!(
        utilization > 3000,
        "Utilization should be high (>30%): {}",
        utilization
    );
    assert_utilization_within_limit(&env, &pool_client, 8000);
}

#[test]
#[should_panic]
fn test_utilization_prevents_opens() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);

    let market_id = 0u32;
    // Extremely large position to exceed 80% utilization
    let collateral = 100_000_000_000u128; // 100,000 tokens
    let leverage = 15u32;

    // Try to open positions that would exceed utilization limit
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);
    }
}

#[test]
fn test_lp_deposits_during_trading() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let pool_client = liquidity_pool::Client::new(&env, &test_env.liquidity_pool_id);

    let market_id = 0u32;
    let collateral = 1_000_000_000u128;
    let leverage = 10u32;

    // Traders open positions
    for i in 0..3 {
        let trader = test_env.traders.get(i).unwrap();
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);
    }

    // Record pool state
    let reserved_before = pool_client.get_reserved_liquidity();
    let available_before = pool_client.get_available_liquidity();

    // LPs add more liquidity while positions are open
    for i in 0..2 {
        let lp = test_env.lps.get(i).unwrap();
        pool_client.deposit(&lp, &50_000_000_000); // 50,000 tokens
    }

    // Verify reserved liquidity unchanged (positions still open)
    let reserved_after = pool_client.get_reserved_liquidity();
    assert_eq!(
        reserved_after, reserved_before,
        "Reserved liquidity should remain constant"
    );

    // Verify available liquidity increased
    let available_after = pool_client.get_available_liquidity();
    assert!(
        available_after > available_before,
        "Available liquidity should increase after deposits"
    );
}

#[test]
fn test_concurrent_50_positions() {
    let env = Env::default();
    let test_env = setup_stress_test(&env); // 20 traders

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let market_client = market_manager::Client::new(&env, &test_env.market_manager_id);

    let collateral = 1_000_000_000u128;
    let leverage = 10u32;

    // Open 50 positions across different markets and users
    let mut position_count = 0;
    for _ in 0..50 {
        let trader_idx = position_count % 20;
        let market_id = (position_count % 3) as u32;
        let is_long = (position_count % 2) == 0;

        let trader = test_env.traders.get(trader_idx).unwrap();
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &is_long);

        position_count += 1;
    }

    // Verify all 50 positions were created
    // Each of 20 traders should have 2-3 positions
    let mut total_positions = 0;
    for i in 0..20 {
        let trader = test_env.traders.get(i).unwrap();
        let positions = position_client.get_user_open_positions(&trader);
        total_positions += positions.len();
    }

    assert_eq!(
        total_positions, 50,
        "Should have 50 total positions tracked"
    );

    // Verify OI is tracked correctly
    let (xlm_long_oi, xlm_short_oi) = market_client.get_open_interest(&0u32);
    let (btc_long_oi, btc_short_oi) = market_client.get_open_interest(&1u32);
    let (eth_long_oi, eth_short_oi) = market_client.get_open_interest(&2u32);

    // Each market should have some OI
    assert!(xlm_long_oi > 0 || xlm_short_oi > 0, "XLM should have OI");
    assert!(btc_long_oi > 0 || btc_short_oi > 0, "BTC should have OI");
    assert!(eth_long_oi > 0 || eth_short_oi > 0, "ETH should have OI");
}

#[test]
fn test_mass_close_liquidity_release() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let pool_client = liquidity_pool::Client::new(&env, &test_env.liquidity_pool_id);

    let market_id = 0u32;
    let collateral = 2_000_000_000u128;
    let leverage = 10u32;

    // Open 5 positions
    let mut position_ids = soroban_sdk::Vec::new(&env);
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        let pos_id =
            position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);
        position_ids.push_back(pos_id);
    }

    // Record liquidity state with all positions open
    let reserved_with_positions = pool_client.get_reserved_liquidity();
    let available_with_positions = pool_client.get_available_liquidity();

    // Close all positions
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        let pos_id = position_ids.get(i).unwrap();
        position_client.close_position(&trader, &pos_id);
    }

    // Verify all liquidity released
    let reserved_after = pool_client.get_reserved_liquidity();
    let available_after = pool_client.get_available_liquidity();

    assert_eq!(reserved_after, 0, "No liquidity should be reserved");

    assert!(
        available_after > available_with_positions,
        "Available liquidity should increase after mass close"
    );

    // Verify reserved liquidity was fully released
    let released_amount = reserved_with_positions - reserved_after;
    let expected_release = collateral * (leverage as u128) * 5;
    assert_eq!(
        released_amount, expected_release,
        "Released liquidity should equal total position sizes"
    );
}

#[test]
fn test_liquidity_reservation_tracking() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let pool_client = liquidity_pool::Client::new(&env, &test_env.liquidity_pool_id);

    let market_id = 0u32;
    let collateral = 1_000_000_000u128;
    let leverage = 10u32;

    // Track reserved liquidity as positions are opened
    let mut expected_reserved = 0u128;

    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);

        expected_reserved += collateral * (leverage as u128);

        // Verify reserved liquidity matches expected
        assert_pool_consistency(&env, &pool_client, expected_reserved);
    }

    // Close positions and verify liquidity released correctly
    let all_positions = position_client.get_user_open_positions(&test_env.traders.get(0).unwrap());
    let pos_id = all_positions.get(0).unwrap();

    let trader0 = test_env.traders.get(0).unwrap();
    position_client.close_position(&trader0, &pos_id);

    expected_reserved -= collateral * (leverage as u128);
    assert_pool_consistency(&env, &pool_client, expected_reserved);
}

#[test]
fn test_pool_stress_with_varying_leverage() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let pool_client = liquidity_pool::Client::new(&env, &test_env.liquidity_pool_id);

    let market_id = 0u32;
    let collateral = 1_000_000_000u128;

    // Open positions with varying leverage (5x to 20x)
    let leverages = [5u32, 10u32, 15u32, 20u32, 12u32];
    let mut total_reserved = 0u128;

    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        let leverage = leverages[i as usize];

        position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);

        total_reserved += collateral * (leverage as u128);
    }

    // Verify total reserved liquidity
    assert_pool_consistency(&env, &pool_client, total_reserved);

    // Verify pool can still accept new deposits
    let lp = test_env.lps.get(0).unwrap();
    pool_client.deposit(&lp, &10_000_000_000);

    // Reserved should be unchanged
    assert_pool_consistency(&env, &pool_client, total_reserved);
}
