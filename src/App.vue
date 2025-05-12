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
import { createUserProvider } from './services/supabase/userProvider'
import { useQuasar } from 'quasar'
defineOptions({
  name: 'App'
})

const $q = useQuasar()

// Provide Kepler wallet
provide('kepler', createKeplerWallet())

// Provide user provider
const userProvider = createUserProvider()

provide('user', userProvider)

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

// Check if user is authenticated, if not, redirect to main page
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth && !userProvider.isLoggedIn.value) {
    $q.notify({
      message: 'Please login to access this page',
      color: 'negative'
    })
    return next('/')
  }
  return next()
})

onMounted(async () => {
  ready()
  checkUpdate()
})

</script>
