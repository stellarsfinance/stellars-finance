#![cfg(test)]

use super::*;
use soroban_sdk::log;
use soroban_sdk::{testutils::Address as _, token, Address, Env, Map};

// Import the actual contracts for integration testing
use crate::config_manager;
use crate::liquidity_pool;
use crate::market_manager;
use crate::oracle_integrator;

/// Helper to create a token contract for testing
fn create_token_contract<'a>(
    env: &'a Env,
    admin: &Address,
) -> (token::Client<'a>, token::StellarAssetClient<'a>) {
    let contract_address = env.register_stellar_asset_contract_v2(admin.clone());
    (
        token::Client::new(env, &contract_address.address()),
        token::StellarAssetClient::new(env, &contract_address.address()),
    )
}

/// Helper to set up the full test environment with all contracts
fn setup_test_environment<'a>(
    env: &'a Env,
) -> (
    Address,                       // config_manager_id
    Address,                       // oracle_id
    Address,                       // position_manager_id
    Address,                       // token_address
    token::Client<'a>,             // token_client
    token::StellarAssetClient<'a>, // token_admin
    Address,                       // admin
    Address,                       // trader
    Address,                       // liquidity pool
) {
    env.mock_all_auths();

    let admin = Address::generate(env);
    let trader = Address::generate(env);

    // Create token contract
    let (token_client, token_admin) = create_token_contract(env, &admin);

    // Deploy ConfigManager
    let config_manager_id = env.register(config_manager::WASM, ());
    let config_client = config_manager::Client::new(env, &config_manager_id);
    config_client.initialize(&admin);

    // Deploy OracleIntegrator
    let oracle_id = env.register(oracle_integrator::WASM, ());
    let oracle_client = oracle_integrator::Client::new(env, &oracle_id);
    oracle_client.initialize(&config_manager_id);

    // Enable test mode with base prices for simulated oracle
    let mut base_prices = Map::new(env);
    base_prices.set(0u32, 100_000_000i128);  // XLM: $1.00
    base_prices.set(1u32, 50_000_000_000i128); // BTC: $50,000
    base_prices.set(2u32, 3_000_000_000i128);  // ETH: $3,000
    oracle_client.set_test_mode(&admin, &true, &base_prices);

    // Deploy MarketManager
    let market_manager_id = env.register(market_manager::WASM, ());
    let market_client = market_manager::Client::new(env, &market_manager_id);
    market_client.initialize(&config_manager_id, &admin);

    // Deploy LiquidityPool
    let liquidity_pool_id = env.register(liquidity_pool::WASM, ());
    let liquidity_client = liquidity_pool::Client::new(env, &liquidity_pool_id);
    liquidity_client.initialize(&admin, &config_manager_id, &token_client.address);

    // Deploy PositionManager
    let position_manager_id = env.register(PositionManager, ());
    let position_client = PositionManagerClient::new(env, &position_manager_id);
    position_client.initialize(&admin, &config_manager_id);

    // Configure ConfigManager with contract addresses
    config_client.set_oracle_integrator(&admin, &oracle_id);
    config_client.set_market_manager(&admin, &market_manager_id);
    config_client.set_liquidity_pool(&admin, &liquidity_pool_id);
    config_client.set_position_manager(&admin, &position_manager_id);
    config_client.set_token(&admin, &token_client.address);

    // Set PositionManager in MarketManager (for authorization)
    market_client.set_position_manager(&admin, &position_manager_id);

    // Set PositionManager in LiquidityPool (for authorization)
    liquidity_client.set_position_manager(&admin, &position_manager_id);

    // Create test markets
    market_client.create_market(&admin, &0u32, &1_000_000_000_000u128, &10000i128); // XLM-PERP
    market_client.create_market(&admin, &1u32, &1_000_000_000_000u128, &10000i128); // BTC-PERP
    market_client.create_market(&admin, &2u32, &1_000_000_000_000u128, &10000i128); // ETH-PERP

    // Mint tokens to trader for testing
    token_admin.mint(&trader, &10_000_000_000); // 10,000 tokens with 7 decimals

    // Also deposit some initial liquidity to the pool
    token_admin.mint(&admin, &100_000_000_000); // 100,000 tokens for initial liquidity
    liquidity_client.deposit(&admin, &100_000_000_000);

    (
        config_manager_id,
        oracle_id,
        position_manager_id,
        token_client.address.clone(),
        token_client,
        token_admin,
        admin,
        trader,
        liquidity_pool_id,
    )
}

#[test]
fn test_contract_initialization() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let config_manager = Address::generate(&env);

    let contract_id = env.register(PositionManager, ());
    let client = PositionManagerClient::new(&env, &contract_id);

    // Initialize the contract
    client.initialize(&admin, &config_manager);

    // Contract successfully initialized
}

#[test]
fn test_open_position_success() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    let initial_balance = token_client.balance(&trader);
    let initial_contract_balance = token_client.balance(&liquidity_pool_id);

    // Open a position
    let market_id = 0u32; // XLM-PERP
    let collateral = 1_000_000_000u128; // 100 tokens (with 7 decimals)
    let leverage = 10u32;
    let is_long = true;

    let position_id =
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &is_long);

    // Verify position ID is 0 (first position)
    assert_eq!(position_id, 0);

    // Verify collateral was transferred
    let new_balance = token_client.balance(&trader);
    assert_eq!(new_balance as u128, (initial_balance as u128) - collateral);

    // Verify colleteral exisits on liquidity pool

    // Verify liquidity contract received collateral
    let final_contract_balance = token_client.balance(&liquidity_pool_id);
    assert_eq!(
        (final_contract_balance - initial_contract_balance) as u128,
        collateral
    );

    // Verify position was stored correctly
    let position = position_client.get_position(&position_id);
    assert_eq!(position.trader, trader);
    assert_eq!(position.collateral, collateral);
    assert_eq!(position.size, collateral * (leverage as u128)); // size = collateral * leverage
    assert_eq!(position.is_long, is_long);
    assert_eq!(position.entry_price, 100_000_000); // Mock oracle price
}

#[test]
fn test_close_position_success() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Open a position first
    let market_id = 0u32;
    let collateral = 1_000_000_000u128;
    let leverage = 10u32;
    let is_long = true;

    let position_id =
        position_client.open_position(&trader, &market_id, &collateral, &leverage, &is_long);

    let balance_after_open = token_client.balance(&trader);

    // Close the position
    let pnl = position_client.close_position(&trader, &position_id);

    // Verify PnL is 0 (MVP - no price changes)
    assert_eq!(pnl, 0);

    // Verify collateral was returned
    let final_balance = token_client.balance(&trader);
    assert_eq!(
        final_balance as u128,
        (balance_after_open as u128) + collateral
    );

    // Verify contract balance is 0
    let contract_balance = token_client.balance(&position_manager_id);
    assert_eq!(contract_balance as u128, 0);
}

#[test]
fn test_multiple_positions() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Open multiple positions
    let pos1 = position_client.open_position(&trader, &0u32, &1_000_000_000u128, &10u32, &true);

    let pos2 = position_client.open_position(&trader, &1u32, &2_000_000_000u128, &10u32, &false);

    let pos3 = position_client.open_position(&trader, &2u32, &500_000_000u128, &10u32, &true);

    // Verify position IDs are sequential
    assert_eq!(pos1, 0);
    assert_eq!(pos2, 1);
    assert_eq!(pos3, 2);

    // Verify each position is stored correctly
    let position1 = position_client.get_position(&pos1);
    assert_eq!(position1.collateral, 1_000_000_000);
    assert_eq!(position1.is_long, true);

    let position2 = position_client.get_position(&pos2);
    assert_eq!(position2.collateral, 2_000_000_000);
    assert_eq!(position2.is_long, false);

    let position3 = position_client.get_position(&pos3);
    assert_eq!(position3.collateral, 500_000_000);
    assert_eq!(position3.is_long, true);

    // Verify total collateral in liquidity pool (collateral is held by pool, not position manager)
    let total_collateral: u128 = 1_000_000_000 + 2_000_000_000 + 500_000_000;
    let initial_pool_balance = 100_000_000_000u128; // Initial liquidity deposited in setup
    let pool_balance = token_client.balance(&liquidity_pool_id);
    assert_eq!(
        pool_balance as u128,
        initial_pool_balance + total_collateral
    );

    // Close middle position
    position_client.close_position(&trader, &pos2);

    // Verify collateral was returned for pos2
    let pool_balance_after_close = token_client.balance(&liquidity_pool_id);
    assert_eq!(
        pool_balance_after_close as u128,
        initial_pool_balance + total_collateral - 2_000_000_000
    );
}

#[test]
fn test_open_and_close_full_workflow() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    let initial_balance = token_client.balance(&trader);

    // Open position
    let position_id =
        position_client.open_position(&trader, &0u32, &1_000_000_000u128, &10u32, &true);

    // Close position
    let pnl = position_client.close_position(&trader, &position_id);

    // Verify final balance is the same as initial (no fees, no PnL)
    let final_balance = token_client.balance(&trader);
    assert_eq!(final_balance as u128, initial_balance as u128);
    assert_eq!(pnl, 0);
}

#[test]
#[should_panic(expected = "Collateral must be positive")]
fn test_open_position_zero_collateral() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        _token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Try to open position with zero collateral
    position_client.open_position(&trader, &0u32, &0u128, &10u32, &true);
}

#[test]
#[should_panic(expected = "Leverage must be positive")]
fn test_open_position_zero_leverage() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        _token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Try to open position with zero leverage
    position_client.open_position(&trader, &0u32, &1_000_000_000u128, &0u32, &true);
}

#[test]
#[should_panic(expected = "Position not found")]
fn test_get_nonexistent_position() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        _token_client,
        _token_admin,
        _admin,
        _trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Try to get a position that doesn't exist
    position_client.get_position(&999u64);
}

#[test]
#[should_panic(expected = "Unauthorized: caller does not own this position")]
fn test_close_position_unauthorized() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        _token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Trader opens a position
    let position_id =
        position_client.open_position(&trader, &0u32, &1_000_000_000u128, &10u32, &true);

    // Different user tries to close it
    let other_user = Address::generate(&env);
    position_client.close_position(&other_user, &position_id);
}

#[test]
#[should_panic(expected = "Leverage too low")]
fn test_open_position_leverage_too_low() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        _token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Try to open position with leverage = 4 (below min of 5)
    position_client.open_position(&trader, &0u32, &1_000_000_000u128, &4u32, &true);
}

#[test]
#[should_panic(expected = "Leverage too high")]
fn test_open_position_leverage_too_high() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        _token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Try to open position with leverage = 21 (above max of 20)
    position_client.open_position(&trader, &0u32, &1_000_000_000u128, &21u32, &true);
}

#[test]
#[should_panic(expected = "Position size too small")]
fn test_open_position_size_too_small() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        _token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Try to open position with size = 1_000_000 * 5 = 5_000_000 (below min of 10_000_000)
    position_client.open_position(&trader, &0u32, &1_000_000u128, &5u32, &true);
}

#[test]
fn test_get_user_positions_empty() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        _token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Get positions for user with no positions
    let user_positions = position_client.get_user_open_positions(&trader);

    // Verify empty vector is returned
    assert_eq!(user_positions.len(), 0);
}

#[test]
fn test_get_user_positions_single() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        _token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Open a single position
    let position_id =
        position_client.open_position(&trader, &0u32, &1_000_000_000u128, &10u32, &true);

    // Get user positions
    let user_positions = position_client.get_user_open_positions(&trader);

    // Verify one position is tracked
    assert_eq!(user_positions.len(), 1);
    assert_eq!(user_positions.get(0).unwrap(), position_id);
}

#[test]
fn test_get_user_positions_multiple() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        _token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Open multiple positions
    let pos1 = position_client.open_position(&trader, &0u32, &1_000_000_000u128, &10u32, &true);

    let pos2 = position_client.open_position(&trader, &1u32, &2_000_000_000u128, &10u32, &false);

    let pos3 = position_client.open_position(&trader, &2u32, &500_000_000u128, &10u32, &true);

    // Get user positions
    let user_positions = position_client.get_user_open_positions(&trader);

    // Verify all positions are tracked
    assert_eq!(user_positions.len(), 3);
    assert_eq!(user_positions.get(0).unwrap(), pos1);
    assert_eq!(user_positions.get(1).unwrap(), pos2);
    assert_eq!(user_positions.get(2).unwrap(), pos3);
}

#[test]
fn test_user_positions_after_close() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        _token_client,
        _token_admin,
        _admin,
        trader,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Open multiple positions
    let pos1 = position_client.open_position(&trader, &0u32, &1_000_000_000u128, &10u32, &true);

    let pos2 = position_client.open_position(&trader, &1u32, &2_000_000_000u128, &10u32, &false);

    let pos3 = position_client.open_position(&trader, &2u32, &500_000_000u128, &10u32, &true);

    // Verify all 3 positions are tracked
    let user_positions_before = position_client.get_user_open_positions(&trader);
    assert_eq!(user_positions_before.len(), 3);

    // Close the middle position
    position_client.close_position(&trader, &pos2);

    // Get user positions after closing
    let user_positions_after = position_client.get_user_open_positions(&trader);

    // Verify only 2 positions remain
    assert_eq!(user_positions_after.len(), 2);
    assert_eq!(user_positions_after.get(0).unwrap(), pos1);
    assert_eq!(user_positions_after.get(1).unwrap(), pos3);

    // Close all remaining positions
    position_client.close_position(&trader, &pos1);
    position_client.close_position(&trader, &pos3);

    // Verify no positions remain
    let user_positions_final = position_client.get_user_open_positions(&trader);
    assert_eq!(user_positions_final.len(), 0);
}

#[test]
fn test_multiple_users_positions() {
    let env = Env::default();
    let (
        _config_id,
        _oracle_id,
        position_manager_id,
        _token_address,
        _token_client,
        token_admin,
        _admin,
        trader1,
        liquidity_pool_id,
    ) = setup_test_environment(&env);

    let position_client = PositionManagerClient::new(&env, &position_manager_id);

    // Create a second trader
    let trader2 = Address::generate(&env);
    token_admin.mint(&trader2, &10_000_000_000);

    // Trader 1 opens 2 positions
    let trader1_pos1 =
        position_client.open_position(&trader1, &0u32, &1_000_000_000u128, &10u32, &true);

    let trader1_pos2 =
        position_client.open_position(&trader1, &1u32, &2_000_000_000u128, &10u32, &false);

    // Trader 2 opens 1 position
    let trader2_pos1 =
        position_client.open_position(&trader2, &2u32, &500_000_000u128, &10u32, &true);

    // Verify trader1 has 2 positions
    let trader1_positions = position_client.get_user_open_positions(&trader1);
    assert_eq!(trader1_positions.len(), 2);
    assert_eq!(trader1_positions.get(0).unwrap(), trader1_pos1);
    assert_eq!(trader1_positions.get(1).unwrap(), trader1_pos2);

    // Verify trader2 has 1 position
    let trader2_positions = position_client.get_user_open_positions(&trader2);
    assert_eq!(trader2_positions.len(), 1);
    assert_eq!(trader2_positions.get(0).unwrap(), trader2_pos1);

    // Close trader1's first position
    position_client.close_position(&trader1, &trader1_pos1);

    // Verify trader1 now has 1 position
    let trader1_positions_after = position_client.get_user_open_positions(&trader1);
    assert_eq!(trader1_positions_after.len(), 1);
    assert_eq!(trader1_positions_after.get(0).unwrap(), trader1_pos2);

    // Verify trader2's positions are unchanged
    let trader2_positions_after = position_client.get_user_open_positions(&trader2);
    assert_eq!(trader2_positions_after.len(), 1);
    assert_eq!(trader2_positions_after.get(0).unwrap(), trader2_pos1);
}
