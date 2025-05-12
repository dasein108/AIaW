import { ref } from 'vue'
import { SigningCosmWasmClient, CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { GasPrice } from '@cosmjs/stargate'
import { AccountData, DirectSecp256k1HdWallet, OfflineDirectSigner } from '@cosmjs/proto-signing'
import type { OfflineAminoSigner, StdSignDoc } from '@cosmjs/amino'
import type { TxStatusResponse } from '../kepler/types'
import { parseTxStatus } from '../kepler/utils'
import { CYBER_CONTRACT_ADDRESS } from '../kepler/KeplerWallet'

export interface CosmosSignerState {
  isConnected: boolean
  address: string | null
  type: 'keplr' | 'mnemonic' | null
}

export interface ChainConfig {
  CHAIN_ID: string
  FEE_DENOM: string
  DENOM: string
  NODE_RPC_URL: string
  LCD_URL: string
  RPC_TIMEOUT: number
  GAS_PRICE_AMOUNT: string
}

// Chain configuration
const config: ChainConfig = {
  CHAIN_ID: 'cyber42-1',
  FEE_DENOM: 'ustake',
  DENOM: 'STAKE',
  NODE_RPC_URL: 'https://rpc.cyber-rollup.chatcyber.ai',
  LCD_URL: 'https://api.cyber-rollup.chatcyber.ai',
  RPC_TIMEOUT: 60000,
  GAS_PRICE_AMOUNT: '0.15'
}

type CyberOfflineSigner = (OfflineDirectSigner | OfflineAminoSigner) & {
  getAccounts: () => Promise<readonly AccountData[]>;
}

export function createCosmosSigner() {
  const state = ref<CosmosSignerState>({
    isConnected: false,
    address: null,
    type: null
  })
  const client = ref<CosmWasmClient | null>(null)
  let offlineSigner: CyberOfflineSigner | null = null

  // Initialize CosmWasmClient
  if (typeof window !== 'undefined') {
    CosmWasmClient.connect(config.NODE_RPC_URL)
      .then((cosmWasmClient) => {
        client.value = cosmWasmClient
      })
      .catch(console.error)
  }

  const connectWithKeplr = async () => {
    try {
      if (!window.keplr) {
        throw new Error('Keplr extension not installed')
      }

      // Enable access to chain
      await window.keplr.enable(config.CHAIN_ID)

      // Get the offline signer
      offlineSigner = window.keplr.getOfflineSigner(config.CHAIN_ID)

      // Get user's account
      const accounts = await offlineSigner.getAccounts()
      const address = accounts[0].address

      state.value = { isConnected: true, address, type: 'keplr' }
    } catch (error) {
      console.error('Failed to connect with Keplr:', error)
      throw error
    }
  }

  const connectWithMnemonic = async (mnemonic: string) => {
    try {
      // Create wallet from mnemonic
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: 'cyber'
      })

      // Get accounts
      const accounts = await wallet.getAccounts()
      const address = accounts[0].address

      offlineSigner = wallet
      state.value = { isConnected: true, address, type: 'mnemonic' }
    } catch (error) {
      console.error('Failed to connect with mnemonic:', error)
      throw error
    }
  }

  const disconnect = () => {
    state.value = { isConnected: false, address: null, type: null }
    offlineSigner = null
  }

  const signTransaction = async (signDoc: StdSignDoc) => {
    try {
      if (!offlineSigner) {
        throw new Error('No signer available')
      }

      const accounts = await offlineSigner.getAccounts()

      // Create a new signDoc with our chain configuration
      const newSignDoc: StdSignDoc = {
        ...signDoc,
        chain_id: config.CHAIN_ID,
        fee: {
          ...signDoc.fee,
          amount: signDoc.fee.amount.map(coin => ({
            ...coin,
            denom: config.FEE_DENOM
          }))
        }
      }

      if ('signAmino' in offlineSigner) {
        return await offlineSigner.signAmino(accounts[0].address, newSignDoc)
      } else {
        throw new Error('Signer does not support amino signing')
      }
    } catch (error) {
      console.error('Failed to sign transaction:', error)
      throw error
    }
  }

  const executeTransaction = async (msg: Record<string, any>, contractAddress: string = CYBER_CONTRACT_ADDRESS) => {
    try {
      if (!offlineSigner) {
        throw new Error('No signer available')
      }

      const accounts = await offlineSigner.getAccounts()
      const sender = accounts[0]

      // Create signing client
      const gasPrice = GasPrice.fromString(`${config.GAS_PRICE_AMOUNT}${config.FEE_DENOM}`)
      const signingClient = await SigningCosmWasmClient.connectWithSigner(
        config.NODE_RPC_URL,
        offlineSigner,
        { gasPrice }
      )

      // Execute transaction
      const result = await signingClient.execute(
        sender.address,
        contractAddress,
        msg,
        'auto'
      )

      return result
    } catch (error) {
      console.error('Failed to execute transaction:', error)
      throw error
    }
  }

  const getTx = async (transactionHash: string): Promise<TxStatusResponse | null> => {
    if (!client.value) {
      throw new Error('CosmWasm client not initialized')
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
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
    }

    throw new Error(`Transaction confirmation timed out after ${timeoutMs}ms`)
  }

  return {
    state,
    connectWithKeplr,
    connectWithMnemonic,
    disconnect,
    signTransaction,
    executeTransaction,
    getTx: waitForTransaction
  }
}

export type CosmosWallet = ReturnType<typeof createCosmosSigner>
