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
    <q-page
      :style-fn="pageFhStyle"
      v-if="isInitialized"
    >
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
            {{ currentUser?.email }}
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item>
          <q-item-section>
            {{ $t('accountPage.name') }}
          </q-item-section>
          <q-item-section>
            <q-input
              v-model="profile.name"
              filled
              clearable
              autogrow

              placeholder="Name..."
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            {{ $t('accountPage.description') }}
          </q-item-section>
          <q-item-section>
            <q-input
              v-model="profile.description"
              autogrow
              filled
              clearable
              placeholder="Description..."
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="pickAvatar"
        >
          <q-item-section>
            {{ $t('accountPage.avatar') }}
          </q-item-section>
          <q-item-section side>
            <a-avatar :avatar="profile.avatar" />
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
import { computed, ref, toRaw, toRefs } from 'vue'
import { useUiStateStore } from 'src/stores/ui-state'
import { useRouter } from 'vue-router'
import { pageFhStyle } from 'src/utils/functions'
import { useAuth } from 'src/composables/auth/useAuth'
import { useProfileStore } from 'src/stores/profile'
import PickAvatarDialog from 'src/components/PickAvatarDialog.vue'
import { useQuasar } from 'quasar'
import { syncRef } from 'src/composables/sync-ref'
import { ProfileMapped } from '@/services/supabase/types'
import { useUserStore } from 'src/stores/user'
import AAvatar from 'src/components/AAvatar.vue'

// const { profiles, put, isInitialized: profileIsInitialized } = toRefs(useProfileStore())
const profileStore = useProfileStore()
const { currentUser, currentUserId, isInitialized: userIsInitialized } = toRefs(useUserStore())
const router = useRouter()
const loading = ref(false)
const $q = useQuasar()
const currentProfile = computed(() => profileStore.profiles[currentUserId.value])
const isInitialized = computed(() => profileStore.isInitialized && userIsInitialized.value)

const profile = syncRef(
  currentProfile,
  val => { profileStore.put(toRaw(val)) },
  { valueDeep: true }
)
const { signOut } = useAuth(loading, () => {
  router.replace('/')
})

function pickAvatar() {
  $q.dialog({
    component: PickAvatarDialog,
    componentProps: { model: profile!.value.avatar, defaultTab: 'icon' }
  }).onOk(avatar => {
    profile!.value.avatar = avatar
  })
}
console.log('----profile', profile)

const uiStateStore = useUiStateStore()

</script>
