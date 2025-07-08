<template>
  <div class="user-auth-status">
    <!-- SuperTokens Auth Status -->
    <AuthStatus v-if="showSuperTokensAuth" />

    <!-- Traditional Auth Status -->
    <div
      v-else-if="isLoggedIn"
      class="user-info"
    >
      <q-avatar
        size="32px"
        class="q-mr-sm"
      >
        <q-icon name="person" />
      </q-avatar>
      <span class="user-name">{{ userDisplayName }}</span>
      <q-btn
        flat
        round
        icon="logout"
        @click="handleLogout"
        size="sm"
        color="negative"
      >
        <q-tooltip>Sign Out</q-tooltip>
      </q-btn>
    </div>

    <!-- Not Authenticated -->
    <div
      v-else
      class="auth-actions"
    >
      <q-btn
        color="primary"
        @click="handleLogin"
        icon="login"
        label="Sign In"
        size="sm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/shared/store'

import AuthStatus from '@/features/auth/components/AuthStatus.vue'
import { useSuperTokensStore } from '@/features/auth/store/supertokens'

const router = useRouter()
const $q = useQuasar()

const superTokensStore = useSuperTokensStore()
const userStore = useUserStore()

// Computed properties
const isLoggedIn = computed(() =>
  userStore.isLoggedIn || superTokensStore.isLoggedIn
)

const showSuperTokensAuth = computed(() =>
  superTokensStore.isLoggedIn && !userStore.isLoggedIn
)

const userDisplayName = computed(() => {
  if (superTokensStore.currentUser) {
    return superTokensStore.currentUser
  }

  if (userStore.currentUser?.user_metadata?.name) {
    return userStore.currentUser.user_metadata.name
  }

  return 'User'
})

// Methods
const handleLogin = async () => {
  if (superTokensStore.isLoggedIn) {
    await superTokensStore.login()
  } else {
    await router.push('/auth')
  }
}

const handleLogout = async () => {
  try {
    if (superTokensStore.isLoggedIn) {
      await superTokensStore.logout()
    } else {
      // Handle traditional logout - sign out from Supabase
      const { supabase } = await import('@/services/data/supabase/client')
      await supabase.auth.signOut()
    }

    $q.notify({
      type: 'positive',
      message: 'Successfully signed out'
    })

    await router.push('/auth')
  } catch (error) {
    console.error('Logout failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to sign out'
    })
  }
}
</script>

<style scoped>
.user-auth-status {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--q-primary);
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
