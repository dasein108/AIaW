import storeCreator from "./piniaStore"

// Re-export all shared stores
export { useUserStore } from "./user"
export { useUserDataStore } from "./userData"
export { useUserPrefsStore as useUserPerfsStore } from "./userPrefs"
export { useUiStateStore } from "./uiState"
export { saveMnemonic, getMnemonic, removeMnemonic } from "./tauriStore"

// Export the Pinia store creator
export default storeCreator
