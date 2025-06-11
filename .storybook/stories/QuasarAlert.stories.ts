import { fn } from '@storybook/test'
import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'
import { QBanner, QBtn, QIcon, QCard, useQuasar } from 'quasar'

const meta = {
  title: 'Modals/Alert Components',
  component: QBanner,
  tags: ['autodocs'],
  argTypes: {
    dense: { control: 'boolean' },
    inlineActions: { control: 'boolean' },
    rounded: { control: 'boolean' }
  },
  args: {
  }
} satisfies Meta<typeof QBanner>

export default meta
type Story = StoryObj<typeof meta>

export const BasicPositiveBanner: Story = {
  render: () => ({
    components: { QBanner, QIcon, QBtn },
    setup() {
      const handleAction = fn()

      return { handleAction }
    },
    template: `
      <QBanner rounded class="bg-positive text-white">
        <template v-slot:avatar>
          <QIcon name="check_circle" color="white" class="q-my-auto" />
        </template>
        Operation completed successfully!
        <template v-slot:action>
          <QBtn flat color="white" label="Dismiss" @click="handleAction" />
        </template>
      </QBanner>
    `
  })
}

export const BasicNegativeBanner: Story = {
  render: () => ({
    components: { QBanner, QIcon, QBtn },
    setup() {
      const handleAction = fn()

      return { handleAction }
    },
    template: `
      <QBanner rounded class="bg-negative text-white">
        <template v-slot:avatar>
          <QIcon name="error" color="white" class="self-center" />
        </template>
        An error occurred while processing your request.
        <template v-slot:action>
          <QBtn flat color="white" label="Retry" @click="handleAction" />
          <QBtn flat color="white" label="Dismiss" @click="handleAction" />
        </template>
      </QBanner>
    `
  })
}

export const BasicWarningBanner: Story = {
  render: () => ({
    components: { QBanner, QIcon, QBtn },
    setup() {
      const handleAction = fn()

      return { handleAction }
    },
    template: `
      <QBanner rounded class="bg-warning text-black">
        <template v-slot:avatar>
          <QIcon name="warning" color="black" class="self-center" />
        </template>
        Please review your input before proceeding.
        <template v-slot:action>
          <QBtn flat color="black" label="Review" @click="handleAction" />
        </template>
      </QBanner>
    `
  })
}

export const BasicInfoBanner: Story = {
  render: () => ({
    components: { QBanner, QIcon, QBtn },
    setup() {
      const handleAction = fn()

      return { handleAction }
    },
    template: `
      <QBanner rounded class="bg-info text-white">
        <template v-slot:avatar>
          <QIcon name="info" color="white" class="self-center" />
        </template>
        Here is some helpful information for you.
        <template v-slot:action>
          <QBtn flat color="white" label="Got it" @click="handleAction" />
        </template>
      </QBanner>
    `
  })
}

// Banner with Custom Icon
export const BannerWithCustomIcon: Story = {
  render: () => ({
    components: { QBanner, QIcon, QBtn },
    setup() {
      const handleAction = fn()

      return { handleAction }
    },
    template: `
      <QBanner rounded class="bg-purple text-white">
        <template v-slot:avatar>
          <QIcon name="star" color="white" class="self-center" />
        </template>
        You have earned a new achievement!
        <template v-slot:action>
          <QBtn flat color="white" label="View" @click="handleAction" />
        </template>
      </QBanner>
    `
  })
}

export const BannerWithAvatar: Story = {
  render: () => ({
    components: { QBanner, QBtn },
    setup() {
      const handleAction = fn()

      return { handleAction }
    },
    template: `
      <QBanner rounded class="bg-grey-3 text-black">
        <template v-slot:avatar>
          <img src="https://cdn.quasar.dev/img/avatar.png" style="width: 40px; height: 40px; border-radius: 50%;" class="self-center" />
        </template>
        John Doe has sent you a message.
        <template v-slot:action>
          <QBtn flat color="primary" label="Reply" @click="handleAction" />
        </template>
      </QBanner>
    `
  })
}

export const DismissibleBanner: Story = {
  render: () => ({
    components: { QBanner, QIcon, QBtn },
    setup() {
      const handleDismiss = fn()

      return { handleDismiss }
    },
    template: `
      <QBanner rounded class="bg-blue text-white">
        <template v-slot:avatar>
          <QIcon name="info" color="white" class="self-center" />
        </template>
        This banner can be dismissed by clicking the X button.
        <template v-slot:action>
          <QBtn flat round color="white" icon="close" @click="handleDismiss" />
        </template>
      </QBanner>
    `
  })
}

export const BannerWithMultipleActions: Story = {
  render: () => ({
    components: { QBanner, QIcon, QBtn },
    setup() {
      const handleExtend = fn()
      const handleLogout = fn()

      return { handleExtend, handleLogout }
    },
    template: `
      <QBanner rounded class="bg-orange text-white">
        <template v-slot:avatar>
          <QIcon name="schedule" color="white" class="self-center" />
        </template>
        Your session will expire in 5 minutes.
        <template v-slot:action>
          <QBtn flat color="white" label="Extend Session" @click="handleExtend" />
          <QBtn flat color="white" label="Logout" @click="handleLogout" />
        </template>
      </QBanner>
    `
  })
}

export const DenseBanner: Story = {
  render: () => ({
    components: { QBanner, QIcon, QBtn },
    setup() {
      const handleAction = fn()

      return { handleAction }
    },
    template: `
      <QBanner rounded dense class="bg-teal text-white">
        <template v-slot:avatar>
          <QIcon name="info" color="white" class="self-center" />
        </template>
        This is a dense banner with reduced padding.
        <template v-slot:action>
          <QBtn flat dense color="white" label="OK" @click="handleAction" />
        </template>
      </QBanner>
    `
  })
}

export const InlineActionsBanner: Story = {
  render: () => ({
    components: { QBanner, QIcon, QBtn },
    setup() {
      const handleAction = fn()

      return { handleAction }
    },
    template: `
      <QBanner rounded inline-actions class="bg-grey-3 text-black">
        <template v-slot:avatar>
          <QIcon name="account_circle" class="self-center" />
        </template>
        Your account has been created successfully!
        <template v-slot:action>
          <QBtn flat color="primary" label="Continue" @click="handleAction" />
        </template>
      </QBanner>
    `
  })
}

export const RoundedBanner: Story = {
  render: () => ({
    components: { QBanner, QIcon, QBtn },
    setup() {
      const handleAction = fn()

      return { handleAction }
    },
    template: `
      <QBanner rounded class="bg-deep-purple text-white q-ma-md">
        <template v-slot:avatar>
          <QIcon name="celebration" color="white" class="self-center" />
        </template>
        This banner has rounded corners for a softer look.
        <template v-slot:action>
          <QBtn flat color="white" label="Celebrate" @click="handleAction" />
        </template>
      </QBanner>
    `
  })
}

export const NotifyPositive: Story = {
  render: () => ({
    components: { QBtn },
    setup() {
      const $q = useQuasar()

      const showNotify = () => {
        $q.notify({
          type: 'positive',
          message: 'Operation completed successfully!',
          position: 'top'
        })
      }

      return { showNotify }
    },
    template: `
      <QBtn color="primary" label="Show Positive Notification" @click="showNotify" />
    `
  })
}

export const NotifyNegative: Story = {
  render: () => ({
    components: { QBtn },
    setup() {
      const $q = useQuasar()

      const showNotify = () => {
        $q.notify({
          type: 'negative',
          message: 'An error occurred while processing your request.',
          position: 'top'
        })
      }

      return { showNotify }
    },
    template: `
      <QBtn color="primary" label="Show Error Notification" @click="showNotify" />
    `
  })
}

export const NotifyWarning: Story = {
  render: () => ({
    components: { QBtn },
    setup() {
      const $q = useQuasar()

      const showNotify = () => {
        $q.notify({
          type: 'warning',
          message: 'Please review your input before proceeding.',
          position: 'top'
        })
      }

      return { showNotify }
    },
    template: `
      <QBtn color="primary" label="Show Warning Notification" @click="showNotify" />
    `
  })
}

export const NotifyInfo: Story = {
  render: () => ({
    components: { QBtn },
    setup() {
      const $q = useQuasar()

      const showNotify = () => {
        $q.notify({
          type: 'info',
          message: 'Here is some helpful information for you.',
          position: 'top'
        })
      }

      return { showNotify }
    },
    template: `
      <QBtn color="primary" label="Show Info Notification" @click="showNotify" />
    `
  })
}

export const NotifyWithActions: Story = {
  render: () => ({
    components: { QBtn },
    setup() {
      const $q = useQuasar()

      const showNotify = () => {
        $q.notify({
          type: 'ongoing',
          message: 'Your session will expire in 5 minutes.',
          position: 'top',
          actions: [
            { label: 'Extend', color: 'white', handler: () => console.log('Extended') },
            { label: 'Logout', color: 'white', handler: () => console.log('Logged out') }
          ]
        })
      }

      return { showNotify }
    },
    template: `
      <QBtn color="primary" label="Show Notification with Actions" @click="showNotify" />
    `
  })
}

export const PersistentNotification: Story = {
  render: () => ({
    components: { QBtn },
    setup() {
      const $q = useQuasar()

      const showPersistent = () => {
        $q.notify({
          type: 'info',
          message: 'This notification will stay until dismissed.',
          position: 'top',
          timeout: 0, // Persistent
          actions: [
            { label: 'Dismiss', color: 'white', handler: () => {} }
          ]
        })
      }

      const showDismissible = () => {
        $q.notify({
          type: 'info',
          message: 'This notification will auto-dismiss in 3 seconds.',
          position: 'top',
          timeout: 3000 // Auto-dismiss
        })
      }

      return { showPersistent, showDismissible }
    },
    template: `
      <div class="q-gutter-md">
        <QBtn color="primary" label="Show Persistent Notification" @click="showPersistent" />
        <QBtn color="secondary" label="Show Auto-Dismiss Notification" @click="showDismissible" />
      </div>
    `
  })
}
export const ComplexBanner: Story = {
  render: () => ({
    components: { QBanner, QIcon, QBtn },
    setup() {
      const handleLearnMore = fn()
      const handleDismiss = fn()

      return { handleLearnMore, handleDismiss }
    },
    template: `
      <QBanner rounded class="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <template v-slot:avatar>
          <QIcon name="new_releases" color="white" size="md" class="self-center" />
        </template>
        <div>
          <div class="text-h6">New Feature Available!</div>
          <div class="q-mt-sm">
            We've added dark mode support to improve your experience.
            <br />
            You can toggle it in the settings menu.
          </div>
        </div>
        <template v-slot:action>
          <QBtn
            flat
            color="white"
            label="Learn More"
            @click="handleLearnMore"
          />
          <QBtn
            flat
            round
            color="white"
            icon="close"
            @click="handleDismiss"
          />
        </template>
      </QBanner>
    `
  })
}
