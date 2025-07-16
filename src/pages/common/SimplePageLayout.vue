<template>
  <view-common-header>
    <q-toolbar-title>
      {{ title }}
    </q-toolbar-title>
  </view-common-header>
  <q-page-container>
    <q-page
      :style-fn="isMobile ? pageFhStyle : undefined"
      bg-sur-c
      class="relative-position"
      p-8
    >
      <slot name="page" />
      <router-view />
      <div h-8 />
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar"
import { computed } from "vue"

import { pageFhStyle } from "@/shared/utils/functions"

import { DRAWER_BREAKPOINT } from "./consts"

import ViewCommonHeader from "@/layouts/components/ViewCommonHeader.vue"

defineProps<{
  title?: string
}>()

const $q = useQuasar()

const isMobile = computed(() => $q.screen.width <= DRAWER_BREAKPOINT)

</script>
