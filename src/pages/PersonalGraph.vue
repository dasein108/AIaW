<template>
  <sidebar-page-layout
    :title="$t('personalGraph.title')"
    @toggle-drawer="$emit('toggle-drawer')"
  >
    <template #drawer>
      <icon-side-button
        icon="sym_o_person_book"
        :to="`/social-graph`"
        :title="$t('personalGraph.personalGraph')"
      />
      <icon-side-button
        icon="sym_o_data_loss_prevention"
        :to="`/social-graph/search`"
        :title="$t('personalGraph.search')"
      />
    </template>
  </sidebar-page-layout>
</template>

<script setup lang="ts">
defineEmits(['toggle-drawer'])

import { toRefs } from "vue"
import { useRoute } from "vue-router"

import IconSideButton from "@/shared/components/layout/IconSideButton.vue"
import { useUserStore } from "@/shared/store/user"

import SidebarPageLayout from "./common/SidebarPageLayout.vue"
// const profileStore = useProfileStore()
const route = useRoute()
const {
  currentUser,
} = toRefs(useUserStore())
// const $q = useQuasar()

console.log("---- personal book", route.hash, currentUser.value)

</script>
