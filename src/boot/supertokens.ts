import { boot } from 'quasar/wrappers'

import { initializeSuperTokens } from '@/services/auth/supertokens'

export default boot(async () => {
  // Initialize SuperTokens
  initializeSuperTokens()
})
