import { defaultData } from "src/utils/plugins"
import { createUserDataStore } from "@/shared/utils/createUserDataStore"
import { PluginData } from "@/utils/types"

export const useUserPluginsStore = () => {
  return createUserDataStore<Record<string, PluginData>>(
    "user-plugins",
    defaultData
  )()
}
