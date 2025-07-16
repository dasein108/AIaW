<template>
  <div
    v-if="isLoading"
  >
    <q-linear-progress indeterminate />
    <q-skeleton
      type="rect"
      class="flex full-width h-50"
    />
  </div>
  <div v-else>
    <personal-book-view
      :text="preparedTextData"
      :graph-type="graphType"
      pb-4
    />
    <div
      v-if="preparedTextData"
      class="flex row justify-center items-center"
    >
      <q-btn
        :label="$t('personalBook.edit')"
        color="secondary"
        :icon="'sym_o_edit'"
        flat
        size="md"
        @click="edit"
        mr-8
      />
      <q-btn
        :label="$t('personalBook.send')"
        color="primary"
        :icon="'sym_o_wallpaper'"
        flat
        size="md"
        @click="buildGraph"
      />
    </div>
    <div v-else>
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
  onComplete?:(text: string) => void
}>()

const isLoading = ref(false)
const editText = ref("")

const preparedTextData = ref("")

const edit = () => {
  editText.value = preparedTextData.value
  preparedTextData.value = ""
}

const process = async (brief: string) => {
  isLoading.value = true
  const result = await processPromptRequest(systemSdkModel.value, PersonalGraphSummaryPrompt, { brief, profile: myProfile })
  preparedTextData.value = result
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

  console.log("---result", result)
  editText.value = result
  preparedTextData.value = ""
  props.onComplete?.(result)
  isLoading.value = false
}

const buildGraph = async () => {
  isLoading.value = true

  const profileAsMarkdown = profileToMarkdown(myProfile.value)
  const text = await processPromptRequest(systemSdkModel.value, PersonalGraphAddMemoryPrompt,
    { brief: preparedTextData.value, profile: profileAsMarkdown, category: props.graphType }, tools)
  editText.value = text
  preparedTextData.value = ""
  $q.dialog({
    component: MarkdownPreviewDialog,
    componentProps: {
      markdown: text,
    },
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
