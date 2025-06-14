/**
 * Index file for dialog utility functions and templates.
 * Re-exports all utilities for easier importing.
 */
export { engine } from "./templateEngine"

export {
  GenDialogTitle,
  DialogContent,
  PluginsPrompt,
  AssistantDefaultPrompt,
  DefaultWsIndexContent,
  ExampleWsIndexContent,
  ExtractArtifactPrompt,
  ExtractArtifactSchema,
  NameArtifactPrompt,
} from "./dialogTemplateDefinitions"

export type { ExtractArtifactResult } from "./dialogTemplateDefinitions"

export { storedItemResultContent } from "./dialogMessageUtils"
