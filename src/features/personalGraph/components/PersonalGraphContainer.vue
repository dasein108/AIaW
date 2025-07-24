<template>
  <div
    v-if="isLoading"
  >
    <!-- <q-linear-progress indeterminate /> -->
    <q-skeleton
      type="rect"
      class="flex full-width h-60"
      mb-4
    />
    <q-skeleton
      type="rect"
      class="flex full-width h-40"
    />
  </div>
  <div v-else>
    <personal-book-view
      :text="graphDataMarkdown"
      :graph-type="graphType"
      pb-4
    />
    <div>
      <div>
        <slot name="actions" />
      </div>
      <personal-book-input-box
        :text="editText"
        :process="process"
        :is-loading="isLoading"
      />
    </div>
  </div>
</template>
<script setup lang="ts">

import { storeToRefs } from "pinia"
import { useQuasar } from "quasar"
import { computed, ref, onMounted } from "vue"

import MarkdownPreviewDialog from "@/shared/components/dialogs/MarkdownPreviewDialog.vue"
import { useUserPerfsStore } from "@/shared/store"

import { useProfileStore } from "@/features/profile/store"
import { useGetModel } from "@/features/providers/composables/useGetModel"

import { PersonalGraphType } from "../types"
import { addItemsToKnowledgeGraph, fetchGraphByNodeName, generateGraphSummary, UserSummaryItem } from "../utils/graph_llm"
import { formatGraphResultToMarkdown } from "../utils/markdown"

import PersonalBookInputBox from "./PersonalGraphInputBox.vue"
import PersonalBookView from "./PersonalGraphViewer.vue"

const { getSdkModel } = useGetModel()
const { data: perfs } = useUserPerfsStore()
const { myProfile } = storeToRefs(useProfileStore())

const $q = useQuasar()

const systemSdkModel = computed(() =>
  getSdkModel(perfs.systemProvider, perfs.systemModel)
)

const props = defineProps<{
  graphType: PersonalGraphType
}>()

const isLoading = ref(false)
const editText = ref("")

const graphDataMarkdown = ref("")

const process = async (brief: string) => {
  isLoading.value = true
  const { name } = myProfile.value
  const result = await generateGraphSummary(systemSdkModel.value, brief)
  const markdown = result.map(item => `- ${item}`).join("\n")
  $q.dialog({
    component: MarkdownPreviewDialog,
    componentProps: {
      title: "Processed graph data",
      markdown,
      customActions: [
        {
          label: "Change",
          icon: "sym_o_edit",
          onClick: async() => {
            editText.value = markdown

            return Promise.resolve()
          },

        },
        {
          label: "Add to graph",
          icon: "sym_o_wallpaper",
          onClick: async () => {
            await buildGraph(result.map(item => `${name}: ${item}`))
          },
        },
      ],
    },
  })
  isLoading.value = false
}

const loadGraph = async () => {
  isLoading.value = true

  const result = await fetchGraphByNodeName(myProfile.value.name, props.graphType) //
  graphDataMarkdown.value = formatGraphResultToMarkdown(result.relations)
  isLoading.value = false
}

const buildGraph = async (graphItems: UserSummaryItem[]) => {
  isLoading.value = true
  $q.loading.show()
  const result = await addItemsToKnowledgeGraph(myProfile.value, props.graphType, graphItems)
  $q.loading.hide()

  if (result.errors.length > 0) {
    $q.notify({
      message: result.errors.join("\n\n"),
      color: "negative"
    })
  } else {
    $q.notify({
      message: "Pushed to knowledge graph",
      color: "positive"
    })
  }

  const markdown = ["# Added to graph", ...result.edge_results?.map(item => `- **${item.action}**: ${item.extracted_info.summary}`)].join("\n")
  $q.dialog({
    component: MarkdownPreviewDialog,
    componentProps: {
      title: "Processed graph data",
      markdown,
    }
  })

  await loadGraph()

  isLoading.value = false
}

onMounted(() => {
  isLoading.value = true
  loadGraph().finally(() => {
    isLoading.value = false
  })
})

</script>
