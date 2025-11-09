# Stellars Finance

Decentralized perpetuals trading platform built on Stellar/Soroban.

## Project Structure

```
stellars-finance/
├── contracts/          # Soroban smart contracts (Rust)
│   ├── position-manager    # Manages trader positions
│   ├── liquidity-pool      # LP deposits/withdrawals
│   ├── config-manager      # Protocol configuration
│   ├── market-manager      # Market-level operations
│   └── oracle-integrator   # Price feed aggregation
├── bindings/           # Generated TypeScript bindings (workspace)
├── frontend/           # Frontend application (workspace)
└── scripts/            # Build and deployment scripts
```

## Prerequisites

- [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup#install-the-stellar-cli)
- Node.js 18+ and npm
- Rust and Cargo (for contract development)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Contracts

```bash
npm run build:contracts
```

This compiles all Soroban contracts to WASM.

### 3. Generate TypeScript Bindings

```bash
npm run generate:bindings
```

This generates TypeScript client code for all contracts in the `bindings/` directory. Each contract gets its own npm package with type-safe interfaces.

### 4. Deploy to Testnet

First, create and fund a deployer account:

```bash
stellar keys generate deployer --network testnet --fund
```

Then deploy all contracts:

```bash
npm run deploy:testnet
```

### 5. Initialize Contracts

After deployment, initialize the contracts with their dependencies:

```bash
npm run initialize:testnet
```

## Development Workflow

### Building Contracts

```bash
# Build all contracts
npm run build:contracts

# Or build specific contract
cd contracts
stellar contract build --package position-manager
```

### Generating Bindings

After modifying contracts, regenerate the TypeScript bindings:

```bash
npm run generate:bindings
```

The generated bindings will be in `bindings/<contract-name>/` with:
- Type definitions for all contract methods
- Client class for invoking contract functions
- Network configuration helpers

### Using Bindings in Frontend

```typescript
import * as PositionManager from '../bindings/position-manager';

// Create client instance
const client = new PositionManager.Client({
  ...PositionManager.networks.testnet,
  rpcUrl: 'https://soroban-testnet.stellar.org:443',
});

// Call contract methods
const { result } = await client.open_position({
  trader: userAddress,
  market_id: 'BTC-USD',
  collateral: 1000_0000000n, // 1000 USDC (7 decimals)
  leverage: 10,
  is_long: true,
});
```

## Deployment

### Testnet

```bash
# Deploy contracts
npm run deploy:testnet

# Initialize contracts
npm run initialize:testnet
```

### Mainnet

```bash
# Deploy contracts
npm run deploy:mainnet

# Initialize contracts
npm run initialize:mainnet
```

Deployment creates a `deployments/<network>.json` file with all contract addresses and updates `scripts/config.ts`.

## Contract Addresses

After deployment, contract addresses are stored in:
- `deployments/<network>.json` - Full deployment info
- `scripts/config.ts` - TypeScript config for frontend
- `.stellar/contract-ids/` - Stellar CLI aliases

## Smart Contracts

### Position Manager
Manages individual trader perpetual positions (open, close, modify, liquidate).

### Liquidity Pool
Core liquidity management for LP deposits/withdrawals and share minting.

### Config Manager
Centralized configuration store for all protocol parameters.

### Market Manager
Handles market-level operations like funding rates and open interest tracking.

### Oracle Integrator
Price feed aggregation from multiple oracle sources (Pyth, DIA, Reflector).

## Scripts

- `build:contracts` - Compile all contracts to WASM
- `generate:bindings` - Generate TypeScript bindings from WASM
- `deploy:testnet` - Deploy contracts to testnet
- `deploy:mainnet` - Deploy contracts to mainnet
- `initialize:testnet` - Initialize contracts on testnet
- `initialize:mainnet` - Initialize contracts on mainnet

## Learn More

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://developers.stellar.org/docs/build/smart-contracts)
- [TypeScript Bindings Guide](https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world-frontend)
