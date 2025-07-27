<template>
  <div class="graph-visualization">
    <div
      ref="cyContainer"
      class="cytoscape-container"
    />
  </div>
</template>

<script setup lang="ts">
import cytoscape from 'cytoscape'
import { onMounted, ref, nextTick, watch, onUnmounted } from 'vue'

import type { SearchResult } from '@/services/data/types/backend'

interface Props {
  results: SearchResult[]
  selectedNodeId?: string
}

interface Emits {
  (e: 'nodeClick', nodeId: string, nodeData: any): void
  (e: 'edgeClick', edgeId: string, edgeData: any): void
}

const props = withDefaults(defineProps<Props>(), {
  selectedNodeId: ''
})

const emit = defineEmits<Emits>()

const cyContainer = ref<HTMLElement>()
let cy: cytoscape.Core | null = null

const initCytoscape = () => {
  if (!cyContainer.value) return

  cy = cytoscape({
    container: cyContainer.value,

    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#ff7f50',
          label: 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          color: '#000000',
          'font-size': '10px',
          width: '48px',
          height: '48px',
          'border-width': '0px',
          'border-color': '#ffb79d',
          'text-wrap': 'wrap',
          'text-max-width': '100px'
        }
      },
      {
        selector: 'node.subject',
        style: {
          'background-color': '#ff7f50',
          'border-color': '#ffb79d'
        }
      },
      {
        selector: 'node.object',
        style: {
          'background-color': '#50d0ff',
          'border-color': '#7f50ff'
        }
      },
      {
        selector: 'node.selected',
        style: {
          'border-width': '2px',
          'border-color': '#ffd750'
        }
      },
      {
        selector: 'edge',
        style: {
          width: 2,
          'line-color': '#757575',
          'target-arrow-color': '#757575',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          label: 'data(relationship)',
          'font-size': '10px',
          'text-rotation': 'autorotate',
          'text-margin-y': -10,
          color: '#424242'
        }
      },
      {
        selector: 'edge.selected',
        style: {
          'line-color': '#ff5722',
          'target-arrow-color': '#ff5722',
          width: 4
        }
      }
    ],

    layout: {
      name: 'cose',
      animate: true,
      animationDuration: 1000,
      idealEdgeLength: 100,
      nodeOverlap: 20,
      refresh: 20,
      fit: true,
      padding: 30,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      edgeElasticity: 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    }
  })

  // Add event listeners
  cy.on('tap', 'node', (evt) => {
    const node = evt.target
    const nodeData = node.data()
    console.log('Node clicked:', nodeData)
    emit('nodeClick', nodeData.id, nodeData)
  })

  cy.on('tap', 'edge', (evt) => {
    const edge = evt.target
    const edgeData = edge.data()
    console.log('Edge clicked:', edgeData)
    emit('edgeClick', edgeData.id, edgeData)
  })
}

const updateGraph = () => {
  if (!cy) return

  const nodes = new Set<string>()
  const edges: any[] = []

  // Process search results to create nodes and edges
  props.results.forEach((result, index) => {
    const edgeId = `edge-${index}`

    // Add nodes
    nodes.add(result.subject)
    nodes.add(result.object)

    // Add edge
    edges.push({
      data: {
        id: edgeId,
        source: result.subject,
        target: result.object,
        relationship: result.relationship,
        confidence: result.confidence,
        metadata: result.metadata
      }
    })
  })

  // Convert nodes set to cytoscape format
  const cyNodes = Array.from(nodes).map(nodeId => ({
    data: {
      id: nodeId,
      label: nodeId
    },
    classes: props.results.some(r => r.subject === nodeId) ? 'subject' : 'object'
  }))

  // Clear existing elements
  cy.elements().remove()

  // Add new elements
  cy.add([...cyNodes, ...edges])

  // Update selected state
  if (props.selectedNodeId) {
    cy.nodes().removeClass('selected')
    cy.getElementById(props.selectedNodeId).addClass('selected')
  }

  // Run layout
  cy.layout({
    name: 'cose',
    animate: true,
    animationDuration: 1000,
    fit: true,
    padding: 30
  }).run()
}

onMounted(() => {
  nextTick(() => {
    initCytoscape()
    updateGraph()
  })
})

watch(() => props.results, () => {
  updateGraph()
}, { deep: true })

watch(() => props.selectedNodeId, () => {
  if (cy) {
    cy.nodes().removeClass('selected')

    if (props.selectedNodeId) {
      cy.getElementById(props.selectedNodeId).addClass('selected')
    }
  }
})

onUnmounted(() => {
  if (cy) {
    cy.destroy()
  }
})
</script>

<style scoped>
.graph-visualization {
  width: 100%;
  height: 100%;
  position: relative;
}

.cytoscape-container {
  width: 100%;
  height: 100%;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
</style>
