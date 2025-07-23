<template>
  <div>
    <q-input
      v-model="search"
      :placeholder="$t('personalGraph.searchPlaceholder')"
      @keyup.enter="performSearch"
      class="q-mb-md"
    />
  </div>
  <div v-if="inferenceLoading">
    <q-card mb-4>
      <q-card-section>
        <q-skeleton
          type="text"
          class="flex full-width h-40"
        />
      </q-card-section>
    </q-card>
    <q-card>
      <q-card-section>
        <q-skeleton
          type="text"
          mb-1
        />
        <q-skeleton
          type="text"
          mb-1
        />
        <q-skeleton
          type="text"
          mb-1
        />
      </q-card-section>
    </q-card>
  </div>
  <div v-if="answer">
    <q-card mb-4>
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          Answer
        </div>
        <div class="text-subtitle2">
          {{ answer }}
        </div>
      </q-card-section>
    </q-card>
    <q-card>
      <q-card-section class="bg-secondary text-white">
        <div class="text-h6">
          Facts
        </div>
      </q-card-section>
      <q-card-section
        flat
        dense
        v-for="(result, index) in results"
        :key="`result-${index}`"
      >
        {{ ` ${index + 1}. ${result.metadata.summary} (${result.confidence.toFixed(2)})` }}
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

import type { SearchResult } from "@/services/data/types/backend"

import { searchGraph } from "../utils/graph_llm"
const search = ref("")
const answer = ref("")
const inferenceLoading = ref(false)
const results = ref<SearchResult[]>([])
const performSearch = async () => {
  inferenceLoading.value = true
  answer.value = ""
  results.value = []
  console.log("searchGraph", search.value)
  const result = await searchGraph(search.value)
  answer.value = result.answer
  results.value = result.results
  console.log("result", result)
  inferenceLoading.value = false
}
</script>
