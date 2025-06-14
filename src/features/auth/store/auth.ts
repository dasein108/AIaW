import { OfflineSigner, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { defineStore } from "pinia"
import { ref } from "vue"

import {
  WalletService,
  WalletInfo,
  GranteeWalletInfo,
} from "@/services/blockchain/authz/walletService"
import { CosmosWallet } from "@/services/blockchain/cosmos/CosmosWallet"
import { KeplerWallet } from "@/services/blockchain/kepler/KeplerWallet"

// interface AuthState {
//   walletInfo: WalletInfo | null // Grantee wallet info (address, encrypted mnemonic)
//   isConnected: boolean // Overall status: True if granter is connected AND grantee is created/connected
//   isGranterActuallyConnected: boolean // Specific for granter wallet connection
//   isGranteeActuallyAuthorized: boolean // Grantee authorization status
//   granterSigner: OfflineDirectSigner | null // Granter's signer instance
//   granteeSigner: OfflineDirectSigner | null // Grantee's signer instance
// }

export const useAuthStore = defineStore("auth", () => {
  // State
  const walletInfo = ref<WalletInfo | null>(null)
  const isConnected = ref(false)
  const isGranterActuallyConnected = ref(false)
  const isGranteeActuallyAuthorized = ref(false)
  const granterSigner = ref<OfflineDirectSigner | null>(null)
  const granteeSigner = ref<OfflineDirectSigner | null>(null)

  // Actions
  function setGranterConnectedStatus(status: boolean) {
    isGranterActuallyConnected.value = status
    updateIsConnected()
  }

  function setGranterSigner(signer: OfflineDirectSigner | null) {
    granterSigner.value = signer
    setGranterConnectedStatus(!!signer)
  }

  function setGranteeSigner(signer: OfflineDirectSigner | null) {
    granteeSigner.value = signer
    updateIsConnected()
  }

  function updateIsConnected() {
    isConnected.value =
      isGranterActuallyConnected.value &&
      !!walletInfo.value &&
      !!granteeSigner.value
  }

  async function createGranteeWallet(pin: string) {
    const walletService = WalletService.getInstance()
    const newGranteeData: GranteeWalletInfo =
      await walletService.createGranteeWallet(pin)
    walletInfo.value = {
      address: newGranteeData.address,
      mnemonic: newGranteeData.mnemonic,
    }
    setGranteeSigner(newGranteeData.signer)
    isGranteeActuallyAuthorized.value = false
    updateIsConnected()

    return walletInfo.value
  }

  async function connectGranteeWallet(encryptedMnemonic: string, pin: string) {
    const walletService = WalletService.getInstance()
    const signer = await walletService.connectGranteeWallet(
      encryptedMnemonic,
      pin
    )
    setGranteeSigner(signer)

    // walletInfo should already be populated from persisted state or set by createGranteeWallet
    // If not, this grantee connection is likely part of an initialization flow.
    if (signer && !walletInfo.value) {
      // Recovering walletInfo if not present
      const [account] = await signer.getAccounts()
      walletInfo.value = {
        address: account.address,
        mnemonic: encryptedMnemonic,
      }
    }

    updateIsConnected()
    console.log("Grantee Wallet connected, state:", {
      isConnected: isConnected.value,
      walletInfo: walletInfo.value,
    })
  }

  async function connectWithExternalSigner(
    signer: OfflineSigner | OfflineDirectSigner
  ) {
    console.log("[External] Connecting external signer")
    const walletService = WalletService.getInstance()
    try {
      await walletService.validateExternalSigner(signer) // Validate before setting
      setGranterSigner(signer as OfflineDirectSigner)
    } catch (error) {
      console.error("Failed to connect external signer in authStore:", error)
      setGranterSigner(null)
    }
  }

  async function initializeFromStorage(
    granterWalletSource: CosmosWallet | KeplerWallet,
    pin: string
  ) {
    if (!walletInfo.value?.mnemonic) {
      console.log(
        "[AuthStore] No grantee mnemonic in storage for initializeFromStorage"
      )
      // Attempt to connect granter even if grantee is not there
      try {
        const granterSigner =
          granterWalletSource.getOfflineSigner() as OfflineDirectSigner
        await WalletService.getInstance().validateExternalSigner(
          granterSigner
        )
        setGranterSigner(granterSigner)
      } catch (error) {
        console.error(
          "Error connecting granter during initializeFromStorage (no grantee):",
          error
        )
        setGranterSigner(null)
      }

      return
    }

    // Connect Granter
    try {
      const granterSigner =
        granterWalletSource.getOfflineSigner() as OfflineDirectSigner
      await WalletService.getInstance().validateExternalSigner(granterSigner)
      setGranterSigner(granterSigner)
    } catch (error) {
      console.error(
        "Error connecting granter during initializeFromStorage:",
        error
      )
      setGranterSigner(null)
      // Potentially stop here or allow grantee connection attempt anyway?
      // For now, if granter fails, we still attempt grantee if mnemonic exists.
    }

    // Connect Grantee
    await connectGranteeWallet(walletInfo.value.mnemonic, pin)
    // updateIsConnected is called by connectGranteeWallet and setGranterSigner
    console.log("AuthStore initialized from storage, state:", {
      isConnected: isConnected.value,
      isGranterActuallyConnected: isGranterActuallyConnected.value,
    })
  }

  async function grantAgentAuthorization(
    granterAddress: string,
    agentAddress: string,
    msgType?: string,
    expiration?: Date
  ) {
    const walletService = WalletService.getInstance()

    if (!granterSigner.value) {
      throw new Error("Granter signer not available")
    }

    if (!isGranterActuallyConnected.value) {
      throw new Error("Granter wallet not connected")
    }

    await walletService.grantAuthorization(
      granterSigner.value,
      granterAddress,
      agentAddress,
      msgType,
      expiration
    )
    isGranteeActuallyAuthorized.value = true
  }

  async function grantMsgSendAuthorization(
    granterAddress: string,
    agentAddress: string,
    expiration?: Date
  ) {
    const walletService = WalletService.getInstance()

    if (!granterSigner.value) {
      throw new Error("Granter signer not available")
    }

    if (!isGranterActuallyConnected.value) {
      throw new Error("Granter wallet not connected")
    }

    await walletService.grantSendAuthorization(
      granterSigner.value,
      granterAddress,
      agentAddress,
      "10000000000",
      expiration
    )
  }

  async function grantMultipleAuthorizations(
    granterAddress: string,
    agentAddress: string,
    options: {
      grantMsgExec?: boolean
      grantMsgSend?: boolean
      msgSendSpendLimit?: string
      expiration?: Date
    }
  ) {
    const walletService = WalletService.getInstance()

    if (!granterSigner.value) {
      throw new Error("Granter signer not available")
    }

    if (!isGranterActuallyConnected.value) {
      throw new Error("Granter wallet not connected")
    }

    await walletService.grantMultipleAuthorizations(
      granterSigner.value,
      granterAddress,
      agentAddress,
      options
    )

    if (options.grantMsgExec || options.grantMsgSend) {
      isGranteeActuallyAuthorized.value = true
    }
  }

  async function revokeAgentAuthorization(
    granterAddress: string,
    agentAddress: string,
    msgType?: string
  ) {
    const walletService = WalletService.getInstance()

    if (!granterSigner.value) {
      throw new Error("Granter signer not available")
    }

    if (!isGranterActuallyConnected.value) {
      throw new Error("Granter wallet not connected")
    }

    await walletService.revokeAuthorization(
      granterSigner.value,
      granterAddress,
      agentAddress,
      msgType
    )
    isGranteeActuallyAuthorized.value = false
  }

  function disconnect() {
    console.log("Disconnecting wallets in AuthStore")
    setGranterSigner(null)
    setGranteeSigner(null)

    walletInfo.value = null
    isGranteeActuallyAuthorized.value = false
    updateIsConnected() // This will set isConnected to false
  }

  return {
    // State
    walletInfo,
    isConnected,
    isGranterActuallyConnected,
    isGranteeActuallyAuthorized,
    granterSigner,
    granteeSigner,

    // Actions
    setGranterConnectedStatus,
    setGranterSigner,
    setGranteeSigner,
    updateIsConnected,
    createGranteeWallet,
    connectGranteeWallet,
    connectWithExternalSigner,
    initializeFromStorage,
    grantAgentAuthorization,
    grantMsgSendAuthorization,
    grantMultipleAuthorizations,
    revokeAgentAuthorization,
    disconnect,
  }
}, {
  persist: {
    storage: localStorage,
    // Do not persist signers as they are live objects and can contain sensitive data or become stale.
    // They should be re-established on app load.
    paths: [
      "walletInfo",
      "isConnected",
      "isGranterActuallyConnected",
      "isGranteeActuallyAuthorized",
    ],
  },
})
