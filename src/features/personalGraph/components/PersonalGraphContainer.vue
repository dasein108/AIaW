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

import { PersonalGraphAddMemoryPrompt, PersonalGraphSummaryPrompt } from "@/features/dialogs/utils/dialogTemplateDefinitions"
import { useProfileStore } from "@/features/profile/store"
import { useGetModel } from "@/features/providers/composables/useGetModel"

import { processPromptRequest } from "@/services/ai/llm/utils"
import { ProfileExtended } from "@/services/data/types/profile"

import { PersonalGraphType } from "../types"
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
  const result = await processPromptRequest(systemSdkModel.value, PersonalGraphSummaryPrompt, { brief, profile: myProfile })
  $q.dialog({
    component: MarkdownPreviewDialog,
    componentProps: {
      title: "Processed graph data",
      markdown: result,
      customActions: [
        {
          label: "Change",
          icon: "sym_o_edit",
          onClick: async() => {
            editText.value = result

            return Promise.resolve()
          },

        },
        {
          label: "Add to graph",
          icon: "sym_o_wallpaper",
          onClick: async () => {
            buildGraph(result).then(async () => {
              await fetchMyGraph()
            })
          },
        },
      ],
    },
  })
  isLoading.value = false
}

const profileToMarkdown = (profile: ProfileExtended): string => {
  if (!profile) return ''

  const lines: string[] = []

  lines.push(`- Name: ${profile.name}`)
  lines.push(`- Age: ${profile.id}`)
  lines.push(`- Description: ${profile.description}`)
  lines.push(`- Email: ${profile.email}`)

  return lines.join('\n')
}

const fetchMyGraph = async () => {
  const tool = tools.value.search_memory_facts // _nodes
  const rawResult = await tool.execute({
    query: "dasein",
    group_ids: [props.graphType],
    max_nodes: 1000
  })
  const result = JSON.parse(rawResult.content[0].text)

  console.log("---result", result)
  console.log("---result2", formatGraphResultToMarkdown(result.facts))
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

const buildGraph = async (brief: string) => {
  isLoading.value = true
  $q.notify({
    message: "💡 Your data is processing. Please wait...",
    color: "positive",
  })
  const profileAsMarkdown = profileToMarkdown(myProfile.value)
  console.log("---buildGraph", brief)
  await processPromptRequest(systemSdkModel.value, PersonalGraphAddMemoryPrompt,
    { brief, profile: profileAsMarkdown, category: props.graphType }, tools.value).then((result) => {
    $q.notify({
      message: result,
      color: "positive",
    })
  })
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
