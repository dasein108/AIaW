<template>
  <q-btn
    round
    v-if="myProfile"
    @click="onClick"
  >
    <a-avatar
      :avatar="myProfile.avatar"
      size="md"
    />
  </q-btn>
  <q-btn
    v-else
    icon="sym_o_account_circle"
    @click="onClick"
    :class="{ 'route-active': route.path === '/account' }"
    :label="
      userStore.isLoggedIn ? $t('accountBtn.account') : $t('accountBtn.login')
    "
  />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useQuasar } from "quasar"
import { useRouter, useRoute } from "vue-router"

import AAvatar from "@/shared/components/avatar/AAvatar.vue"
import { useUserStore } from "@/shared/store"

import { useProfileStore } from "@/features/profile/store"

import AuthDialog from "./AuthDialog.vue"

const $q = useQuasar()

const router = useRouter()
const route = useRoute()

const userStore = useUserStore()
const { myProfile } = storeToRefs(useProfileStore())

console.log("isLoggedIn", userStore.isLoggedIn)

function onClick () {
  if (userStore.isLoggedIn) {
    router.push("/account")
  } else {
    $q.dialog({
      component: AuthDialog,
    }).onOk(() => {
      console.log("OOK")
    })
  }
}
</script>

<style scoped></style>
