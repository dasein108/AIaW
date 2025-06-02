import { Plugin } from 'src/utils/types'
import { coins } from '@cosmjs/proto-signing'
import { GasPrice, SigningStargateClient } from '@cosmjs/stargate'
import { MsgExec } from 'cosmjs-types/cosmos/authz/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { toUtf8 } from '@cosmjs/encoding'
import { useAuthStore } from 'src/stores/auth'
import { WalletService } from 'src/services/authz/wallet-service'
import { config } from 'src/services/constants'
import { Decimal } from '@cosmjs/math'
import { CYBER_CONTRACT_ADDRESS, getLocalStorageWalletState } from 'src/services/kepler/KeplerWallet'

const authzPlugin: Plugin = {
  id: 'cosmos-authz',
  type: 'builtin',
  available: true,
  title: 'Cosmos Authz',
  description: 'Direct plugin for Cyber blockchain operations. IMPORTANT FOR AI: When user says anything like "create cyberlink with type X and value Y" - immediately execute create-cyberlink API call with those parameters. The API will handle all wallet checks internally.',
  apis: [
    {
      type: 'tool',
      name: 'create-cyberlink',
      description: 'PRIMARY API FOR CYBERLINKS: This is the main API to use when user wants to create a cyberlink. If user message contains phrases like "create cyberlink", "make cyberlink", "new cyberlink" - THIS is the API to use, not execute-send. Example: "create cyberlink with type Thread and value Hello" -> use this API with {from: "Thread", to: "Hello"}.',
      parameters: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Extract this from user message - this is the type they mention (e.g. if they say "type Thread", use "Thread" here)'
          },
          to: {
            type: 'string',
            description: 'Extract this from user message - this is the value they mention (e.g. if they say "value Hello", use "Hello" here)'
          }
        },
        required: ['from', 'to']
      },
      async execute(args) {
        console.log('[PLUGIN] Executing create-cyberlink')
        const { from, to } = args
        debugger
        const authStore = useAuthStore()
        const walletService = WalletService.getInstance()
        const walletState = getLocalStorageWalletState()

        if (!walletState.isConnected || !walletState.address) {
          throw new Error('Kepler wallet not connected. Please connect Kepler wallet first.')
        }

        if (!authStore.isConnected || !authStore.granteeSigner) {
          console.log({ isConnected: authStore.isConnected, granteeSigner: authStore.granteeSigner })
          throw new Error('Grantee wallet not connected or signer not available. Please ensure grantee wallet is set up and connected.')
        }

        const granterAddress = walletState.address

        try {
          const granteeAccounts = await authStore.granteeSigner.getAccounts()
          if (granteeAccounts.length === 0) {
            throw new Error('No accounts found for grantee signer.')
          }
          const granteeAccount = granteeAccounts[0]
          const granteeClient = await walletService.getClient(authStore.granteeSigner)

          const execContractMsg = {
            sender: granterAddress,
            contract: CYBER_CONTRACT_ADDRESS,
            msg: toUtf8(JSON.stringify({
              create_cyberlink: {
                from,
                to
              }
            })),
            funds: []
          }

          const execMsg = {
            grantee: granteeAccount.address,
            msgs: [
              {
                typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
                value: MsgExecuteContract.encode(execContractMsg).finish()
              }
            ]
          }

          const tx = await granteeClient.signAndBroadcast(granteeAccount.address, [
            {
              typeUrl: '/cosmos.authz.v1beta1.MsgExec',
              value: execMsg
            }
          ], {
            amount: coins('160000', config.FEE_DENOM),
            gas: '160000'
          })

          if (tx.code !== 0) {
            const errorMessage = tx.rawLog || 'Transaction failed'
            throw new Error(`Transaction failed with code ${tx.code} ${errorMessage}`)
          }

          return [{
            type: 'text',
            contentText: `Cyberlink created successfully. Transaction hash: ${tx.transactionHash}`
          }]
        } catch (error) {
          console.error('Error creating cyberlink:', error)
          throw new Error(`Failed to create cyberlink: ${error.message}`)
        }
      }
    },
    {
      type: 'tool',
      name: 'update-cyberlink',
      description: 'Update an existing cyberlink\'s target value while keeping the same source type.',
      parameters: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Original source particle type (e.g. "Thread", "Post", "Comment")'
          },
          to: {
            type: 'string',
            description: 'Current target particle value or content'
          },
          newTo: {
            type: 'string',
            description: 'New target particle value or content to replace the current one'
          }
        },
        required: ['from', 'to', 'newTo']
      },
      async execute(args) {
        console.log('[PLUGIN] Executing update-cyberlink')
        const { from, to, newTo } = args
        const authStore = useAuthStore()
        const walletService = WalletService.getInstance()
        const walletState = getLocalStorageWalletState()

        if (!walletState.isConnected || !walletState.address) {
          throw new Error('Kepler wallet not connected. Please connect Kepler wallet first.')
        }

        if (!authStore.isConnected || !authStore.granteeSigner) {
          console.log({ isConnected: authStore.isConnected, granteeSigner: authStore.granteeSigner })
          throw new Error('Grantee wallet not connected or signer not available. Please ensure grantee wallet is set up and connected.')
        }

        const granterAddress = walletState.address

        try {
          const granteeAccounts = await authStore.granteeSigner.getAccounts()
          if (granteeAccounts.length === 0) {
            throw new Error('No accounts found for grantee signer.')
          }
          const granteeAccount = granteeAccounts[0]
          const granteeClient = await walletService.getClient(authStore.granteeSigner)

          const execContractMsg = {
            sender: granterAddress,
            contract: CYBER_CONTRACT_ADDRESS,
            msg: toUtf8(JSON.stringify({
              update_cyberlink: {
                from,
                to,
                new_to: newTo
              }
            })),
            funds: []
          }

          const execMsg = {
            grantee: granteeAccount.address,
            msgs: [
              {
                typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
                value: MsgExecuteContract.encode(execContractMsg).finish()
              }
            ]
          }

          const tx = await granteeClient.signAndBroadcast(granteeAccount.address, [
            {
              typeUrl: '/cosmos.authz.v1beta1.MsgExec',
              value: execMsg
            }
          ], {
            amount: coins('160000', config.FEE_DENOM),
            gas: '160000'
          })

          if (tx.code !== 0) {
            const errorMessage = tx.rawLog || 'Transaction failed'
            throw new Error(`Transaction failed with code ${tx.code} ${errorMessage}`)
          }

          return [{
            type: 'text',
            contentText: `Cyberlink updated successfully. Transaction hash: ${tx.transactionHash}`
          }]
        } catch (error) {
          console.error('Error updating cyberlink:', error)
          throw new Error(`Failed to update cyberlink: ${error.message}`)
        }
      }
    },
    {
      type: 'tool',
      name: 'delete-cyberlink',
      description: 'Delete an existing cyberlink between a type and its value.',
      parameters: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Source particle type (e.g. "Thread", "Post", "Comment")'
          },
          to: {
            type: 'string',
            description: 'Target particle value or content to unlink'
          }
        },
        required: ['from', 'to']
      },
      async execute(args) {
        console.log('[PLUGIN] Executing delete-cyberlink')
        const { from, to } = args
        const authStore = useAuthStore()
        const walletService = WalletService.getInstance()
        const walletState = getLocalStorageWalletState()

        if (!walletState.isConnected || !walletState.address) {
          throw new Error('Kepler wallet not connected. Please connect Kepler wallet first.')
        }

        if (!authStore.isConnected || !authStore.granteeSigner) {
          console.log({ isConnected: authStore.isConnected, granteeSigner: authStore.granteeSigner })
          throw new Error('Grantee wallet not connected or signer not available. Please ensure grantee wallet is set up and connected.')
        }

        const granterAddress = walletState.address

        try {
          const granteeAccounts = await authStore.granteeSigner.getAccounts()
          if (granteeAccounts.length === 0) {
            throw new Error('No accounts found for grantee signer.')
          }
          const granteeAccount = granteeAccounts[0]
          const granteeClient = await walletService.getClient(authStore.granteeSigner)

          const execContractMsg = {
            sender: granterAddress,
            contract: CYBER_CONTRACT_ADDRESS,
            msg: toUtf8(JSON.stringify({
              delete_cyberlink: {
                from,
                to
              }
            })),
            funds: []
          }

          const execMsg = {
            grantee: granteeAccount.address,
            msgs: [
              {
                typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
                value: MsgExecuteContract.encode(execContractMsg).finish()
              }
            ]
          }

          const tx = await granteeClient.signAndBroadcast(granteeAccount.address, [
            {
              typeUrl: '/cosmos.authz.v1beta1.MsgExec',
              value: execMsg
            }
          ], {
            amount: coins('160000', config.FEE_DENOM),
            gas: '160000'
          })

          if (tx.code !== 0) {
            const errorMessage = tx.rawLog || 'Transaction failed'
            throw new Error(`Transaction failed with code ${tx.code} ${errorMessage}`)
          }

          return [{
            type: 'text',
            contentText: `Cyberlink deleted successfully. Transaction hash: ${tx.transactionHash}`
          }]
        } catch (error) {
          console.error('Error deleting cyberlink:', error)
          throw new Error(`Failed to delete cyberlink: ${error.message}`)
        }
      }
    },
    {
      type: 'tool',
      name: 'execute-send',
      description: 'TOKENS ONLY: Execute token transfer transaction. Only use this when user specifically wants to send/transfer tokens. For cyberlinks use create-cyberlink API instead.',
      parameters: {
        type: 'object',
        properties: {
          toAddress: {
            type: 'string',
            description: 'Recipient wallet address for token transfer (NOT for cyberlinks)'
          },
          amount: {
            type: 'string',
            description: 'Amount of tokens to transfer (NOT for cyberlinks)'
          }
        },
        required: ['toAddress', 'amount']
      },
      async execute(args) {
        console.log('[PLUGIN] Executing execute-send')
        const { toAddress, amount } = args
        const authStore = useAuthStore()
        const walletService = WalletService.getInstance()
        const walletState = getLocalStorageWalletState()

        if (!walletState.isConnected || !walletState.address) {
          throw new Error('Kepler wallet not connected. Please connect Kepler wallet first.')
        }

        if (!authStore.isConnected || !authStore.granteeSigner) {
          console.log({ isConnected: authStore.isConnected, granteeSigner: authStore.granteeSigner })
          throw new Error('Grantee wallet not connected or signer not available. Please ensure grantee wallet is set up and connected.')
        }

        const granterAddress = walletState.address

        try {
          // Validate and sanitize amount
          if (!amount || typeof amount !== 'string') {
            throw new Error('Invalid amount format')
          }

          // Remove any non-numeric characters except decimal point
          const sanitizedAmount = amount.replace(/[^\d.]/g, '')

          // Ensure only one decimal point
          const parts = sanitizedAmount.split('.')
          if (parts.length > 2) {
            throw new Error('Invalid amount format: multiple decimal points')
          }

          // Ensure decimal places don't exceed 6
          if (parts[1] && parts[1].length > 6) {
            throw new Error('Amount cannot have more than 6 decimal places')
          }

          // const [granteeAccount] = await walletService.getAccounts() // Old way
          const granteeAccounts = await authStore.granteeSigner.getAccounts()
          if (granteeAccounts.length === 0) {
            throw new Error('No accounts found for grantee signer.')
          }
          const granteeAccount = granteeAccounts[0]

          // Create a new client instance for this transaction, using the granteeSigner
          // const granteeClient = await walletService.getGranteeClient() // Old way
          const granteeClient = await walletService.getClient(authStore.granteeSigner) // Pass grantee signer

          // Convert amount to proper format
          // const amountDecimal = Decimal.fromUserInput(sanitizedAmount, 6)
          const amountDecimal = Decimal.fromUserInput(sanitizedAmount, 0)
          const amountString = amountDecimal.atomics.toString()
          console.log('[PLUGIN] Amount decimal:', { amountDecimal, amountString })

          console.log('Transaction details:', {
            granterAddress,
            toAddress,
            originalAmount: amount,
            sanitizedAmount,
            amountString
          })

          console.log('[PLUGIN] Grantee client:', { granteeClient, amount: coins(amountString, config.FEE_DENOM) })

          const execContractMsg: MsgExecuteContract = {
            sender: granterAddress,
            contract: CYBER_CONTRACT_ADDRESS,
            msg: toUtf8(JSON.stringify({ transfer: { recipient: toAddress, amount: amountString } })),
            funds: coins(amountString, config.FEE_DENOM)
          }

          const execMsg: MsgExec = {
            grantee: granteeAccount.address,
            msgs: [
              {
                typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
                value: MsgExecuteContract.encode(execContractMsg).finish()
              }
            ]
          }

          const tx = await granteeClient.signAndBroadcast(granteeAccount.address, [
            {
              typeUrl: '/cosmos.authz.v1beta1.MsgExec',
              value: execMsg
            }
          ], {
            amount: coins('160000', config.FEE_DENOM),
            gas: '160000'
          })

          if (tx.code !== 0) {
            const errorMessage = tx.rawLog || 'Transaction failed'
            throw new Error(`Transaction failed with code ${tx.code} ${errorMessage}`)
          }

          return [{
            type: 'text',
            contentText: `Transaction executed successfully. Transaction hash: ${tx.transactionHash}`
          }]
        } catch (error) {
          console.error('Error executing send transaction:', error)
          throw new Error(`Failed to execute transaction: ${error.message}`)
        }
      }
    }
  ],
  fileparsers: [],
  settings: {
    type: 'object',
    properties: {}
  },
  prompt: 'I am a direct executor for Cyber blockchain operations. My PRIMARY function is creating cyberlinks - when user mentions anything about creating/making cyberlinks, I MUST use create-cyberlink API (not execute-send). I extract the type and value from their message and call the API immediately. For token transfers only, I use execute-send.',
  promptVars: []
}

export default authzPlugin
