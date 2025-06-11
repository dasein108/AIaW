import type { Meta, StoryObj } from '@storybook/vue3'
import MessageContextMenu from '../components/MessageContextMenu.vue'
import { action } from '@storybook/addon-actions'
import { ref } from 'vue'

const meta = {
  title: 'Dialog/MessageContextMenu',
  component: MessageContextMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A reusable context menu component for message items with options for source code view, editing, quoting, and more info.'
      }
    }
  },
  argTypes: {
    sourceCodeMode: {
      control: 'boolean',
      description: 'Whether source code mode is currently active'
    }
  }
} satisfies Meta<typeof MessageContextMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    sourceCodeMode: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Default message context menu with all options available'
      }
    }
  },
  render: (args) => ({
    components: { MessageContextMenu },
    setup() {
      const sourceCodeMode = ref(args.sourceCodeMode)

      const handleToggleSourceCode = () => {
        sourceCodeMode.value = !sourceCodeMode.value
        action('toggle-source-code')()
      }

      const handleEdit = action('edit')
      const handleQuote = action('quote')
      const handleMoreInfo = action('more-info')

      return {
        args: { ...args, sourceCodeMode },
        handleToggleSourceCode,
        handleEdit,
        handleQuote,
        handleMoreInfo
      }
    },
    template: `
      <div style="padding: 100px; display: flex; justify-content: center; align-items: center;">
        <div style="position: relative;">
          <MessageContextMenu
            :source-code-mode="args.sourceCodeMode"
            @toggle-source-code="handleToggleSourceCode"
            @edit="handleEdit"
            @quote="handleQuote"
            @more-info="handleMoreInfo"
          />
        </div>
      </div>
    `
  })
}
