#![cfg(test)]

mod common;
mod scenarios;

use soroban_sdk::Env;

use common::{assertions::*, liquidity_pool, market_manager, position_manager, setup::*, time_helpers::*};

#[test]
fn test_full_trading_lifecycle_5_users() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let market_client = market_manager::Client::new(&env, &test_env.market_manager_id);
    let pool_client = liquidity_pool::Client::new(&env, &test_env.liquidity_pool_id);

    let market_id = 0u32;
    let collateral = 2_000_000_000u128;
    let leverage = 15u32;

    // Phase 1: All 5 users open positions
    let mut position_ids = soroban_sdk::Vec::new(&env);
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        let is_long = (i % 2) == 0; // Alternate long/short

        let pos_id =
            position_client.open_position(&trader, &market_id, &collateral, &leverage, &is_long);
        position_ids.push_back(pos_id);
    }

    // Verify all positions opened
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        assert_user_positions_tracked(&env, &position_client, &trader, 1);
    }

    // Phase 2: Simulate 1 hour with funding updates
    for _ in 0..60 {
        advance_funding_interval(&env);
        market_client.update_funding_rate(&test_env.admin, &market_id);
    }

    // Phase 3: Users close some positions
    for i in 0..2 {
        let trader = test_env.traders.get(i).unwrap();
        let pos_id = position_ids.get(i).unwrap();
        position_client.close_position(&trader, &pos_id);
    }

    // Verify partial closes
    assert_user_positions_tracked(&env, &position_client, &test_env.traders.get(0).unwrap(), 0);
    assert_user_positions_tracked(&env, &position_client, &test_env.traders.get(1).unwrap(), 0);
    assert_user_positions_tracked(&env, &position_client, &test_env.traders.get(2).unwrap(), 1);

    // Phase 4: Remaining users close positions
    for i in 2..5 {
        let trader = test_env.traders.get(i).unwrap();
        let pos_id = position_ids.get(i).unwrap();
        position_client.close_position(&trader, &pos_id);
    }

    // Phase 5: Verify final state consistency
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        assert_user_positions_tracked(&env, &position_client, &trader, 0);
    }

    // Verify all liquidity released
    let final_reserved = pool_client.get_reserved_liquidity();
    assert_eq!(final_reserved, 0, "All liquidity should be released");

    // Verify OI is zero
    let (long_oi, short_oi) = market_client.get_open_interest(&market_id);
    assert_eq!(long_oi, 0, "Long OI should be zero");
    assert_eq!(short_oi, 0, "Short OI should be zero");
}

#[test]
fn test_multi_market_concurrent_trading() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let market_client = market_manager::Client::new(&env, &test_env.market_manager_id);

    let collateral = 1_000_000_000u128;
    let leverage = 10u32;

    // Each user trades a different market
    let markets = [0u32, 1u32, 2u32, 0u32, 1u32];

    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        let market_id = markets[i as usize];
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);
    }

    // Verify OI per market
    let expected_oi = collateral * (leverage as u128);

    // XLM (market 0): 2 positions
    let (xlm_long_oi, _) = market_client.get_open_interest(&0u32);
    assert_eq!(xlm_long_oi, expected_oi * 2, "XLM should have 2 positions");

    // BTC (market 1): 2 positions
    let (btc_long_oi, _) = market_client.get_open_interest(&1u32);
    assert_eq!(btc_long_oi, expected_oi * 2, "BTC should have 2 positions");

    // ETH (market 2): 1 position
    let (eth_long_oi, _) = market_client.get_open_interest(&2u32);
    assert_eq!(eth_long_oi, expected_oi, "ETH should have 1 position");

    // Close all positions
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        let user_positions = position_client.get_user_open_positions(&trader);
        let pos_id = user_positions.get(0).unwrap();
        position_client.close_position(&trader, &pos_id);
    }

    // Verify all markets have zero OI
    for market_id in 0..3 {
        let (long_oi, short_oi) = market_client.get_open_interest(&market_id);
        assert_eq!(long_oi, 0, "Market {} long OI should be zero", market_id);
        assert_eq!(short_oi, 0, "Market {} short OI should be zero", market_id);
    }
}

#[test]
fn test_stress_concurrent_operations_20_users() {
    let env = Env::default();
    let test_env = setup_stress_test(&env); // 20 traders

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let pool_client = liquidity_pool::Client::new(&env, &test_env.liquidity_pool_id);

    let collateral = 1_000_000_000u128;
    let leverage = 10u32;

    // Phase 1: Open 40 positions across 20 users
    for _ in 0..2 {
        for i in 0..20 {
            let trader = test_env.traders.get(i).unwrap();
            let market_id = (i % 3) as u32;
            let is_long = (i % 2) == 0;

            position_client.open_position(&trader, &market_id, &collateral, &leverage, &is_long);
        }
    }

    // Verify all users have 2 positions
    for i in 0..20 {
        let trader = test_env.traders.get(i).unwrap();
        assert_user_positions_tracked(&env, &position_client, &trader, 2);
    }

    // Phase 2: Close first position for each user
    for i in 0..20 {
        let trader = test_env.traders.get(i).unwrap();
        let user_positions = position_client.get_user_open_positions(&trader);
        let pos_id = user_positions.get(0).unwrap();
        position_client.close_position(&trader, &pos_id);
    }

    // Verify all users have 1 position
    for i in 0..20 {
        let trader = test_env.traders.get(i).unwrap();
        assert_user_positions_tracked(&env, &position_client, &trader, 1);
    }

    // Phase 3: Close remaining positions
    for i in 0..20 {
        let trader = test_env.traders.get(i).unwrap();
        let user_positions = position_client.get_user_open_positions(&trader);
        let pos_id = user_positions.get(0).unwrap();
        position_client.close_position(&trader, &pos_id);
    }

    // Verify final state
    for i in 0..20 {
        let trader = test_env.traders.get(i).unwrap();
        assert_user_positions_tracked(&env, &position_client, &trader, 0);
    }

    // Verify all liquidity released
    let final_reserved = pool_client.get_reserved_liquidity();
    assert_eq!(final_reserved, 0, "All liquidity should be released");
}

// TODO: Fix funding rate accumulation - currently cumulative funding stays at 0
#[test]
#[ignore]
fn test_liquidation_and_trading_workflow() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let market_client = market_manager::Client::new(&env, &test_env.market_manager_id);

    let market_id = 0u32;
    let collateral = 1_000_000_000u128;
    let high_leverage = 20u32;
    let safe_leverage = 5u32;

    // User 0: Opens highly leveraged position (will be liquidated)
    let risky_trader = test_env.traders.get(0).unwrap();
    let risky_pos_id = position_client.open_position(
        &risky_trader,
        &market_id,
        &collateral,
        &high_leverage,
        &true,
    );

    // Users 1-3: Open safe positions
    for i in 1..4 {
        let trader = test_env.traders.get(i).unwrap();
        position_client.open_position(&trader, &market_id, &collateral, &safe_leverage, &true);
    }

    // Create imbalance for funding
    let extra_trader = test_env.traders.get(4).unwrap();
    position_client.open_position(&extra_trader, &market_id, &collateral, &high_leverage, &true);

    // Simulate time to make risky position liquidatable
    for _ in 0..10000 {
        advance_funding_interval(&env);
        market_client.update_funding_rate(&test_env.admin, &market_id);
    }

    // Keeper liquidates the risky position
    let keeper = test_env.lps.get(0).unwrap();
    let reward = position_client.liquidate_position(&keeper, &risky_pos_id);
    assert!(reward > 0, "Keeper should receive reward");

    // Verify risky trader has no positions
    assert_user_positions_tracked(&env, &position_client, &risky_trader, 0);

    // Safe traders close their positions normally
    for i in 1..4 {
        let trader = test_env.traders.get(i).unwrap();
        let user_positions = position_client.get_user_open_positions(&trader);
        let pos_id = user_positions.get(0).unwrap();
        position_client.close_position(&trader, &pos_id);
    }

    // Extra trader closes position
    let extra_positions = position_client.get_user_open_positions(&extra_trader);
    let extra_pos_id = extra_positions.get(0).unwrap();
    position_client.close_position(&extra_trader, &extra_pos_id);

    // Verify final state
    let (final_long_oi, final_short_oi) = market_client.get_open_interest(&market_id);
    assert_eq!(final_long_oi, 0, "All positions should be closed");
    assert_eq!(final_short_oi, 0, "All positions should be closed");
}

#[test]
fn test_lp_operations_during_trading() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let pool_client = liquidity_pool::Client::new(&env, &test_env.liquidity_pool_id);

    let market_id = 0u32;
    let collateral = 1_000_000_000u128;
    let leverage = 10u32;

    // Phase 1: Traders open positions
    for i in 0..3 {
        let trader = test_env.traders.get(i).unwrap();
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);
    }

    let initial_available = pool_client.get_available_liquidity();

    // Phase 2: LPs add liquidity
    for i in 0..2 {
        let lp = test_env.lps.get(i).unwrap();
        pool_client.deposit(&lp, &50_000_000_000); // 50,000 tokens
    }

    let after_deposit_available = pool_client.get_available_liquidity();
    assert!(
        after_deposit_available > initial_available,
        "Available liquidity should increase"
    );

    // Phase 3: More traders open positions with increased liquidity
    for i in 3..5 {
        let trader = test_env.traders.get(i).unwrap();
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);
    }

    // Phase 4: Traders close positions
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        let user_positions = position_client.get_user_open_positions(&trader);
        let pos_id = user_positions.get(0).unwrap();
        position_client.close_position(&trader, &pos_id);
    }

    // Verify no reserved liquidity
    let final_reserved = pool_client.get_reserved_liquidity();
    assert_eq!(final_reserved, 0, "No liquidity should be reserved");
}
