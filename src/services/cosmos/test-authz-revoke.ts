import { DirectSecp256k1HdWallet, coins } from "@cosmjs/proto-signing"
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate"
import { MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx"

const config = {
  CHAIN_ID: "cyber42-1",
  FEE_DENOM: "ustake",
  NODE_RPC_URL: "https://rpc.cyber-rollup.chatcyber.ai",
  GAS_PRICE_AMOUNT: "0.15",
}

const granterMnemonic =
  "program vast lesson soldier lucky power cost tragic train combine minute wonder"
const granteeAddress = "cyber19jjkgn29ncqravjdvzy7gmahxhp2r4u5584gax"
;(async () => {
  const granterWallet = await DirectSecp256k1HdWallet.fromMnemonic(
    granterMnemonic,
    {
      prefix: "cyber",
    }
  )
  const [granterAccount] = await granterWallet.getAccounts()

  const gasPrice = GasPrice.fromString(
    `${config.GAS_PRICE_AMOUNT}${config.FEE_DENOM}`
  )

  const client = await SigningStargateClient.connectWithSigner(
    config.NODE_RPC_URL,
    granterWallet,
    { gasPrice }
  )

  const revokeMsg: MsgRevoke = {
    granter: granterAccount.address,
    grantee: granteeAddress,
    msgTypeUrl: "/cosmos.bank.v1beta1.MsgSend",
  }

  const revokeTx = await client.signAndBroadcast(
    granterAccount.address,
    [
      {
        typeUrl: "/cosmos.authz.v1beta1.MsgRevoke",
        value: revokeMsg,
      },
    ],
    {
      amount: coins("100000", config.FEE_DENOM),
      gas: "100000",
    }
  )

  if (revokeTx.code !== 0) {
    throw new Error(`Broadcast failed: ${revokeTx.code} ${revokeTx.rawLog}`)
  }

  console.log("✅ MsgRevoke success:", revokeTx.transactionHash)
})()
