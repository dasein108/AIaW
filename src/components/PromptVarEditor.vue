<template>
  <div>
    <prompt-var-item
      v-for="(item, index) in Object.values(model)"
      :key="item.id"
      v-model="model[index]"
      @remove="delete model[item.id]"
      my-3
    />
    <q-btn
      :label="$t('promptVarEditor.addVariable')"
      icon="sym_o_add"
      flat
      w-full
      text-sec
      @click="add"
    />
  </div>
</template>

<script setup lang="ts">
import { genId } from 'src/utils/functions'
import { PromptVar } from 'src/utils/types'
import PromptVarItem from './PromptVarItem.vue'

const model = defineModel<Record<string, PromptVar>>()

function add() {
  const id = genId()
  model.value[id] = {
    id: genId(),
    name: null,
    type: 'text'
  }
}
</script>
