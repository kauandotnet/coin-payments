import * as t from 'io-ts'
import {
  requiredOptionalCodec,
  extendCodec,
  enumCodec,
  nullable,
  DateT,
  Logger,
  functionT,
  Numeric,
  optional,
} from '@faast/ts-common'

export type MaybePromise<T> = Promise<T> | T

export const NullableOptionalString = t.union([t.string, t.null, t.undefined])
export type NullableOptionalString = t.TypeOf<typeof NullableOptionalString>

export enum NetworkType {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}
export const NetworkTypeT = enumCodec<NetworkType>(NetworkType, 'NetworkType')

export const BaseConfig = t.partial(
  {
    network: NetworkTypeT,
    logger: Logger,
  },
  'BaseConfig',
)
export type BaseConfig = t.TypeOf<typeof BaseConfig>

export const KeyPairsConfigParam = t.union([
  t.array(NullableOptionalString),
  t.record(t.number, NullableOptionalString)
], 'KeyPairsConfigParam')
export type KeyPairsConfigParam = t.TypeOf<typeof KeyPairsConfigParam>

export const Payport = requiredOptionalCodec(
  {
    address: t.string,
  },
  {
    extraId: nullable(t.string),
  },
  'Payport',
)
export type Payport = t.TypeOf<typeof Payport>

export const ResolveablePayport = t.union([Payport, t.string, t.number], 'ResolveablePayport')
export type ResolveablePayport = t.TypeOf<typeof ResolveablePayport>

export enum FeeLevel {
  Custom = 'custom',
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}
export const FeeLevelT = enumCodec<FeeLevel>(FeeLevel, 'FeeLevel')

export const AutoFeeLevels = t.keyof({
  [FeeLevel.Low]: null,
  [FeeLevel.Medium]: null,
  [FeeLevel.High]: null,
}, 'AutoFeeLevels')
export type AutoFeeLevels = t.TypeOf<typeof AutoFeeLevels>

export enum FeeRateType {
  Main = 'main', // ie bitcoins, ethers
  Base = 'base', // ie satoshis, wei
  BasePerWeight = 'base/weight', // ie satoshis per byte, gas price (wei per gas)
}
export const FeeRateTypeT = enumCodec<FeeRateType>(FeeRateType, 'FeeRateType')

export const FeeRate = t.type({
  feeRate: t.string,
  feeRateType: FeeRateTypeT,
}, 'FeeRate')
export type FeeRate = t.TypeOf<typeof FeeRate>

export const FeeOptionCustom = extendCodec(
  FeeRate,
  {},
  {
    feeLevel: t.literal(FeeLevel.Custom),
  },
  'FeeOptionCustom',
)
export type FeeOptionCustom = t.TypeOf<typeof FeeOptionCustom>

export const FeeOptionLevel = t.partial(
  {
    feeLevel: t.union([t.literal(FeeLevel.High), t.literal(FeeLevel.Medium), t.literal(FeeLevel.Low)]),
  },
  'FeeOptionLevel',
)
export type FeeOptionLevel = t.TypeOf<typeof FeeOptionLevel>

export const FeeOption = t.union([FeeOptionCustom, FeeOptionLevel], 'FeeOption')
export type FeeOption = t.TypeOf<typeof FeeOption>

export const UtxoInfo = requiredOptionalCodec(
  {
    txid: t.string,
    vout: t.number,
    value: t.string, // main denomination
  },
  {
    satoshis: t.union([t.number, t.string]),
    confirmations: t.number,
    height: t.string,
    lockTime: t.string,
    coinbase: t.boolean,
  },
  'UtxoInfo',
)
export type UtxoInfo = t.TypeOf<typeof UtxoInfo>

export const WeightedChangeOutput = t.type(
  {
    address: t.string,
    weight: t.number,
  },
  'WeightedChangeOutput',
)
export type WeightedChangeOutput = t.TypeOf<typeof WeightedChangeOutput>

export const CreateTransactionOptions = extendCodec(
  FeeOption,
  {},
  {
    sequenceNumber: Numeric, // Ripple/Stellar/Ethereum sequence number or nonce
    payportBalance: Numeric, // Spendable balance at the from payport (useful in conjunction with a BalanceMonitor)
    utxos: t.array(UtxoInfo), // Available utxos - ones that can be used
    useAllUtxos: t.boolean, // Uses all available utxos (sweep)
    useUnconfirmedUtxos: t.boolean,
  },
  'CreateTransactionOptions',
)
export type CreateTransactionOptions = t.TypeOf<typeof CreateTransactionOptions>

export const GetPayportOptions = t.partial({}, 'GetPayportOptions')
export type GetPayportOptions = t.TypeOf<typeof GetPayportOptions>

export const ResolvedFeeOption = t.type({
  targetFeeLevel: FeeLevelT,
  targetFeeRate: t.string,
  targetFeeRateType: FeeRateTypeT,
  feeBase: t.string,
  feeMain: t.string,
}, 'ResolvedFeeOption')
export type ResolvedFeeOption = t.TypeOf<typeof ResolvedFeeOption>

export const BalanceResult = t.type(
  {
    confirmedBalance: t.string, // balance with at least 1 confirmation
    unconfirmedBalance: t.string, // balance that is pending confirmation
    sweepable: t.boolean, // balance is high enough to be swept
  },
  'BalanceResult',
)
export type BalanceResult = t.TypeOf<typeof BalanceResult>

export enum TransactionStatus {
  Unsigned = 'unsigned',
  Signed = 'signed',
  Pending = 'pending',
  Confirmed = 'confirmed',
  Failed = 'failed',
}
export const TransactionStatusT = enumCodec<TransactionStatus>(TransactionStatus, 'TransactionStatus')

export const TransactionOutput = requiredOptionalCodec(
  {
    address: t.string,
    value: t.string,
  },
  {
    extraId: nullable(t.string),
  },
  'TransactionOutput',
)
export type TransactionOutput = t.TypeOf<typeof TransactionOutput>

export const TransactionCommon = requiredOptionalCodec(
  {
    status: TransactionStatusT,
    id: nullable(t.string), // network txid
    fromAddress: nullable(t.string), // sender address
    toAddress: nullable(t.string), // recipient address
    fromIndex: nullable(t.number), // sender address index
    toIndex: nullable(t.number), // recipient address index, null if not ours
    amount: nullable(t.string), // main denomination (eg "0.125")
    fee: nullable(t.string), // total fee in main denomination
  },
  {
    fromExtraId: nullable(t.string), // eg ripple sender tag
    toExtraId: nullable(t.string), // eg Monero payment ID or ripple destination tag
    sequenceNumber: nullable(t.union([t.string, t.number])), // eg Ethereum nonce or ripple sequence
    inputUtxos: t.array(UtxoInfo),
    externalOutputs: t.array(TransactionOutput)
  },
  'TransactionCommon',
)
export type TransactionCommon = t.TypeOf<typeof TransactionCommon>

const UnsignedCommon = extendCodec(
  TransactionCommon,
  {
    fromAddress: t.string,
    toAddress: t.string,
    fromIndex: t.number,
    targetFeeLevel: FeeLevelT,
    targetFeeRate: nullable(t.string),
    targetFeeRateType: nullable(FeeRateTypeT),
  },
  'UnsignedCommon',
)
type UnsignedCommon = t.TypeOf<typeof UnsignedCommon>

export const BaseUnsignedTransaction = extendCodec(
  UnsignedCommon,
  {
    status: t.literal(TransactionStatus.Unsigned),
    data: t.object,
  },
  'BaseUnsignedTransaction',
)
export type BaseUnsignedTransaction = t.TypeOf<typeof BaseUnsignedTransaction>

export const BaseSignedTransaction = extendCodec(
  UnsignedCommon,
  {
    status: t.literal(TransactionStatus.Signed),
    id: t.string,
    amount: t.string,
    fee: t.string,
    data: t.object,
  },
  'BaseSignedTransaction',
)
export type BaseSignedTransaction = t.TypeOf<typeof BaseSignedTransaction>

export const BaseTransactionInfo = extendCodec(
  TransactionCommon,
  {
    id: t.string,
    amount: t.string,
    fee: t.string,
    isExecuted: t.boolean, // true if transaction didn't fail (eg TRX/ETH contract succeeded)
    isConfirmed: t.boolean,
    confirmations: t.number, // 0 if not confirmed
    confirmationId: nullable(t.string), // eg block/ledger hash. null if not confirmed
    confirmationTimestamp: nullable(DateT), // block timestamp. null if timestamp unavailable or unconfirmed
    data: t.object,
  },
  {
    confirmationNumber: t.union([t.string, t.number]) // eg block number
  },
  'BaseTransactionInfo',
)
export type BaseTransactionInfo = t.TypeOf<typeof BaseTransactionInfo>

export const BaseBroadcastResult = t.type(
  {
    id: t.string,
  },
  'BaseBroadcastResult',
)
export type BaseBroadcastResult = t.TypeOf<typeof BaseBroadcastResult>

export const BalanceActivityType = t.union([t.literal('in'), t.literal('out')], 'BalanceActivityType')
export type BalanceActivityType = t.TypeOf<typeof BalanceActivityType>

export const BalanceActivity = t.type(
  {
    type: BalanceActivityType,
    networkType: NetworkTypeT,
    networkSymbol: t.string,
    assetSymbol: t.string,
    address: t.string,
    extraId: nullable(t.string),
    amount: t.string,
    externalId: t.string,
    activitySequence: t.string,
    confirmationId: t.string,
    confirmationNumber: t.union([t.string, t.number]),
    timestamp: DateT,
  },
  'BalanceActivity',
)
export type BalanceActivity = t.TypeOf<typeof BalanceActivity>

export const BalanceMonitorConfig = BaseConfig
export type BalanceMonitorConfig = t.TypeOf<typeof BalanceMonitorConfig>

export const GetBalanceActivityOptions = t.partial(
  {
    from: t.union([Numeric, BalanceActivity]),
    to: t.union([Numeric, BalanceActivity]),
  },
  'GetBalanceActivityOptions',
)
export type GetBalanceActivityOptions = t.TypeOf<typeof GetBalanceActivityOptions>

export type BalanceActivityCallback = (ba: BalanceActivity) => Promise<void> | void
export const BalanceActivityCallback = functionT<BalanceActivityCallback>('BalanceActivityCallback')

export type FromTo = Pick<
  BaseUnsignedTransaction,
  'fromAddress' | 'fromIndex' | 'fromExtraId' | 'toAddress' | 'toIndex' | 'toExtraId'
> & { fromPayport: Payport; toPayport: Payport }

export const RetrieveBalanceActivitiesResult = t.type(
  {
    from: t.string,
    to: t.string,
  },
  'RetrieveBalanceActivitiesResult',
)
export type RetrieveBalanceActivitiesResult = t.TypeOf<typeof RetrieveBalanceActivitiesResult>
