import { Plugin } from 'src/utils/types'
import { coins } from '@cosmjs/proto-signing'
import { GasPrice, SigningStargateClient } from '@cosmjs/stargate'
import { MsgExec } from 'cosmjs-types/cosmos/authz/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
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
  description: 'BLOCKCHAIN EXECUTOR - CALLS APIs TO PERFORM OPERATIONS. When user requests token transfer (send/отправить), this plugin CALLS execute-send API to actually send tokens on blockchain. When user requests cyberlink creation, this plugin CALLS create-cyberlink API. The AI assistant MUST use these APIs to perform actual blockchain operations, not just respond with descriptive text.',
  apis: [
    {
      type: 'tool',
      name: 'create-cyberlink',
      description: 'PRIMARY API FOR CYBERLINKS: This is the main API to use when user wants to create a cyberlink. If user message contains phrases like "create cyberlink", "make cyberlink", "new cyberlink" - THIS is the API to use, not execute-send. Example: "create cyberlink with type Thread and value Hello" -> use this API with {type: "Thread", value: "Hello"}.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'The type of cyberlink (e.g. "Thread", "Post", "Comment")'
          },
          value: {
            type: 'string',
            description: 'The content/value for the cyberlink'
          }
        },
        required: ['type', 'value']
      },
      async execute(args) {
        console.log('[PLUGIN] Executing create-cyberlink')
        const { type, value } = args
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
              cyberlink: {
                type,
                value
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
            contentText: `✅ **Cyberlink Created Successfully**

**Cyberlink Details:**
- **Type:** ${type}
- **Value:** ${value}
- **Creator:** ${granterAddress}
- **Transaction Hash:** ${tx.transactionHash}
- **Gas Used:** ${tx.gasUsed}
- **Gas Wanted:** ${tx.gasWanted}
- **Block Height:** ${tx.height}

**Explorer Link:** https://cybernode.ai/network/cyber/tx/${tx.transactionHash}

The cyberlink was created using MsgExecuteContract authorization through the grantee wallet.`
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
            contentText: `✅ **Cyberlink Updated Successfully**

**Update Details:**
- **From (Type):** ${from}
- **Old Value:** ${to}
- **New Value:** ${newTo}
- **Updater:** ${granterAddress}
- **Transaction Hash:** ${tx.transactionHash}
- **Gas Used:** ${tx.gasUsed}
- **Gas Wanted:** ${tx.gasWanted}
- **Block Height:** ${tx.height}

**Explorer Link:** https://cybernode.ai/network/cyber/tx/${tx.transactionHash}

The cyberlink was updated using MsgExecuteContract authorization through the grantee wallet.`
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
            contentText: `✅ **Cyberlink Deleted Successfully**

**Deletion Details:**
- **From (Type):** ${from}
- **To (Value):** ${to}
- **Deleter:** ${granterAddress}
- **Transaction Hash:** ${tx.transactionHash}
- **Gas Used:** ${tx.gasUsed}
- **Gas Wanted:** ${tx.gasWanted}
- **Block Height:** ${tx.height}

**Explorer Link:** https://cybernode.ai/network/cyber/tx/${tx.transactionHash}

The cyberlink was deleted using MsgExecuteContract authorization through the grantee wallet.`
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
      description: 'REQUIRED ACTION: Execute blockchain token transfer. When user says ANY of these phrases: "send tokens", "transfer tokens", "отправить токены", "перевести токены", "послать токены", "send X to address", "transfer X to address" - you MUST call this API immediately. DO NOT respond with text like "tokens sent" - CALL THIS API TO ACTUALLY SEND THEM. Example user input: "send 100 ustake to cyber1abc" -> REQUIRED ACTION: call execute-send with {toAddress: "cyber1abc", amount: "100"}',
      parameters: {
        type: 'object',
        properties: {
          toAddress: {
            type: 'string',
            description: 'Recipient wallet address (must start with cyber1...)'
          },
          amount: {
            type: 'string',
            description: 'Amount to send as string (e.g. "100", "50.5")'
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

          const granteeAccounts = await authStore.granteeSigner.getAccounts()
          if (granteeAccounts.length === 0) {
            throw new Error('No accounts found for grantee signer.')
          }
          const granteeAccount = granteeAccounts[0]
          const granteeClient = await walletService.getClient(authStore.granteeSigner)

          // Convert amount to proper format
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

          // Create MsgSend directly instead of MsgExecuteContract
          const sendMsg = MsgSend.fromPartial({
            fromAddress: granterAddress,
            toAddress,
            amount: coins(amountString, config.FEE_DENOM)
          })

          // Use MsgExec to execute the MsgSend with authorization
          const execMsg: MsgExec = {
            grantee: granteeAccount.address,
            msgs: [
              {
                typeUrl: '/cosmos.bank.v1beta1.MsgSend',
                value: MsgSend.encode(sendMsg).finish()
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
            contentText: `✅ **Token Transfer Successful** **Explorer Link:** https://cybernode.ai/network/cyber/tx/${tx.transactionHash}`
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
  prompt: `CRITICAL INSTRUCTIONS FOR AI ASSISTANT:

1. When user writes "send X tokens to cyber1..." or "отправить X токенов на cyber1..." I MUST immediately call execute-send API
2. When user writes "create cyberlink..." I MUST immediately call create-cyberlink API
3. I NEVER respond with text like "tokens sent" or "операция выполнена" without calling the API first
4. I ALWAYS call the API to perform the actual blockchain operation

EXAMPLES OF REQUIRED API CALLS:
- User: "send 100 ustake to cyber1abc123" → I call execute-send({toAddress: "cyber1abc123", amount: "100"})
- User: "отправить 50 токенов на cyber1def456" → I call execute-send({toAddress: "cyber1def456", amount: "50"})
- User: "create cyberlink with type Thread and value Hello" → I call create-cyberlink({type: "Thread", value: "Hello"})
- User: "make Thread cyberlink with Hello content" → I call create-cyberlink({type: "Thread", value: "Hello"})

I am a blockchain executor that PERFORMS operations by calling APIs, not a text generator that describes operations.`,
  promptVars: []
}

export default authzPlugin
