import { createKeyValueDbStore } from "@/shared/store/utils/createKeyValueDbStore"
import { PluginData } from "@/shared/types"

import { defaultData } from "@/features/plugins/utils/plugins"

/**
 * Store for managing user-installed plugins
 *
 * This store provides persistent storage for plugin data including:
 * - Installed plugin configurations
 * - Plugin settings and metadata
 * - Plugin authorization status
 *
 * It uses the key-value database store pattern for simplified data persistence.
 *
 * @dependencies
 * - {@link createKeyValueDbStore} - For database persistence
 *
 * @database
 * - Table: "user_data" with key "user-plugins" - Stores serialized plugin data
 *
 * @related
 * - Used by {@link usePluginsStore} for plugin management
 * - Used by {@link mcpClient} for plugin communication
 * - Used by various plugin components for installation and configuration
 */
export const useUserPluginsStore = () => {
  return createKeyValueDbStore<Record<string, PluginData>>(
    "user-plugins",
    defaultData
  )()
}
