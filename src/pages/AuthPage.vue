<template>
  <q-page class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="auth-title">
          Welcome to AIaW
        </h1>
        <p class="auth-subtitle">
          Sign in to your account to continue
        </p>
      </div>

      <SuperTokensAuth
        :redirect-to="redirectTo"
        @auth-success="handleAuthSuccess"
        @auth-error="handleAuthError"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import SuperTokensAuth from '@/features/auth/components/SuperTokensAuth.vue'

const route = useRoute()
const $q = useQuasar()

// Get redirect URL from query params or default to home
const redirectTo = ref(route.query.redirect as string || '/')

// Handle successful authentication
const handleAuthSuccess = () => {
  $q.notify({
    type: 'positive',
    message: 'Successfully authenticated!'
  })
}

// Handle authentication error
const handleAuthError = (error: any) => {
  console.error('Authentication error:', error)
  $q.notify({
    type: 'negative',
    message: 'Authentication failed. Please try again.'
  })
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 480px;
  margin: 20px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.auth-subtitle {
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0;
}
</style>
