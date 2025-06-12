// This file provides backward compatibility with existing imports
// It re-exports from the modular locations to maintain original import paths

// Re-export from blockchain services
export { config } from "./blockchain/constants"
export { WalletService } from "./blockchain/authz/wallet-service"
export { createCosmosSigner } from "./blockchain/cosmos/CosmosWallet"
export { createKeplerWallet, CYBER_CONTRACT_ADDRESS, getLocalStorageWalletState } from "./blockchain/kepler/KeplerWallet"
export { parseTxStatus } from "./blockchain/kepler/utils"
export { keplerPlugin } from "./blockchain/kepler/kepler-plugin"
export type { KeplerWalletState, TxStatusResponse } from "./blockchain/kepler/types"
export type { ChainConfig } from "./blockchain/kepler/types"

// Re-export from security services
export { EncryptionService } from "./security/encryption/EncryptionService"

// Re-export from AI services
export {
  generateTitle,
  generateArtifactName,
  generateExtractArtifact,
  getSystemPrompt
} from "./ai/llm/utils"

// Re-export from data services
export { supabase } from "./data/supabase/client"
export { CODE_NO_RECORD_FOUND } from "./data/supabase/consts"
export type {
  Database,
  Tables,
  Enums
} from "./data/supabase/database.types"
export type {
  AssistantMapped,
  WorkspaceMapped,
  DialogMapped,
  MessageContentMapped,
  ChatMapped,
  WorkspaceMemberMapped,
  ArtifactMapped,
  SubproviderMapped,
  CustomProviderMapped,
  ProfileMapped,
  DialogMessageMapped
} from "./data/supabase/types"
