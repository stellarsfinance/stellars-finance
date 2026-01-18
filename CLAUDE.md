# Overview
- Stellars Finance is a Perps Protocol on the Stellar Blockchain
- Written in Soroban (Rust framework for Stellar smart contracts)

# Structure
This is a monorepo:
- **bindings**: generated JS bindings for frontend/backend (generate with script)
- **contracts**: Soroban smart contracts
- **deployments**: JSON files with contract addresses
- **frontend**: Vite + React app
- **packages**: shared code between packages
- **scripts**: building, bindings generation, deployment

# Bash Commands
```bash
npm run dev                # Start frontend dev server
npm run build              # Build frontend
npm run build:contracts    # Build all contracts (required before testing)
npm run generate:bindings  # Generate TS bindings for contracts
npm run test:contracts     # Run all contract tests
npm run test:unit          # Run only unit tests (fast)
npm run test:e2e           # Run only E2E tests
```

# Code Style
- Use ES modules (import/export), not CommonJS (require)
- Destructure imports when possible
- Keep code readable and maintainable
- Use SOLID principles
- Reuse functions as much as possible
- Comments only for critical business logic
- Avoid "else", use early returns
- Avoid nested logic, deep indentation, long functions

# Workflow
- Use available bash commands (npm run test instead of cargo test)
- Think critically and ask questions if unsure
- Focus only on the task at hand

---

# Contracts

## Contracts Overview

| Contract | Purpose | Path |
|----------|---------|------|
| **config-manager** | Central configuration & contract registry | `contracts/contracts/config-manager/` |
| **position-manager** | Position & order lifecycle management | `contracts/contracts/position-manager/` |
| **liquidity-pool** | LP deposits, withdrawals & collateral | `contracts/contracts/liquidity-pool/` |
| **market-manager** | Markets, OI tracking & funding rates | `contracts/contracts/market-manager/` |
| **oracle-integrator** | Price feeds & validation | `contracts/contracts/oracle-integrator/` |
| **faucet-token** | SEP-41 test token (testnet only) | `contracts/contracts/faucet-token/` |

## Contract Dependencies
```
position-manager
  |-- config-manager (addresses & config)
  |-- liquidity-pool (collateral transfers)
  |-- market-manager (OI, funding rates)
  +-- oracle-integrator (prices)

liquidity-pool, market-manager, oracle-integrator
  +-- config-manager
```

## Testing

### Test Oracle (IMPORTANT)
The oracle-integrator has a **test mode** that simulates price oscillation. For deterministic tests:

```rust
// Enable test mode with fixed prices (no oscillation)
oracle_client.set_test_mode(&admin, &true);
oracle_client.set_fixed_price_mode(&admin, &true);
oracle_client.set_test_base_price(&admin, &0, &10_000_000);   // XLM: $1.00 (1e7 scaling)
oracle_client.set_test_base_price(&admin, &1, &500_000_000_000); // BTC: $50,000
oracle_client.set_test_base_price(&admin, &2, &30_000_000_000);  // ETH: $3,000
```

**Without `set_fixed_price_mode(true)`**, prices oscillate +/-10% per hour in a sawtooth pattern.

### Unit Test Setup Pattern
```rust
#[test]
fn test_example() {
    let env = Env::default();
    env.mock_all_auths();  // Bypass auth for testing

    let admin = Address::generate(&env);
    let contract_id = env.register(ContractName, ());
    let client = ContractNameClient::new(&env, &contract_id);
}
```

### Token Creation for Tests
```rust
let contract_address = env.register_stellar_asset_contract_v2(admin.clone());
let token_client = token::Client::new(&env, &contract_address.address());
let token_admin = token::StellarAssetClient::new(&env, &contract_address.address());
token_admin.mint(&trader, &1_000_000_000);
```

### Cross-Contract Import Pattern
```rust
mod config_manager {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32v1-none/release/config_manager.wasm"
    );
}
// Usage: let client = config_manager::Client::new(&env, &address);
```

### E2E Test Environment
Located in `contracts/tests/`. Use helpers from `common/setup.rs`:
```rust
let test_env = setup_test_environment(&env, 5, 2); // 5 traders, 2 LPs
```

## Key Data Structures

### Position
```rust
Position {
    trader: Address,
    market_id: u32,           // 0=XLM, 1=BTC, 2=ETH
    collateral: u128,
    size: u128,               // notional = collateral * leverage
    is_long: bool,
    entry_price: i128,        // 1e7 scaled
    entry_funding_long: i128,
    entry_funding_short: i128,
    last_interaction: u64,    // for borrowing fee calc
    liquidation_price: i128,
}
```

### Order Types
```rust
OrderType::Limit      // Open new position at trigger price
OrderType::StopLoss   // Close position to limit losses
OrderType::TakeProfit // Close position to secure gains
```

## Configuration Defaults

| Parameter | Default | Notes |
|-----------|---------|-------|
| MinLeverage | 5 | |
| MaxLeverage | 20 | |
| MinPositionSize | 10_000_000 | In base units |
| MakerFeeBps | 2 | 0.02% |
| TakerFeeBps | 5 | 0.05% |
| LiquidationFeeBps | 50 | 0.50% |
| LiquidationThreshold | 9000 | 90% |
| MaintenanceMargin | 5000 | 50% |
| MaxUtilizationRatio | 8000 | 80% |
| FundingInterval | 60 | seconds |
| BorrowRatePerSecond | 1 | scaled 1e7, ~3.15% APR |

## Validation Rules

**Position Opening:**
- `collateral > 0`
- `leverage >= MinLeverage && leverage <= MaxLeverage`
- `size >= MinPositionSize`
- Market must exist and not be paused
- OI increase must not exceed market cap

**Orders:**
- `execution_fee >= minimum` (currently 1_000_000)
- Stop-loss: trigger below current for longs, above for shorts
- Take-profit: trigger above current for longs, below for shorts
- `close_percentage`: 1-10000 (100 = 1%, 10000 = 100%)

## Storage Patterns

| Contract | Persistent | Instance |
|----------|-----------|----------|
| config-manager | - | All config |
| position-manager | Positions, Orders | IDs, ConfigMgr addr |
| liquidity-pool | Shares, Collateral | Totals, ConfigMgr addr |
| market-manager | - | Markets, Admin |
| oracle-integrator | - | Test prices |

## Common Gotchas

1. **Build before test**: Always run `npm run build:contracts` before testing
2. **Price scaling**: All prices use 1e7 scaling (1.00 USD = 10_000_000)
3. **Position/Order IDs start at 1**: ID 0 means "no position" in orders
4. **Funding is cumulative**: Stored as bps * seconds for efficient per-position calculation
5. **Order TTL**: ~14 days (100,000 ledgers), extended on each interaction

---

# Frontend

TODO

---

# Bindings

TODO

---

# Deployments

TODO
