#![no_std]

//! # Faucet Token Contract
//!
//! A SEP-41 compliant test token with unlimited supply that anyone can mint.
//! This token is designed for testing purposes on testnet for liquidity providing
//! and opening positions in the Stellars Finance protocol.
//!
//! ## Features
//!
//! - SEP-41 compliant - implements full Stellar token standard
//! - Unlimited supply - no cap on total tokens
//! - Public minting - anyone can mint any amount
//! - Standard token interface (name, symbol, decimals, balance, transfer, allowance, burn)
//! - No admin controls - fully permissionless
//!
//! ## Warning
//!
//! This token is for TESTNET ONLY and should never be used in production.

use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String};

#[derive(Clone)]
#[contracttype]
pub struct AllowanceDataKey {
    pub from: Address,
    pub spender: Address,
}

#[derive(Clone)]
#[contracttype]
pub struct AllowanceValue {
    pub amount: i128,
    pub live_until_ledger: u32,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Name,
    Symbol,
    Decimals,
    TotalSupply,
    Balance(Address),
    Allowance(AllowanceDataKey),
}

#[contract]
pub struct FaucetToken;

// Helper functions for storage access
fn get_balance(e: &Env, addr: &Address) -> i128 {
    e.storage()
        .persistent()
        .get(&DataKey::Balance(addr.clone()))
        .unwrap_or(0)
}

fn put_balance(e: &Env, addr: &Address, amount: i128) {
    e.storage()
        .persistent()
        .set(&DataKey::Balance(addr.clone()), &amount);
}

fn get_total_supply(e: &Env) -> i128 {
    e.storage()
        .instance()
        .get(&DataKey::TotalSupply)
        .unwrap_or(0)
}

fn put_total_supply(e: &Env, amount: i128) {
    e.storage().instance().set(&DataKey::TotalSupply, &amount);
}

fn get_allowance(e: &Env, from: &Address, spender: &Address) -> AllowanceValue {
    let key = DataKey::Allowance(AllowanceDataKey {
        from: from.clone(),
        spender: spender.clone(),
    });
    e.storage()
        .temporary()
        .get(&key)
        .unwrap_or(AllowanceValue {
            amount: 0,
            live_until_ledger: 0,
        })
}

fn put_allowance(e: &Env, from: &Address, spender: &Address, allowance: AllowanceValue) {
    let key = DataKey::Allowance(AllowanceDataKey {
        from: from.clone(),
        spender: spender.clone(),
    });
    if allowance.amount > 0 && allowance.live_until_ledger > e.ledger().sequence() {
        e.storage().temporary().set(&key, &allowance);
        e.storage()
            .temporary()
            .extend_ttl(&key, allowance.live_until_ledger - e.ledger().sequence(), allowance.live_until_ledger - e.ledger().sequence());
    } else {
        e.storage().temporary().remove(&key);
    }
}

fn spend_allowance(e: &Env, from: &Address, spender: &Address, amount: i128) {
    let allowance = get_allowance(e, from, spender);

    if allowance.live_until_ledger < e.ledger().sequence() {
        panic!("allowance expired");
    }

    if allowance.amount < amount {
        panic!("insufficient allowance");
    }

    put_allowance(
        e,
        from,
        spender,
        AllowanceValue {
            amount: allowance.amount - amount,
            live_until_ledger: allowance.live_until_ledger,
        },
    );
}

#[contractimpl]
impl FaucetToken {
    /// Initialize the token with name, symbol, and decimals.
    ///
    /// # Arguments
    ///
    /// * `name` - The token name (e.g., "Test USDC")
    /// * `symbol` - The token symbol (e.g., "USDC")
    /// * `decimals` - The number of decimal places (typically 7 for Stellar)
    ///
    /// # Panics
    ///
    /// Panics if the token is already initialized
    pub fn initialize(env: Env, name: String, symbol: String, decimals: u32) {
        if env.storage().instance().has(&DataKey::Name) {
            panic!("already initialized");
        }

        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::Decimals, &decimals);
        put_total_supply(&env, 0);
    }

    /// Get the token name.
    ///
    /// # Returns
    ///
    /// The token name
    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).unwrap()
    }

    /// Get the token symbol.
    ///
    /// # Returns
    ///
    /// The token symbol
    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&DataKey::Symbol).unwrap()
    }

    /// Get the number of decimals.
    ///
    /// # Returns
    ///
    /// The number of decimal places
    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap()
    }

    /// Get the total token supply.
    ///
    /// # Returns
    ///
    /// The total number of tokens minted
    pub fn total_supply(env: Env) -> i128 {
        get_total_supply(&env)
    }

    /// Get the balance of a specific address.
    ///
    /// # Arguments
    ///
    /// * `addr` - The address to query
    ///
    /// # Returns
    ///
    /// The token balance of the address
    pub fn balance(env: Env, addr: Address) -> i128 {
        get_balance(&env, &addr)
    }

    /// Mint tokens to any address. Anyone can call this function.
    ///
    /// # Arguments
    ///
    /// * `to` - The address to receive the tokens
    /// * `amount` - The amount of tokens to mint
    ///
    /// # Panics
    ///
    /// Panics if amount is not positive
    pub fn mint(env: Env, to: Address, amount: i128) {
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let current_balance = get_balance(&env, &to);
        let new_balance = current_balance + amount;
        put_balance(&env, &to, new_balance);

        let total_supply = get_total_supply(&env);
        put_total_supply(&env, total_supply + amount);
    }

    /// Transfer tokens from one address to another.
    ///
    /// # Arguments
    ///
    /// * `from` - The address sending tokens
    /// * `to` - The address receiving tokens
    /// * `amount` - The amount of tokens to transfer
    ///
    /// # Panics
    ///
    /// Panics if amount is not positive or if sender has insufficient balance
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let from_balance = get_balance(&env, &from);
        if from_balance < amount {
            panic!("insufficient balance");
        }

        let to_balance = get_balance(&env, &to);

        put_balance(&env, &from, from_balance - amount);
        put_balance(&env, &to, to_balance + amount);
    }

    /// Get the allowance for a spender.
    ///
    /// # Arguments
    ///
    /// * `from` - The address that owns the tokens
    /// * `spender` - The address authorized to spend
    ///
    /// # Returns
    ///
    /// The amount the spender is allowed to spend
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        let allowance = get_allowance(&env, &from, &spender);
        if allowance.live_until_ledger < env.ledger().sequence() {
            0
        } else {
            allowance.amount
        }
    }

    /// Approve a spender to spend tokens on behalf of the owner.
    ///
    /// # Arguments
    ///
    /// * `from` - The address that owns the tokens
    /// * `spender` - The address authorized to spend
    /// * `amount` - The amount the spender is allowed to spend
    /// * `live_until_ledger` - The ledger sequence number when the allowance expires
    ///
    /// # Panics
    ///
    /// Panics if amount is negative or if expiration is in the past
    pub fn approve(
        env: Env,
        from: Address,
        spender: Address,
        amount: i128,
        live_until_ledger: u32,
    ) {
        from.require_auth();

        if amount < 0 {
            panic!("amount cannot be negative");
        }

        if live_until_ledger <= env.ledger().sequence() {
            panic!("expiration must be in the future");
        }

        put_allowance(
            &env,
            &from,
            &spender,
            AllowanceValue {
                amount,
                live_until_ledger,
            },
        );
    }

    /// Transfer tokens from one address to another on behalf of the owner.
    /// Requires proper allowance to be set via approve().
    ///
    /// # Arguments
    ///
    /// * `spender` - The address authorized to spend
    /// * `from` - The address sending tokens
    /// * `to` - The address receiving tokens
    /// * `amount` - The amount of tokens to transfer
    ///
    /// # Panics
    ///
    /// Panics if amount is not positive, if sender has insufficient balance,
    /// or if allowance is insufficient or expired
    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        spend_allowance(&env, &from, &spender, amount);

        let from_balance = get_balance(&env, &from);
        if from_balance < amount {
            panic!("insufficient balance");
        }

        let to_balance = get_balance(&env, &to);

        put_balance(&env, &from, from_balance - amount);
        put_balance(&env, &to, to_balance + amount);
    }

    /// Burn tokens from an address, reducing total supply.
    ///
    /// # Arguments
    ///
    /// * `from` - The address to burn tokens from
    /// * `amount` - The amount of tokens to burn
    ///
    /// # Panics
    ///
    /// Panics if amount is not positive or if address has insufficient balance
    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let balance = get_balance(&env, &from);
        if balance < amount {
            panic!("insufficient balance");
        }

        put_balance(&env, &from, balance - amount);

        let total_supply = get_total_supply(&env);
        put_total_supply(&env, total_supply - amount);
    }

    /// Burn tokens from an address on behalf of the owner.
    /// Requires proper allowance to be set via approve().
    ///
    /// # Arguments
    ///
    /// * `spender` - The address authorized to burn
    /// * `from` - The address to burn tokens from
    /// * `amount` - The amount of tokens to burn
    ///
    /// # Panics
    ///
    /// Panics if amount is not positive, if address has insufficient balance,
    /// or if allowance is insufficient or expired
    pub fn burn_from(env: Env, spender: Address, from: Address, amount: i128) {
        spender.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        spend_allowance(&env, &from, &spender, amount);

        let balance = get_balance(&env, &from);
        if balance < amount {
            panic!("insufficient balance");
        }

        put_balance(&env, &from, balance - amount);

        let total_supply = get_total_supply(&env);
        put_total_supply(&env, total_supply - amount);
    }
}
