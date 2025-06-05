import { PluginData } from '@/utils/types'
import { createUserDataStore } from './createUserDataStore'
import { defaultData } from 'src/utils/plugins'

export const useUserPluginsStore = () => {
  return createUserDataStore<Record<string, PluginData>>('user-plugins', defaultData)()
}
