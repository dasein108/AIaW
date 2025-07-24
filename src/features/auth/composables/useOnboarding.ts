import { storeToRefs } from "pinia"
import { QSpinnerGears, useQuasar } from "quasar"
import { useRouter } from "vue-router"

import { defaultWorkspaceId, getDefaultAssistant, getDefaultProviderData, DEFAULT_BUILDIN_MCP_PLUGINS, DEFAULT_BUILTIN_PLUGINS } from "@/shared/consts"
import { useUserPerfsStore, useUserStore } from "@/shared/store"
import { McpPluginDump, McpPluginManifest } from "@/shared/types"
import { localData } from "@/shared/utils/localData"

import { useAssistantsStore } from "@/features/assistants/store"
import { usePluginsStore } from "@/features/plugins/store"
import { buildMcpPlugin } from "@/features/plugins/utils/plugins"
import { useWorkspacesStore } from "@/features/workspaces/store"

import { Assistant } from "@/services/data/types/assistant"

export function useOnboarding () {
  const $q = useQuasar()
  const router = useRouter()
  const assistantsStore = useAssistantsStore()
  const userStore = useUserStore()
  const pluginsStore = usePluginsStore()
  const { data: userPerf } = storeToRefs(useUserPerfsStore())
  const workspaceStore = useWorkspacesStore()

  const showOnboardingLoader = (message: string) => {
    $q.loading.show({
      spinner: QSpinnerGears,
      message,
    })
  }
  const onboarding = async () => {
    // Check if user is logged in first
    if (!userStore.currentUserId) {
      console.log("No user logged in, skipping onboarding")

      return
    }

    let assistant: Assistant | null = assistantsStore.assistants[0]
    // Check user's accessible workspaces instead of all workspaces
    const userAccessibleWorkspaces = workspaceStore.getUserAccessibleWorkspaces(userStore.currentUserId)
    const noWorkspaces = userAccessibleWorkspaces.length === 0
    const defaultPluginsExist = DEFAULT_BUILDIN_MCP_PLUGINS.every(plugin => pluginsStore.plugins.find(p => p.id === plugin.id))

    console.log("Assistants", assistant)
    console.log("noWorkspaces", noWorkspaces)
    console.log("userAccessibleWorkspaces", userAccessibleWorkspaces)
    console.log("localData.visited", localData.visited)

    if (!localData.visited || (!assistant && noWorkspaces) || !defaultPluginsExist) {
      try {
        showOnboardingLoader("Onboarding in progress...")

        if (!userPerf.value.provider) {
          const { provider, model } = getDefaultProviderData()
          userPerf.value.provider = provider
          userPerf.value.model = model
        }

        if (!assistant) {
          showOnboardingLoader("Creating default assistant...")

          assistant = await assistantsStore.add(getDefaultAssistant())
        }

        if (!defaultPluginsExist) {
          showOnboardingLoader("Setting up plugins...")

          // Install default MCP plugins
          for (const pluginManifest of DEFAULT_BUILDIN_MCP_PLUGINS) {
            // if plugin is not installed, install it
            if (!pluginsStore.plugins.find(p => p.id === pluginManifest.id)) {
              const pluginData = await pluginsStore.installMcpPlugin(pluginManifest as McpPluginManifest)

              const plugin = buildMcpPlugin(pluginData.manifest as McpPluginDump)
              await assistantsStore.setPlugin(assistant, plugin, true)
            }
          }

          // Install default built-in plugins
          for (const pluginId of DEFAULT_BUILTIN_PLUGINS) {
            if (!pluginsStore.plugins.find(p => p.id === pluginId)) {
              const plugin = pluginsStore.plugins.find(p => p.id === pluginId)

              if (!plugin) {
                console.error(`Plugin ${pluginId} not found`)
                continue
              }

              await assistantsStore.setPlugin(assistant, plugin, true)
            }
          }
        }

        if (noWorkspaces) {
          showOnboardingLoader("Adding default workspace...")
          await workspaceStore.addWorkspaceMember(defaultWorkspaceId, userStore.currentUserId, "member")
        }

        // Mark as visited after successful onboarding
        localData.visited = true

        $q.notify({
          message: "Onboarding completed. You can start using the app now.",
          color: "positive",
          position: "top",
        })

        // Redirect to the workspace page after successful onboarding
        await router.push(`/workspaces/${defaultWorkspaceId}`)
      } catch (error) {
        console.error(error)
        $q.notify({
          message: "Onboarding failed. Ask support@cyber.ai",
          color: "negative",
          position: "top",
        })
      } finally {
        setTimeout(() => {
          $q.loading.hide()
        }, 500)
      }
    }
  }

  return {
    onboarding,
  }
}
