#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize_and_get_config() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);

    // Deploy config manager contract
    let contract_id = env.register(ConfigManager, ());
    let client = ConfigManagerClient::new(&env, &contract_id);

    // Initialize contract
    client.initialize(&admin);

    // Test getting default values
    assert_eq!(client.min_leverage(), 5);
    assert_eq!(client.max_leverage(), 20);
    assert_eq!(client.maker_fee_bps(), 2);
    assert_eq!(client.taker_fee_bps(), 5);
    assert_eq!(client.liquidation_threshold(), 9000);

    // Verify admin is set
    assert_eq!(client.admin(), admin);
}

#[test]
fn test_set_leverage_limits() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);

    let contract_id = env.register(ConfigManager, ());
    let client = ConfigManagerClient::new(&env, &contract_id);

    client.initialize(&admin);

    // Verify defaults
    assert_eq!(client.min_leverage(), 5);
    assert_eq!(client.max_leverage(), 20);

    // Update leverage limits
    client.set_leverage_limits(&admin, &2, &50);
    assert_eq!(client.min_leverage(), 2);
    assert_eq!(client.max_leverage(), 50);
}

#[test]
fn test_set_fees() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);

    let contract_id = env.register(ConfigManager, ());
    let client = ConfigManagerClient::new(&env, &contract_id);

    client.initialize(&admin);

    // Verify defaults
    assert_eq!(client.maker_fee_bps(), 2);
    assert_eq!(client.taker_fee_bps(), 5);
    assert_eq!(client.liquidation_fee_bps(), 50);

    // Update fees
    client.set_fees(&admin, &10, &20, &100);
    assert_eq!(client.maker_fee_bps(), 10);
    assert_eq!(client.taker_fee_bps(), 20);
    assert_eq!(client.liquidation_fee_bps(), 100);
}

#[test]
fn test_set_risk_params() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);

    let contract_id = env.register(ConfigManager, ());
    let client = ConfigManagerClient::new(&env, &contract_id);

    client.initialize(&admin);

    // Verify defaults
    assert_eq!(client.liquidation_threshold(), 9000);
    assert_eq!(client.maintenance_margin(), 5000);

    // Update risk params
    client.set_risk_params(&admin, &8500, &4000);
    assert_eq!(client.liquidation_threshold(), 8500);
    assert_eq!(client.maintenance_margin(), 4000);
}

#[test]
fn test_admin_transfer() {
    let env = Env::default();
    env.mock_all_auths();

    let admin1 = Address::generate(&env);
    let admin2 = Address::generate(&env);

    // Deploy config manager contract
    let contract_id = env.register(ConfigManager, ());
    let client = ConfigManagerClient::new(&env, &contract_id);

    // Initialize contract with admin1
    client.initialize(&admin1);
    assert_eq!(client.admin(), admin1);

    // Transfer admin to admin2
    client.set_admin(&admin1, &admin2);
    assert_eq!(client.admin(), admin2);
}

#[test]
fn test_contract_registry() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let lp_contract = Address::generate(&env);
    let pm_contract = Address::generate(&env);
    let mm_contract = Address::generate(&env);
    let oi_contract = Address::generate(&env);

    // Deploy config manager contract
    let contract_id = env.register(ConfigManager, ());
    let client = ConfigManagerClient::new(&env, &contract_id);

    // Initialize contract
    client.initialize(&admin);

    // Register all contracts
    client.set_liquidity_pool(&admin, &lp_contract);
    client.set_position_manager(&admin, &pm_contract);
    client.set_market_manager(&admin, &mm_contract);
    client.set_oracle_integrator(&admin, &oi_contract);

    // Verify all contracts are registered correctly
    assert_eq!(client.liquidity_pool(), lp_contract);
    assert_eq!(client.position_manager(), pm_contract);
    assert_eq!(client.market_manager(), mm_contract);
    assert_eq!(client.oracle_integrator(), oi_contract);
}

#[test]
fn test_registry_update_addresses() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let lp_contract_v1 = Address::generate(&env);
    let lp_contract_v2 = Address::generate(&env);

    // Deploy config manager contract
    let contract_id = env.register(ConfigManager, ());
    let client = ConfigManagerClient::new(&env, &contract_id);

    // Initialize contract
    client.initialize(&admin);

    // Admin can set contract addresses
    client.set_liquidity_pool(&admin, &lp_contract_v1);
    assert_eq!(client.liquidity_pool(), lp_contract_v1);

    // Admin can update contract addresses (e.g., after upgrade)
    client.set_liquidity_pool(&admin, &lp_contract_v2);
    assert_eq!(client.liquidity_pool(), lp_contract_v2);
}

#[test]
fn test_borrow_rate_per_second() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);

    let contract_id = env.register(ConfigManager, ());
    let client = ConfigManagerClient::new(&env, &contract_id);

    client.initialize(&admin);

    // Check default value
    assert_eq!(client.borrow_rate_per_second(), 1);

    // Update borrow rate
    client.set_borrow_rate_per_second(&admin, &100);
    assert_eq!(client.borrow_rate_per_second(), 100);

    // Set to zero (disable borrowing fees)
    client.set_borrow_rate_per_second(&admin, &0);
    assert_eq!(client.borrow_rate_per_second(), 0);
}

#[test]
#[should_panic(expected = "borrow rate must be >= 0")]
fn test_borrow_rate_negative_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);

    let contract_id = env.register(ConfigManager, ());
    let client = ConfigManagerClient::new(&env, &contract_id);

    client.initialize(&admin);

    client.set_borrow_rate_per_second(&admin, &-1);
}
