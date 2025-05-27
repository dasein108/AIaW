import { Plugin } from 'src/utils/types'
import { coins } from '@cosmjs/proto-signing'
import { GasPrice, SigningStargateClient } from '@cosmjs/stargate'
import { MsgExec } from 'cosmjs-types/cosmos/authz/v1beta1/tx'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { useAuthStore } from 'src/stores/auth'
import { WalletService } from 'src/services/authz/wallet-service'
import { config } from 'src/services/constants'
import { Decimal } from '@cosmjs/math'

const authzPlugin: Plugin = {
  id: 'cosmos-authz',
  type: 'builtin',
  available: true,
  title: 'Cosmos Authz',
  description: 'Plugin for Cosmos authz functionality',
  apis: [
    {
      type: 'tool',
      name: 'grant-send-auth',
      description: 'Grant send authorization to an address',
      parameters: {
        type: 'object',
        properties: {
          granteeAddress: {
            type: 'string',
            description: 'Address of the grantee'
          },
          spendLimit: {
            type: 'string',
            description: 'Spend limit amount'
          },
          expirationHours: {
            type: 'number',
            description: 'Authorization expiration in hours',
            default: 24
          }
        },
        required: ['granteeAddress', 'spendLimit']
      },
      async execute(args) {
        console.log('[PLUGIN] Executing grant-send-auth')
        const { granteeAddress, spendLimit, expirationHours = 24 } = args
        const authStore = useAuthStore()

        if (!authStore.isConnected) {
          throw new Error('Wallet not connected. Please connect your wallet first.')
        }

        if (!authStore.walletInfo) {
          throw new Error('Wallet info not found. Please reconnect your wallet.')
        }

        const expiration = new Date(Date.now() + expirationHours * 3600 * 1000)
        await authStore.grantAgentAuthorization(
          authStore.walletInfo.address,
          granteeAddress,
          '/cosmos.bank.v1beta1.MsgSend',
          expiration
        )

        return [{
          type: 'text',
          contentText: `Authorization granted successfully to ${granteeAddress} with spend limit ${spendLimit}${config.FEE_DENOM}`
        }]
      }
    },
    {
      type: 'tool',
      name: 'execute-send',
      description: 'Execute send transaction using authorization',
      parameters: {
        type: 'object',
        properties: {
          granterAddress: {
            type: 'string',
            description: 'Address of the granter'
          },
          toAddress: {
            type: 'string',
            description: 'Recipient address'
          },
          amount: {
            type: 'string',
            description: 'Amount to send'
          }
        },
        required: ['granterAddress', 'toAddress', 'amount']
      },
      async execute(args) {
        console.log('[PLUGIN] Executing execute-send')
        const { granterAddress, toAddress, amount } = args
        const authStore = useAuthStore()
        const walletService = WalletService.getInstance()

        if (!authStore.isConnected) {
          throw new Error('Wallet not connected. Please connect your wallet first.')
        }

        if (!authStore.walletInfo) {
          throw new Error('Wallet info not found. Please reconnect your wallet.')
        }

        if (!walletService.isConnected()) {
          throw new Error('Wallet service not connected. Please reconnect your wallet.')
        }

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

          const [granteeAccount] = await walletService.getAccounts()

          // Create a new client instance for this transaction
          const granteeClient = await walletService.getGranteeClient()

          // Convert amount to proper format
          // const amountDecimal = Decimal.fromUserInput(sanitizedAmount, 6)
          const amountDecimal = Decimal.fromUserInput(sanitizedAmount, 0)
          const amountString = amountDecimal.atomics.toString()

          console.log('Transaction details:', {
            granterAddress,
            toAddress,
            originalAmount: amount,
            sanitizedAmount,
            amountString
          })

          const sendMsg: MsgSend = {
            fromAddress: granterAddress,
            toAddress,
            amount: coins(amountString, config.FEE_DENOM)
          }

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
            amount: coins('100000', config.FEE_DENOM),
            gas: '100000'
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
  prompt: 'I can help you manage Cosmos authz permissions and execute transactions on your behalf. Before executing any transactions, make sure the wallet is connected.',
  promptVars: []
}

export default authzPlugin
