<template>
  <q-header
    bg-sur-c-low
    text-on-sur
  >
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="sym_o_menu"
        @click="uiStateStore.mainDrawerOpen = !uiStateStore.mainDrawerOpen"
      />
      <q-toolbar-title>
        {{ $t('accountPage.accountTitle') }}
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page-container>
    <q-page :style-fn="pageFhStyle">
      <q-list
        pb-2
        max-w="1000px"
        mx-a
      >
        <q-item-label header>
          {{ $t('accountPage.infoHeader') }}
        </q-item-label>
        <q-item>
          <q-item-section>
            {{ $t('accountPage.emailLabel') }}
          </q-item-section>
          <q-item-section side>
            {{ currentUser.email }}
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item
          clickable
          v-ripple
          @click="signOut"
        >
          <q-item-section avatar>
            <q-icon name="sym_o_logout" />
          </q-item-section>
          <q-item-section>
            Sign Out
          </q-item-section>
        </q-item>
      </q-list>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { useUiStateStore } from 'src/stores/ui-state'
import { useRouter } from 'vue-router'
import { pageFhStyle } from 'src/utils/functions'
import { UserProvider } from '@/services/supabase/userProvider'
import { useAuth } from 'src/components/auth/composable/auth'

const { currentUser } = inject<UserProvider>('user')

const router = useRouter()
const loading = ref(false)

const { signOut } = useAuth(loading, () => {
  router.replace('/')
})

const uiStateStore = useUiStateStore()

</script>
