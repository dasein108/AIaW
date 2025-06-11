import { defaultData } from "@/features/plugins/utils/plugins"
import { createUserDataStore } from "@/shared/utils/createUserDataStore"
import { PluginData } from "@/shared/utils/types"

export const useUserPluginsStore = () => {
  return createUserDataStore<Record<string, PluginData>>(
    "user-plugins",
    defaultData
  )()
}
