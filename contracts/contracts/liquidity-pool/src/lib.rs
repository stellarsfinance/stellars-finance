#![no_std]

//! # LiquidityPool Contract
//!
//! The LiquidityPool contract is the core liquidity management system for the Stellars Finance
//! perpetuals protocol. It implements a single liquidity pool architecture inspired by the GLP model.
//!
//! ## Overview
//!
//! This contract serves as the central repository for all protocol funds. Liquidity providers (LPs)
//! deposit tokens into the pool and receive LP shares representing their proportional ownership.
//! These funds are used as counterparty liquidity for all perpetual trading positions across
//! multiple markets (XLM-PERP, BTC-PERP, ETH-PERP).
//!
//! ## Key Responsibilities
//!
//! - **Deposit Management**: Accept token deposits from LPs and mint corresponding LP shares
//! - **Withdrawal Management**: Burn LP shares and return proportional token amounts to LPs
//! - **Share Calculation**: Calculate LP shares based on pool value and total supply
//! - **Balance Tracking**: Track total deposited amounts and individual LP balances
//! - **Counterparty Liquidity**: Provide liquidity for trader positions (long/short)
//! - **Liquidity Reservation**: Reserves liquidity when positions open and releases it when they close
//!
//! ## LP Share Mechanism
//!
//! - LPs receive shares proportional to their deposit relative to total pool value
//! - Shares represent claim on pool assets, which fluctuate based on trader PnL
//! - When traders lose, pool value increases (LPs profit)
//! - When traders win, pool value decreases (LPs take losses)
//!
//! ## Storage Strategy
//!
//! - **Instance Storage**: Stores total share supply and pool configuration
//! - **Persistent Storage**: Stores individual LP share balances and total deposit amounts to track pool ownership and liquidity
//!
//! ## Contract Stability
//!
//! This contract is kept stable and rarely upgraded since it holds all user funds. Changes to
//! trading logic and features are isolated in other contracts (PositionManager, MarketManager)
//! to minimize risk to the fund-holding contract.
//!
//! ## Future Enhancements
//!
//! - Integration with PositionManager for PnL tracking
//! - Multi-token support for diversified pool composition
//! - Dynamic fee distribution to LPs
//! - Utilization-based deposit/withdrawal limits

use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    ConfigManager,
    Token,
    TotalShares,
    TotalDeposits,
    Shares(Address),
}

#[contract]
pub struct LiquidityPool;

// Helper functions for storage access
fn get_config_manager(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::ConfigManager).unwrap()
}

fn put_config_manager(e: &Env, address: &Address) {
    e.storage().instance().set(&DataKey::ConfigManager, address);
}

fn get_token(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::Token).unwrap()
}

fn put_token(e: &Env, token: Address) {
    e.storage().instance().set(&DataKey::Token, &token);
}

fn get_balance(e: &Env) -> i128 {
    let token = get_token(e);
    token::Client::new(e, &token).balance(&e.current_contract_address())
}

fn get_total_shares(e: &Env) -> i128 {
    e.storage()
        .instance()
        .get(&DataKey::TotalShares)
        .unwrap_or(0)
}

fn put_total_shares(e: &Env, amount: i128) {
    e.storage().instance().set(&DataKey::TotalShares, &amount)
}

fn get_total_deposits(e: &Env) -> i128 {
    e.storage()
        .instance()
        .get(&DataKey::TotalDeposits)
        .unwrap_or(0)
}

fn put_total_deposits(e: &Env, amount: i128) {
    e.storage().instance().set(&DataKey::TotalDeposits, &amount)
}

fn get_shares(e: &Env, user: &Address) -> i128 {
    e.storage()
        .persistent()
        .get(&DataKey::Shares(user.clone()))
        .unwrap_or(0)
}

fn put_shares(e: &Env, user: &Address, amount: i128) {
    e.storage()
        .persistent()
        .set(&DataKey::Shares(user.clone()), &amount);
}

fn mint_shares(e: &Env, to: &Address, amount: i128) {
    let current_shares = get_shares(e, to);
    let total = get_total_shares(e);
    put_shares(e, to, current_shares + amount);
    put_total_shares(e, total + amount);
}

fn burn_shares(e: &Env, from: &Address, amount: i128) {
    let current_shares = get_shares(e, from);
    if current_shares < amount {
        panic!("insufficient shares");
    }
    let total = get_total_shares(e);
    put_shares(e, from, current_shares - amount);
    put_total_shares(e, total - amount);
}

#[contractimpl]
impl LiquidityPool {
    /// Initialize the liquidity pool with config manager and token addresses.
    ///
    /// # Arguments
    ///
    /// * `config_manager` - The Config Manager contract address
    /// * `token` - The token contract address for this pool
    ///
    /// # Panics
    ///
    /// Panics if the pool is already initialized
    pub fn initialize(env: Env, config_manager: Address, token: Address) {
        if env.storage().instance().has(&DataKey::ConfigManager) {
            panic!("already initialized");
        }

        put_config_manager(&env, &config_manager);
        put_token(&env, token);
        put_total_shares(&env, 0);
        put_total_deposits(&env, 0);
    }

    /// Get the Config Manager address.
    ///
    /// # Returns
    ///
    /// The Config Manager contract address
    pub fn config_manager(env: Env) -> Address {
        get_config_manager(&env)
    }

    /// Get the token address for this pool.
    ///
    /// # Returns
    ///
    /// The token contract address
    pub fn token(env: Env) -> Address {
        get_token(&env)
    }

    /// Deposit tokens into the liquidity pool and receive LP shares.
    ///
    /// # Arguments
    ///
    /// * `user` - The address of the depositor
    /// * `amount` - The amount of tokens to deposit
    ///
    /// # Returns
    ///
    /// The number of LP shares minted to the user
    ///
    /// # Panics
    ///
    /// Panics if amount is not positive
    pub fn deposit(env: Env, user: Address, amount: i128) -> i128 {
        // Verify user authorization
        user.require_auth();

        // Validate amount is positive
        if amount <= 0 {
            panic!("amount must be positive");
        }

        // Get token and current pool state
        let token = get_token(&env);
        let total_shares = get_total_shares(&env);
        let total_deposits = get_total_deposits(&env);

        // Transfer tokens from user to contract first
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        // Get actual balance after transfer (protects against PnL changes)
        let balance = get_balance(&env);

        // Calculate shares to mint based on actual pool value
        // If first deposit, shares = amount (1:1 ratio)
        // Otherwise, shares = (amount * total_shares) / (balance - amount)
        // Note: (balance - amount) represents the pool value before this deposit
        let shares_to_mint = if total_shares == 0 {
            amount
        } else {
            let pool_value_before = balance - amount;
            if pool_value_before <= 0 {
                panic!("invalid pool state");
            }
            (amount * total_shares) / pool_value_before
        };

        // Mint shares to user
        mint_shares(&env, &user, shares_to_mint);

        // Update total deposits
        put_total_deposits(&env, total_deposits + amount);

        shares_to_mint
    }

    /// Withdraw tokens from the liquidity pool by burning LP shares.
    ///
    /// # Arguments
    ///
    /// * `user` - The address of the withdrawer
    /// * `shares` - The number of LP shares to burn
    ///
    /// # Returns
    ///
    /// The amount of tokens returned to the user
    ///
    /// # Panics
    ///
    /// Panics if shares is not positive or if total_shares is zero
    pub fn withdraw(env: Env, user: Address, shares: i128) -> i128 {
        // Verify user authorization
        user.require_auth();

        // Validate shares is positive
        if shares <= 0 {
            panic!("shares must be positive");
        }

        // Get token and current pool state
        let token = get_token(&env);
        let total_shares = get_total_shares(&env);
        let total_deposits = get_total_deposits(&env);

        // Prevent division by zero
        if total_shares == 0 {
            panic!("no shares to burn");
        }

        // Get actual balance (reflects PnL from trading)
        let balance = get_balance(&env);

        // Calculate tokens to return based on actual pool value
        // tokens = (shares * balance) / total_shares
        let tokens_to_return = (shares * balance) / total_shares;

        // Burn shares from user (includes validation)
        burn_shares(&env, &user, shares);

        // Update total deposits proportionally
        let deposits_to_reduce = (shares * total_deposits) / total_shares;
        put_total_deposits(&env, total_deposits - deposits_to_reduce);

        // Transfer tokens from contract to user
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &user, &tokens_to_return);

        tokens_to_return
    }

    /// Get the LP share balance for a user.
    ///
    /// # Arguments
    ///
    /// * `user` - The address to query
    ///
    /// # Returns
    ///
    /// The number of LP shares owned by the user
    pub fn get_shares(env: Env, user: Address) -> i128 {
        get_shares(&env, &user)
    }

    /// Get the total number of LP shares in circulation.
    ///
    /// # Returns
    ///
    /// The total number of LP shares
    pub fn get_total_shares(env: Env) -> i128 {
        get_total_shares(&env)
    }

    /// Get the total amount of tokens deposited in the pool.
    ///
    /// # Returns
    ///
    /// The total deposited token amount
    pub fn get_total_deposits(env: Env) -> i128 {
        get_total_deposits(&env)
    }
}

#[cfg(test)]
mod test;
