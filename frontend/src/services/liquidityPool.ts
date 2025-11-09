/**
 * Liquidity Pool Service
 *
 * Provides contract interaction for the Stellar liquidity pool.
 * Handles deposits, withdrawals, and balance queries.
 */

import { Client as LiquidityPoolClient } from '../../../bindings/liquidity-pool/dist/index.js';
import { Client as TokenClient } from '../../../bindings/faucet-token/dist/index.js';
import { CONTRACT_ADDRESSES, getRpcUrl, getNetworkPassphrase } from '../config/contracts';
import type { i128 } from '@stellar/stellar-sdk/contract';

// Stellar typically uses 7 decimal places for tokens
const DECIMALS = 7;
const DECIMAL_MULTIPLIER = Math.pow(10, DECIMALS);

/**
 * Convert display amount to contract amount (i128)
 * @param amount - Human-readable amount (e.g., 100.5)
 * @returns Contract amount as bigint
 */
export function toContractAmount(amount: number): bigint {
  return BigInt(Math.floor(amount * DECIMAL_MULTIPLIER));
}

/**
 * Convert contract amount (i128) to display amount
 * @param amount - Contract amount as bigint
 * @returns Human-readable amount
 */
export function fromContractAmount(amount: bigint): number {
  return Number(amount) / DECIMAL_MULTIPLIER;
}

/**
 * Get liquidity pool contract client
 * @param publicKey - Optional public key for transaction source account
 */
export function getLiquidityPoolClient(publicKey?: string) {
  return new LiquidityPoolClient({
    contractId: CONTRACT_ADDRESSES.liquidityPool,
    rpcUrl: getRpcUrl(),
    networkPassphrase: getNetworkPassphrase(),
    ...(publicKey && { publicKey }),
  });
}

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
 * Get user's LP shares
 * @param userAddress - User's Stellar address
 * @returns LP shares as bigint
 */
export async function getUserShares(userAddress: string): Promise<bigint> {
  const client = getLiquidityPoolClient();
  const tx = await client.get_shares({ user: userAddress });
  const result = await tx.simulate();
  return result.result;
}

/**
 * Get total LP shares in circulation
 * @returns Total shares as bigint
 */
export async function getTotalShares(): Promise<bigint> {
  const client = getLiquidityPoolClient();
  const tx = await client.get_total_shares();
  const result = await tx.simulate();
  return result.result;
}

/**
 * Get total deposits in the pool
 * @returns Total deposits as bigint
 */
export async function getTotalDeposits(): Promise<bigint> {
  const client = getLiquidityPoolClient();
  const tx = await client.get_total_deposits();
  const result = await tx.simulate();
  return result.result;
}

/**
 * Get user's token balance
 * @param userAddress - User's Stellar address
 * @returns Token balance as bigint
 */
export async function getUserTokenBalance(userAddress: string): Promise<bigint> {
  const client = getTokenClient();
  const tx = await client.balance({ addr: userAddress });
  const result = await tx.simulate();
  return result.result;
}

/**
 * Create a deposit transaction
 * @param userAddress - User's Stellar address
 * @param amount - Amount to deposit (in contract units)
 * @returns AssembledTransaction ready for signing
 */
export async function createDepositTransaction(userAddress: string, amount: bigint) {
  const client = getLiquidityPoolClient(userAddress);
  return await client.deposit({ user: userAddress, amount: amount as i128 });
}

/**
 * Create a withdraw transaction
 * @param userAddress - User's Stellar address
 * @param shares - LP shares to burn (in contract units)
 * @returns AssembledTransaction ready for signing
 */
export async function createWithdrawTransaction(userAddress: string, shares: bigint) {
  const client = getLiquidityPoolClient(userAddress);
  return await client.withdraw({ user: userAddress, shares: shares as i128 });
}

/**
 * Create an approve transaction for the liquidity pool
 * This allows the pool to spend user's tokens for deposits
 * @param userAddress - User's Stellar address
 * @param amount - Amount to approve (in contract units)
 * @param liveUntilLedger - Ledger number when approval expires (optional, defaults to current + 100000)
 * @returns AssembledTransaction ready for signing
 */
export async function createApproveTransaction(
  userAddress: string,
  amount: bigint,
  liveUntilLedger?: number
) {
  const client = getTokenClient(userAddress);

  // Default to a far future ledger if not specified
  const expiration = liveUntilLedger || (await getCurrentLedger()) + 100000;

  return await client.approve({
    from: userAddress,
    spender: CONTRACT_ADDRESSES.liquidityPool,
    amount: amount as i128,
    live_until_ledger: expiration,
  });
}

/**
 * Get current ledger number (approximation)
 * In production, you'd want to fetch this from the RPC
 */
async function getCurrentLedger(): Promise<number> {
  // Placeholder - in production, fetch from RPC
  return 1000000;
}

/**
 * Calculate user's share of the pool
 * @param userShares - User's LP shares
 * @param totalShares - Total LP shares
 * @param totalDeposits - Total deposits in pool
 * @returns User's share value
 */
export function calculateUserShareValue(
  userShares: bigint,
  totalShares: bigint,
  totalDeposits: bigint
): bigint {
  if (totalShares === BigInt(0)) return BigInt(0);
  return (userShares * totalDeposits) / totalShares;
}
