import storeCreator from "./pinia-store"

// Re-export all shared stores
export { useUserStore } from "./user"
export { useUserDataStore } from "./user-data"
export { useUserPerfsStore } from "./user-perfs"
export { useUiStateStore } from "./ui-state"
export { saveMnemonic, getMnemonic, removeMnemonic } from "./tauri-store"

// Export the Pinia store creator
export default storeCreator
