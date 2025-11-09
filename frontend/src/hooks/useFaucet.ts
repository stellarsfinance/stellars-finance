/**
 * TanStack Query hooks for Faucet
 *
 * Provides React hooks for minting test tokens from the faucet.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import {
  getTokenInfo,
  getTokenBalance,
  createMintTransaction,
  toContractAmount,
  fromContractAmount,
} from '../services/faucet';
import { signTransaction } from '@stellar/freighter-api';

// Query keys for cache management
export const FAUCET_KEYS = {
  tokenInfo: () => ['faucet', 'tokenInfo'] as const,
  balance: (address: string) => ['faucet', 'balance', address] as const,
};

/**
 * Hook to get token information (name, symbol, decimals)
 */
export function useTokenInfo() {
  return useQuery({
    queryKey: FAUCET_KEYS.tokenInfo(),
    queryFn: getTokenInfo,
    staleTime: 60000 * 60, // 1 hour - token info rarely changes
  });
}

/**
 * Hook to get user's token balance
 */
export function useTokenBalance() {
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: FAUCET_KEYS.balance(publicKey || ''),
    queryFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected');
      const balance = await getTokenBalance(publicKey);
      return {
        raw: balance,
        formatted: fromContractAmount(balance),
      };
    },
    enabled: !!publicKey,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to mint tokens from the faucet
 */
export function useMintTokens() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!publicKey) throw new Error('Wallet not connected');

      const contractAmount = toContractAmount(amount);

      // Create mint transaction
      const mintTx = await createMintTransaction(publicKey, contractAmount);

      // Sign and send using Freighter
      const result = await mintTx.signAndSend({
        signTransaction: async (xdr) => {
          return await signTransaction(xdr, {
            networkPassphrase: mintTx.options.networkPassphrase,
          });
        },
      });

      return {
        result,
        amountMinted: amount,
      };
    },
    onSuccess: () => {
      // Invalidate balance queries to refetch
      if (publicKey) {
        queryClient.invalidateQueries({ queryKey: FAUCET_KEYS.balance(publicKey) });
        // Also invalidate liquidity pool balance if it exists
        queryClient.invalidateQueries({ queryKey: ['liquidityPool', 'userTokenBalance', publicKey] });
      }
    },
  });
}
