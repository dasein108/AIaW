export interface TxStatusResponse {
  status: 'pending' | 'confirmed' | 'failed';
  result?: Record<string, any>;
  error?: string;
}

export interface KeplerWalletState {
  isConnected: boolean;
  address: string | null;
}

export interface ChainConfig {
  CHAIN_ID: string;
  FEE_DENOM: string;
  DENOM: string;
  NODE_RPC_URL: string;
  LCD_URL: string;
  RPC_TIMEOUT: number;
  GAS_PRICE_AMOUNT: string;
}
