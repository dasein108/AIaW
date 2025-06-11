import type { Meta, StoryObj } from '@storybook/vue3'
import AbortableBtn from '../../src/components/AbortableBtn.vue'

const meta = {
  title: 'Dialog/AbortableBtn',
  component: AbortableBtn,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: { control: 'text' },
    icon: { control: 'text' },
    loading: { control: 'boolean' },
    onClick: { action: 'clicked' },
    onAbort: { action: 'aborted' }
  },
  args: {
    label: 'Send',
    icon: 'sym_o_send',
    loading: false
  }
} satisfies Meta<typeof AbortableBtn>

export default meta
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    loading: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in idle state'
      }
    }
  },
  render: (args) => ({
    components: { AbortableBtn },
    setup() {
      const onClick = () => console.log('Button clicked')
      const onAbort = () => console.log('Operation aborted')

      return { args, onClick, onAbort }
    },
    template: `
      <div style="padding: 20px; display: flex; justify-content: flex-end; align-items: center;">
        <AbortableBtn
          v-bind="args"
          @click="onClick"
          @abort="onAbort"
        />
      </div>
    `
  })
}

export const Loading: Story = {
  args: {
    loading: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in loading state showing the stop text'
      }
    }
  },
  render: (args) => ({
    components: { AbortableBtn },
    setup() {
      const onClick = () => console.log('Button clicked')
      const onAbort = () => console.log('Operation aborted')

      return { args, onClick, onAbort }
    },
    template: `
      <div style="padding: 20px; display: flex; justify-content: flex-end; align-items: center;">
        <AbortableBtn
          v-bind="args"
          @click="onClick"
          @abort="onAbort"
        />
      </div>
    `
  })
}
