declare module '@stellars-finance/deployments/testnet.json' {
  export interface DeploymentConfig {
    network: string;
    timestamp: string;
    sourceAccount: string;
    contracts: {
      'faucet-token': string;
      'config-manager': string;
      'oracle-integrator': string;
      'liquidity-pool': string;
      'market-manager': string;
      'position-manager': string;
    };
  }

  const config: DeploymentConfig;
  export default config;
}

declare module '@stellars-finance/deployments/mainnet.json' {
  export interface DeploymentConfig {
    network: string;
    timestamp: string;
    sourceAccount: string;
    contracts: {
      'faucet-token': string;
      'config-manager': string;
      'oracle-integrator': string;
      'liquidity-pool': string;
      'market-manager': string;
      'position-manager': string;
    };
  }

  const config: DeploymentConfig;
  export default config;
}
