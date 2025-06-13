import storeCreator from "./piniaStore"

// Re-export all shared stores
export { useUserStore } from "./user"
export { useUserDataStore } from "./userData"
export { useUserPerfsStore } from "./userPerfs"
export { useUiStateStore } from "./uiState"
export { saveMnemonic, getMnemonic, removeMnemonic } from "./tauriStore"

// Export the Pinia store creator
export default storeCreator
