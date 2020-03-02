import { BalanceResult, BasePayments, FeeOption, Payport, FromTo, ResolveablePayport, CreateTransactionOptions as TransactionOptions } from '@faast/payments-common';
import { EthereumTransactionInfo, EthereumUnsignedTransaction, EthereumSignedTransaction, EthereumBroadcastResult, BaseEthereumPaymentsConfig, EthereumResolvedFeeOption } from './types';
import { EthereumPaymentsUtils } from './EthereumPaymentsUtils';
export declare abstract class BaseEthereumPayments<Config extends BaseEthereumPaymentsConfig> extends EthereumPaymentsUtils implements BasePayments<Config, EthereumUnsignedTransaction, EthereumSignedTransaction, EthereumBroadcastResult, EthereumTransactionInfo> {
    private eth;
    private gasStation;
    private config;
    constructor(config: Config);
    init(): Promise<void>;
    destroy(): Promise<void>;
    getFullConfig(): Config;
    abstract getPublicConfig(): Config;
    resolvePayport(payport: ResolveablePayport): Promise<Payport>;
    resolveFromTo(from: number, to: ResolveablePayport): Promise<FromTo>;
    resolveFeeOption(feeOption: FeeOption): Promise<EthereumResolvedFeeOption>;
    private resolveCustomFeeOption;
    private resolveLeveledFeeOption;
    abstract getAccountIds(): string[];
    abstract getAccountId(index: number): string;
    requiresBalanceMonitor(): boolean;
    getAvailableUtxos(): Promise<never[]>;
    getUtxos(): Promise<never[]>;
    usesSequenceNumber(): boolean;
    usesUtxos(): boolean;
    abstract getPayport(index: number): Promise<Payport>;
    getBalance(resolveablePayport: ResolveablePayport): Promise<BalanceResult>;
    isSweepableBalance(balanceEth: string): Promise<boolean>;
    getNextSequenceNumber(payport: ResolveablePayport): Promise<string>;
    getTransactionInfo(txid: string): Promise<EthereumTransactionInfo>;
    createTransaction(from: number, to: ResolveablePayport, amountEth: string, options?: TransactionOptions): Promise<EthereumUnsignedTransaction>;
    createSweepTransaction(from: number, to: ResolveablePayport, options?: TransactionOptions): Promise<EthereumUnsignedTransaction>;
    signTransaction(unsignedTx: EthereumUnsignedTransaction): Promise<EthereumSignedTransaction>;
    broadcastTransaction(tx: EthereumSignedTransaction): Promise<EthereumBroadcastResult>;
    abstract getPrivateKey(index: number): Promise<string>;
    private createTransactionObject;
}
export default BaseEthereumPayments;
