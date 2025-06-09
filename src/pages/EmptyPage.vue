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
      <div class="row justify-end flex-1">
        <settings-area />
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import SettingsArea from "src/layouts/SettingsArea.vue"
import { useUiStateStore } from "src/stores/ui-state"

const uiStateStore = useUiStateStore()
</script>
