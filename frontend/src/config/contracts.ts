/**
 * Smart Contract Configuration
 *
 * Contract addresses and network configuration for Stellar.
 * Addresses are automatically loaded from the deployment JSON files.
 */

// Import deployment configuration
import testnetDeployment from '../../../deployments/testnet.json';
// import mainnetDeployment from '../../../deployments/mainnet.json'; // Uncomment when mainnet deployed

export const NETWORK_CONFIG = {
  testnet: {
    rpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
  },
  mainnet: {
    rpcUrl: 'https://soroban-mainnet.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
  },
} as const;

// Current network - change this to switch networks
export const CURRENT_NETWORK = 'testnet' as const;

// Load contract addresses from deployment JSON based on current network
const deploymentConfig = CURRENT_NETWORK === 'testnet' ? testnetDeployment : testnetDeployment; // Change to mainnetDeployment when ready

// Contract addresses from deployment file
export const CONTRACT_ADDRESSES = {
  faucetToken: deploymentConfig.contracts['faucet-token'],
  configManager: deploymentConfig.contracts['config-manager'],
  oracleIntegrator: deploymentConfig.contracts['oracle-integrator'],
  liquidityPool: deploymentConfig.contracts['liquidity-pool'],
  marketManager: deploymentConfig.contracts['market-manager'],
  positionManager: deploymentConfig.contracts['position-manager'],
} as const;

// Get current network configuration
export const getNetworkConfig = () => NETWORK_CONFIG[CURRENT_NETWORK];

// Get RPC URL for current network
export const getRpcUrl = () => getNetworkConfig().rpcUrl;

// Get network passphrase for current network
export const getNetworkPassphrase = () => getNetworkConfig().networkPassphrase;
