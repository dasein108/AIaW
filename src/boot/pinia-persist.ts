import { boot } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default boot(({ app }) => {
  app.use(pinia)
})
