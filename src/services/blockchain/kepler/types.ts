export interface TxStatusResponse {
  status: "pending" | "confirmed" | "failed"
  result?: Record<string, any>
  error?: string
}

export interface KeplerWalletState {
  isConnected: boolean
  address: string | null
}
