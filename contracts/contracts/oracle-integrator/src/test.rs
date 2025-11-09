#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_contract_initialization() {
    let env = Env::default();
    let contract_id = env.register(OracleIntegrator, ());
    let client = OracleIntegratorClient::new(&env, &contract_id);

    let config_manager = Address::generate(&env);

    // Initialize the contract
    client.initialize(&config_manager);

    // Contract successfully initialized
}

#[test]
fn test_get_price_returns_mock_value() {
    let env = Env::default();
    let contract_id = env.register(OracleIntegrator, ());
    let client = OracleIntegratorClient::new(&env, &contract_id);

    let config_manager = Address::generate(&env);
    client.initialize(&config_manager);

    // Test getting price for any asset ID
    let asset_id = 1u32; // Arbitrary asset ID
    let price = client.get_price(&asset_id);

    // Should return fixed mock price of 100_000_000 ($1.00 with 7 decimals)
    assert_eq!(price, 100_000_000);
}

#[test]
fn test_get_price_consistent_across_assets() {
    let env = Env::default();
    let contract_id = env.register(OracleIntegrator, ());
    let client = OracleIntegratorClient::new(&env, &contract_id);

    let config_manager = Address::generate(&env);
    client.initialize(&config_manager);

    // All assets should return the same mock price
    let price_xlm = client.get_price(&1u32);
    let price_btc = client.get_price(&2u32);
    let price_eth = client.get_price(&3u32);

    assert_eq!(price_xlm, 100_000_000);
    assert_eq!(price_btc, 100_000_000);
    assert_eq!(price_eth, 100_000_000);
}
