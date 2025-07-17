import { generateText, LanguageModelV1 } from "ai"

import { PluginPrompt } from "@/shared/types"

import {
  GenDialogTitle,
  NameArtifactPrompt,
  ExtractArtifactPrompt,
  PluginsPrompt,
} from "@/features/dialogs/utils/dialogTemplateDefinitions"
import { engine } from "@/features/dialogs/utils/templateEngine"

import { MessageContentNested } from "@/services/data/types/messageContents"

const generateTitle = async (
  model: LanguageModelV1,
  contents: Readonly<MessageContentNested[]>,
  lang: string
) => {
  const { text } = await generateText({
    model,
    prompt: await engine.parseAndRender(GenDialogTitle, {
      contents,
      lang,
    }),
  })

  return text
}

const generateArtifactName = async (
  model: LanguageModelV1,
  content: string,
  lang?: string
) => {
  const { text } = await generateText({
    model,
    prompt: engine.parseAndRenderSync(NameArtifactPrompt, { content, lang }),
  })

  return text
}

const processPromptRequest = async (
  model: LanguageModelV1,
  promptTemplate: string,
  context: Record<string, any>,
  tools?: Record<string, any>,
  maxSteps = 5
) => {
  const response = await generateText({
    model,
    prompt: engine.parseAndRenderSync(promptTemplate, context),
    tools,
    maxSteps
  })

  console.log("---processPromptRequest response", response)

  // If response.text is exactly '""', return empty string instead
  return response.text === '""' ? '' : response.text
}

const generateExtractArtifact = async (
  model: LanguageModelV1,
  content: MessageContentNested[],
  lang?: string
) => {
  const { text } = await generateText({
    model,
    prompt: engine.parseAndRenderSync(ExtractArtifactPrompt, { content, lang }),
  })

  return text
}

function getSystemPrompt (
  pluginPrompts: PluginPrompt[],
  promptTemplate: string,
  rolePrompt: string,
  vars: Record<string, any>
) {
  const prompt = engine.parseAndRenderSync(promptTemplate, {
    ...vars,
    _pluginsPrompt: pluginPrompts.length
      ? engine.parseAndRenderSync(PluginsPrompt, { plugins: pluginPrompts })
      : "",
    _rolePrompt: rolePrompt,
  })

  return prompt.trim() ? prompt : undefined
}

export {
  generateTitle,
  generateArtifactName,
  generateExtractArtifact,
  getSystemPrompt,
  processPromptRequest
}
