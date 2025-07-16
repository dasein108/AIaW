<template>
  <div
    flex-col
    items-center
    justify-center
    min-h-25
  >
    <div
      v-if="!text"
      class="flex row items-center justify-end"
    >
      <q-btn
        size="sm"
        color="warning"
        mb-2
        :icon="'sym_o_info'"
        :label="$t('personalBook.help')"
      >
        <q-tooltip>
          <MdPreview
            :model-value="intro"
            v-bind="mdPreviewProps"
          />
        </q-tooltip>
      </q-btn>
    </div>
    <MdPreview
      :model-value="text || intro"
      v-bind="mdPreviewProps"
      bg-sur
    />
  </div>
</template>
<script setup lang="ts">
import { MdPreview } from "md-editor-v3"
import { computed } from "vue"

import { useMdPreviewProps } from "@/shared/composables/mdPreviewProps"

import { PERSONAL_GRAPH_ADVICES } from "./consts"
import { PersonalGraphType } from "./types"

const mdPreviewProps = useMdPreviewProps()

const props = defineProps<{
  text: string,
  graphType: PersonalGraphType
}>()

const intro = computed(() => PERSONAL_GRAPH_ADVICES[props.graphType])
</script>
