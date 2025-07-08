<template>
  <div class="supertokens-auth">
    <div id="supertokens-auth-container" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useSuperTokens } from '../composables/useSuperTokens'

const router = useRouter()
const { checkAuth, isAuthenticated } = useSuperTokens()

// Props
interface Props {
  redirectTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  redirectTo: '/'
})

// Emits
const emit = defineEmits<{
  (e: 'auth-success'): void
  (e: 'auth-error', error: any): void
}>()

// Check authentication on mount
onMounted(async () => {
  try {
    const authenticated = await checkAuth()

    if (authenticated) {
      emit('auth-success')

      if (props.redirectTo) {
        await router.push(props.redirectTo)
      }
    }
  } catch (error) {
    console.error('Authentication check failed:', error)
    emit('auth-error', error)
  }
})

// Watch for authentication changes
const unwatch = watch(isAuthenticated, async (authenticated) => {
  if (authenticated) {
    emit('auth-success')

    if (props.redirectTo) {
      await router.push(props.redirectTo)
    }
  }
})

onUnmounted(() => {
  unwatch()
})
</script>

<style scoped>
.supertokens-auth {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

#supertokens-auth-container {
  min-height: 400px;
}
</style>
