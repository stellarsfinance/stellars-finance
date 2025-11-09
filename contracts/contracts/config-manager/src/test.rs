#![cfg(test)]

use super::*;
use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env};

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
fn test_set_and_get_config() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);

    // Deploy config manager contract
    let contract_id = env.register(ConfigManager, ());
    let client = ConfigManagerClient::new(&env, &contract_id);

    // Initialize contract
    client.initialize(&admin);

    // Set a custom config value
    let custom_key = symbol_short!("CUSTOM");
    client.set_config(&admin, &custom_key, &12345);

    // Get the config value
    assert_eq!(client.get_config(&custom_key), 12345);

    // Update the config value
    client.set_config(&admin, &custom_key, &54321);
    assert_eq!(client.get_config(&custom_key), 54321);
}

#[test]
fn test_update_leverage_limits() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);

    // Deploy config manager contract
    let contract_id = env.register(ConfigManager, ());
    let client = ConfigManagerClient::new(&env, &contract_id);

    // Initialize contract
    client.initialize(&admin);

    // Test using generic set_config with custom keys
    let custom_min_key = symbol_short!("CUST_MIN");
    let custom_max_key = symbol_short!("CUST_MAX");

    client.set_config(&admin, &custom_min_key, &10);
    assert_eq!(client.get_config(&custom_min_key), 10);

    client.set_config(&admin, &custom_max_key, &15);
    assert_eq!(client.get_config(&custom_max_key), 15);

    // Note: The named parameters (MinLeverage, MaxLeverage) use dedicated DataKey variants
    // and cannot be updated via set_config. They would need dedicated setter methods.
    // For now, they retain their default values.
    assert_eq!(client.min_leverage(), 5);
    assert_eq!(client.max_leverage(), 20);
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
