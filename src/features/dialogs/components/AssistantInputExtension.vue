<template>
  <div class="assistant-input-extension">
    <!-- Assistant-specific control buttons (only show if not prompt-vars-only mode) -->
    <template v-if="assistant && !promptVarsOnly">
      <q-btn
        v-if="assistant?.promptVars?.length"
        flat
        icon="sym_o_tune"
        :title="showVars ? $t('dialogView.hideVars') : $t('dialogView.showVars')"
        round
        min-w="2.7em"
        min-h="2.7em"
        @click="showVars = !showVars"
        :class="{ 'text-ter': showVars }"
      />

      <model-options-btn
        v-if="sdkModel"
        :provider-name="sdkModel.provider"
        :model-id="sdkModel.modelId"
        :model-value="modelOptions"
        @update:model-value="$emit('update:model-options', $event)"
        flat
        round
        min-w="2.7em"
        min-h="2.7em"
      />

      <add-info-btn
        :plugins="activePlugins"
        :assistant-plugins="assistant?.plugins || {}"
        :dialog-id="dialogId"
        :workspace-id="workspaceId"
        flat
        round
        min-w="2.7em"
        min-h="2.7em"
      />

      <q-btn
        flat
        :round="!activePlugins.length"
        :class="{ 'px-2': activePlugins.length }"
        min-w="2.7em"
        min-h="2.7em"
        icon="sym_o_extension"
        :title="$t('dialogView.plugins')"
      >
        <code
          v-if="activePlugins.length"
          bg-sur-c-high
          px="6px"
        >{{ activePlugins.length }}</code>
        <enable-plugins-menu :assistant-id="assistant.id" />
      </q-btn>
    </template>

    <!-- Usage display (only show if not prompt-vars-only mode) -->
    <div
      v-if="usage && !promptVarsOnly"
      my-2
      ml-2
    >
      <q-icon
        name="sym_o_generating_tokens"
        size="24px"
      />
      <code
        bg-sur-c-high
        px-2
        py-1
      >{{ usage.promptTokens }}+{{ usage.completionTokens }}</code>
      <q-tooltip>
        {{ $t("dialogView.messageTokens") }}<br>
        {{ $t("dialogView.tokenPrompt") }}：{{ usage.promptTokens }}，{{
          $t("dialogView.tokenCompletion")
        }}：{{ usage.completionTokens }}
      </q-tooltip>
    </div>

    <!-- Prompt variables section -->
    <div
      v-if="assistant && showVars && assistant.promptVars?.length"
      class="prompt-vars-section"
      flex
      pb-2
      mt-2
    >
      <prompt-var-input
        class="mt-2 mr-2"
        v-for="promptVar of assistant.promptVars"
        :key="promptVar.id"
        :prompt-var="promptVar"
        :model-value="inputVars[promptVar.name]"
        @update:model-value="$emit('update-input-vars', promptVar.name, $event)"
        :input-props="{
          dense: true,
          outlined: true,
        }"
        component="input"
      />
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'

import AddInfoBtn from '@/features/dialogs/components/AddPlugin/AddInfoBtn.vue'
import EnablePluginsMenu from '@/features/plugins/components/EnablePluginsMenu.vue'
import PromptVarInput from '@/features/prompt/components/PromptVarInput.vue'
import ModelOptionsBtn from '@/features/providers/components/ModelOptionsBtn.vue'

interface Props {
  assistant?: any
  model?: any
  sdkModel?: any
  modelOptions?: any
  activePlugins?: any[]
  usage?: any
  inputVars?: Record<string, any>
  dialogId?: string
  workspaceId?: string
  promptVarsOnly?: boolean
}

withDefaults(defineProps<Props>(), {
  assistant: undefined,
  model: undefined,
  sdkModel: undefined,
  modelOptions: undefined,
  activePlugins: () => [],
  usage: undefined,
  inputVars: () => ({}),
  dialogId: undefined,
  workspaceId: undefined,
  promptVarsOnly: false,
})

defineEmits<{
  'update:model-options': [value: any]
  'update-input-vars': [name: string, value: any]
}>()

const showVars = ref(true)

defineExpose({
  showVars
})
</script>

<style scoped>
.assistant-input-extension {
  display: contents;
}

.prompt-vars-section {
  width: 100%;
}
</style>
