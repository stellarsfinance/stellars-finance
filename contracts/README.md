# Stellars Finance - Perpetuals Protocol on Stellar

Stellars Finance is a decentralized perpetuals trading protocol built on the Stellar blockchain using Soroban smart contracts. The protocol enables traders to open leveraged long and short positions on crypto assets with up to 20x leverage, backed by a single liquidity pool model inspired by GMX's GLP.

## Overview

Stellars Finance implements a perpetual futures exchange with the following features:

- **Leveraged Trading**: 5-20x leverage on perpetual positions
- **Multiple Markets**: XLM-PERP, BTC-PERP, and ETH-PERP
- **Single Liquidity Pool**: Unified liquidity model where LPs act as counterparties to traders
- **Advanced Order Types**: Market orders, limit orders, stop-loss, and take-profit
- **Funding Rates**: Automated funding payments updated every 60 seconds
- **Liquidation System**: Keeper-driven liquidations with incentive rewards
- **Multi-Oracle Integration**: Price feeds from Pyth Network, DIA, and Reflector oracles
- **Auto-Deleveraging (ADL)**: Risk management mechanism for extreme market conditions

## Architecture

The protocol consists of 5 specialized Soroban smart contracts:

### 1. LiquidityPool Contract

**Purpose**: Core liquidity management system for the protocol

**Responsibilities**:
- Accept token deposits from liquidity providers (LPs)
- Mint LP shares representing proportional ownership
- Handle LP withdrawals by burning shares
- Provide counterparty liquidity for all trader positions
- Track total pool value and individual LP balances

**Key Mechanisms**:
- LPs receive shares proportional to their deposit relative to total pool value
- Pool value fluctuates based on trader PnL (traders lose = LPs profit, traders win = LPs lose)
- Single unified pool acts as the house for all markets

**Implemented Functions**:
- `deposit(user, token, amount)` - Deposit tokens and receive LP shares
- `withdraw(user, token, shares)` - Burn shares and withdraw tokens
- `get_shares(user)` - Get user's LP share balance
- `get_total_shares()` - Get total LP shares in circulation
- `get_total_deposits()` - Get total deposited value

### 2. PositionManager Contract

**Purpose**: Manages individual trader perpetual positions

**Responsibilities**:
- Open new long/short positions with specified leverage (5-20x)
- Close existing positions and realize PnL
- Modify positions (increase/decrease size or collateral)
- Execute liquidations for undercollateralized positions
- Calculate unrealized PnL for active positions
- Track collateral, entry prices, and funding debt

**Position Lifecycle**:
1. **Open**: Trader deposits collateral and specifies leverage, size, direction
2. **Active**: Position monitored for liquidation conditions and funding payments
3. **Modify**: Add/remove collateral or increase/decrease size
4. **Close**: Close position (market/limit), PnL realized and settled
5. **Liquidate**: If margin ratio < threshold, keepers liquidate position

**Order Types Supported**:
- Market orders (immediate execution at oracle price)
- Limit orders (execute when price reaches specified level)
- Stop-loss (automatically close to limit losses)
- Take-profit (automatically close to secure gains)

**Stub Functions** (to be implemented):
- `open_position(trader, market_id, collateral, size, leverage, is_long)`
- `close_position(trader, position_id)`
- `increase_position(trader, position_id, additional_collateral, additional_size)`
- `decrease_position(trader, position_id, collateral_to_remove, size_to_reduce)`
- `liquidate_position(keeper, position_id)`
- `get_position(position_id)`
- `calculate_pnl(position_id)`

### 3. MarketManager Contract

**Purpose**: Handles market-level operations and state management

**Responsibilities**:
- Initialize and manage perpetual markets (XLM-PERP, BTC-PERP, ETH-PERP)
- Calculate and update funding rates every 60 seconds
- Track long and short open interest
- Enforce open interest caps to control risk
- Pause/unpause markets for maintenance or risk management

**Initial Markets**:
1. **XLM-PERP** (Market ID: 0) - Stellar Lumens perpetual
2. **BTC-PERP** (Market ID: 1) - Bitcoin perpetual
3. **ETH-PERP** (Market ID: 2) - Ethereum perpetual

**Funding Rate Mechanism**:
- Updated every 60 seconds
- Positive funding: Longs pay shorts (when longs > shorts)
- Negative funding: Shorts pay longs (when shorts > longs)
- Rate based on position imbalance and market conditions
- Capped at maximum funding rate to prevent extreme payments

**Market Pausing**:
Markets can be paused during:
- Protocol upgrades or maintenance
- Oracle failures or price manipulation concerns
- Extreme market volatility
- Risk management measures

**Stub Functions** (to be implemented):
- `create_market(market_id, max_open_interest, max_funding_rate)`
- `update_funding_rate(market_id)`
- `get_funding_rate(market_id)`
- `update_open_interest(market_id, is_long, size_delta)`
- `get_open_interest(market_id)`
- `pause_market(market_id)`
- `unpause_market(market_id)`
- `is_market_paused(market_id)`
- `can_open_position(market_id, is_long, size)`

### 4. OracleIntegrator Contract

**Purpose**: Fetches, validates, and aggregates price data from multiple oracle sources

**Responsibilities**:
- Query price feeds from Pyth Network, DIA, and Reflector oracles
- Validate price freshness, bounds, and consistency
- Calculate median price from multiple sources
- Detect excessive price deviations between oracles
- Monitor oracle health and availability
- Provide fallback logic for oracle failures

**Oracle Sources**:
1. **Pyth Network** (Primary) - High-frequency updates, sub-second latency
2. **DIA Oracle** (Secondary) - Transparent data sourcing, customizable feeds
3. **Reflector Oracle** (Tertiary) - Stellar-native, community-driven

**Price Aggregation Strategy**:
- Fetch prices from all available oracles
- Validate each price (timestamp freshness, bounds check)
- Calculate median of valid prices
- Flag deviations >5% from median
- Require minimum 2 valid sources for trading

**Price Validation Rules**:
- Staleness check: Reject prices older than 60 seconds
- Deviation threshold: Alert if sources differ by >5%
- Circuit breaker: Pause market if price moves >20% in single update
- Confidence intervals: Use Pyth confidence data for quality assessment

**Stub Functions** (to be implemented):
- `get_price(asset_id)` - Get aggregated median price
- `fetch_pyth_price(asset_id)` - Query Pyth Network
- `fetch_dia_price(asset_id)` - Query DIA oracle
- `fetch_reflector_price(asset_id)` - Query Reflector oracle
- `validate_price(price, timestamp, min_price, max_price)`
- `calculate_median()` - Calculate median from price array
- `check_price_deviation(threshold_bps)` - Check if deviation is acceptable
- `get_oracle_health()` - Get health status of all oracles
- `update_cached_price(asset_id)` - Update cached price

### 5. ConfigManager Contract

**Purpose**: Centralized configuration store for all protocol parameters

**Responsibilities**:
- Store all protocol configuration parameters
- Provide read-only access to all contracts
- Restrict parameter updates to authorized administrators
- Validate parameter values and consistency
- Manage admin access control

**Configuration Categories**:

**Trading Parameters**:
- `MIN_LEVERAGE`: 5x (minimum allowed leverage)
- `MAX_LEVERAGE`: 20x (maximum allowed leverage)
- `MIN_POSITION_SIZE`: 10 USD (minimum position size)

**Fee Configuration** (in basis points):
- `MAKER_FEE_BPS`: 2 (0.02% for limit orders)
- `TAKER_FEE_BPS`: 5 (0.05% for market orders)
- `LIQUIDATION_FEE_BPS`: 50 (0.5% paid to liquidators)

**Risk Parameters**:
- `LIQUIDATION_THRESHOLD`: 9000 (90% - margin ratio triggering liquidation)
- `MAINTENANCE_MARGIN`: 5000 (50% - minimum margin to maintain position)
- `MAX_PRICE_DEVIATION_BPS`: 500 (5% - max deviation between oracles)

**Time Parameters**:
- `FUNDING_INTERVAL`: 60 seconds (time between funding rate updates)
- `PRICE_STALENESS_THRESHOLD`: 60 seconds (maximum age of oracle price)

**Implemented Functions**:
- `initialize(admin)` - Initialize contract with admin and defaults
- `set_config(admin, key, value)` - Set configuration parameter (admin only)
- `get_config(key)` - Get configuration parameter value
- `get_time_config(key)` - Get time-based configuration parameter
- `set_admin(current_admin, new_admin)` - Transfer admin role
- `get_admin()` - Get current admin address
- `get_min_leverage()` - Get minimum leverage limit
- `get_max_leverage()` - Get maximum leverage limit
- `get_maker_fee()` - Get maker fee in basis points
- `get_taker_fee()` - Get taker fee in basis points
- `get_liquidation_threshold()` - Get liquidation threshold

## Project Structure

```text
.
├── contracts/
│   ├── liquidity-pool/           # LP deposit/withdrawal, share management
│   ├── position-manager/         # Position lifecycle management
│   ├── market-manager/           # Market operations, funding rates
│   ├── oracle-integrator/        # Multi-oracle price aggregation
│   └── config-manager/           # Protocol configuration storage
├── Stellars Finance - Technical Architecture.pdf
├── Cargo.toml                    # Workspace configuration
└── README.md
```

## Storage Strategies

Different contracts use different storage types based on access patterns:

- **Persistent Storage** (LiquidityPool, PositionManager): Data that must survive contract upgrades (positions, balances)
- **Instance Storage** (MarketManager, ConfigManager): Frequently accessed configuration and market state
- **Temporary Storage** (OracleIntegrator): Short-lived cached data with TTL (prices updated frequently)

## Key Features

### Leverage System
- Minimum leverage: 5x
- Maximum leverage: 20x
- Leverage determines position size relative to collateral
- Higher leverage = higher potential returns but also higher liquidation risk

### Liquidation Mechanism
- Positions liquidatable when margin ratio < 90%
- Keepers incentivized with liquidation fees (0.5% of collateral)
- Liquidation price calculated based on entry price, leverage, and funding
- Partial liquidations via ADL for large positions

### Funding Rates
- Updated every 60 seconds by keeper bots
- Balances long/short positions to maintain market equilibrium
- Continuously accrued and settled on position close or liquidation
- Capped at maximum rate to prevent extreme payments

### LP Share Mechanism
- LPs deposit tokens and receive shares proportional to pool value
- Shares represent claim on pool assets
- Pool value fluctuates based on trader PnL:
  - Traders lose → Pool value increases → LPs profit
  - Traders win → Pool value decreases → LPs take losses
- LPs earn trading fees as compensation for providing liquidity

## Building and Testing

### Prerequisites
- Rust toolchain
- Soroban CLI (`cargo install soroban-cli`)
- Stellar account for deployment

### Build All Contracts

```bash
cargo build --release --target wasm32-unknown-unknown
```

### Run Tests

```bash
# Test all contracts
cargo test

# Test specific contract
cargo test -p liquidity-pool
cargo test -p config-manager
```

### Run Specific Contract Tests

```bash
cd contracts/liquidity-pool
cargo test

cd contracts/config-manager
cargo test
```

## Development Status

**Completed**:
- ✅ LiquidityPool contract with deposit/withdraw functionality
- ✅ ConfigManager contract with get/set configuration
- ✅ Basic test coverage for implemented features
- ✅ Contract structure and comprehensive documentation

**To Be Implemented**:
- ⏳ PositionManager: Position lifecycle (open, close, modify, liquidate)
- ⏳ MarketManager: Funding rate calculations and OI tracking
- ⏳ OracleIntegrator: Multi-oracle integration and price aggregation
- ⏳ Order execution engine (market, limit, stop-loss, take-profit)
- ⏳ Cross-contract integration
- ⏳ Keeper bot service
- ⏳ Backend indexer and API
- ⏳ Frontend application

## Additional Resources

- **Soroban Documentation**: https://developers.stellar.org/docs/build/smart-contracts
- **Soroban SDK**: https://docs.rs/soroban-sdk/latest/soroban_sdk/
- **Technical Architecture**: See `Stellars Finance - Technical Architecture.pdf` for detailed specifications

## License

See project license details.
