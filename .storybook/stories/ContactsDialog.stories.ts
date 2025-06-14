import type { Meta, StoryObj } from '@storybook/vue3'
import ContactsDialog from '../components/ContactsDialog.vue'

const meta: Meta<typeof ContactsDialog> = {
  title: 'Social/ContactsDialog',
  component: ContactsDialog,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A Vue3 Quasar modal dialog component for displaying and managing contacts, similar to Telegram/Discord contact lists.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: { type: 'boolean' },
      description: 'Controls the visibility of the dialog'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    modelValue: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Default contacts dialog with sample users data'
      }
    }
  }
}

// With search functionality
export const WithSearch: Story = {
  render: (args) => ({
    components: { ContactsDialog },
    setup() {
      const handleUserClick = (user: any) => {
        console.log('User clicked:', user)
      }

      const handleAddContact = () => {
        console.log('Add contact clicked')
      }

      return { args, handleUserClick, handleAddContact }
    },
    template: `
      <ContactsDialog
        v-bind="args"
        @user-click="handleUserClick"
        @add-contact="handleAddContact"
      />
    `
  }),
  args: {
    modelValue: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Contacts dialog with search functionality - try searching for user names'
      }
    }
  }
}
