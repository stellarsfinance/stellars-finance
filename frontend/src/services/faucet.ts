/**
 * Faucet Service
 *
 * Provides token minting functionality for the testnet faucet.
 * Allows users to mint test tokens to their wallet.
 */

import { Client as TokenClient } from '@stellars-finance/faucet-token';
import { CONTRACT_ADDRESSES, getRpcUrl, getNetworkPassphrase } from '../config/contracts';
import type { i128 } from '@stellar/stellar-sdk/contract';
import { toContractAmount, fromContractAmount } from './liquidityPool';

/**
 * Get token contract client
 * @param publicKey - Optional public key for transaction source account
 */
export function getTokenClient(publicKey?: string) {
  return new TokenClient({
    contractId: CONTRACT_ADDRESSES.faucetToken,
    rpcUrl: getRpcUrl(),
    networkPassphrase: getNetworkPassphrase(),
    ...(publicKey && { publicKey }),
  });
}

/**
 * Get token information
 */
export async function getTokenInfo() {
  const client = getTokenClient();

  const [name, symbol, decimals] = await Promise.all([
    client.name().then(tx => tx.simulate()).then(result => result.result),
    client.symbol().then(tx => tx.simulate()).then(result => result.result),
    client.decimals().then(tx => tx.simulate()).then(result => result.result),
  ]);

  return { name, symbol, decimals };
}

/**
 * Get user's token balance
 * @param userAddress - User's Stellar address
 * @returns Token balance as bigint
 */
export async function getTokenBalance(userAddress: string): Promise<bigint> {
  const client = getTokenClient();
  const tx = await client.balance({ addr: userAddress });
  const result = await tx.simulate();
  return result.result;
}

/**
 * Create a mint transaction
 * @param recipientAddress - Address to receive tokens
 * @param amount - Amount to mint (in contract units)
 * @returns AssembledTransaction ready for signing
 */
export async function createMintTransaction(recipientAddress: string, amount: bigint) {
  const client = getTokenClient(recipientAddress);
  return await client.mint({ to: recipientAddress, amount: amount as i128 });
}

// Re-export utility functions
export { toContractAmount, fromContractAmount };
