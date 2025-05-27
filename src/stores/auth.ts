import { defineStore } from 'pinia'
import { WalletService, WalletInfo } from 'src/services/authz/wallet-service'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { CosmosWallet } from 'src/services/cosmos/CosmosWallet'
import { KeplerWallet } from 'src/services/kepler/KeplerWallet'

interface AuthState {
  walletInfo: WalletInfo | null;
  isConnected: boolean;
}

export const useAuthStore = defineStore({
  id: 'auth',
  state: (): AuthState => ({
    walletInfo: null,
    isConnected: false
  }),

  actions: {
    async createGranteeWallet(pin: string) {
      const walletService = WalletService.getInstance()
      this.walletInfo = await walletService.createGranteeWallet(pin)

      return this.walletInfo
    },

    async connectGranteeWallet(encryptedMnemonic: string, pin: string) {
      const walletService = WalletService.getInstance()
      await walletService.connectGranteeWallet(encryptedMnemonic, pin)
      this.isConnected = walletService.isConnected()
      console.log('Wallet connected, state:', { isConnected: this.isConnected, walletInfo: this.walletInfo })
    },

    async connectWithExternalSigner(signer: OfflineSigner) {
      console.log('[External] Connecting external signer')
      const walletService = WalletService.getInstance()
      await walletService.connectWithExternalSigner(signer)
      this.isConnected = walletService.isConnected()
      console.log('External signer connected, state:', { isConnected: this.isConnected })
    },

    async initializeFromStorage(granterWallet: CosmosWallet | KeplerWallet, pin: string) {
      if (!this.walletInfo?.mnemonic) {
        console.log('[External] Wallet not found')
        return
      }

      const walletService = WalletService.getInstance()
      await this.connectGranteeWallet(this.walletInfo.mnemonic, pin)
      await walletService.connectWithExternalSigner(granterWallet.getOfflineSigner())
      this.isConnected = true

      console.log('Wallet initialized from storage, state:', { isConnected: this.isConnected })
    },

    async grantAgentAuthorization(granterAddress: string, agentAddress: string, msgType: string, expiration?: Date) {
      console.log('Granting authorization:', {
        userAddress: granterAddress,
        isConnected: this.isConnected,
        walletInfo: this.walletInfo,
        msgType
      })

      const walletService = WalletService.getInstance()
      if (!walletService.isConnected()) {
        throw new Error('Wallet not connected')
      }

      await walletService.grantAuthorization(granterAddress, agentAddress, msgType, expiration)
    },

    async revokeAgentAuthorization(granterAddress: string, agentAddress: string, msgType: string) {
      console.log('Revoking authorization:', {
        isConnected: this.isConnected,
        walletInfo: this.walletInfo,
        msgType
      })

      const walletService = WalletService.getInstance()
      if (!walletService.isConnected()) {
        throw new Error('Wallet not connected')
      }

      await walletService.revokeAuthorization(granterAddress, agentAddress, msgType)
    },

    disconnect() {
      console.log('Disconnecting wallet')
      this.walletInfo = null
      this.isConnected = false
    }
  },

  persist: {
    storage: localStorage,
    paths: ['walletInfo', 'isConnected']
  }
})
