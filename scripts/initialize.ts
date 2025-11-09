#!/usr/bin/env tsx

/**
 * Initialize all Stellars Finance contracts after deployment
 * Must be run after deploy.ts
 *
 * Initialization order:
 * 1. FaucetToken - Initialize test token with name, symbol, decimals
 * 2. ConfigManager - Set admin address
 * 3. OracleIntegrator - Initialize with config manager
 * 4. LiquidityPool - Initialize with config manager and token
 * 5. MarketManager - Initialize with config manager
 * 6. PositionManager - Initialize with config manager
 *
 * Usage:
 *   npm run initialize:testnet
 *   npm run initialize:mainnet
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { NETWORK_CONFIGS } from './config';
import { Client as FaucetTokenClient } from '../bindings/faucet-token/src/index';
import { Client as ConfigManagerClient } from '../bindings/config-manager/src/index';
import { Client as OracleIntegratorClient } from '../bindings/oracle-integrator/src/index';
import { Client as LiquidityPoolClient } from '../bindings/liquidity-pool/src/index';
import { Client as PositionManagerClient } from '../bindings/position-manager/src/index';
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';

type NetworkType = 'testnet' | 'mainnet';

// Parse command line arguments
const args = process.argv.slice(2);
const networkArg = args.find(arg => arg.startsWith('--network='));
const network: NetworkType = (networkArg?.split('=')[1] as NetworkType) || 'testnet';

if (!['testnet', 'mainnet'].includes(network)) {
  console.error('Error: Network must be either "testnet" or "mainnet"');
  process.exit(1);
}

console.log(`\n⚙️  Initializing Stellars Finance contracts on ${network.toUpperCase()}\n`);

// Load deployment data
const deploymentFile = `deployments/${network}.json`;
let deployment: any;

try {
  const data = readFileSync(deploymentFile, 'utf-8');
  deployment = JSON.parse(data);
} catch (error) {
  console.error(`Error: Could not load deployment file ${deploymentFile}`);
  console.error('Please run deployment first: npm run deploy:' + network);
  process.exit(1);
}

const contracts = deployment.contracts;
const networkConfig = NETWORK_CONFIGS[network];

// Load source keypair from environment or use default
const sourceSecretKey = process.env.STELLAR_SECRET_KEY;
if (!sourceSecretKey) {
  console.error('Error: STELLAR_SECRET_KEY environment variable not set');
  console.error('Please set it to your deployer account secret key');
  process.exit(1);
}

const sourceKeypair = Keypair.fromSecret(sourceSecretKey);
const publicKey = sourceKeypair.publicKey();

console.log(`Using source account: ${publicKey}\n`);

// Common client options
const clientOptions = {
  publicKey,
  networkPassphrase: networkConfig.networkPassphrase,
  rpcUrl: networkConfig.rpcUrl,
};

async function main() {
  try {
    // 1. Initialize FaucetToken
    console.log('1️⃣  Initializing FaucetToken...');
    const faucetTokenClient = new FaucetTokenClient({
      ...clientOptions,
      contractId: contracts['faucet-token'],
    });

    const faucetInitTx = await faucetTokenClient.initialize({
      name: 'Test USDC',
      symbol: 'TUSDC',
      decimals: 7,
    });

    await faucetInitTx.signAndSend({
      signTransaction: async (xdr: string) => {
        const tx = TransactionBuilder.fromXDR(xdr, networkConfig.networkPassphrase);
        tx.sign(sourceKeypair);
        return { signedTxXdr: tx.toXDR() };
      }
    });
    console.log('   ✓ FaucetToken initialized (Test USDC, TUSDC, 7 decimals)\n');

    // 2. Initialize ConfigManager
    console.log('2️⃣  Initializing ConfigManager...');
    const configManagerClient = new ConfigManagerClient({
      ...clientOptions,
      contractId: contracts['config-manager'],
    });

    const configInitTx = await configManagerClient.initialize({
      admin: publicKey,
    });

    await configInitTx.signAndSend({
      signTransaction: async (xdr: string) => {
        const tx = TransactionBuilder.fromXDR(xdr, networkConfig.networkPassphrase);
        tx.sign(sourceKeypair);
        return { signedTxXdr: tx.toXDR() };
      }
    });
    console.log(`   ✓ ConfigManager initialized with admin: ${publicKey}`);

    // 2b. Set token address in ConfigManager
    console.log('   → Setting token address in ConfigManager...');
    const setTokenTx = await configManagerClient.set_token({
      admin: publicKey,
      contract: contracts['faucet-token'],
    });

    await setTokenTx.signAndSend({
      signTransaction: async (xdr: string) => {
        const tx = TransactionBuilder.fromXDR(xdr, networkConfig.networkPassphrase);
        tx.sign(sourceKeypair);
        return { signedTxXdr: tx.toXDR() };
      }
    });
    console.log('   ✓ Token address set');

    // 2c. Set oracle integrator address in ConfigManager
    console.log('   → Setting oracle integrator address in ConfigManager...');
    const setOracleTx = await configManagerClient.set_oracle_integrator({
      admin: publicKey,
      contract: contracts['oracle-integrator'],
    });

    await setOracleTx.signAndSend({
      signTransaction: async (xdr: string) => {
        const tx = TransactionBuilder.fromXDR(xdr, networkConfig.networkPassphrase);
        tx.sign(sourceKeypair);
        return { signedTxXdr: tx.toXDR() };
      }
    });
    console.log('   ✓ Oracle integrator address set\n');

    // 3. Initialize OracleIntegrator
    console.log('3️⃣  Initializing OracleIntegrator...');
    const oracleIntegratorClient = new OracleIntegratorClient({
      ...clientOptions,
      contractId: contracts['oracle-integrator'],
    });

    const oracleInitTx = await oracleIntegratorClient.initialize({
      config_manager: contracts['config-manager'],
    });

    await oracleInitTx.signAndSend({
      signTransaction: async (xdr: string) => {
        const tx = TransactionBuilder.fromXDR(xdr, networkConfig.networkPassphrase);
        tx.sign(sourceKeypair);
        return { signedTxXdr: tx.toXDR() };
      }
    });
    console.log('   ✓ OracleIntegrator initialized\n');

    // 4. Initialize LiquidityPool
    console.log('4️⃣  Initializing LiquidityPool...');
    const liquidityPoolClient = new LiquidityPoolClient({
      ...clientOptions,
      contractId: contracts['liquidity-pool'],
    });

    const liquidityInitTx = await liquidityPoolClient.initialize({
      config_manager: contracts['config-manager'],
      token: contracts['faucet-token'],
    });

    await liquidityInitTx.signAndSend({
      signTransaction: async (xdr: string) => {
        const tx = TransactionBuilder.fromXDR(xdr, networkConfig.networkPassphrase);
        tx.sign(sourceKeypair);
        return { signedTxXdr: tx.toXDR() };
      }
    });
    console.log('   ✓ LiquidityPool initialized\n');

    // 5. MarketManager - No initialization needed (uses create_market instead)
    console.log('5️⃣  MarketManager...');
    console.log('   ℹ️  MarketManager has no initialize function - use create_market to set up markets\n');

    // 6. Initialize PositionManager
    console.log('6️⃣  Initializing PositionManager...');
    const positionManagerClient = new PositionManagerClient({
      ...clientOptions,
      contractId: contracts['position-manager'],
    });

    const positionInitTx = await positionManagerClient.initialize({
      config_manager: contracts['config-manager'],
    });

    await positionInitTx.signAndSend({
      signTransaction: async (xdr: string) => {
        const tx = TransactionBuilder.fromXDR(xdr, networkConfig.networkPassphrase);
        tx.sign(sourceKeypair);
        return { signedTxXdr: tx.toXDR() };
      }
    });
    console.log('   ✓ PositionManager initialized\n');

    console.log('\n✅ All contracts initialized successfully!\n');
    console.log('Contract addresses:');
    Object.entries(contracts).forEach(([name, address]) => {
      console.log(`   ${name.padEnd(20)} → ${address}`);
    });

    console.log('\n📝 Next steps:');
    console.log('   1. Set protocol configuration via ConfigManager');
    console.log('   2. Mint test tokens from the faucet');
    console.log('   3. Fund the liquidity pool for trading');
    console.log('   4. Create markets and set up price feeds\n');

  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
}

main();
