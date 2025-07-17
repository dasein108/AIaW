<template>
  <sidebar-page-layout
    :title="$t('personalBook.title')"
    @toggle-drawer="$emit('toggle-drawer')"
  >
    <template #drawer>
      <icon-side-button
        icon="sym_o_person_book"
        :to="`/personal-book`"
        :title="$t('personalBook.personalGraph')"
      />
      <icon-side-button
        icon="sym_o_data_loss_prevention"
        :to="`/personal-book/search`"
        :title="$t('personalBook.search')"
      />
    </template>
    <template #page>
      <div
        class=" page-width"
      >
        <personal-book />
      </div>
    </template>
  </sidebar-page-layout>
</template>

<script setup lang="ts">
defineEmits(['toggle-drawer'])

import { toRefs } from "vue"
import { useRoute } from "vue-router"

import IconSideButton from "@/shared/components/layout/IconSideButton.vue"
import { useUserStore } from "@/shared/store/user"

import PersonalBook from "@/features/profile/components/PersonalBookBuilder.vue"

import SidebarPageLayout from "./common/SidebarPageLayout.vue"
// const profileStore = useProfileStore()
const route = useRoute()
const {
  currentUser,
} = toRefs(useUserStore())
// const $q = useQuasar()

console.log("---- personal book", route.hash, currentUser.value)

</script>
