/**
 * TanStack Query hooks for Position Manager Contract
 *
 * Provides React hooks for interacting with the position manager smart contract.
 * Uses TanStack Query for caching, loading states, and automatic refetching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import {
  getUserPositions,
  getPosition,
  calculatePnL,
  createOpenPositionTransaction,
  createClosePositionTransaction,
  fromContractAmount,
  fromContractPrice,
  toContractAmount,
  calculateLiquidationPrice,
  calculateLeverage,
  getUserTokenBalance,
  MarketId,
} from '../services/positionManager';
import { signTransaction } from '@stellar/freighter-api';
import { toast } from 'sonner';

// Query keys for cache management
export const POSITION_MANAGER_KEYS = {
  userPositions: (address: string) => ['positionManager', 'userPositions', address] as const,
  position: (positionId: bigint) => ['positionManager', 'position', positionId.toString()] as const,
  positionPnL: (positionId: bigint) => ['positionManager', 'pnl', positionId.toString()] as const,
  userTokenBalance: (address: string) => ['positionManager', 'userTokenBalance', address] as const,
};

/**
 * Formatted position data for UI display
 */
export interface FormattedPosition {
  id: bigint;
  trader: string;
  collateral: number;
  size: number;
  isLong: boolean;
  entryPrice: number;
  leverage: number;
  liquidationPrice: number;
  pnl?: number;
  pnlPercent?: number;
}

/**
 * Hook to get all positions for the connected user
 * @returns Query result with user's positions
 */
export function useUserPositions() {
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: POSITION_MANAGER_KEYS.userPositions(publicKey || ''),
    queryFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected');

      const positions = await getUserPositions(publicKey);

      // Format positions for UI
      const formatted: FormattedPosition[] = positions.map((pos) => ({
        id: pos.id,
        trader: pos.trader,
        collateral: fromContractAmount(pos.collateral),
        size: fromContractAmount(pos.size),
        isLong: pos.is_long,
        entryPrice: fromContractPrice(pos.entry_price),
        leverage: calculateLeverage(pos),
        liquidationPrice: calculateLiquidationPrice(pos),
      }));

      return formatted;
    },
    enabled: !!publicKey,
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds for live PnL updates
  });
}

/**
 * Hook to get a specific position by ID
 * @param positionId - Position ID to fetch
 * @returns Query result with position data
 */
export function usePosition(positionId: bigint | null) {
  return useQuery({
    queryKey: POSITION_MANAGER_KEYS.position(positionId || BigInt(0)),
    queryFn: async () => {
      if (!positionId) throw new Error('Position ID required');

      const position = await getPosition(positionId);

      return {
        raw: position,
        formatted: {
          id: positionId,
          trader: position.trader,
          collateral: fromContractAmount(position.collateral),
          size: fromContractAmount(position.size),
          isLong: position.is_long,
          entryPrice: fromContractPrice(position.entry_price),
          leverage: calculateLeverage(position),
          liquidationPrice: calculateLiquidationPrice(position),
        },
      };
    },
    enabled: !!positionId,
    staleTime: 5000,
  });
}

/**
 * Hook to calculate PnL for a specific position
 * Note: Currently returns 0 in MVP, but hook is ready for future implementation
 * @param positionId - Position ID
 * @returns Query result with PnL data
 */
export function usePositionPnL(positionId: bigint | null) {
  return useQuery({
    queryKey: POSITION_MANAGER_KEYS.positionPnL(positionId || BigInt(0)),
    queryFn: async () => {
      if (!positionId) throw new Error('Position ID required');

      const pnl = await calculatePnL(positionId);

      return {
        raw: pnl,
        formatted: fromContractAmount(pnl),
      };
    },
    enabled: !!positionId,
    staleTime: 5000,
    refetchInterval: 10000, // Update PnL frequently
  });
}

/**
 * Hook to get user's token balance (for collateral)
 * @returns Query result with user's token balance
 */
export function useUserTokenBalance() {
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: POSITION_MANAGER_KEYS.userTokenBalance(publicKey || ''),
    queryFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected');
      const balance = await getUserTokenBalance(publicKey);
      return {
        raw: balance,
        formatted: fromContractAmount(balance),
      };
    },
    enabled: !!publicKey,
    staleTime: 10000,
    refetchInterval: 30000,
  });
}

/**
 * Parameters for opening a position
 */
export interface OpenPositionParams {
  marketId: MarketId;
  collateral: number; // Human-readable amount
  leverage: number;
  isLong: boolean;
}

/**
 * Hook to open a new position
 * @returns Mutation function and state
 */
export function useOpenPosition() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: OpenPositionParams) => {
      if (!publicKey) throw new Error('Wallet not connected');

      const contractCollateral = toContractAmount(params.collateral);

      // Open position (Soroban handles auth via require_auth, no separate approve needed)
      toast.info('Opening position...');
      const openTx = await createOpenPositionTransaction(
        publicKey,
        params.marketId,
        contractCollateral,
        params.leverage,
        params.isLong
      );

      const result = await openTx.signAndSend({
        signTransaction: async (xdr) => {
          return await signTransaction(xdr, {
            networkPassphrase: openTx.options.networkPassphrase,
          });
        },
      });

      return {
        result,
        positionId: result, // The contract returns the position ID
      };
    },
    onSuccess: () => {
      toast.success('Position opened successfully!');

      // Invalidate and refetch relevant queries
      if (publicKey) {
        queryClient.invalidateQueries({
          queryKey: POSITION_MANAGER_KEYS.userPositions(publicKey)
        });
        queryClient.invalidateQueries({
          queryKey: POSITION_MANAGER_KEYS.userTokenBalance(publicKey)
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to open position: ${error.message}`);
    },
  });
}

/**
 * Hook to close an existing position
 * @returns Mutation function and state
 */
export function useClosePosition() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (positionId: bigint) => {
      if (!publicKey) throw new Error('Wallet not connected');

      toast.info('Closing position...');
      const closeTx = await createClosePositionTransaction(publicKey, positionId);

      const result = await closeTx.signAndSend({
        signTransaction: async (xdr) => {
          return await signTransaction(xdr, {
            networkPassphrase: closeTx.options.networkPassphrase,
          });
        },
      });

      return {
        result,
        pnl: 0, // MVP: PnL is always 0 (fixed price)
      };
    },
    onSuccess: (data) => {
      const pnl = data.pnl;

      if (pnl > 0) {
        toast.success(`Position closed with profit: $${pnl.toFixed(2)}`);
      } else if (pnl < 0) {
        toast.success(`Position closed with loss: $${Math.abs(pnl).toFixed(2)}`);
      } else {
        toast.success('Position closed successfully!');
      }

      // Invalidate and refetch relevant queries
      if (publicKey) {
        queryClient.invalidateQueries({
          queryKey: POSITION_MANAGER_KEYS.userPositions(publicKey)
        });
        queryClient.invalidateQueries({
          queryKey: POSITION_MANAGER_KEYS.userTokenBalance(publicKey)
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to close position: ${error.message}`);
    },
  });
}

/**
 * Hook to get position statistics for the user
 * @returns Combined position statistics
 */
export function usePositionStats() {
  const { data: positions, isLoading, isError } = useUserPositions();

  if (!positions || positions.length === 0) {
    return {
      totalPositions: 0,
      totalCollateral: 0,
      totalSize: 0,
      longPositions: 0,
      shortPositions: 0,
      isLoading,
      isError,
    };
  }

  const stats = positions.reduce(
    (acc, pos) => {
      acc.totalCollateral += pos.collateral;
      acc.totalSize += pos.size;
      if (pos.isLong) {
        acc.longPositions += 1;
      } else {
        acc.shortPositions += 1;
      }
      return acc;
    },
    { totalCollateral: 0, totalSize: 0, longPositions: 0, shortPositions: 0 }
  );

  return {
    totalPositions: positions.length,
    ...stats,
    isLoading,
    isError,
  };
}
