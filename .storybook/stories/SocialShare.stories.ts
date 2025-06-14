import type { Meta, StoryObj } from '@storybook/vue3'
import SocialShare from '../components/SocialShare.vue'

const meta = {
  title: 'Social/SocialShare',
  component: SocialShare,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A Vue 3 + Quasar component for sharing content across various social media platforms and other channels. Features a circular share button that opens a popup with multiple sharing options including WhatsApp, Facebook, X (Twitter), Email, Embed code, and Kakao.'
      }
    }
  },
  argTypes: {
    url: {
      control: 'text',
      description: 'The URL to be shared'
    },
    title: {
      control: 'text',
      description: 'The title/subject for the shared content'
    },
    text: {
      control: 'text',
      description: 'The text content to be shared'
    },
    disable: {
      control: 'boolean',
      description: 'Whether to disable the share button'
    },
    onShare: {
      action: 'share',
      description: 'Event emitted when a share option is clicked'
    }
  },
  args: {
    url: 'https://example.com/awesome-content',
    title: 'Check out this amazing content!',
    text: 'I found this incredible piece of content and wanted to share it with you.',
    disable: false
  }
} satisfies Meta<typeof SocialShare>

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default social share component with sample content. Click the share button to see all available sharing options.'
      }
    }
  },
  render: (args) => ({
    components: { SocialShare },
    setup() {
      const onShare = (social: any, url: string) => {
        console.log('Shared via:', social.name, 'URL:', url)
      }

      return { args, onShare }
    },
    template: `
      <div style="padding: 40px; display: flex; justify-content: center; align-items: center;">
        <SocialShare
          v-bind="args"
          @share="onShare"
        />
      </div>
    `
  })
}

// Disabled state
export const Disabled: Story = {
  args: {
    disable: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Social share component in disabled state.'
      }
    }
  },
  render: (args) => ({
    components: { SocialShare },
    setup() {
      const onShare = (social: any, url: string) => {
        console.log('Shared via:', social.name, 'URL:', url)
      }

      return { args, onShare }
    },
    template: `
      <div style="padding: 40px; display: flex; justify-content: center; align-items: center;">
        <SocialShare
          v-bind="args"
          @share="onShare"
        />
      </div>
    `
  })
}
