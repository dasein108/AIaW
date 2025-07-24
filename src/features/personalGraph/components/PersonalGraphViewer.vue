<template>
  <div
    flex-col
    items-center
    justify-center
    min-h-25
  >
    <div
      class="flex row items-center justify-end"
    >
      <q-btn
        size="sm"
        color="warning"
        mb-2
        :icon="'sym_o_info'"
        :label="$t('personalGraph.help')"
        @click="openHelp"
      />
    </div>
    <MdPreview
      :model-value="text || intro"
      v-bind="mdPreviewProps"
      bg-sur
      max-h="400px"
      overflow-y-auto
    />
  </div>
</template>
<script setup lang="ts">
import { MdPreview } from "md-editor-v3"
import { useQuasar } from "quasar"
import { computed } from "vue"

import MarkdownPreviewDialog from "@/shared/components/dialogs/MarkdownPreviewDialog.vue"
import { useMdPreviewProps } from "@/shared/composables/mdPreviewProps"

import { PERSONAL_GRAPH_ADVICES } from "../consts"
import { PersonalGraphType } from "../types"
const mdPreviewProps = useMdPreviewProps()

const props = defineProps<{
  text: string,
  graphType: PersonalGraphType
}>()

const intro = computed(() => PERSONAL_GRAPH_ADVICES[props.graphType])

const $q = useQuasar()

const openHelp = () => {
  $q.dialog({
    component: MarkdownPreviewDialog,
    componentProps: {
      markdown: intro.value,
    },
  })
}
</script>
