import { defineStore } from 'pinia'
import { WalletService, WalletInfo } from 'src/services/authz/wallet-service'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { CosmosWallet } from 'src/services/cosmos/CosmosWallet'
import { KeplerWallet } from 'src/services/kepler/KeplerWallet'

interface AuthState {
  walletInfo: WalletInfo | null;
  isConnected: boolean; // General connection or grantee connection status
  isGranterActuallyConnected: boolean; // Specific for granter wallet connection
  isGranteeActuallyAuthorized: boolean; // New state for grantee authorization
}

export const useAuthStore = defineStore({
  id: 'auth',
  state: (): AuthState => ({
    walletInfo: null,
    isConnected: false,
    isGranterActuallyConnected: false, // Initialize
    isGranteeActuallyAuthorized: false // Initialize
  }),

  actions: {
    setGranterConnectedStatus(status: boolean) {
      this.isGranterActuallyConnected = status
    },

    async createGranteeWallet(pin: string) {
      const walletService = WalletService.getInstance()
      this.walletInfo = await walletService.createGranteeWallet(pin)
      this.isGranteeActuallyAuthorized = false // Reset on new wallet creation
      // Grantee created, but overall isConnected might depend on other factors or be set after grant
      return this.walletInfo
    },

    async connectGranteeWallet(encryptedMnemonic: string, pin: string) {
      const walletService = WalletService.getInstance()
      await walletService.connectGranteeWallet(encryptedMnemonic, pin)
      // Assuming general isConnected reflects grantee + granter being ready
      this.isConnected = walletService.isGranteeConnected() && this.isGranterActuallyConnected
      console.log('Grantee Wallet connected, state:', { isConnected: this.isConnected, walletInfo: this.walletInfo })
    },

    async connectWithExternalSigner(signer: OfflineSigner) {
      console.log('[External] Connecting external signer')
      const walletService = WalletService.getInstance()
      try {
        await walletService.connectWithExternalSigner(signer)
        this.setGranterConnectedStatus(true)
        // Update general isConnected status if needed
        this.isConnected = this.isGranterActuallyConnected && walletService.isGranteeConnected()
        console.log('External signer connected, state:', { isConnected: this.isConnected, isGranterActuallyConnected: this.isGranterActuallyConnected })
      } catch (error) {
        console.error('Failed to connect external signer in authStore:', error)
        this.setGranterConnectedStatus(false)
        this.isConnected = false
      }
    },

    async initializeFromStorage(granterWallet: CosmosWallet | KeplerWallet, pin: string) {
      if (!this.walletInfo?.mnemonic) {
        console.log('[External] Wallet not found for initializeFromStorage')
        return
      }
      // Assume granterWallet (Kepler/Cosmos) is already connected or will be by caller
      // So, update granter connected status based on its presence/ability to get signer
      try {
        await WalletService.getInstance().connectWithExternalSigner(granterWallet.getOfflineSigner())
        this.setGranterConnectedStatus(true)
      } catch (error) {
        console.error('Error connecting granter during initializeFromStorage:', error)
        this.setGranterConnectedStatus(false)
      }

      await this.connectGranteeWallet(this.walletInfo.mnemonic, pin)
      // isConnected will be updated by connectGranteeWallet
      console.log('Wallet initialized from storage, state:', { isConnected: this.isConnected, isGranterActuallyConnected: this.isGranterActuallyConnected })
    },

    async grantAgentAuthorization(granterAddress: string, agentAddress: string, msgType?: string, expiration?: Date) {
      const walletService = WalletService.getInstance()
      if (!this.isGranterActuallyConnected) { // Check reactive state
        throw new Error('Granter wallet not connected')
      }
      // isConnected in WalletService checks both, but for granting, only granter matters for this step
      await walletService.grantAuthorization(granterAddress, agentAddress, msgType, expiration)
      this.isGranteeActuallyAuthorized = true // Set to true after successful grant
    },

    async revokeAgentAuthorization(granterAddress: string, agentAddress: string, msgType?: string) {
      const walletService = WalletService.getInstance()
      if (!this.isGranterActuallyConnected) { // Check reactive state
        throw new Error('Granter wallet not connected')
      }
      await walletService.revokeAuthorization(granterAddress, agentAddress, msgType)
      this.isGranteeActuallyAuthorized = false // Set to false after successful revoke
    },

    disconnect() {
      console.log('Disconnecting granter and grantee wallets')
      const walletService = WalletService.getInstance()
      walletService.disconnectGranter()
      walletService.disconnectGrantee() // Ensure grantee is also cleared in service

      this.setGranterConnectedStatus(false)
      this.walletInfo = null
      this.isConnected = false
      this.isGranteeActuallyAuthorized = false // Reset on disconnect
    }
  },

  persist: {
    storage: localStorage,
    paths: ['walletInfo', 'isConnected', 'isGranterActuallyConnected', 'isGranteeActuallyAuthorized'] // Persist new state
  }
})
