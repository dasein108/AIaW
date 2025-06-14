import { LanguageModel, wrapLanguageModel } from "ai"
import { useProvidersStore } from "@features/providers/store"
import { useUserPerfsStore } from "@/shared/store"
import { AuthropicCors, FormattingReenabled } from "@/features/providers/utils/middlewares"
import { fetch } from "@/shared/utils/platformApi"
import { Model, Provider } from "@/shared/types"

const FormattingModels = ["o1", "o3-mini", "o3-mini-2025-01-31"]

function wrapMiddlewares (model: LanguageModel) {
  const middlewares = []
  FormattingModels.includes(model.modelId) &&
    middlewares.push(FormattingReenabled)
  model.provider.startsWith("anthropic.") && middlewares.push(AuthropicCors)

  return middlewares.length
    ? wrapLanguageModel({ model, middleware: middlewares })
    : model
}
export function useGetModel () {
  const { data: perfs } = useUserPerfsStore()

  const providersStore = useProvidersStore()

  function getProvider (provider?: Provider) {
    return provider || perfs.provider
  }

  /**
   * Retrieves the model configuration from user preferences or uses the provided model.
   * Ensures a valid model configuration is always available.
   *
   * @param model - Optional model configuration to use instead of preferences
   * @returns The provided model or the default model from user preferences
   */
  function retrieveModelConfiguration (model?: Model) {
    return model || perfs.model
  }

  function getSdkProvider (provider?: Provider) {
    provider = getProvider(provider)

    if (!provider) return null

    return providersStore.providerTypes
      .find((p) => p.name === provider.type)
      ?.constructor({
        ...provider.settings,
        fetch,
      })
  }

  function getSdkModel (
    provider?: Provider,
    model?: Model,
    options?: Record<string, any>
  ) {
    const sdkProvider = getSdkProvider(provider)

    if (!sdkProvider) return null

    model = retrieveModelConfiguration(model)

    if (!model) return null

    const m = sdkProvider(model.name, options) // TODO: || getSdkProvider(defaultProvider.value)(model.name, options)

    return m && wrapMiddlewares(m)
  }

  return { getProvider, getModel: retrieveModelConfiguration, getSdkProvider, getSdkModel }
}
