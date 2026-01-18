//! E2E tests for order types: Limit Orders, Stop-Loss, and Take-Profit
//!
//! These tests verify the full lifecycle of orders in realistic scenarios
//! with multiple users, price movements, and keeper execution.

use soroban_sdk::Env;

use crate::common::{
    assertions::*,
    liquidity_pool, market_manager, oracle_integrator, position_manager,
    setup::*,
    time_helpers::*,
};

// Test constants
const COLLATERAL: u128 = 1_000_000_000; // 100 tokens
const LEVERAGE: u32 = 10;
const XLM_PRICE: i128 = 100_000_000; // $1.00
const CLOSE_FULL: u32 = 10000; // 100%
const CLOSE_HALF: u32 = 5000; // 50%

#[test]
fn test_limit_order_lifecycle_multi_user() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);

    let market_id = 0u32;

    // 3 traders create limit orders at different trigger prices
    // Trader 0: Buy long at $0.95
    // Trader 1: Buy long at $0.90
    // Trader 2: Sell short at $1.05

    let trader0 = test_env.traders.get(0).unwrap();
    let trader1 = test_env.traders.get(1).unwrap();
    let trader2 = test_env.traders.get(2).unwrap();

    let order0 = create_test_limit_order(
        &env,
        &position_client,
        &trader0,
        market_id,
        95_000_000, // $0.95
        COLLATERAL,
        LEVERAGE,
        true,
    );

    let order1 = create_test_limit_order(
        &env,
        &position_client,
        &trader1,
        market_id,
        90_000_000, // $0.90
        COLLATERAL,
        LEVERAGE,
        true,
    );

    let order2 = create_test_limit_order(
        &env,
        &position_client,
        &trader2,
        market_id,
        105_000_000, // $1.05
        COLLATERAL,
        LEVERAGE,
        false,
    );

    // Verify all orders created
    let market_orders = position_client.get_market_orders(&market_id);
    assert_eq!(market_orders.len(), 3);

    // Create keeper
    let keeper = test_env.lps.get(0).unwrap();

    // None should be executable at current price ($1.00)
    assert_order_executable(&env, &position_client, order0, false);
    assert_order_executable(&env, &position_client, order1, false);
    assert_order_executable(&env, &position_client, order2, false);

    // Drop price to $0.95 - triggers order0 only
    set_oracle_price(&env, &test_env.oracle_id, &test_env.admin, market_id, 95_000_000);

    assert_order_executable(&env, &position_client, order0, true);
    assert_order_executable(&env, &position_client, order1, false);
    assert_order_executable(&env, &position_client, order2, false);

    // Execute order0
    let pos0_id = position_client.execute_order(&keeper, &order0) as u64;

    // Verify position created for trader0
    assert_user_positions_tracked(&env, &position_client, &trader0, 1);
    let pos0 = position_client.get_position(&pos0_id);
    assert_eq!(pos0.trader, trader0);
    assert_eq!(pos0.is_long, true);

    // Order0 should be removed from market orders
    let market_orders_after = position_client.get_market_orders(&market_id);
    assert_eq!(market_orders_after.len(), 2);

    // Raise price to $1.05 - triggers order2 (short)
    set_oracle_price(&env, &test_env.oracle_id, &test_env.admin, market_id, 105_000_000);

    assert_order_executable(&env, &position_client, order1, false);
    assert_order_executable(&env, &position_client, order2, true);

    // Execute order2
    let pos2_id = position_client.execute_order(&keeper, &order2) as u64;

    // Verify short position created for trader2
    assert_user_positions_tracked(&env, &position_client, &trader2, 1);
    let pos2 = position_client.get_position(&pos2_id);
    assert_eq!(pos2.is_long, false);

    // Order1 still not triggered (needs $0.90)
    assert_user_positions_tracked(&env, &position_client, &trader1, 0);
    assert_user_orders_count(&env, &position_client, &trader1, 1);
}

#[test]
fn test_stop_loss_protects_against_loss() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);

    let market_id = 0u32;
    let trader = test_env.traders.get(0).unwrap();
    let keeper = test_env.lps.get(0).unwrap();

    // Capture balance BEFORE opening position
    let balance_before_position = test_env.token_client.balance(&trader);

    // Open a long position at $1.00
    let position_id = position_client.open_position(
        &trader,
        &market_id,
        &COLLATERAL,
        &LEVERAGE,
        &true,
    );

    // Create stop-loss at $0.95 (5% loss protection)
    let sl_trigger = 95_000_000i128;
    let sl_order = create_test_stop_loss(
        &env,
        &position_client,
        &trader,
        position_id,
        sl_trigger,
        CLOSE_FULL,
    );

    // Verify SL is attached
    assert_position_orders_count(&env, &position_client, position_id, 1);

    // Price drops to $0.95 - SL should trigger
    set_oracle_price(&env, &test_env.oracle_id, &test_env.admin, market_id, sl_trigger);

    assert_order_executable(&env, &position_client, sl_order, true);

    // Execute SL
    let pnl = position_client.execute_order(&keeper, &sl_order);

    // PnL should be negative (5% loss on size with 10x leverage = 50% loss)
    assert!(pnl < 0);

    // Position should be fully closed
    assert_user_positions_tracked(&env, &position_client, &trader, 0);

    // Trader should have lost money overall (loss + execution fee)
    // But not lost all collateral - SL protected them
    let final_balance = test_env.token_client.balance(&trader);
    // Total loss should be: PnL loss + execution fee (paid to keeper)
    assert!(final_balance < balance_before_position);
    // But they still have more than 0 (not total loss of collateral)
    assert!(final_balance > balance_before_position - (COLLATERAL as i128));
}

#[test]
fn test_take_profit_secures_gains() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);

    let market_id = 0u32;
    let trader = test_env.traders.get(0).unwrap();
    let keeper = test_env.lps.get(0).unwrap();

    // Open a long position at $1.00
    let position_id = position_client.open_position(
        &trader,
        &market_id,
        &COLLATERAL,
        &LEVERAGE,
        &true,
    );

    let balance_after_open = test_env.token_client.balance(&trader);

    // Create take-profit at $1.10 (10% gain target)
    let tp_trigger = 110_000_000i128;
    let tp_order = create_test_take_profit(
        &env,
        &position_client,
        &trader,
        position_id,
        tp_trigger,
        CLOSE_FULL,
    );

    // Price rises to $1.10 - TP should trigger
    set_oracle_price(&env, &test_env.oracle_id, &test_env.admin, market_id, tp_trigger);

    assert_order_executable(&env, &position_client, tp_order, true);

    // Execute TP
    let pnl = position_client.execute_order(&keeper, &tp_order);

    // PnL should be positive (10% gain on size)
    assert!(pnl > 0);

    // Position should be fully closed
    assert_user_positions_tracked(&env, &position_client, &trader, 0);

    // Trader should have received collateral plus profit
    let final_balance = test_env.token_client.balance(&trader);
    // Minus execution fee, plus profit
    assert!(final_balance > balance_after_open);
}

#[test]
fn test_combined_sl_tp_one_triggers() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);

    let market_id = 0u32;
    let trader = test_env.traders.get(0).unwrap();
    let keeper = test_env.lps.get(0).unwrap();

    // Open a long position
    let position_id = position_client.open_position(
        &trader,
        &market_id,
        &COLLATERAL,
        &LEVERAGE,
        &true,
    );

    // Create both SL and TP
    let sl_order = create_test_stop_loss(
        &env,
        &position_client,
        &trader,
        position_id,
        95_000_000, // $0.95
        CLOSE_FULL,
    );

    let tp_order = create_test_take_profit(
        &env,
        &position_client,
        &trader,
        position_id,
        110_000_000, // $1.10
        CLOSE_FULL,
    );

    // Verify both orders attached
    assert_position_orders_count(&env, &position_client, position_id, 2);
    assert_user_orders_count(&env, &position_client, &trader, 2);

    let balance_before_tp = test_env.token_client.balance(&trader);

    // Price rises to TP level
    set_oracle_price(&env, &test_env.oracle_id, &test_env.admin, market_id, 110_000_000);

    // Execute TP
    let pnl = position_client.execute_order(&keeper, &tp_order);
    assert!(pnl > 0);

    // Position closed, SL should be auto-cancelled with fee refund
    assert_user_positions_tracked(&env, &position_client, &trader, 0);
    assert_user_orders_count(&env, &position_client, &trader, 0);

    // Trader should have received collateral + profit + SL fee refund
    let final_balance = test_env.token_client.balance(&trader);
    // Balance should include: collateral return + pnl + SL execution fee refund - TP execution fee paid to keeper
    assert!(final_balance > balance_before_tp);
}

#[test]
fn test_keeper_incentive_economics() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);

    let market_id = 0u32;
    let trader = test_env.traders.get(0).unwrap();
    let keeper = test_env.lps.get(0).unwrap();

    let keeper_initial_balance = test_env.token_client.balance(&keeper);

    // Create a limit order
    let order_id = create_test_limit_order(
        &env,
        &position_client,
        &trader,
        market_id,
        95_000_000, // $0.95
        COLLATERAL,
        LEVERAGE,
        true,
    );

    // Trigger the order
    set_oracle_price(&env, &test_env.oracle_id, &test_env.admin, market_id, 95_000_000);

    // Execute
    position_client.execute_order(&keeper, &order_id);

    // Keeper should have received execution fee
    let keeper_final_balance = test_env.token_client.balance(&keeper);
    assert_eq!(
        keeper_final_balance,
        keeper_initial_balance + (ORDER_EXECUTION_FEE as i128)
    );
}

#[test]
fn test_concurrent_orders_same_position() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);

    let market_id = 0u32;
    let trader = test_env.traders.get(0).unwrap();
    let keeper = test_env.lps.get(0).unwrap();

    // Open a position
    let position_id = position_client.open_position(
        &trader,
        &market_id,
        &COLLATERAL,
        &LEVERAGE,
        &true,
    );

    // Create multiple cascading stop-losses at different levels
    let sl1 = create_test_stop_loss(
        &env,
        &position_client,
        &trader,
        position_id,
        98_000_000, // $0.98 - first stop
        3000, // Close 30%
    );

    let sl2 = create_test_stop_loss(
        &env,
        &position_client,
        &trader,
        position_id,
        95_000_000, // $0.95 - second stop
        5000, // Close 50% of remaining
    );

    // Create take-profit
    let tp = create_test_take_profit(
        &env,
        &position_client,
        &trader,
        position_id,
        110_000_000, // $1.10
        CLOSE_FULL,
    );

    // Verify all orders attached
    assert_position_orders_count(&env, &position_client, position_id, 3);

    // Trigger first SL by dropping to $0.98
    set_oracle_price(&env, &test_env.oracle_id, &test_env.admin, market_id, 98_000_000);

    // Execute first SL (partial close)
    let pnl1 = position_client.execute_order(&keeper, &sl1);
    assert!(pnl1 < 0); // Small loss

    // Position should still exist (partial close)
    assert_user_positions_tracked(&env, &position_client, &trader, 1);

    // Other orders should still be there (minus the executed one)
    assert_position_orders_count(&env, &position_client, position_id, 2);

    // Now trigger second SL
    set_oracle_price(&env, &test_env.oracle_id, &test_env.admin, market_id, 95_000_000);
    let pnl2 = position_client.execute_order(&keeper, &sl2);
    assert!(pnl2 < 0);

    // Position should still exist (another partial close)
    assert_user_positions_tracked(&env, &position_client, &trader, 1);
    assert_position_orders_count(&env, &position_client, position_id, 1); // Only TP remains
}

#[test]
fn test_order_cancellation_flow() {
    let env = Env::default();
    let test_env = setup_focused_test(&env);

    let position_client = position_manager::Client::new(&env, &test_env.position_manager_id);

    let trader = test_env.traders.get(0).unwrap();

    let balance_before = test_env.token_client.balance(&trader);

    // Create a limit order
    let order_id = create_test_limit_order(
        &env,
        &position_client,
        &trader,
        0u32,
        95_000_000,
        COLLATERAL,
        LEVERAGE,
        true,
    );

    let balance_after_create = test_env.token_client.balance(&trader);
    // Limit orders escrow both execution fee AND collateral
    assert_eq!(
        balance_after_create,
        balance_before - (ORDER_EXECUTION_FEE as i128) - (COLLATERAL as i128)
    );

    // Verify order exists
    assert_user_orders_count(&env, &position_client, &trader, 1);

    // Cancel the order
    position_client.cancel_order(&trader, &order_id);

    // Verify fee refunded
    let balance_after_cancel = test_env.token_client.balance(&trader);
    assert_eq!(balance_after_cancel, balance_before);

    // Verify order removed
    assert_user_orders_count(&env, &position_client, &trader, 0);
}
