<template>
  <view-common-header @toggle-drawer="$emit('toggle-drawer')">
    <q-toolbar-title>
      {{ $t("workspaceIndex.title") }}
    </q-toolbar-title>
  </view-common-header>
  <q-page-container bg-sur-c-low>
    <q-page bg-sur>
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
import { MdPreview } from "md-editor-v3"
import ViewCommonHeader from "@/layouts/components/ViewCommonHeader.vue"
import { useMdPreviewProps } from "@/shared/composables/mdPreviewProps"
import { useSetTitle } from "@/shared/composables/setTitle"
import { syncRef } from "@/shared/composables/syncRef"
import { useWorkspacesStore } from "@/features/workspaces/store"
import { engine } from "@/features/dialogs/utils/templateEngine"
import { DefaultWsIndexContent } from "@/features/dialogs/utils/templates"
import { computed, Ref, inject, toRaw } from "vue"
import { WorkspaceMapped } from "@/services/supabase/types"

defineEmits(["toggle-drawer"])

const store = useWorkspacesStore()

const workspace = syncRef(
  inject("workspace") as Ref<WorkspaceMapped>,
  (val) => {
    store.putItem(toRaw(val))
  },
  { valueDeep: true }
)

const contentMd = computed(() =>
  engine.parseAndRenderSync(workspace.value.index_content, {
    workspace: workspace.value || DefaultWsIndexContent,
  })
)

useSetTitle(computed(() => workspace.value?.name))

const mdPreviewProps = useMdPreviewProps()
</script>
