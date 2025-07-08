<template>
  <div class="supertokens-provider">
    <slot v-if="isInitialized" />
    <div
      v-else
      class="loading-container"
    >
      <q-spinner-dots
        size="50px"
        color="primary"
      />
      <p class="text-grey q-mt-md">
        Initializing authentication...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { initializeSuperTokens } from '@/services/auth/supertokens'

import { useSuperTokensStore } from '../store/supertokens'

const authStore = useSuperTokensStore()
const isInitialized = ref(false)

onMounted(async () => {
  try {
    // Initialize SuperTokens
    initializeSuperTokens()

    // Initialize auth store
    await authStore.initializeAuth()

    isInitialized.value = true
  } catch (error) {
    console.error('Failed to initialize SuperTokens:', error)
    // Still set as initialized to show the app, but auth will be in error state
    isInitialized.value = true
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
}
</style>
