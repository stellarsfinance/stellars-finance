#![cfg(test)]

use super::*;
use soroban_sdk::Env;

#[test]
fn test_contract_initialization() {
    let env = Env::default();
    let _contract_id = env.register(MarketManager, ());
    // Contract successfully deployed
}
