<template>
  <q-layout view="Lhh Lpr lff">
    <q-drawer
      v-model="uiStore.mainDrawerOpen"
      show-if-above
      :width="locale.startsWith('zh') ? 250 : 270"
      :breakpoint="1200"
      bg-sur-c
      flex
      flex-col
    >
      <div
        text-xl
        px-4
        pt-4
      >
        <svg
          fill-on-sur-var
          h="24px"
          viewBox="0 0 636 86"
          cursor-pointer
          @click="notifyVersion"
        >
          <use
            xlink:href="/banner.svg#default"
          />
        </svg>
      </div>
      <q-separator spaced />
      <q-item
        px-4
        py-2
        text-sec
      >
        <q-item-section>
          {{ t('mainLayout.workspace', 1) }}
        </q-item-section>
        <q-item-section side>
          <q-btn
            v-if="workspace"
            flat
            dense
            icon="sym_o_home"
            :to="`/workspaces/${workspace.id}`"
            :class="{'route-active': route.path === `/workspaces/${workspace.id}`}"
            :title="$t('workspacePage.workspaceHome')"
          />
        </q-item-section>
        <q-item-section side>
          <add-dialog-item
            v-if="workspace"
            main-layout
            :workspace-id="workspace.id"
          />
        </q-item-section>
      </q-item>
      <workspace-selector />
      <assistant-selector />
      <!-- before -->
      <!-- <workspace-nav mt-2 /> -->
      <!-- end before -->
      <tabs-item />
      <!-- <q-list
        mt-a
        mb-2
      >
        <q-separator
          spaced
        />
        <settings-area />
      </q-list> -->
      <vue-draggable />
    </q-drawer>
    <router-view />
  </q-layout>
</template>

<script setup>
import { useUiStateStore } from 'src/stores/ui-state'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import version from 'src/version.json'
import { useI18n } from 'vue-i18n'
import { useOpenLastWorkspace } from 'src/composables/open-last-workspace'
import { VueDraggable } from 'vue-draggable-plus'
import WorkspaceSelector from './WorkspaceSelector.vue'
import AssistantSelector from './AssistantSelector.vue'
import TabsItem from './TabsItem.vue'
import { useActiveWorkspace } from 'src/composables/workspaces/useActiveWorkspace'
import AddDialogItem from 'src/components/AddDialogItem.vue'
defineOptions({
  name: 'MainLayout'
})

const uiStore = useUiStateStore()
const route = useRoute()
const { workspace } = useActiveWorkspace()

const { openLastWorkspace } = useOpenLastWorkspace()
route.path === '/' && openLastWorkspace()

const { t, locale } = useI18n()
const $q = useQuasar()
function notifyVersion() {
  $q.notify({
    message: `${t('mainLayout.currentVersion')}: ${version.version}`,
    color: 'inv-sur',
    textColor: 'inv-on-sur',
    actions: [{
      label: t('mainLayout.changeLog'),
      handler: () => {
        window.open('https://github.com/NitroRCr/AIaW/releases', '_blank')
      },
      textColor: 'inv-pri'
    }]
  })
}
</script>
