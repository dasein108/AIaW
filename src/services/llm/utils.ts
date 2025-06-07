import { engine } from "src/utils/template-engine"
import { generateText, LanguageModelV1 } from "ai"
import { MessageContentMapped } from "../supabase/types"
import { GenDialogTitle, NameArtifactPrompt, ExtractArtifactPrompt } from "src/utils/templates"

const generateTitle = async (model: LanguageModelV1, contents: MessageContentMapped[], lang: string) => {
  const { text } = await generateText({
    model,
    prompt: await engine.parseAndRender(GenDialogTitle, {
      contents,
      lang
    })
  })

  return text
}

const generateArtifactName = async (model: LanguageModelV1, content: string, lang?: string) => {
  const { text } = await generateText({
    model,
    prompt: engine.parseAndRenderSync(NameArtifactPrompt, { content, lang })
  })
  return text
}

const generateExtractArtifact = async (model: LanguageModelV1, content: MessageContentMapped[], lang?: string) => {
  const { text } = await generateText({
    model,
    prompt: engine.parseAndRenderSync(ExtractArtifactPrompt, { content, lang })
  })
  return text
}

export { generateTitle, generateArtifactName, generateExtractArtifact }
