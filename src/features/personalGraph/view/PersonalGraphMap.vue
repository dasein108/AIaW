<template>
  <q-page class="personal-graph-map">
    <div class="q-pa-md">
      <!-- Search Bar -->
      <div class="row q-mb-md">
        <div class="col-12">
          <q-input
            v-model="searchQuery"
            outlined
            placeholder="Search graph by node name..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prepend>
              <q-icon name="sym_o_radar" />
            </template>
            <template #append>
              <q-btn
                flat
                round
                dense
                icon="sym_o_search"
                :loading="loading"
                @click="handleSearch(false)"
              />
            </template>
          </q-input>
        </div>
      </div>

      <!-- Graph Visualization -->
      <div class="graph-container">
        <q-card
          flat
          bordered
          class="full-height"
        >
          <q-card-section class="q-pa-none full-height">
            <GraphVisualization
              v-if="searchResults.length > 0"
              :results="searchResults"
              :selected-node-id="selectedNodeId"
              @node-click="handleNodeClick"
              @edge-click="handleEdgeClick"
            />
            <div
              v-else-if="!loading && searchQuery"
              class="flex flex-center full-height text-grey-6"
            >
              <div class="text-center">
                <q-icon
                  name="sym_o_search_off"
                  size="4em"
                  class="q-mb-md"
                />
                <div class="text-h6">
                  No results found
                </div>
                <div class="text-body2">
                  Try searching for a different node name
                </div>
              </div>
            </div>
            <div
              v-else-if="!searchQuery"
              class="flex flex-center full-height text-grey-6"
            >
              <div class="text-center">
                <q-icon
                  name="sym_o_account_tree"
                  size="4em"
                  class="q-mb-md"
                />
                <div class="text-h6">
                  Personal Graph Map
                </div>
                <div class="text-body2">
                  Enter a search term to explore your knowledge graph
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Results Info -->
      <div
        v-if="searchResults.length > 0"
        class="q-mt-md"
      >
        <q-card
          flat
          bordered
        >
          <q-card-section>
            <div class="row items-center q-gutter-md">
              <div class="text-subtitle2">
                Found {{ searchResults.length }} relationships
              </div>
              <q-space />
              <div
                v-if="selectedNodeId"
                class="text-caption text-grey-7"
              >
                Selected: {{ selectedNodeId }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ref, watch } from 'vue'

import GraphVisualization from '@/features/personalGraph/components/GraphVisualization.vue'
import { fetchGraphByNodeName } from '@/features/personalGraph/utils/graph_llm'

import type { SearchResult } from '@/services/data/types/backend'

const searchQuery = ref('')
const loading = ref(false)
const searchResults = ref<SearchResult[]>([])
const selectedNodeId = ref('')
const $q = useQuasar()

const handleSearch = async (append: boolean = false) => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []

    return
  }

  loading.value = true

  try {
    const response = await fetchGraphByNodeName(searchQuery.value.trim())

    // Transform NodeRelationsResponse to SearchResult array
    if (response.relations) {
      if (append) {
        searchResults.value = [...searchResults.value, ...response.relations]
      } else {
        searchResults.value = response.relations
      }
    } else {
      searchResults.value = []
    }

    // Clear selection when new search is performed
    selectedNodeId.value = ''
  } catch (error) {
    console.error('Error searching graph:', error)
    searchResults.value = []

    // Show error notification
    $q.notify({
      type: 'negative',
      message: 'Failed to search graph',
      caption: 'Please try again'
    })
  } finally {
    loading.value = false
  }
}

const handleNodeClick = (nodeId: string, nodeData: any) => {
  console.log('Node clicked in map:', nodeId, nodeData)
  selectedNodeId.value = nodeId

  // Optionally trigger a new search based on clicked node
  searchQuery.value = nodeId
  handleSearch(true)
}

const handleEdgeClick = (edgeId: string, edgeData: any) => {
  console.log('Edge clicked in map:', edgeId, edgeData)

  // Show edge information
  $q.notify({
    type: 'info',
    message: `${edgeData.metadata.summary}`,
    caption: `Confidence: ${Math.round(edgeData.confidence * 100)}%`
  })
}

// Clear results when search query is cleared
watch(searchQuery, (newValue) => {
  if (!newValue) {
    searchResults.value = []
    selectedNodeId.value = ''
  }
})
</script>

<style scoped>
.personal-graph-map {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.graph-container {
  flex: 1;
  min-height: 500px;
  height: calc(100vh - 200px);
}

.full-height {
  height: 100%;
}
</style>
