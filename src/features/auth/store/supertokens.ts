import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { useSuperTokens } from '../composables/useSuperTokens'

export const useSuperTokensStore = defineStore('supertokens', () => {
  const {
    checkAuth,
    signOut,
    redirectToLogin,
    getSession,
    getUserId,
    getAccessToken,
    getAccessTokenPayload,
    attemptRefreshingSession
  } = useSuperTokens()

  // State
  const user = ref(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const sessionData = ref(null)

  // Getters
  const isLoggedIn = computed(() => isAuthenticated.value)
  const currentUser = computed(() => user.value)
  const loading = computed(() => isLoading.value)

  // Actions
  const initializeAuth = async () => {
    try {
      isLoading.value = true
      const authenticated = await checkAuth()
      isAuthenticated.value = authenticated

      if (authenticated) {
        const session = await getSession()

        if (session) {
          user.value = session.getUserId()
          sessionData.value = session
        }
      }

      return authenticated
    } catch (error) {
      console.error('Failed to initialize authentication:', error)
      isAuthenticated.value = false

      return false
    } finally {
      isLoading.value = false
    }
  }

  const login = async () => {
    redirectToLogin()
  }

  const logout = async () => {
    try {
      isLoading.value = true
      await signOut()
      user.value = null
      isAuthenticated.value = false
      sessionData.value = null
    } catch (error) {
      console.error('Failed to logout:', error)
    } finally {
      isLoading.value = false
    }
  }

  const refreshSession = async () => {
    try {
      const refreshed = await attemptRefreshingSession()

      if (refreshed) {
        await initializeAuth()
      }

      return refreshed
    } catch (error) {
      console.error('Failed to refresh session:', error)

      return false
    }
  }

  const getSupabaseToken = async () => {
    try {
      const payload = await getAccessTokenPayload()

      return payload.supabase_token || null
    } catch (error) {
      console.error('Failed to get Supabase token:', error)

      return null
    }
  }

  const updateUserData = async () => {
    try {
      const session = await getSession()

      if (session) {
        user.value = session.getUserId()
        sessionData.value = session
      }
    } catch (error) {
      console.error('Failed to update user data:', error)
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    sessionData,

    // Getters
    isLoggedIn,
    currentUser,
    loading,

    // Actions
    initializeAuth,
    login,
    logout,
    refreshSession,
    getSupabaseToken,
    updateUserData,
  }
}, {
  persist: {
    key: 'supertokens-auth',
    storage: localStorage,
    paths: ['isAuthenticated', 'user'],
  }
})
