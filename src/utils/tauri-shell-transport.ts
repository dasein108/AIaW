// This file is being kept for backward compatibility during the refactoring process.
// It re-exports the utils from its new location in the feature module.
// TODO: Update all imports to reference @features/platform/utils/tauriShellTransport directly and remove this file.

export { TauriShellClientTransport, type TauriShellServerParameters } from "@features/platform/utils/tauriShellTransport"
