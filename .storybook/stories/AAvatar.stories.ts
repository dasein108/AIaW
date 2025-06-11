import type { Meta, StoryObj } from '@storybook/vue3'
import AAvatar from '../../src/components/AAvatar.vue'
import { hctToHex } from '../../@/shared/utils/functions'

const meta = {
  title: 'Social/Profile/AAvatar',
  component: AAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    avatar: { control: 'object' }
  }
} satisfies Meta<typeof AAvatar>

export default meta
type Story = StoryObj<typeof meta>;

export const TextAvatar: Story = {
  args: {
    avatar: {
      type: 'text',
      text: 'A',
      hue: 240
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar with text content'
      }
    }
  },
  render: (args) => ({
    components: { AAvatar },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 20px; display: flex; justify-content: center; align-items: center;">
        <AAvatar v-bind="args" />
      </div>
    `
  })
}

export const ImageAvatar: Story = {
  args: {
    avatar: {
      type: 'image',
      imageId: '33', // This assumes an image with this ID exists
      hue: 120
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar with an image'
      }
    }
  },
  render: (args) => ({
    components: { AAvatar },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 20px; display: flex; justify-content: center; align-items: center;">
        <AAvatar v-bind="args" />
      </div>
    `
  })
}

export const IconAvatar: Story = {
  args: {
    avatar: {
      type: 'icon',
      icon: 'person',
      hue: 300
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar with an icon'
      }
    }
  },
  render: (args) => ({
    components: { AAvatar },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 20px; display: flex; justify-content: center; align-items: center;">
        <AAvatar v-bind="args" />
      </div>
    `
  })
}

export const UrlAvatar: Story = {
  args: {
    avatar: {
      type: 'url',
      url: 'https://picsum.photos/200',
      hue: 180
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar with an image from URL'
      }
    }
  },
  render: (args) => ({
    components: { AAvatar },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 20px; display: flex; justify-content: center; align-items: center;">
        <AAvatar v-bind="args" />
      </div>
    `
  })
}

export const SvgAvatar: Story = {
  args: {
    avatar: {
      type: 'svg',
      name: 'github', // Using a valid SVG that exists in public/svg
      hue: 60
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar with an SVG icon'
      }
    }
  },
  render: (args) => ({
    components: { AAvatar },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 20px; display: flex; justify-content: center; align-items: center;">
        <AAvatar v-bind="args" />
      </div>
    `
  })
}

export const NoHueAvatar: Story = {
  args: {
    avatar: {
      type: 'text',
      text: 'NH'
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar without a specified hue value'
      }
    }
  },
  render: (args) => ({
    components: { AAvatar },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 20px; display: flex; justify-content: center; align-items: center;">
        <AAvatar v-bind="args" />
      </div>
    `
  })
}

export const MultipleAvatars: Story = {
  args: {
    avatar: {
      type: 'text',
      text: 'A',
      hue: 0
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple avatars with different types'
      }
    }
  },
  render: () => ({
    components: { AAvatar },
    setup() {
      const avatars = [
        { type: 'text', text: 'A', hue: 0 },
        { type: 'text', text: 'B', hue: 60 },
        { type: 'text', text: 'C', hue: 120 },
        { type: 'text', text: 'D', hue: 180 },
        { type: 'text', text: 'E', hue: 240 },
        { type: 'text', text: 'F', hue: 300 },
        { type: 'icon', icon: 'person', hue: 30 },
        { type: 'url', url: 'https://picsum.photos/200', hue: 210 }
      ]
      return { avatars, hctToHex }
    },
    template: `
      <div style="padding: 20px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; align-items: center;">
        <div v-for="(avatar, index) in avatars" :key="index" style="display: flex; flex-direction: column; align-items: center;">
          <AAvatar :avatar="avatar" />
          <div style="margin-top: 5px; font-size: 12px;" :style="{ color: hctToHex(avatar.hue, 40, 40) }">
            {{ avatar.type }} (hue: {{ avatar.hue }})
          </div>
        </div>
      </div>
    `
  })
}
