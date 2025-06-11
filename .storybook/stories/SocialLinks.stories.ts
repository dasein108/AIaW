import type { Meta, StoryObj } from '@storybook/vue3'
import SocialLinks from '../components/SocialLinks.vue'

const meta = {
  title: 'Social/SocialLinks',
  component: SocialLinks,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A Vue 3 + Quasar component for displaying social media links in a transparent dropdown. Features a circular link button that opens a vertical dropdown with colorful social media icons without labels or tooltips. Perfect for showcasing project social links in a clean, minimalist design with consistent color theming.'
      }
    }
  },
  argTypes: {
    links: {
      control: 'object',
      description: 'Object containing social media URLs'
    },
    disable: {
      control: 'boolean',
      description: 'Whether to disable the social links button'
    },
    onLinkClick: {
      action: 'linkClick',
      description: 'Event emitted when a social link is clicked'
    }
  },
  args: {
    links: {
      email: 'mailto:contact@example.com',
      telegram: 'https://t.me/username',
      facebook: 'https://facebook.com/username',
      whatsapp: 'https://wa.me/1234567890',
      twitter: 'https://twitter.com/username',
      github: 'https://github.com/username'
    },
    disable: false
  }
} satisfies Meta<typeof SocialLinks>

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default social links component with all social media platforms. Click the link button to see the transparent dropdown with colorful circular icons.'
      }
    }
  },
  render: (args) => ({
    components: { SocialLinks },
    setup() {
      const onLinkClick = (social: any) => {
        console.log('Link clicked:', social.name, 'URL:', social.url)
      }

      return { args, onLinkClick }
    },
    template: `
      <div style="padding: 60px; display: flex; justify-content: center; align-items: center;">
        <SocialLinks
          v-bind="args"
          @link-click="onLinkClick"
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
        story: 'Social links component in disabled state.'
      }
    }
  },
  render: (args) => ({
    components: { SocialLinks },
    setup() {
      const onLinkClick = (social: any) => {
        console.log('Link clicked:', social.name, 'URL:', social.url)
      }

      return { args, onLinkClick }
    },
    template: `
      <div style="padding: 60px; display: flex; justify-content: center; align-items: center;">
        <SocialLinks
          v-bind="args"
          @link-click="onLinkClick"
        />
      </div>
    `
  })
}
