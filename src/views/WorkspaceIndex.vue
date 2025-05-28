<template>
  <view-common-header @toggle-drawer="$emit('toggle-drawer')">
    <q-toolbar-title>
      {{ $t('workspaceIndex.title') }}
    </q-toolbar-title>
  </view-common-header>
  <q-page-container bg-sur-c-low>
    <q-page
      bg-sur
    >
      <md-preview
        bg-sur
        rd-lg
        :model-value="contentMd"
        v-bind="mdPreviewProps"
        max-w="1000px"
        m-a
      />
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { computed, Ref, inject, toRaw } from 'vue'
import { syncRef } from 'src/composables/sync-ref'
import { useWorkspacesStore } from 'src/stores/workspaces'
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'
import { MdPreview } from 'md-editor-v3'
import { engine } from 'src/utils/template-engine'
import { useSetTitle } from 'src/composables/set-title'
import { useMdPreviewProps } from 'src/composables/md-preview-props'
import { DefaultWsIndexContent } from 'src/utils/templates'
import { WorkspaceMapped } from '@/services/supabase/types'

defineEmits(['toggle-drawer'])

const store = useWorkspacesStore()

// TODO: ??? sync workspace updates from everywhere to DB
const workspace = syncRef(
  inject('workspace') as Ref<WorkspaceMapped>,
  val => { store.putItem(toRaw(val)) },
  { valueDeep: true }
)

const contentMd = computed(() => engine.parseAndRenderSync(workspace.value.index_content, { workspace: workspace.value || DefaultWsIndexContent }))

useSetTitle(computed(() => workspace.value?.name))

const mdPreviewProps = useMdPreviewProps()
</script>
