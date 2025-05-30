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
import { CYBER_CONTRACT_ADDRESS } from 'src/services/kepler/KeplerWallet'

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

        if (!authStore.isGranterActuallyConnected || !authStore.granterSigner) {
          throw new Error('Granter wallet not connected or signer not available. Please connect your wallet first.')
        }

        // Get granter address from the granterSigner
        const granterAccounts = await authStore.granterSigner.getAccounts()
        if (granterAccounts.length === 0) {
          throw new Error('No accounts found for granter signer.')
        }
        const granterAddress = granterAccounts[0].address

        const expiration = new Date(Date.now() + expirationHours * 3600 * 1000)
        // authStore.grantAgentAuthorization now uses its internally stored granterSigner
        await authStore.grantAgentAuthorization(
          granterAddress, // Pass the resolved granter address
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
      description: 'Execute smart contract call using authorization',
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

        if (!authStore.isConnected || !authStore.granteeSigner) {
          console.log({ isConnected: authStore.isConnected, granteeSigner: authStore.granteeSigner })
          throw new Error('Grantee wallet not connected or signer not available. Please ensure grantee wallet is set up and connected.')
        }

        // isConnected implies granter is also connected, but execute-send uses granteeSigner
        // Granter address is passed as an argument, but the transaction is signed by grantee.

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
            amount: coins('150000', config.FEE_DENOM),
            gas: '150000'
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
