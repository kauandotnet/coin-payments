import { omit } from 'lodash'
import {
  assertType,
} from '@faast/ts-common'
import {
  isValidXprv as isValidXprvHelper,
  isValidXpub as isValidXpubHelper,
  validateHdKey,
  xprvToXpub,
  deriveAddress,
  HDNode,
  deriveHDNode,
  deriveKeyPair,
} from './bip44'
import { HdBitcoinCashPaymentsConfig } from './types'
import { SinglesigBitcoinCashPayments } from './SinglesigBitcoinCashPayments'
import { DEFAULT_DERIVATION_PATHS } from './constants'
import { bip32MagicNumberToPrefix } from './utils'

export class HdBitcoinCashPayments extends SinglesigBitcoinCashPayments<HdBitcoinCashPaymentsConfig> {
  readonly derivationPath: string
  readonly xpub: string
  readonly xprv: string | null
  readonly hdNode: HDNode

  constructor(private config: HdBitcoinCashPaymentsConfig) {
    super(config)
    assertType(HdBitcoinCashPaymentsConfig, config)
    this.derivationPath = config.derivationPath || DEFAULT_DERIVATION_PATHS[this.addressType]

    if (this.isValidXpub(config.hdKey)) {
      this.xpub = config.hdKey
      this.xprv = null
    } else if (this.isValidXprv(config.hdKey)) {
      this.xpub = xprvToXpub(config.hdKey, this.derivationPath, this.bitcoinjsNetwork)
      this.xprv = config.hdKey
    } else {
      const providedPrefix = config.hdKey.slice(0, 4)
      const xpubPrefix = bip32MagicNumberToPrefix(this.bitcoinjsNetwork.bip32.public)
      const xprvPrefix = bip32MagicNumberToPrefix(this.bitcoinjsNetwork.bip32.private)
      let reason = ''
      if (providedPrefix !== xpubPrefix && providedPrefix !== xprvPrefix) {
        reason = ` with prefix ${providedPrefix} but expected ${xprvPrefix} or ${xpubPrefix}`
      } else {
        reason = ` (${validateHdKey(config.hdKey, this.bitcoinjsNetwork)})`
      }
      throw new Error(
        `Invalid ${this.networkType} hdKey provided to bitcoin payments config${reason}`
      )
    }
    this.hdNode = deriveHDNode(config.hdKey, this.derivationPath, this.bitcoinjsNetwork)
  }

  isValidXprv(xprv: string) {
    return xprv.startsWith('xprv')
      ? isValidXprvHelper(xprv)
      : isValidXprvHelper(xprv, this.bitcoinjsNetwork)
  }

  isValidXpub(xpub: string) {
    return xpub.startsWith('xpub')
      ? isValidXpubHelper(xpub)
      : isValidXpubHelper(xpub, this.bitcoinjsNetwork)
  }

  getFullConfig(): HdBitcoinCashPaymentsConfig {
    return {
      ...this.config,
      network: this.networkType,
      addressType: this.addressType,
      derivationPath: this.derivationPath,
    }
  }

  getPublicConfig(): HdBitcoinCashPaymentsConfig {
    return {
      ...omit(this.getFullConfig(), ['logger', 'server', 'hdKey']),
      hdKey: this.xpub,
    }
  }
  getAccountId(index: number): string {
    return this.xpub
  }
  getAccountIds(index?: number): string[] {
    return [this.xpub]
  }

  getAddress(index: number): string {
    return deriveAddress(this.hdNode, index, this.bitcoinjsNetwork, this.addressType)
  }

  getKeyPair(index: number) {
    return deriveKeyPair(this.hdNode, index, this.bitcoinjsNetwork)
  }
}
