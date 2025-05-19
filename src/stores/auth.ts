import { defineStore } from 'pinia'
import { WalletService, WalletInfo } from 'src/services/authz/wallet'
import { OfflineSigner } from '@cosmjs/proto-signing'

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
    async createWallet() {
      const walletService = WalletService.getInstance()
      this.walletInfo = await walletService.createWallet()
      console.log('Wallet created:', this.walletInfo)
      await this.connectWallet(this.walletInfo.mnemonic)
      return this.walletInfo
    },

    async connectWallet(mnemonic: string) {
      console.log('Connecting wallet with mnemonic:', mnemonic)
      const walletService = WalletService.getInstance()
      await walletService.connectWallet(mnemonic)
      this.isConnected = walletService.isConnected()
      console.log('Wallet connected, state:', { isConnected: this.isConnected, walletInfo: this.walletInfo })
    },

    async connectWithExternalSigner(signer: OfflineSigner) {
      console.log('Connecting external signer')
      const walletService = WalletService.getInstance()
      await walletService.connectWithExternalSigner(signer)
      this.isConnected = walletService.isConnected()
      console.log('External signer connected, state:', { isConnected: this.isConnected })
    },

    async restoreConnection() {
      console.log('Attempting to restore connection:', {
        hasWalletInfo: !!this.walletInfo,
        isConnected: this.isConnected,
        walletInfo: this.walletInfo
      })

      if (this.walletInfo?.mnemonic) {
        try {
          await this.connectWallet(this.walletInfo.mnemonic)
          console.log('Connection restored successfully')
        } catch (error) {
          console.error('Failed to restore wallet connection:', error)
          this.disconnect()
        }
      }
    },

    async grantAgentAuthorization(geaterAddress: string, agentAddress: string, msgType: string, expiration?: Date) {
      console.log('Granting authorization:', {
        userAddress: geaterAddress,
        isConnected: this.isConnected,
        walletInfo: this.walletInfo,
        msgType
      })

      const walletService = WalletService.getInstance()
      if (!walletService.isConnected()) {
        throw new Error('Wallet not connected')
      }

      await walletService.grantAuthorization(geaterAddress, agentAddress, msgType, expiration)
    },

    async revokeAgentAuthorization(agentAddress: string, msgType: string) {
      console.log('Revoking authorization:', {
        isConnected: this.isConnected,
        walletInfo: this.walletInfo,
        msgType
      })

      const walletService = WalletService.getInstance()
      if (!walletService.isConnected()) {
        throw new Error('Wallet not connected')
      }

      await walletService.revokeAuthorization(agentAddress, msgType)
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
