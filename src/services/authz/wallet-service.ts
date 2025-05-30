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

export interface GranteeWalletInfo extends WalletInfo {
  signer: OfflineDirectSigner;
}

export class WalletService {
  // eslint-disable-next-line no-use-before-define
  private static instance: WalletService

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  async getAccounts(signer: OfflineDirectSigner) {
    if (!signer) {
      throw new Error('Signer not provided')
    }
    return signer.getAccounts()
  }

  async createGranteeWallet(pin: string): Promise<GranteeWalletInfo> {
    try {
      const granteeSigner = await DirectSecp256k1HdWallet.generate(24, {
        prefix: 'cyber'
      })
      const [firstAccount] = await granteeSigner.getAccounts()
      const encryptedMnemonic = await EncryptionService.encryptMnemonic(granteeSigner.mnemonic, pin)

      return {
        address: firstAccount.address,
        mnemonic: encryptedMnemonic,
        signer: granteeSigner
      }
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw new Error(`Failed to create wallet: ${error.message}`)
    }
  }

  async connectGranteeWallet(encryptedMnemonic: string, pin: string): Promise<OfflineDirectSigner> {
    try {
      const decryptedMnemonic = await EncryptionService.decryptMnemonic(encryptedMnemonic, pin)
      const granteeSigner = await DirectSecp256k1HdWallet.fromMnemonic(decryptedMnemonic, {
        prefix: 'cyber'
      })
      return granteeSigner
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw new Error(`Failed to connect wallet: ${error.message}`)
    }
  }

  async validateExternalSigner(signer: OfflineSigner): Promise<void> {
    const accounts = await signer.getAccounts()
    if (accounts.length === 0) throw new Error('No accounts in external signer')
  }

  async grantAuthorization(
    granterSigner: OfflineDirectSigner,
    granterAddress: string,
    granteeAddress: string,
    msgType: string = '/cosmwasm.wasm.v1.MsgExecuteContract',
    expiration?: Date
  ): Promise<void> {
    if (!granterSigner) {
      throw new Error('Granter signer not provided')
    }

    try {
      console.log('Granting authorization:', {
        granter: granterAddress,
        grantee: granteeAddress,
        msgType
      })

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

      const client = await this.getClient(granterSigner)

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
    granterSigner: OfflineDirectSigner,
    granterAddress: string,
    granteeAddress: string,
    msgType: string = '/cosmwasm.wasm.v1.MsgExecuteContract'
  ): Promise<void> {
    if (!granterSigner) {
      throw new Error('Granter signer not provided')
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

      const client = await this.getClient(granterSigner)

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
    granterSigner: OfflineDirectSigner,
    granteeAddress: string,
    amountDenom: string = config.FEE_DENOM,
    amountValue: string = '105000'
  ): Promise<void> {
    if (!granterSigner) {
      throw new Error('Granter signer not connected. Cannot send tokens.')
    }

    try {
      const [granterAccount] = await granterSigner.getAccounts()
      const granterAddress = granterAccount.address

      console.log(`Sending ${amountValue}${amountDenom} from ${granterAddress} to ${granteeAddress}`)

      const client = await this.getClient(granterSigner)
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

  async getClient(signer: OfflineDirectSigner): Promise<SigningStargateClient> {
    if (!signer) {
      throw new Error('Signer must be provided to create a client.')
    }
    return SigningStargateClient.connectWithSigner(config.NODE_RPC_URL, signer, {
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
