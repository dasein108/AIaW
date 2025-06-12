import { toUtf8 } from "@cosmjs/encoding"
import { Decimal } from "@cosmjs/math"
import { coins } from "@cosmjs/proto-signing"
import { MsgExec } from "cosmjs-types/cosmos/authz/v1beta1/tx"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx"
import { WalletService } from "src/services/authz/wallet-service"
import { config } from "src/services/constants"
import {
  CYBER_CONTRACT_ADDRESS,
  getLocalStorageWalletState,
} from "src/services/kepler/KeplerWallet"
import { useAuthStore } from "@features/auth/store/auth"
import { IsTauri } from "src/utils/platform-api"
import { Plugin } from "src/utils/types"

// Function to get wallet state depending on platform
const getWalletState = () => {
  if (IsTauri) {
    // For Tauri, we use CosmosWallet through inject, but since we can't use inject here,
    // we'll rely on authStore which should be connected
    const authStore = useAuthStore()

    return {
      isConnected:
        authStore.isGranterActuallyConnected && !!authStore.granterSigner,
      address: authStore.granterSigner ? null : null, // We'll get address from signer when needed
    }
  } else {
    // For Web, use Kepler wallet state
    return getLocalStorageWalletState()
  }
}

// Function to get granter address
const getGranterAddress = async () => {
  const authStore = useAuthStore()

  if (authStore.granterSigner) {
    const accounts = await authStore.granterSigner.getAccounts()

    return accounts[0]?.address
  }

  if (!IsTauri) {
    // Fallback to localStorage for Web
    const walletState = getLocalStorageWalletState()

    return walletState.address
  }

  throw new Error("No granter address available")
}

const authzPlugin: Plugin = {
  id: "cosmos-authz",
  type: "builtin",
  available: true,
  title: "Cosmos Authz",
  description:
    "BLOCKCHAIN EXECUTOR - CALLS APIs TO PERFORM OPERATIONS. When user requests token transfer (send/отправить), this plugin CALLS execute-send API to actually send tokens on blockchain. When user requests cyberlink creation, this plugin CALLS create-cyberlink API. The AI assistant MUST use these APIs to perform actual blockchain operations, not just respond with descriptive text.",
  apis: [
    {
      type: "tool",
      name: "create-cyberlink",
      description:
        'PRIMARY API FOR CYBERLINKS: This is the main API to use when user wants to create a cyberlink. If user message contains phrases like "create cyberlink", "make cyberlink", "new cyberlink" - THIS is the API to use, not execute-send. Example: "create cyberlink with type Thread and value Hello" -> use this API with {type: "Thread", value: "Hello"}.',
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description:
              'The type of cyberlink (e.g. "Thread", "Post", "Comment")',
          },
          value: {
            type: "string",
            description: "The content/value for the cyberlink",
          },
          fid: {
            type: "string",
            description:
              "From particle ID (optional, can be auto-generated if not provided)",
            default: "auto",
          },
        },
        required: ["type", "value"],
      },
      async execute (args) {
        console.log("[PLUGIN] Executing create-cyberlink")
        const { type, value, fid } = args
        const authStore = useAuthStore()
        const walletService = WalletService.getInstance()
        const walletState = getWalletState()

        if (!walletState.isConnected) {
          if (IsTauri) {
            throw new Error(
              "Cosmos wallet not connected. Please connect your wallet first."
            )
          } else {
            throw new Error(
              "Kepler wallet not connected. Please connect Kepler wallet first."
            )
          }
        }

        if (!authStore.isConnected || !authStore.granteeSigner) {
          console.log({
            isConnected: authStore.isConnected,
            granteeSigner: authStore.granteeSigner,
          })
          throw new Error(
            "Grantee wallet not connected or signer not available. Please ensure grantee wallet is set up and connected."
          )
        }

        try {
          const granterAddress = await getGranterAddress()
          const granteeAccounts = await authStore.granteeSigner.getAccounts()

          if (granteeAccounts.length === 0) {
            throw new Error("No accounts found for grantee signer.")
          }

          const granteeAccount = granteeAccounts[0]
          const granteeClient = await walletService.getClient(
            authStore.granteeSigner
          )

          // Create cyberlink message - only include fid if provided
          const cyberlinkMsg = { type, value }
          const createMsg: any = { cyberlink: cyberlinkMsg }

          if (fid && fid !== "auto") {
            createMsg.fid = fid
          }

          const execContractMsg = {
            sender: granterAddress,
            contract: CYBER_CONTRACT_ADDRESS,
            msg: toUtf8(
              JSON.stringify({
                create_cyberlink: createMsg,
              })
            ),
            funds: [],
          }

          const execMsg = {
            grantee: granteeAccount.address,
            msgs: [
              {
                typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
                value: MsgExecuteContract.encode(execContractMsg).finish(),
              },
            ],
          }

          const tx = await granteeClient.signAndBroadcast(
            granteeAccount.address,
            [
              {
                typeUrl: "/cosmos.authz.v1beta1.MsgExec",
                value: execMsg,
              },
            ],
            {
              amount: coins("210000", config.FEE_DENOM),
              gas: "210000",
            }
          )

          if (tx.code !== 0) {
            const errorMessage = tx.rawLog || "Transaction failed"
            throw new Error(
              `Transaction failed with code ${tx.code} ${errorMessage}`
            )
          }

          return [
            {
              type: "text",
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

The cyberlink was created using MsgExecuteContract authorization through the grantee wallet.`,
            },
          ]
        } catch (error) {
          console.error("Error creating cyberlink:", error)
          throw new Error(`Failed to create cyberlink: ${error.message}`)
        }
      },
    },
    {
      type: "tool",
      name: "update-cyberlink",
      description: "Update an existing cyberlink by setting a new value.",
      parameters: {
        type: "object",
        properties: {
          value: {
            type: "string",
            description: "New value/content for the cyberlink",
          },
          fid: {
            type: "string",
            description: 'From particle ID (required, e.g. "Thread:12")',
          },
          from: {
            type: "string",
            description:
              'Source particle (optional, only include if user explicitly mentions "from something")',
          },
          to: {
            type: "string",
            description:
              'Target particle (optional, only include if user explicitly mentions "to something")',
          },
        },
        required: ["value", "fid"],
      },
      async execute (args) {
        console.log("[PLUGIN] Executing update-cyberlink")
        const { value, fid, from, to } = args
        const authStore = useAuthStore()
        const walletService = WalletService.getInstance()
        const walletState = getWalletState()

        if (!walletState.isConnected) {
          if (IsTauri) {
            throw new Error(
              "Cosmos wallet not connected. Please connect your wallet first."
            )
          } else {
            throw new Error(
              "Kepler wallet not connected. Please connect Kepler wallet first."
            )
          }
        }

        if (!authStore.isConnected || !authStore.granteeSigner) {
          console.log({
            isConnected: authStore.isConnected,
            granteeSigner: authStore.granteeSigner,
          })
          throw new Error(
            "Grantee wallet not connected or signer not available. Please ensure grantee wallet is set up and connected."
          )
        }

        try {
          const granterAddress = await getGranterAddress()
          const granteeAccounts = await authStore.granteeSigner.getAccounts()

          if (granteeAccounts.length === 0) {
            throw new Error("No accounts found for grantee signer.")
          }

          const granteeAccount = granteeAccounts[0]
          const granteeClient = await walletService.getClient(
            authStore.granteeSigner
          )

          // Create update message - fid and value are required, from/to only if specified
          const updateMsg: any = {
            fid,
            value,
          }

          // Only include from/to if user explicitly provided them
          if (from) {
            updateMsg.from = from
          }

          if (to) {
            updateMsg.to = to
          }

          const execContractMsg = {
            sender: granterAddress,
            contract: CYBER_CONTRACT_ADDRESS,
            msg: toUtf8(
              JSON.stringify({
                update_cyberlink: updateMsg,
              })
            ),
            funds: [],
          }

          const execMsg = {
            grantee: granteeAccount.address,
            msgs: [
              {
                typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
                value: MsgExecuteContract.encode(execContractMsg).finish(),
              },
            ],
          }

          const tx = await granteeClient.signAndBroadcast(
            granteeAccount.address,
            [
              {
                typeUrl: "/cosmos.authz.v1beta1.MsgExec",
                value: execMsg,
              },
            ],
            {
              amount: coins("210000", config.FEE_DENOM),
              gas: "210000",
            }
          )

          if (tx.code !== 0) {
            const errorMessage = tx.rawLog || "Transaction failed"
            throw new Error(
              `Transaction failed with code ${tx.code} ${errorMessage}`
            )
          }

          return [
            {
              type: "text",
              contentText: `✅ **Cyberlink Updated Successfully**

**Update Details:**
- **FID:** ${fid}
- **New Value:** ${value}${from ? `\n- **From:** ${from}` : ""}${to ? `\n- **To:** ${to}` : ""}
- **Updater:** ${granterAddress}
- **Transaction Hash:** ${tx.transactionHash}
- **Gas Used:** ${tx.gasUsed}
- **Gas Wanted:** ${tx.gasWanted}
- **Block Height:** ${tx.height}

**Explorer Link:** https://cybernode.ai/network/cyber/tx/${tx.transactionHash}

The cyberlink was updated using MsgExecuteContract authorization through the grantee wallet.`,
            },
          ]
        } catch (error) {
          console.error("Error updating cyberlink:", error)
          throw new Error(`Failed to update cyberlink: ${error.message}`)
        }
      },
    },
    {
      type: "tool",
      name: "delete-cyberlink",
      description: "Delete an existing cyberlink between a type and its value.",
      parameters: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description:
              'Source particle type (e.g. "Thread", "Post", "Comment")',
          },
          to: {
            type: "string",
            description: "Target particle value or content to unlink",
          },
          fid: {
            type: "string",
            description:
              "From particle ID (optional, can be auto-generated if not provided)",
            default: "auto",
          },
        },
        required: ["from", "to"],
      },
      async execute (args) {
        console.log("[PLUGIN] Executing delete-cyberlink")
        const { from, to, fid } = args
        const authStore = useAuthStore()
        const walletService = WalletService.getInstance()
        const walletState = getWalletState()

        if (!walletState.isConnected) {
          if (IsTauri) {
            throw new Error(
              "Cosmos wallet not connected. Please connect your wallet first."
            )
          } else {
            throw new Error(
              "Kepler wallet not connected. Please connect Kepler wallet first."
            )
          }
        }

        if (!authStore.isConnected || !authStore.granteeSigner) {
          console.log({
            isConnected: authStore.isConnected,
            granteeSigner: authStore.granteeSigner,
          })
          throw new Error(
            "Grantee wallet not connected or signer not available. Please ensure grantee wallet is set up and connected."
          )
        }

        try {
          const granterAddress = await getGranterAddress()
          const granteeAccounts = await authStore.granteeSigner.getAccounts()

          if (granteeAccounts.length === 0) {
            throw new Error("No accounts found for grantee signer.")
          }

          const granteeAccount = granteeAccounts[0]
          const granteeClient = await walletService.getClient(
            authStore.granteeSigner
          )

          // Create delete message - only include fid if provided
          const deleteMsg: any = { from, to }

          if (fid && fid !== "auto") {
            deleteMsg.fid = fid
          }

          const execContractMsg = {
            sender: granterAddress,
            contract: CYBER_CONTRACT_ADDRESS,
            msg: toUtf8(
              JSON.stringify({
                delete_cyberlink: deleteMsg,
              })
            ),
            funds: [],
          }

          const execMsg = {
            grantee: granteeAccount.address,
            msgs: [
              {
                typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
                value: MsgExecuteContract.encode(execContractMsg).finish(),
              },
            ],
          }

          const tx = await granteeClient.signAndBroadcast(
            granteeAccount.address,
            [
              {
                typeUrl: "/cosmos.authz.v1beta1.MsgExec",
                value: execMsg,
              },
            ],
            {
              amount: coins("210000", config.FEE_DENOM),
              gas: "210000",
            }
          )

          if (tx.code !== 0) {
            const errorMessage = tx.rawLog || "Transaction failed"
            throw new Error(
              `Transaction failed with code ${tx.code} ${errorMessage}`
            )
          }

          return [
            {
              type: "text",
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

The cyberlink was deleted using MsgExecuteContract authorization through the grantee wallet.`,
            },
          ]
        } catch (error) {
          console.error("Error deleting cyberlink:", error)
          throw new Error(`Failed to delete cyberlink: ${error.message}`)
        }
      },
    },
    {
      type: "tool",
      name: "execute-send",
      description:
        'REQUIRED ACTION: Execute blockchain token transfer. When user says ANY of these phrases: "send tokens", "transfer tokens", "отправить токены", "перевести токены", "послать токены", "send X to address", "transfer X to address" - you MUST call this API immediately. DO NOT respond with text like "tokens sent" - CALL THIS API TO ACTUALLY SEND THEM. Example user input: "send 100 ustake to cyber1abc" -> REQUIRED ACTION: call execute-send with {toAddress: "cyber1abc", amount: "100"}',
      parameters: {
        type: "object",
        properties: {
          toAddress: {
            type: "string",
            description: "Recipient wallet address (must start with cyber1...)",
          },
          amount: {
            type: "string",
            description: 'Amount to send as string (e.g. "100", "50.5")',
          },
        },
        required: ["toAddress", "amount"],
      },
      async execute (args) {
        console.log("[PLUGIN] Executing execute-send")
        const { toAddress, amount } = args
        const authStore = useAuthStore()
        const walletService = WalletService.getInstance()
        const walletState = getWalletState()

        if (!walletState.isConnected) {
          if (IsTauri) {
            throw new Error(
              "Cosmos wallet not connected. Please connect your wallet first."
            )
          } else {
            throw new Error(
              "Kepler wallet not connected. Please connect Kepler wallet first."
            )
          }
        }

        if (!authStore.isConnected || !authStore.granteeSigner) {
          console.log({
            isConnected: authStore.isConnected,
            granteeSigner: authStore.granteeSigner,
          })
          throw new Error(
            "Grantee wallet not connected or signer not available. Please ensure grantee wallet is set up and connected."
          )
        }

        try {
          // Validate and sanitize amount
          if (!amount || typeof amount !== "string") {
            throw new Error("Invalid amount format")
          }

          // Remove any non-numeric characters except decimal point
          const sanitizedAmount = amount.replace(/[^\d.]/g, "")

          // Ensure only one decimal point
          const parts = sanitizedAmount.split(".")

          if (parts.length > 2) {
            throw new Error("Invalid amount format: multiple decimal points")
          }

          // Ensure decimal places don't exceed 6
          if (parts[1] && parts[1].length > 6) {
            throw new Error("Amount cannot have more than 6 decimal places")
          }

          const granterAddress = await getGranterAddress()
          const granteeAccounts = await authStore.granteeSigner.getAccounts()

          if (granteeAccounts.length === 0) {
            throw new Error("No accounts found for grantee signer.")
          }

          const granteeAccount = granteeAccounts[0]
          const granteeClient = await walletService.getClient(
            authStore.granteeSigner
          )

          // Convert amount to proper format
          const amountDecimal = Decimal.fromUserInput(sanitizedAmount, 0)
          const amountString = amountDecimal.atomics.toString()
          console.log("[PLUGIN] Amount decimal:", {
            amountDecimal,
            amountString,
          })

          console.log("Transaction details:", {
            granterAddress,
            toAddress,
            originalAmount: amount,
            sanitizedAmount,
            amountString,
          })

          // Create MsgSend directly instead of MsgExecuteContract
          const sendMsg = MsgSend.fromPartial({
            fromAddress: granterAddress,
            toAddress,
            amount: coins(amountString, config.FEE_DENOM),
          })

          // Use MsgExec to execute the MsgSend with authorization
          const execMsg: MsgExec = {
            grantee: granteeAccount.address,
            msgs: [
              {
                typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                value: MsgSend.encode(sendMsg).finish(),
              },
            ],
          }

          const tx = await granteeClient.signAndBroadcast(
            granteeAccount.address,
            [
              {
                typeUrl: "/cosmos.authz.v1beta1.MsgExec",
                value: execMsg,
              },
            ],
            {
              amount: coins("210000", config.FEE_DENOM),
              gas: "210000",
            }
          )

          if (tx.code !== 0) {
            const errorMessage = tx.rawLog || "Transaction failed"
            throw new Error(
              `Transaction failed with code ${tx.code} ${errorMessage}`
            )
          }

          return [
            {
              type: "text",
              contentText: `✅ **Token Transfer Successful** **Explorer Link:** https://cybernode.ai/network/cyber/tx/${tx.transactionHash}`,
            },
          ]
        } catch (error) {
          console.error("Error executing send transaction:", error)
          throw new Error(`Failed to execute transaction: ${error.message}`)
        }
      },
    },
  ],
  fileparsers: [],
  settings: {
    type: "object",
    properties: {},
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
  promptVars: [],
}

export default authzPlugin
