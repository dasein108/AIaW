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

import { PersonalGraphAddMemoryPrompt, PersonalGraphFetchPrompt, PersonalGraphSummaryPrompt } from "@/features/dialogs/utils/dialogTemplateDefinitions"
import { useProfileStore } from "@/features/profile/store"
import { useGetModel } from "@/features/providers/composables/useGetModel"

import { processPromptRequest } from "@/services/ai/llm/utils"
import { ProfileExtended } from "@/services/data/types/profile"

import PersonalBookInputBox from "./PersonalBookInputBox.vue"
import PersonalBookView from "./PersonalBookView.vue"
import { PersonalGraphType } from "./types"

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
            await buildGraph()
            await fetchMyGraph()
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
  const profileAsMarkdown = profileToMarkdown(myProfile.value)
  const result = await processPromptRequest(systemSdkModel.value, PersonalGraphFetchPrompt,
    { profile: profileAsMarkdown, category: props.graphType }, tools.value)

  graphDataMarkdown.value = result
  isLoading.value = false
}

const buildGraph = async () => {
  isLoading.value = true

  const profileAsMarkdown = profileToMarkdown(myProfile.value)
  await processPromptRequest(systemSdkModel.value, PersonalGraphAddMemoryPrompt,
    { brief: graphDataMarkdown.value, profile: profileAsMarkdown, category: props.graphType }, tools.value).then(() => {
    $q.notify({
      message: "Your data is queued for processing\n\n" +
          "It will be available in your graph in a few minutes",
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
