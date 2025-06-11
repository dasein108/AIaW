import { defaultData } from "@/features/plugins/utils/plugins"
import { createUserDataStore } from "./createUserDataStore"
import { PluginData } from "@/utils/types"

export const useUserPluginsStore = () => {
  return createUserDataStore<Record<string, PluginData>>(
    "user-plugins",
    defaultData
  )()
}
