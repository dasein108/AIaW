import { DirectSecp256k1HdWallet, coins } from "@cosmjs/proto-signing"
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate"
import { MsgExec, MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx"
import { SendAuthorization } from "cosmjs-types/cosmos/bank/v1beta1/authz"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { Any } from "cosmjs-types/google/protobuf/any"

// Chain config
const config = {
  CHAIN_ID: "cyber42-1",
  FEE_DENOM: "ustake",
  DENOM: "STAKE",
  NODE_RPC_URL: "https://rpc.cyber-rollup.chatcyber.ai",
  LCD_URL: "https://api.cyber-rollup.chatcyber.ai",
  RPC_TIMEOUT: 60000,
  GAS_PRICE_AMOUNT: "0.15",
}

const granterMnemonic =
  "program vast lesson soldier lucky power cost tragic train combine minute wonder"
const granteeMnemonic =
  "letter asthma orange sight cake negative miracle auction enact word senior report vehicle viable scrub tower arena minimum produce floor cloud drip ridge essay"

;(async () => {
  // Инициализация granter
  const granterWallet = await DirectSecp256k1HdWallet.fromMnemonic(
    granterMnemonic,
    {
      prefix: "cyber",
    }
  )
  const [granterAccount] = await granterWallet.getAccounts()

  // Создание grantee
  const granteeWallet = await DirectSecp256k1HdWallet.fromMnemonic(
    granteeMnemonic,
    { prefix: "cyber" }
  )
  const [granteeAccount] = await granteeWallet.getAccounts()

  console.log("Granter:", granterAccount.address)
  console.log("Grantee:", granteeAccount.address)

  const gasPrice = GasPrice.fromString(
    `${config.GAS_PRICE_AMOUNT}${config.FEE_DENOM}`
  )

  // Клиент granter'а
  const granterClient = await SigningStargateClient.connectWithSigner(
    config.NODE_RPC_URL,
    granterWallet,
    { gasPrice }
  )

  // Создаём SendAuthorization
  const sendAuth = SendAuthorization.fromPartial({
    spendLimit: coins("10000", config.FEE_DENOM),
  })

  const grantMsg: MsgGrant = {
    granter: granterAccount.address,
    grantee: granteeAccount.address,
    grant: {
      authorization: Any.fromPartial({
        typeUrl: "/cosmos.bank.v1beta1.SendAuthorization",
        value: SendAuthorization.encode(sendAuth).finish(),
      }),
      expiration: {
        seconds: BigInt(Math.floor((Date.now() + 3600_000) / 1000)),
        nanos: 0,
      },
    },
  }

  const grantTx = await granterClient.signAndBroadcast(
    granterAccount.address,
    [
      {
        typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
        value: grantMsg,
      },
    ],
    {
      amount: coins("100000", config.FEE_DENOM),
      gas: "100000",
    }
  )

  if (grantTx.code !== 0) {
    throw new Error(`Broadcast failed: ${grantTx.code} ${grantTx.rawLog}`)
  }

  console.log("✅ MsgGrant success:", grantTx.transactionHash)

  // Теперь grantee делает MsgExec с MsgSend
  const granteeClient = await SigningStargateClient.connectWithSigner(
    config.NODE_RPC_URL,
    granteeWallet,
    { gasPrice }
  )

  const sendMsg: MsgSend = {
    fromAddress: granterAccount.address,
    toAddress: granteeAccount.address,
    amount: coins("1", config.FEE_DENOM),
  }

  const execMsg: MsgExec = {
    grantee: granteeAccount.address,
    msgs: [
      {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: MsgSend.encode(sendMsg).finish(),
      },
    ],
  }

  const execTx = await granteeClient.signAndBroadcast(
    granteeAccount.address,
    [
      {
        typeUrl: "/cosmos.authz.v1beta1.MsgExec",
        value: execMsg,
      },
    ],
    {
      amount: coins("100000", config.FEE_DENOM),
      gas: "100000",
    }
  )

  if (execTx.code !== 0) {
    throw new Error(`Broadcast failed: ${execTx.code} ${execTx.rawLog}`)
  }

  console.log("✅ MsgExec success:", execTx.transactionHash)
})()
