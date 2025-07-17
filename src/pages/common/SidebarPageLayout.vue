<template>
  <view-common-header @toggle-drawer="drawerOpen = !drawerOpen">
    <q-toolbar-title>
      {{ title }}
    </q-toolbar-title>
  </view-common-header>
  <q-drawer
    show-if-above
    bg-sur-c-low
    :width="drawerWidth"
    :breakpoint="DRAWER_BREAKPOINT"
    side="right"
    v-model="drawerOpen"
    flex
    flex-col
    pt-2
  >
    <slot name="drawer" />
  </q-drawer>
  <q-page-container>
    <q-page
      :style-fn="isMobile ? pageFhStyle : undefined"
      bg-sur-c
      class="relative-position"
      p-8
    >
      <slot name="page" />
      <router-view @toggle-drawer="drawerOpen = !drawerOpen" />
      <div h-8 />
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar"
import { computed, provide, ref } from "vue"

import { pageFhStyle } from "@/shared/utils/functions"

import { DRAWER_BREAKPOINT } from "./consts"

import ViewCommonHeader from "@/layouts/components/ViewCommonHeader.vue"

const props = defineProps<{
  customWidth?: number
  title?: string
}>()

const drawerOpen = ref(true)

const $q = useQuasar()

const extraWidth = ref(Math.max(innerWidth / 2, props.customWidth || 0))

const drawerWidth = computed(() =>
  props.customWidth ? extraWidth.value : 240
)

defineEmits(["toggle-drawer"])
// const drawerOpen = computed({
//   get() {
//     return !userStore.ready ? false : userStore.data.rightSidebarOpen ?? false
//   },
//   set(val) {
//     userStore.data.rightSidebarOpen = val
//   }
// })

const rightDrawerAbove = computed(() => $q.screen.width > DRAWER_BREAKPOINT)
provide("rightDrawerAbove", rightDrawerAbove)

const isMobile = computed(() => $q.screen.width <= DRAWER_BREAKPOINT)

</script>
