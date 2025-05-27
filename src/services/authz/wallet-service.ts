import { SigningStargateClient, coins } from '@cosmjs/stargate'
import { DirectSecp256k1HdWallet, OfflineSigner } from '@cosmjs/proto-signing'
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx'
import { Any } from 'cosmjs-types/google/protobuf/any'
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp'
import { Decimal } from '@cosmjs/math'
import { config } from '../constants'
import { SendAuthorization } from 'cosmjs-types/cosmos/bank/v1beta1/authz'
import { StakeAuthorization } from 'cosmjs-types/cosmos/staking/v1beta1/authz'
import { EncryptionService } from 'src/services/encryption/EncryptionService'

export interface WalletInfo {
  address: string;
  mnemonic: string;
}

export class WalletService {
  // eslint-disable-next-line no-use-before-define
  private static instance: WalletService
  private granteeClient: SigningStargateClient | null = null
  private granterClient: SigningStargateClient | null = null
  private granterWallet: DirectSecp256k1HdWallet | null = null
  private granteeWallet: DirectSecp256k1HdWallet | null = null
  private isInitialized: boolean = false

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  isConnected(): boolean {
    return this.granteeClient !== null && this.granterWallet !== null && this.isInitialized
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

      this.granteeClient = await SigningStargateClient.connectWithSigner(
        config.NODE_RPC_URL,
        this.granteeWallet,
        {
          gasPrice: {
            amount: Decimal.fromUserInput(config.GAS_PRICE_AMOUNT, 6),
            denom: config.FEE_DENOM
          }
        }
      )

      this.isInitialized = true
    } catch (error) {
      console.error('Error connecting wallet:', error)
      this.granteeClient = null
      this.granterWallet = null
      this.isInitialized = false
      throw new Error(`Failed to connect wallet: ${error.message}`)
    }
  }

  async connectWithExternalSigner(signer: OfflineSigner): Promise<void> {
    const accounts = await signer.getAccounts()
    if (accounts.length === 0) throw new Error('No accounts in external signer')

    // this.wallet = null // сброс локального кошелька
    this.granterClient = await SigningStargateClient.connectWithSigner(config.NODE_RPC_URL, signer, {
      gasPrice: {
        amount: Decimal.fromUserInput(config.GAS_PRICE_AMOUNT, 6),
        denom: config.FEE_DENOM
      }
    })

    console.log('Connected with external signer:', accounts[0].address)
    this.isInitialized = true
  }

  private getAuthorizationType(msgType: string): { typeUrl: string; value: Uint8Array } {
    switch (msgType) {
      case '/cosmos.bank.v1beta1.MsgSend':
        return {
          typeUrl: '/cosmos.bank.v1beta1.SendAuthorization',
          value: SendAuthorization.encode({
            spendLimit: [],
            allowList: []
          }).finish()
        }
      case '/cosmos.staking.v1beta1.MsgDelegate':
      case '/cosmos.staking.v1beta1.MsgUndelegate':
      case '/cosmos.staking.v1beta1.MsgWithdrawDelegatorReward':
        return {
          typeUrl: '/cosmos.staking.v1beta1.StakeAuthorization',
          value: StakeAuthorization.encode({
            allowList: {
              address: []
            },
            maxTokens: undefined,
            authorizationType: 1 // AUTHORIZATION_TYPE_DELEGATE
          }).finish()
        }
      default:
        throw new Error(`Unsupported message type: ${msgType}`)
    }
  }

  async grantAuthorization(
    granterAddress: string,
    granteeAddress: string,
    msgType: string,
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

      const sendAuth = SendAuthorization.fromPartial({
        spendLimit: coins('10000', config.FEE_DENOM)
      })

      const grantMsg: MsgGrant = {
        granter: granterAddress,
        grantee: granteeAddress,
        grant: {
          authorization: Any.fromPartial({
            typeUrl: '/cosmos.bank.v1beta1.SendAuthorization',
            value: SendAuthorization.encode(sendAuth).finish()
          }),
          expiration: expiration ? {
            seconds: BigInt(Math.floor(expiration.getTime() / 1000)),
            nanos: 0
          } : undefined
        }
      }

      const result = await this.granterClient!.signAndBroadcast(granterAddress, [{
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
    msgType: string
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

      const result = await this.granterClient!.signAndBroadcast(granterAddress, [{
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

  async getSigner(): Promise<OfflineSigner> {
    if (!this.granterWallet) {
      throw new Error('Wallet not connected')
    }
    return this.granterWallet
  }
}
