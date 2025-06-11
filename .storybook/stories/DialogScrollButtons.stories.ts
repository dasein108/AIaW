import type { Meta, StoryObj } from '@storybook/vue3'
import { ref, nextTick } from 'vue'
import { fn } from '@storybook/test'
import DialogScrollButtons from '../components/DialogScrollButtons.vue'

const meta = {
  title: 'Dialog/DialogScrollButtons',
  component: DialogScrollButtons,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Scroll buttons component for dialog views with keyboard shortcuts support. Provides quick navigation through message items.'
      }
    }
  },
  argTypes: {
    scrollContainer: {
      control: false,
      description: 'HTML element that serves as the scroll container'
    },
    onSwitchTo: { action: 'switchTo' },
    onRegenerateCurr: { action: 'regenerateCurr' },
    onEditCurr: { action: 'editCurr' },
    onFocusInput: { action: 'focusInput' }
  },
  args: {
    onSwitchTo: fn(),
    onRegenerateCurr: fn(),
    onEditCurr: fn(),
    onFocusInput: fn()
  }
} satisfies Meta<typeof DialogScrollButtons>

export default meta
type Story = StoryObj<typeof meta>

// Mock scroll container with message items
const createMockScrollContainer = () => {
  const container = document.createElement('div')
  container.style.cssText = `
    height: 400px;
    overflow-y: auto;
    border: 1px solid #ccc;
    padding: 16px;
    background: #f5f5f5;
    position: relative;
  `

  // Create mock message items
  for (let i = 0; i < 10; i++) {
    const messageItem = document.createElement('div')
    messageItem.className = 'message-item'
    messageItem.style.cssText = `
      height: 120px;
      margin-bottom: 16px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #333;
    `
    messageItem.textContent = `Message Item ${i + 1}`
    container.appendChild(messageItem)
  }

  return container
}

export const Default: Story = {
  args: {
    scrollContainer: null as any, // Will be set dynamically in render
    onSwitchTo: fn(),
    onRegenerateCurr: fn(),
    onEditCurr: fn(),
    onFocusInput: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Default scroll buttons with a mock scroll container containing message items.'
      }
    }
  },
  render: (args) => ({
    components: { DialogScrollButtons },
    setup() {
      const scrollContainer = ref<HTMLElement | null>(null)
      const containerRef = ref<HTMLElement | null>(null)

      nextTick(() => {
        if (containerRef.value) {
          scrollContainer.value = createMockScrollContainer()
          containerRef.value.appendChild(scrollContainer.value)
        }
      })

      return {
        args,
        scrollContainer,
        containerRef
      }
    },
    template: `
      <div style="padding: 20px; height: 500px; display: flex; flex-direction: column;">
        <p style="margin-bottom: 16px; color: #666;">
          Try the scroll buttons in the bottom-right corner:
          <br>• Top button: Scroll to top
          <br>• Up arrow: Scroll up by one message
          <br>• Down arrow: Scroll down by one message
          <br>• Bottom button: Scroll to bottom
        </p>
        <div style="flex: 1; position: relative;">
          <div ref="containerRef" style="height: 100%;"></div>
        </div>
        <div style="position: relative; padding: 8px; background: #f0f0f0; border-radius: 4px;">
          <DialogScrollButtons
            :scroll-container="scrollContainer"
            @switch-to="args.onSwitchTo"
            @regenerate-curr="args.onRegenerateCurr"
            @edit-curr="args.onEditCurr"
            @focus-input="args.onFocusInput"
          />
          <div style="text-align: center; color: #666; font-size: 14px;">
            Input Area (scroll buttons positioned above this)
          </div>
        </div>
      </div>
    `
  })
}
