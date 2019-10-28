import { NetworkType } from '@faast/payments-common';
import { StellarCreateTransactionOptions } from './types';
export declare const PACKAGE_NAME = "stellar-payments";
export declare const DECIMAL_PLACES = 7;
export declare const BASE_UNITS = 10000000;
export declare const MIN_BALANCE = 1;
export declare const DEFAULT_CREATE_TRANSACTION_OPTIONS: StellarCreateTransactionOptions;
export declare const DEFAULT_TX_TIMEOUT_SECONDS: number;
export declare const NOT_FOUND_ERRORS: string[];
export declare const DEFAULT_NETWORK = NetworkType.Mainnet;
export declare const DEFAULT_MAINNET_SERVER = "https://horizon.stellar.org";
export declare const DEFAULT_TESTNET_SERVER = "https://horizon-testnet.stellar.org";