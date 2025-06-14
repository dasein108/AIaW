import { Schema, Validator } from "@cfworker/json-schema"
import { Ref, toRaw } from "vue"
import { useI18n } from "vue-i18n"

import { ApiResultItem, Plugin, PluginApi } from "@/shared/types"
import { removeUndefinedProps } from "@/shared/utils/functions"

import { usePluginsStore } from "@/features/plugins/store"

/**
 * Composable for calling plugin APIs with proper validation and error handling
 *
 * Provides utilities for validating and executing plugin API calls in the
 * context of a specific workspace and dialog.
 *
 * @param workspaceId - Reference to the current workspace ID
 * @param dialogId - Reference to the current dialog ID
 * @returns Object containing the callApi function
 */
export function useCallApi(
  workspaceId: Ref<string>,
  dialogId: Ref<string>
) {
  const pluginsStore = usePluginsStore()
  const { t } = useI18n()

  /**
   * Retrieves and validates settings for a plugin
   *
   * Injects context variables like workspaceId and dialogId if the plugin
   * accepts them, and validates the settings against the plugin's schema.
   *
   * @param plugin - The plugin to get settings for
   * @returns Object containing validation result and settings
   */
  function getPluginSettings(plugin: Plugin): { valid: boolean; settings: Record<string, any> } {
    const settings = toRaw(pluginsStore.data[plugin.id].settings)

    // Inject context variables if the plugin accepts them
    if (plugin.settings.properties._workspaceId) {
      settings._workspaceId = workspaceId.value
    }

    if (plugin.settings.properties._dialogId) {
      settings._dialogId = dialogId.value
    }

    // Clean up settings before validation
    removeUndefinedProps(settings)
    const { valid } = new Validator(plugin.settings as Schema).validate(
      settings
    )

    return { valid, settings }
  }

  /**
   * Calls a plugin API with arguments and proper validation
   *
   * This function:
   * 1. Validates the API arguments against the API's parameter schema
   * 2. Gets and validates the plugin settings
   * 3. Executes the API with the validated arguments and settings
   * 4. Handles any errors that occur during execution
   *
   * @param plugin - The plugin containing the API to call
   * @param api - The specific API to call
   * @param args - Arguments to pass to the API
   * @returns Promise resolving to the API result or error
   */
  async function callApi(
    plugin: Plugin,
    api: PluginApi,
    args: Record<string, any>
  ): Promise<{ result?: ApiResultItem[]; error?: string }> {
    // Validate API arguments
    const { valid: argValid } = new Validator(
      api.parameters as Schema
    ).validate(args)

    if (!argValid) {
      return { result: [], error: t("callApi.argValidationFailed") }
    }

    // Get and validate plugin settings
    const { valid: SettingsValid, settings } = getPluginSettings(plugin)

    if (!SettingsValid) {
      return { result: [], error: t("callApi.settingsValidationFailed") }
    }

    // Execute API and handle errors
    try {
      const result = await api.execute(args, settings)

      return { result, error: null }
    } catch (e) {
      return { result: [], error: e.message }
    }
  }

  return { callApi }
}
