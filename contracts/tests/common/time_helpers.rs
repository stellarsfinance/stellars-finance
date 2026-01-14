use soroban_sdk::Env;
use soroban_sdk::testutils::Ledger;

/// Advance ledger timestamp by specified seconds
pub fn advance_time(env: &Env, seconds: u64) {
    let current_time = env.ledger().timestamp();
    env.ledger().with_mut(|ledger| {
        ledger.timestamp = current_time + seconds;
    });
}

/// Advance time by one funding interval (60 seconds)
pub fn advance_funding_interval(env: &Env) {
    advance_time(env, 60);
}

/// Advance time by multiple funding intervals
pub fn advance_funding_intervals(env: &Env, count: u64) {
    advance_time(env, 60 * count);
}

/// Simulate time passage for holding periods (in hours)
pub fn simulate_holding_period(env: &Env, hours: u64) {
    advance_time(env, hours * 3600);
}

/// Get current timestamp
pub fn current_time(env: &Env) -> u64 {
    env.ledger().timestamp()
}
