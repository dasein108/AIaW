<template>
  <router-view @toggle-drawer="drawerOpen = !drawerOpen" />
  <q-drawer
    show-if-above
    bg-sur-c-low
    :width="320"
    :breakpoint="drawerBreakpoint"
    side="right"
    v-model="drawerOpen"
  >
    <q-expansion-item
      header-class="text-lg"
      default-opened
    >
      <template #header>
        <q-item-section>
          {{ $t("pluginsPage.installedPlugins") }}
        </q-item-section>
        <q-item-section side>
          <install-plugins-button />
        </q-item-section>
      </template>
      <template #default>
        <installed-plugins />
      </template>
    </q-expansion-item>
  </q-drawer>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar"
import InstalledPlugins from "src/components/InstalledPlugins.vue"
import InstallPluginsButton from "src/components/InstallPluginsButton.vue"
import { computed, provide, ref } from "vue"

const drawerOpen = ref(false)
const drawerBreakpoint = 960
const $q = useQuasar()
const rightDrawerAbove = computed(() => $q.screen.width > drawerBreakpoint)
provide("rightDrawerAbove", rightDrawerAbove)
</script>
