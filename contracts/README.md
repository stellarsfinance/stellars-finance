# Stellars Finance - Perpetuals Protocol on Stellar

Stellars Finance is a decentralized perpetuals trading protocol built on the Stellar blockchain using Soroban smart contracts. The protocol enables traders to open leveraged long and short positions on crypto assets with up to 20x leverage, backed by a single liquidity pool model inspired by GMX's GLP.

## Features

- **Leveraged Trading**: 5-20x leverage on perpetual positions
- **Multiple Markets**: XLM-PERP (0), BTC-PERP (1), ETH-PERP (2)
- **Single Liquidity Pool**: Unified liquidity model where LPs act as counterparties
- **Advanced Order Types**: Market orders, limit orders, stop-loss, and take-profit
- **Funding Rates**: Automated funding payments based on OI imbalance
- **Borrowing Fees**: Time-based fees for holding positions
- **PnL Calculation**: Includes price movement, funding payments, and borrowing costs

## Contracts

### 1. ConfigManager
**Path**: `contracts/config-manager/`

Central configuration hub and contract registry for the protocol.

**Key Functions**:
- `initialize(admin)` - Set admin and default parameters
- `set_admin(admin, new_admin)` - Transfer admin role
- Contract registry: `set_*_contract()` / `get_*_contract()` for all protocol contracts
- Parameter setters: `set_leverage_limits()`, `set_fees()`, `set_risk_params()`, `set_borrow_rate()`

**Default Parameters**:
| Parameter | Value | Notes |
|-----------|-------|-------|
| MinLeverage | 5 | |
| MaxLeverage | 20 | |
| MinPositionSize | 10,000,000 | Base units |
| MakerFeeBps | 2 | 0.02% |
| TakerFeeBps | 5 | 0.05% |
| LiquidationFeeBps | 50 | 0.50% |
| LiquidationThreshold | 9000 | 90% |
| MaintenanceMargin | 5000 | 50% |
| BorrowRatePerSecond | 1 | Scaled 1e7, ~3.15% APR |

---

### 2. PositionManager
**Path**: `contracts/position-manager/`

Core position and order lifecycle management.

**Position Functions**:
- `open_position(trader, market_id, collateral, size, leverage, is_long)` - Open new position
- `close_position(trader, position_id)` - Close position and settle PnL
- `get_position(position_id)` - Get position details
- `get_user_positions(trader)` - Get all positions for a user
- `calculate_pnl(position_id)` - Calculate current PnL (price + funding + borrowing)

**Order Functions**:
- `create_limit_order(...)` - Create limit order to open position at trigger price
- `create_stop_loss(trader, position_id, trigger_price, close_percentage, execution_fee)` - Set stop-loss
- `create_take_profit(trader, position_id, trigger_price, close_percentage, execution_fee)` - Set take-profit
- `execute_order(keeper, order_id)` - Execute order when conditions met
- `cancel_order(trader, order_id)` - Cancel pending order
- `can_execute_order(order_id)` - Check if order trigger conditions are met
- `get_order(order_id)` / `get_user_orders(trader)` / `get_position_orders(position_id)`

**Position Data**:
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
    last_interaction: u64,    // for borrowing fee calculation
    liquidation_price: i128,
}
```

---

### 3. LiquidityPool
**Path**: `contracts/liquidity-pool/`

LP deposit/withdrawal and position collateral management.

**LP Functions**:
- `deposit(user, amount)` - Deposit tokens, receive LP shares
- `withdraw(user, shares)` - Burn shares, withdraw tokens
- `get_shares(user)` / `get_total_shares()` / `get_total_deposits()`

**Position Collateral Functions** (called by PositionManager):
- `deposit_position_collateral(position_id, trader, amount)` - Transfer collateral in
- `withdraw_position_collateral(position_id, trader, amount)` - Transfer collateral out
- `reserve_liquidity(amount)` / `release_liquidity(amount)` - Reserve pool liquidity for positions

**Share Calculation**:
- First deposit: shares = amount (1:1)
- Subsequent: shares = (deposit * total_shares) / pool_value

---

### 4. MarketManager
**Path**: `contracts/market-manager/`

Market operations, open interest tracking, and funding rates.

**Functions**:
- `create_market(admin, market_id, max_open_interest, max_funding_rate)` - Create new market
- `update_funding_rate(market_id)` - Keeper-triggered funding update
- `update_open_interest(market_id, is_long, size_delta, is_increase)` - Track OI changes
- `get_funding_rate(market_id)` / `get_cumulative_funding(market_id)`
- `get_open_interest(market_id)` / `can_open_position(market_id, is_long, size)`
- `pause_market(admin, market_id)` / `unpause_market(admin, market_id)`

**Funding Rate Mechanism**:
- Rate = base_rate * (imbalance_ratio)^2
- Positive: Longs pay shorts (long OI > short OI)
- Negative: Shorts pay longs (short OI > long OI)
- Cumulative tracking for efficient per-position calculation

---

### 5. OracleIntegrator
**Path**: `contracts/oracle-integrator/`

Price feeds and validation with test mode support.

**Functions**:
- `get_price(market_id)` - Get current price for market
- `set_test_mode(admin, enabled)` - Enable/disable test mode
- `set_fixed_price_mode(admin, enabled)` - Disable price oscillation for deterministic tests
- `set_test_base_price(admin, market_id, price)` - Set base price in test mode

**Test Mode**:
- Simulates +/-10% price oscillation per hour (sawtooth pattern)
- Use `set_fixed_price_mode(true)` for deterministic test prices
- Prices use 1e7 scaling (1.00 USD = 10,000,000)

---

### 6. FaucetToken
**Path**: `contracts/faucet-token/`

SEP-41 compliant test token with unlimited minting (testnet only).

**Functions**:
- `initialize(admin, name, symbol, decimals)` - Initialize token
- `mint(to, amount)` - Public minting (anyone can mint)
- Standard token interface: `transfer()`, `approve()`, `balance_of()`, `total_supply()`

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

## Project Structure

```
contracts/
├── contracts/
│   ├── config-manager/      # Protocol configuration & registry
│   ├── position-manager/    # Position & order management
│   ├── liquidity-pool/      # LP deposits & collateral
│   ├── market-manager/      # Markets & funding rates
│   ├── oracle-integrator/   # Price feeds
│   └── faucet-token/        # Test token
├── tests/                   # E2E integration tests
│   ├── common/              # Test helpers & setup
│   └── scenarios/           # Test scenarios
├── Cargo.toml               # Workspace configuration
└── README.md
```

## Building and Testing

### Build Contracts
```bash
# From repo root
npm run build:contracts

# Or directly with cargo
cargo build --release --target wasm32v1-none
```

### Run Tests
```bash
# All tests
npm run test:contracts

# Unit tests only (faster)
npm run test:unit

# E2E tests only
npm run test:e2e
```

### Test a Specific Contract
```bash
cargo test -p config-manager
cargo test -p position-manager
cargo test -p liquidity-pool
cargo test -p market-manager
cargo test -p oracle-integrator
```

## Storage Patterns

| Contract | Persistent | Instance |
|----------|-----------|----------|
| config-manager | - | All config & registry |
| position-manager | Positions, Orders | IDs, ConfigMgr address |
| liquidity-pool | Shares, Collateral per position | Totals, ConfigMgr address |
| market-manager | - | Markets, Admin |
| oracle-integrator | - | Test mode prices |

## Key Implementation Details

- **Price scaling**: All prices use 1e7 scaling (1.00 USD = 10,000,000)
- **Position/Order IDs**: Start at 1 (0 means "no position" in order references)
- **Funding tracking**: Cumulative (bps * seconds) for efficient per-position calculation
- **Order TTL**: ~14 days (100,000 ledgers), extended on interaction
- **Slippage protection**: Orders have `acceptable_price` field (0 = no limit)

## Resources

- **Soroban Documentation**: https://developers.stellar.org/docs/build/smart-contracts
- **Soroban SDK**: https://docs.rs/soroban-sdk/latest/soroban_sdk/
