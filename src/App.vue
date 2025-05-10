<template>
  <router-view />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFirstVisit } from './composables/first-visit'
import { useLoginDialogs } from './composables/login-dialogs'
import { useSetTheme } from './composables/set-theme'
import { useSubscriptionNotify } from './composables/subscription-notify'
import { onMounted, provide } from 'vue'
import { checkUpdate, ready } from './utils/update'
import { createKeplerWallet } from './services/kepler/KeplerWallet'
import { createCosmosSigner } from './services/cosmos/CosmosSigner'
// import { createDbService } from './services/database/Db'

defineOptions({
  name: 'App'
})

// Provide Kepler wallet
provide('kepler', createKeplerWallet())
// Provide Cosmos signer
provide('cosmos', createCosmosSigner())
// provide('db', createDbService())
useSetTheme()
useLoginDialogs()
useFirstVisit()
useSubscriptionNotify()

const router = useRouter()
router.afterEach(to => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI as Workspace`
  }
})

onMounted(() => {
  ready()
  checkUpdate()
})

</script>
