import type { Meta, StoryObj } from '@storybook/vue3'
import UserProfileBlock from '../components/UserProfileBlock.vue'

const meta: Meta<typeof UserProfileBlock> = {
  title: 'Social/Profile/UserProfileBlock',
  component: UserProfileBlock,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A Vue3 Quasar component that combines avatar, name, and status into a cohesive user profile block similar to Discord/Telegram user profiles.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    user: {
      control: 'object',
      description: 'User object with avatar, name, displayName, status, and subtitle'
    },
    layout: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size of the component'
    },
    clickable: {
      control: { type: 'boolean' },
      description: 'Whether the component is clickable'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Sample users for stories
const sampleUsers = {
  johnDoe: {
    avatar: { type: 'text', text: 'JD', hue: 240 },
    name: 'John Doe',
    displayName: 'John Doe',
    status: 'online',
    subtitle: 'Software Engineer'
  },
  aliceSmith: {
    avatar: { type: 'text', text: 'AS', hue: 300 },
    name: 'Alice Smith',
    displayName: 'Alice',
    status: 'busy',
    subtitle: 'Product Manager'
  },
  bobJohnson: {
    avatar: { type: 'text', text: 'BJ', hue: 120 },
    name: 'Bob Johnson',
    status: 'away',
    subtitle: 'Designer'
  },
  charlieWilson: {
    avatar: { type: 'text', text: 'CW', hue: 60 },
    name: 'Charlie Wilson',
    displayName: 'Charlie',
    status: 'offline'
  },
  avatarUser: {
    avatar: { type: 'icon', icon: 'person', hue: 180 },
    name: 'Demo User',
    displayName: 'Demo User',
    status: 'online',
    subtitle: 'AI Assistant'
  }
} as const

// Default story
export const Default: Story = {
  args: {
    user: sampleUsers.johnDoe,
    layout: 'horizontal',
    size: 'medium',
    clickable: false
  }
}

// Layout variations
export const HorizontalLayout: Story = {
  args: {
    user: sampleUsers.johnDoe,
    layout: 'horizontal',
    size: 'medium',
    clickable: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Horizontal layout with avatar and content side by side'
      }
    }
  }
}

export const VerticalLayout: Story = {
  args: {
    user: sampleUsers.johnDoe,
    layout: 'vertical',
    size: 'medium',
    clickable: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Vertical layout with avatar above content, centered'
      }
    }
  }
}

// Size variations
export const SmallSize: Story = {
  args: {
    user: sampleUsers.johnDoe,
    layout: 'horizontal',
    size: 'small',
    clickable: true
  }
}

export const LargeSize: Story = {
  args: {
    user: sampleUsers.johnDoe,
    layout: 'horizontal',
    size: 'large',
    clickable: true
  }
}

// Status variations
export const OnlineStatus: Story = {
  args: {
    user: { ...sampleUsers.johnDoe, status: 'online' },
    layout: 'horizontal',
    size: 'medium',
    clickable: true
  }
}

export const BusyStatus: Story = {
  args: {
    user: { ...sampleUsers.aliceSmith, status: 'busy' },
    layout: 'horizontal',
    size: 'medium',
    clickable: true
  }
}

export const AwayStatus: Story = {
  args: {
    user: { ...sampleUsers.bobJohnson, status: 'away' },
    layout: 'horizontal',
    size: 'medium',
    clickable: true
  }
}

export const OfflineStatus: Story = {
  args: {
    user: { ...sampleUsers.charlieWilson, status: 'offline' },
    layout: 'horizontal',
    size: 'medium',
    clickable: true
  }
}

// Without status
export const NoStatus: Story = {
  args: {
    user: {
      avatar: { type: 'text', text: 'NU', hue: 200 },
      name: 'No Status User',
      subtitle: 'Regular user'
    },
    layout: 'horizontal',
    size: 'medium',
    clickable: true
  },
  parameters: {
    docs: {
      description: {
        story: 'User profile without status indicator'
      }
    }
  }
}

// Without subtitle
export const NoSubtitle: Story = {
  args: {
    user: {
      avatar: { type: 'text', text: 'NS', hue: 320 },
      name: 'No Subtitle User',
      status: 'online'
    },
    layout: 'horizontal',
    size: 'medium',
    clickable: true
  },
  parameters: {
    docs: {
      description: {
        story: 'User profile without subtitle'
      }
    }
  }
}

// Different avatar types
export const IconAvatar: Story = {
  args: {
    user: sampleUsers.avatarUser,
    layout: 'horizontal',
    size: 'medium',
    clickable: true
  },
  parameters: {
    docs: {
      description: {
        story: 'User profile with icon avatar'
      }
    }
  }
}

export const SvgAvatar: Story = {
  args: {
    user: {
      avatar: { type: 'svg', name: 'openai', hue: 160 },
      name: 'AI Assistant',
      displayName: 'ChatGPT',
      status: 'online',
      subtitle: 'AI Language Model'
    },
    layout: 'horizontal',
    size: 'medium',
    clickable: true
  },
  parameters: {
    docs: {
      description: {
        story: 'User profile with SVG avatar'
      }
    }
  }
}

// Clickable variations
export const Clickable: Story = {
  args: {
    user: sampleUsers.johnDoe,
    layout: 'horizontal',
    size: 'medium',
    clickable: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Clickable user profile with hover effects'
      }
    }
  }
}

export const NonClickable: Story = {
  args: {
    user: sampleUsers.johnDoe,
    layout: 'horizontal',
    size: 'medium',
    clickable: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Non-clickable user profile for display only'
      }
    }
  }
}

// All layout and size combinations
export const AllCombinations: Story = {
  render: () => ({
    components: { UserProfileBlock },
    setup() {
      const user = sampleUsers.johnDoe
      const layouts = ['horizontal', 'vertical'] as const
      const sizes = ['small', 'medium', 'large'] as const

      return { user, layouts, sizes }
    },
    template: `
      <q-page class="q-pa-lg">
        <div class="row q-gutter-lg justify-center">
          <template v-for="layout in layouts" :key="layout">
            <template v-for="size in sizes" :key="size">
              <q-card class="bg-dark column items-center justify-center q-pa-lg" style="min-height: 200px; min-width: 180px;">
                <q-card-section class="text-center q-pb-md">
                  <div class="text-overline text-grey">
                    {{ layout }} - {{ size }}
                  </div>
                </q-card-section>
                <q-card-section class="flex flex-center full-width">
                  <UserProfileBlock
                    :user="user"
                    :layout="layout"
                    :size="size"
                    :clickable="true"
                  />
                </q-card-section>
              </q-card>
            </template>
          </template>
        </div>
      </q-page>
    `
  }),
  parameters: {
    docs: {
      description: {
        story: 'All layout and size combinations in a grid with Quasar theming'
      }
    }
  }
}
