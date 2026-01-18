use soroban_sdk::Env;

use crate::common::{assertions::*, position_manager, market_manager, setup::*};

#[test]
fn test_concurrent_position_opens() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);

    let market_id = 0u32; // XLM-PERP
    let collateral = 1_000_000_000u128; // 100 tokens
    let leverage = 10u32;

    // All 5 users open positions concurrently
    let mut position_ids = soroban_sdk::Vec::new(&env);
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        let position_id =
            position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);
        position_ids.push_back(position_id);
    }

    // Verify position IDs are sequential (starting from 1)
    for i in 0..5 {
        assert_eq!(position_ids.get(i).unwrap(), (i + 1) as u64);
    }

    // Verify each user has exactly 1 position tracked
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        assert_user_positions_tracked(&env, &position_client, &trader, 1);
    }

    // Verify total open interest
    let market_client = market_manager::Client::new(&env, &test_env.market_manager_id);
    let expected_oi = collateral * (leverage as u128) * 5;
    assert_market_oi(&env, &market_client, market_id, expected_oi, 0);
}

#[test]
fn test_concurrent_long_short_same_market() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let market_client = market_manager::Client::new(&env, &test_env.market_manager_id);

    let market_id = 0u32; // XLM-PERP
    let collateral = 1_000_000_000u128;
    let leverage = 10u32;

    // 3 users open longs
    let mut long_positions = soroban_sdk::Vec::new(&env);
    for i in 0..3 {
        let trader = test_env.traders.get(i).unwrap();
        let pos_id =
            position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);
        long_positions.push_back(pos_id);
    }

    // 2 users open shorts
    let mut short_positions = soroban_sdk::Vec::new(&env);
    for i in 3..5 {
        let trader = test_env.traders.get(i).unwrap();
        let pos_id =
            position_client.open_position(&trader, &market_id, &collateral, &leverage, &false);
        short_positions.push_back(pos_id);
    }

    // Verify OI is tracked separately for longs and shorts
    let expected_long_oi = collateral * (leverage as u128) * 3;
    let expected_short_oi = collateral * (leverage as u128) * 2;
    assert_market_oi(
        &env,
        &market_client,
        market_id,
        expected_long_oi,
        expected_short_oi,
    );

    // Verify each user's positions are tracked correctly
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        assert_user_positions_tracked(&env, &position_client, &trader, 1);
    }

    // Verify position IDs are sequential
    assert_eq!(long_positions.len(), 3);
    assert_eq!(short_positions.len(), 2);
}

#[test]
fn test_interleaved_open_close() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);

    let market_id = 0u32;
    let collateral = 1_000_000_000u128;
    let leverage = 10u32;

    // User 0 opens position
    let trader0 = test_env.traders.get(0).unwrap();
    let pos0 = position_client.open_position(&trader0, &market_id, &collateral, &leverage, &true);

    // User 1 opens position
    let trader1 = test_env.traders.get(1).unwrap();
    let pos1 = position_client.open_position(&trader1, &market_id, &collateral, &leverage, &true);

    // User 0 closes position
    position_client.close_position(&trader0, &pos0);

    // User 2 opens position
    let trader2 = test_env.traders.get(2).unwrap();
    let pos2 = position_client.open_position(&trader2, &market_id, &collateral, &leverage, &false);

    // User 1 closes position
    position_client.close_position(&trader1, &pos1);

    // Verify remaining positions
    assert_user_positions_tracked(&env, &position_client, &trader0, 0);
    assert_user_positions_tracked(&env, &position_client, &trader1, 0);
    assert_user_positions_tracked(&env, &position_client, &trader2, 1);

    // Close last position
    position_client.close_position(&trader2, &pos2);
    assert_user_positions_tracked(&env, &position_client, &trader2, 0);
}

#[test]
fn test_position_id_uniqueness() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);

    let market_id = 0u32;
    let collateral = 1_000_000_000u128;
    let leverage = 10u32;

    // Open 10 positions across different users
    let mut all_position_ids = soroban_sdk::Vec::new(&env);
    for i in 0..10 {
        let trader = test_env.traders.get(i % 5).unwrap(); // Cycle through 5 traders
        let pos_id =
            position_client.open_position(&trader, &market_id, &collateral, &leverage, &true);
        all_position_ids.push_back(pos_id);
    }

    // Verify all IDs are unique and sequential (starting from 1)
    for i in 0..10 {
        assert_eq!(all_position_ids.get(i).unwrap(), (i + 1) as u64);
    }

    // Verify position count per user
    // Users 0-4 should have 2 positions each (10 positions / 5 users)
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        assert_user_positions_tracked(&env, &position_client, &trader, 2);
    }
}

#[test]
fn test_concurrent_different_markets() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);
    let market_client = market_manager::Client::new(&env, &test_env.market_manager_id);

    let collateral = 1_000_000_000u128;
    let leverage = 10u32;

    // User 0: XLM-PERP
    let trader0 = test_env.traders.get(0).unwrap();
    position_client.open_position(&trader0, &0u32, &collateral, &leverage, &true);

    // User 1: BTC-PERP
    let trader1 = test_env.traders.get(1).unwrap();
    position_client.open_position(&trader1, &1u32, &collateral, &leverage, &true);

    // User 2: ETH-PERP
    let trader2 = test_env.traders.get(2).unwrap();
    position_client.open_position(&trader2, &2u32, &collateral, &leverage, &false);

    // User 3: XLM-PERP
    let trader3 = test_env.traders.get(3).unwrap();
    position_client.open_position(&trader3, &0u32, &collateral, &leverage, &false);

    // User 4: BTC-PERP
    let trader4 = test_env.traders.get(4).unwrap();
    position_client.open_position(&trader4, &1u32, &collateral, &leverage, &true);

    // Verify OI per market
    let expected_oi = collateral * (leverage as u128);

    // XLM: 1 long, 1 short
    assert_market_oi(&env, &market_client, 0u32, expected_oi, expected_oi);

    // BTC: 2 longs, 0 shorts
    assert_market_oi(&env, &market_client, 1u32, expected_oi * 2, 0);

    // ETH: 0 longs, 1 short
    assert_market_oi(&env, &market_client, 2u32, 0, expected_oi);

    // Verify each user has 1 position
    for i in 0..5 {
        let trader = test_env.traders.get(i).unwrap();
        assert_user_positions_tracked(&env, &position_client, &trader, 1);
    }
}
