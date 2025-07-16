<template>
  <simple-page-layout
    :title="$t('personalBook.title')"
    @toggle-drawer="$emit('toggle-drawer')"
  >
    <template #page>
      <div
        class=" page-width"
      >
        <personal-book />
      </div>
    </template>
  </simple-page-layout>
</template>

<script setup lang="ts">
defineEmits(['toggle-drawer'])

import { toRefs } from "vue"
import { useRoute } from "vue-router"

import { useUserStore } from "@/shared/store/user"

import PersonalBook from "@/features/profile/components/PersonalBook.vue"

import SimplePageLayout from "./common/SimplePageLayout.vue"
// const profileStore = useProfileStore()
const route = useRoute()
const {
  currentUser,
} = toRefs(useUserStore())
// const $q = useQuasar()

console.log("---- personal book", route.hash, currentUser.value)

</script>
