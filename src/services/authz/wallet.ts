import { SigningStargateClient, coins } from '@cosmjs/stargate'
import { DirectSecp256k1HdWallet, OfflineSigner } from '@cosmjs/proto-signing'
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx'
import { Any } from 'cosmjs-types/google/protobuf/any'
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp'
import { Decimal } from '@cosmjs/math'
import { config } from '../constants'
import { SendAuthorization } from 'cosmjs-types/cosmos/bank/v1beta1/authz'
import { StakeAuthorization } from 'cosmjs-types/cosmos/staking/v1beta1/authz'

export interface WalletInfo {
  address: string;
  mnemonic: string;
}

export class WalletService {
  // eslint-disable-next-line no-use-before-define
  private static instance: WalletService
  private client: SigningStargateClient | null = null
  private wallet: DirectSecp256k1HdWallet | null = null
  private isInitialized: boolean = false

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  isConnected(): boolean {
    return this.client !== null && this.wallet !== null && this.isInitialized
  }

  async initializeFromStorage(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      const storedWalletInfo = localStorage.getItem('walletInfo')
      if (!storedWalletInfo) {
        console.log('No wallet info found in storage')
        return
      }

      const walletInfo: WalletInfo = JSON.parse(storedWalletInfo)
      await this.connectWallet(walletInfo.mnemonic)
      this.isInitialized = true
      console.log('Wallet initialized from storage:', walletInfo.address)
    } catch (error) {
      console.error('Failed to initialize wallet from storage:', error)
      this.isInitialized = false
      throw new Error(`Failed to initialize wallet: ${error.message}`)
    }
  }

  async getAccounts() {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }
    return this.wallet.getAccounts()
  }

  async createWallet(): Promise<WalletInfo> {
    try {
      const wallet = await DirectSecp256k1HdWallet.generate(24, {
        prefix: 'cyber'
      })
      const [firstAccount] = await wallet.getAccounts()
      console.log('Created wallet:', firstAccount.address)
      return {
        address: firstAccount.address,
        mnemonic: wallet.mnemonic
      }
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw new Error(`Failed to create wallet: ${error.message}`)
    }
  }

  async connectWallet(mnemonic: string): Promise<void> {
    try {
      this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: 'cyber'
      })
      const [firstAccount] = await this.wallet.getAccounts()
      console.log('Connecting wallet:', firstAccount.address)

      this.client = await SigningStargateClient.connectWithSigner(
        config.NODE_RPC_URL,
        this.wallet,
        {
          gasPrice: {
            amount: Decimal.fromUserInput(config.GAS_PRICE_AMOUNT, 6),
            denom: config.FEE_DENOM
          }
        }
      )
      console.log('Connected to RPC:', config.NODE_RPC_URL)
      this.isInitialized = true
    } catch (error) {
      console.error('Error connecting wallet:', error)
      this.client = null
      this.wallet = null
      this.isInitialized = false
      throw new Error(`Failed to connect wallet: ${error.message}`)
    }
  }

  async connectWithExternalSigner(signer: OfflineSigner): Promise<void> {
    const accounts = await signer.getAccounts()
    if (accounts.length === 0) throw new Error('No accounts in external signer')

    // this.wallet = null // сброс локального кошелька
    this.client = await SigningStargateClient.connectWithSigner(config.NODE_RPC_URL, signer, {
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
      const [granter] = await this.wallet?.getAccounts() ?? []
      const granterAddr = granter?.address ?? granterAddress
      console.log('Granting authorization:', {
        granter: granterAddr,
        grantee: granteeAddress,
        msgType
      })

      const authorization = this.getAuthorizationType(msgType)

      const msg = MsgGrant.fromPartial({
        granter: granterAddr,
        grantee: granteeAddress,
        grant: {
          authorization: Any.fromPartial({
            typeUrl: authorization.typeUrl,
            value: authorization.value
          }),
          expiration: expiration ? {
            seconds: BigInt(Math.floor(expiration.getTime() / 1000)),
            nanos: 0
          } : undefined
        }
      })

      const result = await this.client!.signAndBroadcast(granterAddr, [{
        typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
        value: msg
      }], {
        amount: coins('100000', config.FEE_DENOM),
        gas: '100000'
      })

      console.log('Authorization granted:', result)
    } catch (error) {
      console.error('Error granting authorization:', error)
      throw new Error(`Failed to grant authorization: ${error.message}`)
    }
  }

  async revokeAuthorization(
    granteeAddress: string,
    msgType: string
  ): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected')
    }

    try {
      const [granter] = await this.wallet!.getAccounts()
      console.log('Revoking authorization:', {
        granter: granter.address,
        grantee: granteeAddress,
        msgType
      })

      const msg = MsgRevoke.fromPartial({
        granter: granter.address,
        grantee: granteeAddress,
        msgTypeUrl: msgType
      })

      const result = await this.client!.signAndBroadcast(granter.address, [{
        typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
        value: msg
      }], {
        amount: coins('100000', config.FEE_DENOM),
        gas: '100000'
      })

      console.log('Authorization revoked:', result)
    } catch (error) {
      console.error('Error revoking authorization:', error)
      throw new Error(`Failed to revoke authorization: ${error.message}`)
    }
  }

  async getSigner(): Promise<OfflineSigner> {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }
    return this.wallet
  }
}
