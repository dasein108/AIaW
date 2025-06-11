import type { Meta, StoryObj } from '@storybook/vue3'
import UserProfileStatus from '../components/UserProfileStatus.vue'

const meta: Meta<typeof UserProfileStatus> = {
  title: 'Social/Profile/UserProfileStatus',
  component: UserProfileStatus,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A Vue3 Quasar component that displays user status similar to Discord/Telegram with colored indicators and optional text labels.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['online', 'away', 'busy', 'offline'],
      description: 'User status type'
    },
    showText: {
      control: { type: 'boolean' },
      description: 'Whether to show status text next to the indicator'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size of the status indicator and text'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    status: 'online',
    showText: true,
    size: 'medium'
  }
}

// Status variations
export const Online: Story = {
  args: {
    status: 'online',
    showText: true,
    size: 'medium'
  }
}

export const Away: Story = {
  args: {
    status: 'away',
    showText: true,
    size: 'medium'
  }
}

export const Busy: Story = {
  args: {
    status: 'busy',
    showText: true,
    size: 'medium'
  }
}

export const Offline: Story = {
  args: {
    status: 'offline',
    showText: true,
    size: 'medium'
  }
}

// Size variations
export const SmallSize: Story = {
  args: {
    status: 'online',
    showText: true,
    size: 'small'
  }
}

export const LargeSize: Story = {
  args: {
    status: 'online',
    showText: true,
    size: 'large'
  }
}

// Dot only (no text)
export const DotOnly: Story = {
  args: {
    status: 'online',
    showText: false,
    size: 'medium'
  }
}

// All statuses in a grid
export const AllStatuses: Story = {
  render: () => ({
    components: { UserProfileStatus },
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; padding: 2rem;">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <h3 style="margin: 0;">With Text</h3>
          <UserProfileStatus status="online" :showText="true" size="medium" />
          <UserProfileStatus status="away" :showText="true" size="medium" />
          <UserProfileStatus status="busy" :showText="true" size="medium" />
          <UserProfileStatus status="offline" :showText="true" size="medium" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <h3 style="margin: 0;">Dot Only</h3>
          <UserProfileStatus status="online" :showText="false" size="medium" />
          <UserProfileStatus status="away" :showText="false" size="medium" />
          <UserProfileStatus status="busy" :showText="false" size="medium" />
          <UserProfileStatus status="offline" :showText="false" size="medium" />
        </div>
      </div>
    `
  })
}

// Size comparison
export const SizeComparison: Story = {
  render: () => ({
    components: { UserProfileStatus },
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem; padding: 2rem;">
        <div>
          <h3 style="margin: 0 0 1rem 0;">Small</h3>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <UserProfileStatus status="online" :showText="true" size="small" />
            <UserProfileStatus status="away" :showText="true" size="small" />
            <UserProfileStatus status="busy" :showText="true" size="small" />
            <UserProfileStatus status="offline" :showText="true" size="small" />
          </div>
        </div>
        <div>
          <h3 style="margin: 0 0 1rem 0;">Medium</h3>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <UserProfileStatus status="online" :showText="true" size="medium" />
            <UserProfileStatus status="away" :showText="true" size="medium" />
            <UserProfileStatus status="busy" :showText="true" size="medium" />
            <UserProfileStatus status="offline" :showText="true" size="medium" />
          </div>
        </div>
        <div>
          <h3 style="margin: 0 0 1rem 0;">Large</h3>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <UserProfileStatus status="online" :showText="true" size="large" />
            <UserProfileStatus status="away" :showText="true" size="large" />
            <UserProfileStatus status="busy" :showText="true" size="large" />
            <UserProfileStatus status="offline" :showText="true" size="large" />
          </div>
        </div>
      </div>
    `
  })
}

// Usage in user profile context
export const InUserProfile: Story = {
  render: () => ({
    components: { UserProfileStatus },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem; max-width: 300px;">
        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
            JD
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 0.25rem;">John Doe</div>
            <UserProfileStatus status="online" :showText="true" size="small" />
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="width: 40px; height: 40px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
            AS
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 0.25rem;">Alice Smith</div>
            <UserProfileStatus status="busy" :showText="true" size="small" />
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="width: 40px; height: 40px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
            BJ
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 0.25rem;">Bob Johnson</div>
            <UserProfileStatus status="away" :showText="true" size="small" />
          </div>
        </div>
      </div>
    `
  })
}
