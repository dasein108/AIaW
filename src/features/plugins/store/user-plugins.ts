import { defaultData } from "@/utils/plugins"
import { createUserDataStore } from "@/stores/createUserDataStore"
import { PluginData } from "@/utils/types"

export const useUserPluginsStore = () => {
  return createUserDataStore<Record<string, PluginData>>(
    "user-plugins",
    defaultData
  )()
}
