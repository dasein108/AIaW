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
import { computed, ref, inject, Ref, watchEffect, onMounted } from "vue"

import MarkdownPreviewDialog from "@/shared/components/dialogs/MarkdownPreviewDialog.vue"
import { useUserPerfsStore } from "@/shared/store"

import { useProfileStore } from "@/features/profile/store"
import { useGetModel } from "@/features/providers/composables/useGetModel"

import { PersonalGraphType } from "../types"
import { addGraphItems, generateGraphSummary, graphSummaryToMarkdown, UserSummaryItem } from "../utils/graph_llm"
import { formatGraphResultToMarkdown } from "../utils/markdown"

import PersonalBookInputBox from "./PersonalGraphInputBox.vue"
import PersonalBookView from "./PersonalGraphViewer.vue"

const { getSdkModel } = useGetModel()
const { data: perfs } = useUserPerfsStore()
const { myProfile } = storeToRefs(useProfileStore())

const tools = inject<Ref<any>>('tools')
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
  // const result = await processPromptRequest(systemSdkModel.value, PersonalGraphSummaryPrompt, { brief, profile: myProfile })
  const result = await generateGraphSummary(systemSdkModel.value, brief)
  const markdown = graphSummaryToMarkdown(result)
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
            await buildGraph(result)
          },
        },
      ],
    },
  })
  isLoading.value = false
}

// const profileToMarkdown = (profile: ProfileExtended): string => {
//   if (!profile) return ''

//   const lines: string[] = []

//   lines.push(`- Name: ${profile.name}`)
//   lines.push(`- Age: ${profile.id}`)
//   lines.push(`- Description: ${profile.description}`)
//   lines.push(`- Email: ${profile.email}`)

//   return lines.join('\n')
// }

const fetchMyGraph = async () => {
  const tool = tools.value.search_memory_facts // _nodes
  const rawResult = await tool.execute({
    query: myProfile.value.name,
    // group_ids: [myProfile.value.name],
    max_nodes: 1000,
  })
  const result = JSON.parse(rawResult.content[0].text)

  console.log("---result", result, formatGraphResultToMarkdown(result.facts))
  // if (!tool) {
  //   $q.notify({
  //     message: "💡 No tool found",
  //     color: "negative",
  //   })
  // }
  // const profileAsMarkdown = profileToMarkdown(myProfile.value)
  // const result = await processPromptRequest(systemSdkModel.value, PersonalGraphFetchPrompt,
  //   { profile: profileAsMarkdown, category: props.graphType }, tools.value)

  graphDataMarkdown.value = formatGraphResultToMarkdown(result.facts)
  isLoading.value = false
}

const buildGraph = async (graphItems: UserSummaryItem[]) => {
  isLoading.value = true
  const results = await addGraphItems(tools.value.add_memory, myProfile.value.name, props.graphType, graphItems)
  $q.notify({
    message: results.join("\n\n"),
    color: "positive"
  })
  // const profileAsMarkdown = profileToMarkdown(myProfile.value)
  // console.log("---buildGraph", brief)
  // await processPromptRequest(systemSdkModel.value, PersonalGraphAddMemoryPrompt,
  //   { brief, profile: profileAsMarkdown, category: props.graphType }, tools.value).then((result) => {
  //   $q.notify({
  //     message: result,
  //     color: "positive",
  //   })
  // })
  await fetchMyGraph()

  isLoading.value = false
}

onMounted(() => {
  isLoading.value = true
  watchEffect(() => {
    if (tools.value) {
      fetchMyGraph().finally(() => {
        isLoading.value = false
      })
    }
  })
})

</script>
