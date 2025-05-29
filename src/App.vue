<template>
  <router-view />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFirstVisit } from './composables/first-visit'
import { useSetTheme } from './composables/set-theme'
import { onMounted, provide } from 'vue'
import { checkUpdate, ready } from './utils/update'
import { createKeplerWallet } from './services/kepler/KeplerWallet'
import { useUserStore } from 'src/stores/user'
import { useQuasar } from 'quasar'
import { useChatMessagesStore } from './stores/chat-messages'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'App'
})

const userStore = useUserStore()
const { t } = useI18n()
// Subscribes to chat messages
useChatMessagesStore()

const $q = useQuasar()

// Provide Kepler wallet
provide('kepler', createKeplerWallet())

useSetTheme()
useFirstVisit()

const router = useRouter()
router.afterEach(to => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI as Workspace`
  }
})

// Check if user is authenticated, if not, redirect to main page
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const waitUntilInit = () =>
      new Promise(resolve => {
        const check = () => {
          if (userStore.isInitialized) resolve(void 0)
          else setTimeout(check, 50)
        }
        check()
      })

    await waitUntilInit()

    if (!userStore.isInitialized) {
      $q.notify({
        message: t('common.pleaseLogin'),
        color: 'negative'
      })
      return next('/')
    }
  }
  return next()
})

onMounted(async () => {
  ready()
  checkUpdate()
  await userStore.init()
})

</script>
