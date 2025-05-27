import { Decimal } from '@cosmjs/math'
import { DirectSecp256k1HdWallet, OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing'
import { SigningStargateClient, coins } from '@cosmjs/stargate'
import { GenericAuthorization } from 'cosmjs-types/cosmos/authz/v1beta1/authz'
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx'
import { Any } from 'cosmjs-types/google/protobuf/any'
import { EncryptionService } from 'src/services/encryption/EncryptionService'
import { config } from '../constants'

export interface WalletInfo {
  address: string;
  mnemonic: string;
}

export class WalletService {
  // eslint-disable-next-line no-use-before-define
  private static instance: WalletService
  private granterWallet: OfflineDirectSigner | null = null
  private granteeWallet: OfflineDirectSigner | null = null

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  isConnected(): boolean {
    return this.isGranterConnected() && this.isGranteeConnected()
  }

  async getAccounts() {
    if (!this.granterWallet) {
      throw new Error('Wallet not connected')
    }
    return this.granterWallet.getAccounts()
  }

  async createGranteeWallet(pin: string): Promise<WalletInfo> {
    try {
      const granteeWallet = await DirectSecp256k1HdWallet.generate(24, {
        prefix: 'cyber'
      })
      const [firstAccount] = await granteeWallet.getAccounts()
      const encryptedMnemonic = await EncryptionService.encryptMnemonic(granteeWallet.mnemonic, pin)
      this.granteeWallet = granteeWallet

      return {
        address: firstAccount.address,
        mnemonic: encryptedMnemonic
      }
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw new Error(`Failed to create wallet: ${error.message}`)
    }
  }

  async connectGranteeWallet(encryptedMnemonic: string, pin: string): Promise<void> {
    try {
      const decryptedMnemonic = await EncryptionService.decryptMnemonic(encryptedMnemonic, pin)
      this.granteeWallet = await DirectSecp256k1HdWallet.fromMnemonic(decryptedMnemonic, {
        prefix: 'cyber'
      })
    } catch (error) {
      console.error('Error connecting wallet:', error)
      this.granterWallet = null

      throw new Error(`Failed to connect wallet: ${error.message}`)
    }
  }

  async connectWithExternalSigner(signer: OfflineSigner): Promise<void> {
    this.granterWallet = signer as OfflineDirectSigner
    const accounts = await signer.getAccounts()
    if (accounts.length === 0) throw new Error('No accounts in external signer')
  }

  async grantAuthorization(
    granterAddress: string,
    granteeAddress: string,
    msgType: string = '/cosmwasm.wasm.v1.MsgExecuteContract',
    expiration?: Date
  ): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected')
    }

    try {
      // Use address from wallet if available
      console.log('Granting authorization:', {
        granter: granterAddress,
        grantee: granteeAddress,
        msgType
      })

      // GenericAuthorization для любого типа
      const genericAuth = GenericAuthorization.fromPartial({
        msg: msgType
      })

      const grantMsg: MsgGrant = {
        granter: granterAddress,
        grantee: granteeAddress,
        grant: {
          authorization: Any.fromPartial({
            typeUrl: '/cosmos.authz.v1beta1.GenericAuthorization',
            value: GenericAuthorization.encode(genericAuth).finish()
          }),
          expiration: expiration ? {
            seconds: BigInt(Math.floor(expiration.getTime() / 1000)),
            nanos: 0
          } : undefined
        }
      }

      if (!this.granterWallet) throw new Error('Granter wallet not connected')
      const client = await SigningStargateClient.connectWithSigner(config.NODE_RPC_URL, this.granterWallet, {
        gasPrice: {
          amount: Decimal.fromUserInput(config.GAS_PRICE_AMOUNT, 6),
          denom: config.FEE_DENOM
        }
      })

      const result = await client.signAndBroadcast(granterAddress, [{
        typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
        value: grantMsg
      }], {
        amount: coins('100000', config.FEE_DENOM),
        gas: '100000'
      })

      if (result.code !== 0) {
        throw new Error(`Failed to grant authorization: ${result.rawLog}`)
      }

      console.log('Authorization granted:', result)
    } catch (error) {
      console.error('Error granting authorization:', error)
      throw new Error(`Failed to grant authorization: ${error.message}`)
    }
  }

  async revokeAuthorization(
    granterAddress: string,
    granteeAddress: string,
    msgType: string = '/cosmwasm.wasm.v1.MsgExecuteContract'
  ): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected')
    }

    try {
      console.log('Revoking authorization:', {
        granter: granterAddress,
        grantee: granteeAddress,
        msgType
      })

      const msg = MsgRevoke.fromPartial({
        granter: granterAddress,
        grantee: granteeAddress,
        msgTypeUrl: msgType
      })

      if (!this.granterWallet) throw new Error('Granter wallet not connected')
      const client = await SigningStargateClient.connectWithSigner(config.NODE_RPC_URL, this.granterWallet, {
        gasPrice: {
          amount: Decimal.fromUserInput(config.GAS_PRICE_AMOUNT, 6),
          denom: config.FEE_DENOM
        }
      })

      const result = await client.signAndBroadcast(granterAddress, [{
        typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
        value: msg
      }], {
        amount: coins('100000', config.FEE_DENOM),
        gas: '100000'
      })

      if (result.code !== 0) {
        throw new Error(`Failed to revoke authorization: ${result.rawLog}`)
      }

      console.log('Authorization revoked:', result)
    } catch (error) {
      console.error('Error revoking authorization:', error)
      throw new Error(`Failed to revoke authorization: ${error.message}`)
    }
  }

  async sendTokensToGrantee(
    granteeAddress: string,
    amountDenom: string = config.FEE_DENOM,
    amountValue: string = '1'
  ): Promise<void> {
    if (!this.granterWallet) {
      throw new Error('Granter wallet not connected. Cannot send tokens.')
    }

    try {
      const [granterAccount] = await this.granterWallet.getAccounts()
      const granterAddress = granterAccount.address

      console.log(`Sending ${amountValue}${amountDenom} from ${granterAddress} to ${granteeAddress}`)

      const client = await this.getClient(this.granterWallet)
      const amount = coins(amountValue, amountDenom)

      const result = await client.sendTokens(granterAddress, granteeAddress, amount, 'auto')

      if (result.code !== 0) {
        throw new Error(`Failed to send tokens to grantee: ${result.rawLog}`)
      }
      console.log('Tokens sent to grantee successfully:', result)
    } catch (error) {
      console.error('Error sending tokens to grantee:', error)
      throw new Error(`Failed to send tokens to grantee: ${error.message}`)
    }
  }

  isGranterConnected(): boolean {
    return this.granterWallet !== null
  }

  isGranteeConnected(): boolean {
    return this.granteeWallet !== null
  }

  async getGranterClient(): Promise<SigningStargateClient> {
    if (!this.granterWallet) {
      throw new Error('Granter wallet not connected')
    }
    return this.getClient(this.granterWallet)
  }

  async getGranteeClient(): Promise<SigningStargateClient> {
    if (!this.granteeWallet) {
      throw new Error('Grantee wallet not connected')
    }
    return this.getClient(this.granteeWallet)
  }

  disconnectGranter() {
    this.granterWallet = null
  }

  disconnectGrantee() {
    this.granteeWallet = null
  }

  private async getClient(wallet: OfflineDirectSigner): Promise<SigningStargateClient> {
    return SigningStargateClient.connectWithSigner(config.NODE_RPC_URL, wallet, {
      gasPrice: {
        amount: Decimal.fromUserInput(config.GAS_PRICE_AMOUNT, 6),
        denom: config.FEE_DENOM
      }
    })
  }
}
declare global {
  interface Window {
    WalletService: typeof WalletService;
  }
}

window.WalletService = WalletService
