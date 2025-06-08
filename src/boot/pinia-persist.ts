import { createPinia } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import { boot } from "quasar/wrappers"

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default boot(({ app }) => {
  app.use(pinia)
})
