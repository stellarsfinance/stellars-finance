import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from '@stellar/stellar-sdk/contract';
import type { u32, u64, u128, i128 } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export type DataKey = {
    tag: "ConfigManager";
    values: void;
} | {
    tag: "Token";
    values: void;
} | {
    tag: "TotalShares";
    values: void;
} | {
    tag: "TotalDeposits";
    values: void;
} | {
    tag: "Shares";
    values: readonly [string];
} | {
    tag: "ReservedLiquidity";
    values: void;
} | {
    tag: "AuthorizedPositionManager";
    values: void;
} | {
    tag: "PositionCollateral";
    values: readonly [u64];
};
export interface Client {
    /**
     * Construct and simulate a token transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the token address for this pool.
     *
     * # Returns
     *
     * The token contract address
     */
    token: (options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Deposit tokens into the liquidity pool and receive LP shares.
     *
     * # Arguments
     *
     * * `user` - The address of the depositor
     * * `amount` - The amount of tokens to deposit
     *
     * # Returns
     *
     * The number of LP shares minted to the user
     *
     * # Panics
     *
     * Panics if amount is not positive
     */
    deposit: ({ user, amount }: {
        user: string;
        amount: i128;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<i128>>;
    /**
     * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Withdraw tokens from the liquidity pool by burning LP shares.
     *
     * # Arguments
     *
     * * `user` - The address of the withdrawer
     * * `shares` - The number of LP shares to burn
     *
     * # Returns
     *
     * The amount of tokens returned to the user
     *
     * # Panics
     *
     * Panics if shares is not positive, if total_shares is zero,
     * or if withdrawal would violate liquidity constraints
     */
    withdraw: ({ user, shares }: {
        user: string;
        shares: i128;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<i128>>;
    /**
     * Construct and simulate a get_shares transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the LP share balance for a user.
     *
     * # Arguments
     *
     * * `user` - The address to query
     *
     * # Returns
     *
     * The number of LP shares owned by the user
     */
    get_shares: ({ user }: {
        user: string;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<i128>>;
    /**
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Initialize the liquidity pool with config manager and token addresses.
     *
     * # Arguments
     *
     * * `config_manager` - The Config Manager contract address
     * * `token` - The token contract address for this pool
     *
     * # Panics
     *
     * Panics if the pool is already initialized
     */
    initialize: ({ config_manager, token }: {
        config_manager: string;
        token: string;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a config_manager transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the Config Manager address.
     *
     * # Returns
     *
     * The Config Manager contract address
     */
    config_manager: (options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a get_total_shares transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the total number of LP shares in circulation.
     *
     * # Returns
     *
     * The total number of LP shares
     */
    get_total_shares: (options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<i128>>;
    /**
     * Construct and simulate a release_liquidity transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Release liquidity when a position is closed.
     *
     * # Arguments
     *
     * * `position_manager` - The Position Manager contract address
     * * `position_id` - The position ID
     * * `size` - The position size (notional value) to release
     *
     * # Panics
     *
     * Panics if caller is not the authorized position manager
     */
    release_liquidity: ({ position_manager, position_id, size }: {
        position_manager: string;
        position_id: u64;
        size: u128;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a reserve_liquidity transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Reserve liquidity when a position is opened.
     *
     * # Arguments
     *
     * * `position_manager` - The Position Manager contract address
     * * `position_id` - The position ID
     * * `size` - The position size (notional value) to reserve
     * * `collateral` - The collateral amount deposited
     *
     * # Panics
     *
     * Panics if caller is not the authorized position manager
     */
    reserve_liquidity: ({ position_manager, position_id, size, collateral }: {
        position_manager: string;
        position_id: u64;
        size: u128;
        collateral: u128;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_total_deposits transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the total amount of tokens deposited in the pool.
     *
     * # Returns
     *
     * The total deposited token amount
     */
    get_total_deposits: (options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<i128>>;
    /**
     * Construct and simulate a set_position_manager transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Set the authorized position manager that can reserve/release liquidity.
     *
     * # Arguments
     *
     * * `admin` - The admin address (must match ConfigManager admin)
     * * `position_manager` - The Position Manager contract address
     *
     * # Panics
     *
     * Panics if caller is not authorized
     */
    set_position_manager: ({ admin, position_manager }: {
        admin: string;
        position_manager: string;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_utilization_ratio transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the pool utilization ratio in basis points.
     *
     * # Returns
     *
     * The utilization ratio in basis points (e.g., 8000 = 80%)
     */
    get_utilization_ratio: (options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a get_reserved_liquidity transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the total reserved liquidity.
     *
     * # Returns
     *
     * The total liquidity reserved for open positions
     */
    get_reserved_liquidity: (options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<u128>>;
    /**
     * Construct and simulate a get_available_liquidity transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the available liquidity (total balance - reserved).
     *
     * # Returns
     *
     * The liquidity available for withdrawal or new positions
     */
    get_available_liquidity: (options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<i128>>;
    /**
     * Construct and simulate a get_position_collateral transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the collateral deposited for a specific position.
     *
     * # Arguments
     *
     * * `position_id` - The position ID
     *
     * # Returns
     *
     * The collateral amount for the position
     */
    get_position_collateral: ({ position_id }: {
        position_id: u64;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<u128>>;
    /**
     * Construct and simulate a deposit_position_collateral transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Deposit collateral for a position.
     *
     * # Arguments
     *
     * * `position_manager` - The Position Manager contract address
     * * `position_id` - The position ID
     * * `trader` - The trader's address
     * * `amount` - The collateral amount to deposit
     *
     * # Panics
     *
     * Panics if caller is not the authorized position manager
     */
    deposit_position_collateral: ({ position_manager, position_id, trader, amount }: {
        position_manager: string;
        position_id: u64;
        trader: string;
        amount: u128;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a withdraw_position_collateral transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Withdraw collateral for a position (when closing).
     *
     * # Arguments
     *
     * * `position_manager` - The Position Manager contract address
     * * `position_id` - The position ID
     * * `trader` - The trader's address
     * * `amount` - The collateral amount to withdraw
     *
     * # Panics
     *
     * Panics if caller is not the authorized position manager
     */
    withdraw_position_collateral: ({ position_manager, position_id, trader, amount }: {
        position_manager: string;
        position_id: u64;
        trader: string;
        amount: u128;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        token: (json: string) => AssembledTransaction<string>;
        deposit: (json: string) => AssembledTransaction<bigint>;
        withdraw: (json: string) => AssembledTransaction<bigint>;
        get_shares: (json: string) => AssembledTransaction<bigint>;
        initialize: (json: string) => AssembledTransaction<null>;
        config_manager: (json: string) => AssembledTransaction<string>;
        get_total_shares: (json: string) => AssembledTransaction<bigint>;
        release_liquidity: (json: string) => AssembledTransaction<null>;
        reserve_liquidity: (json: string) => AssembledTransaction<null>;
        get_total_deposits: (json: string) => AssembledTransaction<bigint>;
        set_position_manager: (json: string) => AssembledTransaction<null>;
        get_utilization_ratio: (json: string) => AssembledTransaction<number>;
        get_reserved_liquidity: (json: string) => AssembledTransaction<bigint>;
        get_available_liquidity: (json: string) => AssembledTransaction<bigint>;
        get_position_collateral: (json: string) => AssembledTransaction<bigint>;
        deposit_position_collateral: (json: string) => AssembledTransaction<null>;
        withdraw_position_collateral: (json: string) => AssembledTransaction<null>;
    };
}
