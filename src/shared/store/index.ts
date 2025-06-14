import storeCreator from "./piniaStore"

// Re-export all shared stores
export { useUserStore } from "./userStore"
export { useUserDataStore } from "./userDataStore"
export { useUserPrefsStore as useUserPerfsStore } from "./userPrefsStore"
export { useUiStateStore } from "./uiStateStore"
export { saveMnemonic, getMnemonic, removeMnemonic } from "./tauriStore"

// Export the Pinia store creator
export default storeCreator
