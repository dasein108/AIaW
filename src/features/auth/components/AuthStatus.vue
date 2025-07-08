<template>
  <div class="auth-status">
    <q-card
      v-if="isLoggedIn"
      class="auth-card"
    >
      <q-card-section>
        <div class="row items-center">
          <q-avatar
            size="40px"
            class="q-mr-md"
          >
            <q-icon name="person" />
          </q-avatar>
          <div class="col">
            <div class="text-h6">
              {{ currentUser || 'User' }}
            </div>
            <div class="text-caption text-grey">
              Authenticated
            </div>
          </div>
          <q-btn
            flat
            round
            icon="logout"
            @click="handleLogout"
            :loading="loading"
            color="negative"
          >
            <q-tooltip>Sign Out</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <q-card
      v-else
      class="auth-card"
    >
      <q-card-section>
        <div class="row items-center">
          <q-avatar
            size="40px"
            class="q-mr-md"
          >
            <q-icon name="person_off" />
          </q-avatar>
          <div class="col">
            <div class="text-h6">
              Not Authenticated
            </div>
            <div class="text-caption text-grey">
              Please sign in to continue
            </div>
          </div>
          <q-btn
            color="primary"
            @click="handleLogin"
            :loading="loading"
            icon="login"
            label="Sign In"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { computed } from 'vue'

import { useSuperTokensStore } from '../store/supertokens'

const $q = useQuasar()
const authStore = useSuperTokensStore()

// Computed properties
const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentUser = computed(() => authStore.currentUser)
const loading = computed(() => authStore.loading)

// Methods
const handleLogin = async () => {
  try {
    await authStore.login()
  } catch (error) {
    console.error('Login failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to initiate login'
    })
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    $q.notify({
      type: 'positive',
      message: 'Successfully signed out'
    })
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
.auth-status {
  width: 100%;
}

.auth-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
