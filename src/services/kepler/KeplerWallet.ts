import type { OfflineAminoSigner, StdSignDoc } from "@cosmjs/amino"
import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate"
import { GasPrice } from "@cosmjs/stargate"
import { ref, watch } from "vue"
import { config } from "../constants"
import type { KeplerWalletState, TxStatusResponse } from "./types"
import { parseTxStatus } from "./utils"

declare global {
  interface Window {
    keplr: {
      experimentalSuggestChain: (chainInfo: any) => Promise<void>
      enable: (chainId: string) => Promise<void>
      getOfflineSigner: (chainId: string) => OfflineAminoSigner
    }
  }
}

export const STORAGE_KEY = "kepler_wallet_state"
export const CYBER_CONTRACT_ADDRESS =
  "cyber14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sjxkrqd"

export const getLocalStorageWalletState = () => {
  return typeof window !== "undefined"
    ? JSON.parse(
      localStorage.getItem(STORAGE_KEY) ||
          '{"isConnected": false, "address": null}'
    )
    : { isConnected: false, address: null }
}

// Chain suggestion configuration for Keplr
const CHAIN_INFO = {
  chainId: config.CHAIN_ID,
  chainName: "Cyber TESTNET",
  rpc: config.NODE_RPC_URL,
  rest: config.LCD_URL,
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "cyber",
    bech32PrefixAccPub: "cyberpub",
    bech32PrefixValAddr: "cybervaloper",
    bech32PrefixValPub: "cybervaloperpub",
    bech32PrefixConsAddr: "cybervalcons",
    bech32PrefixConsPub: "cybervalconspub",
  },
  currencies: [
    {
      coinDenom: config.DENOM,
      coinMinimalDenom: config.DENOM.toLowerCase(),
      coinDecimals: 6,
    },
    {
      coinDenom: config.FEE_DENOM,
      coinMinimalDenom: config.FEE_DENOM.toLowerCase(),
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: config.FEE_DENOM,
      coinMinimalDenom: config.FEE_DENOM.toLowerCase(),
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.1,
        average: 0.15,
        high: 0.3,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: config.DENOM,
    coinMinimalDenom: config.DENOM.toLowerCase(),
    coinDecimals: 6,
  },
}

export function createKeplerWallet () {
  // Initialize state from localStorage if available
  const initialState: KeplerWalletState = getLocalStorageWalletState()
  const state = ref<KeplerWalletState>(initialState)
  const client = ref<CosmWasmClient | null>(null)

  // Initialize CosmWasmClient
  if (typeof window !== "undefined") {
    CosmWasmClient.connect(config.NODE_RPC_URL)
      .then((cosmWasmClient) => {
        client.value = cosmWasmClient
      })
      .catch(console.error)
  }

  // Watch for state changes and save to localStorage
  if (typeof window !== "undefined") {
    watch(
      state,
      (newState) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      },
      { deep: true }
    )
  }

  const connect = async () => {
    try {
      if (!window.keplr) {
        throw new Error("Keplr extension not installed")
      }

      // Try to suggest the chain to Keplr
      await window.keplr.experimentalSuggestChain(CHAIN_INFO)

      // Enable access to chain
      await window.keplr.enable(config.CHAIN_ID)

      // Get the offline signer
      const offlineSigner = window.keplr.getOfflineSigner(config.CHAIN_ID)

      // Get user's Kepler account
      const accounts = await offlineSigner.getAccounts()
      const address = accounts[0].address

      state.value = { ...state.value, isConnected: true, address }
    } catch (error) {
      console.error("Failed to connect Kepler wallet:", error)
      throw error
    }
  }

  const disconnect = async () => {
    state.value = { ...state.value, isConnected: false, address: null }
  }

  const signTransaction = async (signDoc: StdSignDoc) => {
    try {
      if (!window.keplr) {
        throw new Error("Keplr extension not installed")
      }

      const offlineSigner = window.keplr.getOfflineSigner(config.CHAIN_ID)
      const accounts = await offlineSigner.getAccounts()

      // Create a new signDoc with our chain configuration
      const newSignDoc: StdSignDoc = {
        ...signDoc,
        chain_id: config.CHAIN_ID,
        fee: {
          ...signDoc.fee,
          amount: signDoc.fee.amount.map((coin) => ({
            ...coin,
            denom: config.FEE_DENOM,
          })),
        },
      }

      return await offlineSigner.signAmino(accounts[0].address, newSignDoc)
    } catch (error) {
      console.error("Failed to sign transaction:", error)
      throw error
    }
  }

  const executeTransaction = async (
    msg: Record<string, any>,
    contractAddress: string = CYBER_CONTRACT_ADDRESS
  ) => {
    try {
      if (!window.keplr) {
        throw new Error("Keplr extension not installed")
      }

      // Get the offline signer
      const offlineSigner = window.keplr.getOfflineSigner(config.CHAIN_ID)
      const accounts = await offlineSigner.getAccounts()
      const sender = accounts[0]

      // Create signing client
      const gasPrice = GasPrice.fromString(
        `${config.GAS_PRICE_AMOUNT}${config.FEE_DENOM}`
      )
      const signingClient = await SigningCosmWasmClient.connectWithSigner(
        config.NODE_RPC_URL,
        offlineSigner,
        { gasPrice }
      )
      console.log("Signing client", sender.address, contractAddress, msg)
      // Execute transaction
      const result = await signingClient.execute(
        sender.address,
        contractAddress,
        msg,
        "auto"
      )

      return result
    } catch (error) {
      console.error("Failed to execute transaction:", error)
      throw error
    }
  }

  const getTx = async (
    transactionHash: string
  ): Promise<TxStatusResponse | null> => {
    if (!client.value) {
      throw new Error("CosmWasm client not initialized")
    }

    const tx = await client.value.getTx(transactionHash)

    if (!tx) {
      return null
    }

    return parseTxStatus(tx)
  }

  const waitForTransaction = async (
    txHash: string,
    timeoutMs: number = 30000,
    pollIntervalMs: number = 1000
  ) => {
    const startTime = Date.now()

    while (Date.now() - startTime < timeoutMs) {
      try {
        const result = await getTx(txHash)

        if (result) return result
      } catch (error) {
        console.error(`Error while polling transaction ${txHash}:`, error)
        // Continue polling if transaction not found
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
    }

    throw new Error(`Transaction confirmation timed out after ${timeoutMs}ms`)
  }

  const getOfflineSigner = () => {
    if (!window.keplr) {
      throw new Error("Keplr extension not installed")
    }

    return window.keplr.getOfflineSigner(config.CHAIN_ID)
  }

  return {
    state,
    connect,
    disconnect,
    signTransaction,
    executeTransaction,
    getTx: waitForTransaction,
    getOfflineSigner,
  }
}

export type KeplerWallet = ReturnType<typeof createKeplerWallet>
