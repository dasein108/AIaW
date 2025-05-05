import type { IndexedTx } from '@cosmjs/cosmwasm-stargate'
import type { TxStatusResponse } from './types'

export const parseTxStatus = async (tx: IndexedTx): Promise<TxStatusResponse> => {
  if (tx.code === 0) {
    return {
      status: 'confirmed',
      result: tx.events.reduce((acc, event) => {
        event.attributes.forEach((attr) => {
          acc[attr.key] = attr.value
        })
        return acc
      }, {} as Record<string, any>)
    }
  }

  return {
    status: 'failed',
    error: String(tx.code) || 'Transaction failed'
  }
}
