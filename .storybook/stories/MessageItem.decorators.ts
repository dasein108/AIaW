import { ref, provide, computed } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAssistantsStore } from '@features/assistants/store'
import { useUserPerfsStore } from '@shared/store/userPerfs'
import { mockAssistants, mockItems, mockUserPerfs, setupGlobalMocks } from '../mocks/MessageItem.mocks'

export const createMessageItemDecorator = (customPerfs?: any) => {
  return (story, context) => ({
    components: { story },
    setup() {
      // Set up global mocks
      setupGlobalMocks()

      // Get existing pinia instance or create new one
      let pinia
      try {
        pinia = createPinia()
        setActivePinia(pinia)
      } catch (e) {
        // Pinia might already be set up globally
        console.log('Using existing Pinia instance')
      }

      // Initialize stores
      const assistantsStore = useAssistantsStore()
      const userPerfsStore = useUserPerfsStore()

      // Set up mock data in stores
      assistantsStore.assistants = mockAssistants
      userPerfsStore.perfs = { ...mockUserPerfs, ...customPerfs } as any

      // Provide required injections
      const itemMapRef = computed(() => {
        const map = {}
        mockItems.forEach(item => { map[item.id] = item })
        return map
      })

      const showArtifactsRef = computed(() => customPerfs?.artifactsEnabled === 'desktop-only')

      provide('itemMap', itemMapRef)
      provide('showArtifacts', showArtifactsRef)
      // Note: Router is provided by vueRouter decorator, not here

      // Create a mock scroll container
      const scrollContainer = ref(document.createElement('div'))

      return { scrollContainer }
    },
    template: `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <story :scroll-container="scrollContainer" />
      </div>
    `
  })
}

export const createCompactMessageItemDecorator = () => {
  return (story, context) => ({
    components: { story },
    setup() {
      // Set up global mocks
      setupGlobalMocks()

      // Get existing pinia instance or create new one
      let pinia
      try {
        pinia = createPinia()
        setActivePinia(pinia)
      } catch (e) {
        // Pinia might already be set up globally
        console.log('Using existing Pinia instance')
      }

      const assistantsStore = useAssistantsStore()
      const userPerfsStore = useUserPerfsStore()

      assistantsStore.assistants = mockAssistants
      userPerfsStore.perfs = mockUserPerfs as any

      const itemMapRef = computed(() => {
        const map = {}
        mockItems.forEach(item => { map[item.id] = item })
        return map
      })

      // Force compact mode by simulating artifacts enabled
      const showArtifactsRef = computed(() => true)

      provide('itemMap', itemMapRef)
      provide('showArtifacts', showArtifactsRef)
      // Note: Router is provided by vueRouter decorator, not here

      const scrollContainer = ref(document.createElement('div'))

      return { scrollContainer }
    },
    template: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <story :scroll-container="scrollContainer" />
      </div>
    `
  })
}

// For backward compatibility
export const createStoryDecorator = createMessageItemDecorator
export const createCompactStoryDecorator = createCompactMessageItemDecorator
