import {
  DirectSecp256k1HdWallet,
  coins
} from '@cosmjs/proto-signing'
import {
  GasPrice,
  SigningStargateClient
} from '@cosmjs/stargate'
import { MsgExec } from 'cosmjs-types/cosmos/authz/v1beta1/tx'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'

// Chain config
const config = {
  CHAIN_ID: 'cyber42-1',
  FEE_DENOM: 'ustake',
  DENOM: 'STAKE',
  NODE_RPC_URL: 'https://rpc.cyber-rollup.chatcyber.ai',
  LCD_URL: 'https://api.cyber-rollup.chatcyber.ai',
  RPC_TIMEOUT: 60000,
  GAS_PRICE_AMOUNT: '0.15'
}

const granterAddress = 'cyber19jjkgn29ncqravjdvzy7gmahxhp2r4u5584gax'
const granteeMnemonic = 'letter asthma orange sight cake negative miracle auction enact word senior report vehicle viable scrub tower arena minimum produce floor cloud drip ridge essay';

(async () => {
  const granteeWallet = await DirectSecp256k1HdWallet.fromMnemonic(granteeMnemonic, { prefix: 'cyber' })
  const [granteeAccount] = await granteeWallet.getAccounts()

  const gasPrice = GasPrice.fromString(`${config.GAS_PRICE_AMOUNT}${config.FEE_DENOM}`)

  const granteeClient = await SigningStargateClient.connectWithSigner(
    config.NODE_RPC_URL,
    granteeWallet,
    { gasPrice }
  )

  const sendMsg = MsgSend.fromPartial({
    fromAddress: granterAddress,
    toAddress: 'cyber1xnn0swvdy6urcl267z4fdvehhhfe7zkh6fme5l',
    amount: coins('100', config.DENOM)
  })

  const execMsg: MsgExec = {
    grantee: granteeAccount.address,
    msgs: [
      {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: MsgSend.encode(sendMsg).finish()
      }
    ]
  }

  const execTx = await granteeClient.signAndBroadcast(granteeAccount.address, [
    {
      typeUrl: '/cosmos.authz.v1beta1.MsgExec',
      value: execMsg
    }
  ], {
    amount: coins('100000', config.FEE_DENOM),
    gas: '100000'
  })

  console.log('[TEST] EXEC TX', execTx)

  if (execTx.code !== 0) {
    throw new Error(`Broadcast failed: ${execTx.code} ${execTx.rawLog}`)
  }
  console.log('✅ MsgExec success (send 100 ustake):', execTx.transactionHash)
})()
