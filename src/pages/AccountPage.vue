<template>
  <view-common-header no-drawer>
    <q-toolbar-title>
      {{ $t("accountPage.accountTitle") }}
    </q-toolbar-title>
  </view-common-header>
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
          {{ $t("accountPage.infoHeader") }}
        </q-item-label>
        <q-item>
          <q-item-section>
            {{ $t("accountPage.emailLabel") }}
          </q-item-section>
          <q-item-section side>
            {{ currentUser?.email }}
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item>
          <q-item-section>
            {{ $t("accountPage.name") }}
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
            {{ $t("accountPage.description") }}
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
            {{ $t("accountPage.avatar") }}
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
          <q-item-section> Sign Out </q-item-section>
        </q-item>
      </q-list>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar"
import AAvatar from "@shared/components/avatar/AAvatar.vue"
import PickAvatarDialog from "@shared/components/avatar/PickAvatarDialog.vue"
import ViewCommonHeader from "@/layouts/components/ViewCommonHeader.vue"
import { useAuth } from "@features/auth/composables/useAuth"
import { syncRef } from "@/shared/composables/syncRef"
import { useProfileStore } from "@features/profile/store"
import { useUserStore } from "@/shared/store/user"
import { pageFhStyle } from "@shared/utils/functions"
import { computed, ref, toRaw, toRefs } from "vue"
import { useRouter } from "vue-router"

const profileStore = useProfileStore()
const {
  currentUser,
  currentUserId,
  isInitialized: userIsInitialized,
} = toRefs(useUserStore())
const router = useRouter()
const loading = ref(false)
const $q = useQuasar()
const currentProfile = computed(
  () => profileStore.profiles[currentUserId.value]
)
const isInitialized = computed(
  () => profileStore.isInitialized && userIsInitialized.value
)

const profile = syncRef(
  currentProfile,
  (val) => {
    profileStore.put(toRaw(val))
  },
  { valueDeep: true }
)
const { signOut } = useAuth({
  loading,
  onComplete: () => {
    router.replace("/")
  }
})

function pickAvatar () {
  $q.dialog({
    component: PickAvatarDialog,
    componentProps: { model: profile!.value.avatar, defaultTab: "icon" },
  }).onOk((avatar) => {
    profile!.value.avatar = avatar
  })
}

</script>
