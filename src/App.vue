<template>
  <div v-if="isAppReady">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFirstVisit } from './composables/first-visit'
import { useSetTheme } from './composables/set-theme'
import { onMounted, provide, watch, computed } from 'vue'
import { checkUpdate, ready } from './utils/update'
import { createKeplerWallet } from './services/kepler/KeplerWallet'
import { useUserStore } from 'src/stores/user'
import { useQuasar } from 'quasar'
import { useChatMessagesStore } from './stores/chat-messages'
import { useI18n } from 'vue-i18n'
import { until } from '@vueuse/core'
import { useAssistantsStore } from './stores/assistants'
import { useChatsStore } from './stores/chats'
import { useDialogsStore } from './stores/dialogs'
import { usePluginsStore } from './stores/plugins'
import { storeToRefs } from 'pinia'
import { useUserPerfsStore } from './stores/user-perfs'
import { useUserDataStore } from './stores/user-data'
defineOptions({
  name: 'App'
})
const { t } = useI18n()
const $q = useQuasar()

const userStore = useUserStore()

$q.loading.show()

const { isInitialized: userInitialized } = storeToRefs(userStore)
const { isLoaded: assistantsLoaded } = storeToRefs(useAssistantsStore())
const { isLoaded: chatsLoaded } = storeToRefs(useChatsStore())
const { isLoaded: dialogsLoaded } = storeToRefs(useDialogsStore())
const { isLoaded: pluginsLoaded } = storeToRefs(usePluginsStore())
const { ready: perfsLoaded } = storeToRefs(useUserPerfsStore())
const { ready: userDataLoaded } = storeToRefs(useUserDataStore())

const isAppReady = computed(() =>
  userInitialized.value &&
  assistantsLoaded.value &&
  chatsLoaded.value &&
  dialogsLoaded.value &&
  pluginsLoaded.value &&
  perfsLoaded.value &&
  userDataLoaded.value
)

watch(isAppReady, (isReady) => {
  if (isReady) {
    $q.loading.hide()
  }
}, { immediate: true })

// Subscribes to chat messages
useChatMessagesStore()

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
    await until(() => userInitialized.value).toBeTruthy()
    if (!userInitialized.value) {
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
