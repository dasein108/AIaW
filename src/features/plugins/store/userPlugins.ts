import { defaultData } from "@/features/plugins/utils/plugins"
import { createKeyValueDbStore } from "@/shared/store/utils/createKeyValueDbStore"
import { PluginData } from "@/shared/types"

export const useUserPluginsStore = () => {
  return createKeyValueDbStore<Record<string, PluginData>>(
    "user-plugins",
    defaultData
  )()
}
