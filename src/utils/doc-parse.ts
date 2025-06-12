// This file is being kept for backward compatibility during the refactoring process.
// It re-exports the utils from its new location in the features/artifacts module.
// TODO: Update all imports to reference @/features/artifacts/utils/docParse directly and remove this file.

export { parseDoc } from "@/features/artifacts/utils/docParse"
export type { ParsedDoc } from "@/features/artifacts/utils/docParse"
