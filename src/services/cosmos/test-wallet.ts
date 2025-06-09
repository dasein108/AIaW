import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"
import { GasPrice, StargateClient } from "@cosmjs/stargate"
import { config } from "../constants"

async function testWallet () {
  try {
    // Create wallet from mnemonic
    const mnemonic =
      "program vast lesson soldier lucky power cost tragic train combine minute wonder" // Replace with your test mnemonic
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "cyber",
    })

    // Get accounts
    const accounts = await wallet.getAccounts()
    const address = accounts[0].address
    console.log("Wallet address:", address)

    // Create signing client
    const gasPrice = GasPrice.fromString(
      `${config.GAS_PRICE_AMOUNT}${config.FEE_DENOM}`
    )
    const signingClient = await SigningCosmWasmClient.connectWithSigner(
      config.NODE_RPC_URL,
      wallet,
      { gasPrice }
    )

    // Get balance
    const balance = await signingClient.getBalance(address, config.FEE_DENOM)
    console.log("Balance:", balance)

    // Get all balances using StargateClient
    const stargateClient = await StargateClient.connect(config.NODE_RPC_URL)
    const allBalances = await stargateClient.getAllBalances(address)
    console.log("All balances:", allBalances)
  } catch (error) {
    console.error("Error:", error)
  }
}

// Run the test
testWallet()
