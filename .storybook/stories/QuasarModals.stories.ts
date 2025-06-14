import { fn } from '@storybook/test'
import type { Meta, StoryObj } from '@storybook/vue3'
import { ref, watch } from 'vue'
import {
  QDialog,
  QCard,
  QCardSection,
  QCardActions,
  QBtn,
  QIcon,
  QInput,
  QSelect,
  QCheckbox,
  QSeparator,
  QAvatar,
  QChip,
  QLinearProgress
} from 'quasar'

// Common render function that handles modal state and events
const createModalRender = (modalConfig: {
  buttonLabel: string
  buttonColor: string
  cardStyle?: string
  cardClass?: string
  content: string
  actions?: string
  showCloseButton?: boolean
}) => {
  return (args: any, { updateArgs }: any) => ({
    components: { QDialog, QCard, QCardSection, QCardActions, QBtn, QIcon, QInput, QSelect, QCheckbox, QSeparator, QAvatar, QChip, QLinearProgress },
    setup() {
      const showModal = ref(args.modelValue || false)
      const onOpen = fn()
      const onClose = fn()
      const onConfirm = fn()
      const onCancel = fn()

      // Sync with Storybook controls
      watch(() => args.modelValue, (newValue) => {
        showModal.value = newValue
      })

      watch(showModal, (newValue) => {
        if (updateArgs) {
          updateArgs({ modelValue: newValue })
        }
      })

      const openModal = () => {
        showModal.value = true
        onOpen()
      }

      const closeModal = () => {
        showModal.value = false
        onClose()
      }

      const confirmAction = () => {
        onConfirm()
        showModal.value = false
      }

      const cancelAction = () => {
        onCancel()
        showModal.value = false
      }

      return {
        showModal,
        openModal,
        closeModal,
        confirmAction,
        cancelAction,
        args
      }
    },
    template: modalConfig.content
  })
}

// Modal size configurations
const MODAL_SIZES = {
  small: 'width: 300px; max-width: 80vw;',
  medium: 'width: 500px; max-width: 80vw;',
  large: 'width: 700px; max-width: 90vw;',
  custom: 'width: 450px; max-width: 80vw;'
}

const meta = {
  title: 'Modals/Modal Components',
  component: QDialog,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'boolean' },
    persistent: { control: 'boolean' },
    noEscDismiss: { control: 'boolean' },
    noBackdropDismiss: { control: 'boolean' },
    seamless: { control: 'boolean' },
    maximized: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    fullHeight: { control: 'boolean' },
    position: {
      control: 'select',
      options: ['standard', 'top', 'right', 'bottom', 'left']
    },
    transitionShow: {
      control: 'select',
      options: ['scale', 'fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'jump-up', 'jump-down', 'jump-left', 'jump-right']
    },
    transitionHide: {
      control: 'select',
      options: ['scale', 'fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'jump-up', 'jump-down', 'jump-left', 'jump-right']
    }
  },
  args: {
    modelValue: false,
    persistent: false,
    noEscDismiss: false,
    noBackdropDismiss: false,
    seamless: false,
    maximized: false,
    fullWidth: false,
    fullHeight: false,
    position: 'standard',
    transitionShow: 'scale',
    transitionHide: 'scale'
  },
  // Decorator for consistent styling and context
  decorators: [
    () => ({
      template: `
        <div style="min-height: 200px; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <story />
          </div>
        </div>
      `
    })
  ]
} satisfies Meta<typeof QDialog>

export default meta
type Story = StoryObj<typeof meta>

// Basic Modal with Different Sizes
export const BasicSmallModal: Story = {
  render: createModalRender({
    buttonLabel: 'Open Small Modal',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Open Small Modal'" @click="openModal" />

        <QDialog
          v-model="showModal"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
          :position="args.position"
          :transition-show="args.transitionShow"
          :transition-hide="args.transitionHide"
        >
          <QCard style="${MODAL_SIZES.small} position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection style="padding-right: 48px;">
              <div class="text-h6">Small Modal</div>
            </QCardSection>

            <QCardSection>
              This is a small modal dialog with basic content.
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Cancel" color="primary" v-close-popup />
              <QBtn label="OK" color="primary" @click="closeModal" />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

export const BasicMediumModal: Story = {
  render: createModalRender({
    buttonLabel: 'Open Medium Modal',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Open Medium Modal'" @click="openModal" />

        <QDialog
          v-model="showModal"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
          :position="args.position"
          :transition-show="args.transitionShow"
          :transition-hide="args.transitionHide"
        >
          <QCard style="${MODAL_SIZES.medium} position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection style="padding-right: 48px;">
              <div class="text-h6">Medium Modal</div>
            </QCardSection>

            <QCardSection>
              <p>This is a medium-sized modal dialog with more content space.</p>
              <p>It can accommodate longer text and multiple paragraphs comfortably.</p>
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Cancel" color="secondary" v-close-popup />
              <QBtn label="Confirm" color="secondary" @click="closeModal" />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

export const BasicLargeModal: Story = {
  render: createModalRender({
    buttonLabel: 'Open Large Modal',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Open Large Modal'" @click="openModal" />

        <QDialog
          v-model="showModal"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
          :position="args.position"
          :transition-show="args.transitionShow"
          :transition-hide="args.transitionHide"
        >
          <QCard style="${MODAL_SIZES.large} position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection style="padding-right: 48px;">
              <div class="text-h6">Large Modal</div>
            </QCardSection>

            <QCardSection>
              <p>This is a large modal dialog that provides ample space for complex content.</p>
              <p>It's perfect for detailed forms, data tables, or rich content that requires more screen real estate.</p>
              <p>The modal automatically adjusts to smaller screens while maintaining readability.</p>
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Cancel" color="accent" v-close-popup />
              <QBtn label="Save" color="accent" @click="closeModal" />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

// Modal with Custom Content and Styling
export const CustomStyledModal: Story = {
  render: createModalRender({
    buttonLabel: 'Open Custom Styled Modal',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Open Custom Styled Modal'" @click="openModal" />

        <QDialog
          v-model="showModal"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
          :position="args.position"
          :transition-show="args.transitionShow"
          :transition-hide="args.transitionHide"
        >
          <QCard class="bg-gradient-to-br from-purple-500 to-pink-500 text-white" style="${MODAL_SIZES.custom} position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              color="white"
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection class="row items-center" style="padding-right: 48px;">
              <QAvatar color="white" text-color="purple" icon="star" />
              <div class="text-h6 q-ml-md">Premium Feature</div>
            </QCardSection>

            <QCardSection>
              <div class="text-subtitle1 q-mb-md">Unlock Advanced Features</div>
              <p>Get access to premium tools and enhanced functionality with our Pro plan.</p>

              <div class="q-mt-md">
                <QChip color="white" text-color="purple" label="Advanced Analytics" icon="analytics" />
                <QChip color="white" text-color="purple" label="Priority Support" icon="support_agent" class="q-ml-sm" />
                <QChip color="white" text-color="purple" label="Custom Integrations" icon="extension" class="q-ml-sm q-mt-sm" />
              </div>
            </QCardSection>

            <QCardActions align="right" class="q-pa-md">
              <QBtn flat label="Maybe Later" color="white" v-close-popup />
              <QBtn label="Upgrade Now" color="white" text-color="purple" @click="closeModal" />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

export const ModalWithImage: Story = {
  render: createModalRender({
    buttonLabel: 'Open Image Modal',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Open Image Modal'" @click="openModal" />

        <QDialog
          v-model="showModal"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
          :position="args.position"
          :transition-show="args.transitionShow"
          :transition-hide="args.transitionHide"
        >
          <QCard style="width: 400px; max-width: 80vw; position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1; background: rgba(255,255,255,0.9);"
            />

            <img src="https://cdn.quasar.dev/img/mountains.jpg" style="width: 100%; height: 200px; object-fit: cover;">

            <QCardSection>
              <div class="text-h6">Beautiful Landscape</div>
              <div class="text-subtitle2 text-grey">Mountain View</div>
            </QCardSection>

            <QCardSection>
              This modal showcases how to include images and media content in your dialogs.
              Perfect for galleries, previews, or media-rich content.
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Close" color="teal" v-close-popup />
              <QBtn label="Download" color="teal" @click="closeModal" icon="download" />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

// Modal with Form Elements
export const FormModal: Story = {
  render: (args, { updateArgs }) => ({
    components: { QDialog, QCard, QCardSection, QCardActions, QBtn, QInput, QSelect, QCheckbox, QSeparator },
    setup() {
      const showModal = ref(args.modelValue || false)
      const formData = ref({
        name: '',
        email: '',
        role: '',
        notifications: false,
        newsletter: true
      })

      const roleOptions = [
        { label: 'Developer', value: 'developer' },
        { label: 'Designer', value: 'designer' },
        { label: 'Manager', value: 'manager' },
        { label: 'Other', value: 'other' }
      ]

      const onOpen = fn()
      const onSubmit = fn()
      const onCancel = fn()

      // Sync with Storybook controls
      watch(() => args.modelValue, (newValue) => {
        showModal.value = newValue
      })

      watch(showModal, (newValue) => {
        if (updateArgs) {
          updateArgs({ modelValue: newValue })
        }
      })

      const openModal = () => {
        showModal.value = true
        onOpen()
      }

      const submitForm = () => {
        onSubmit(formData.value)
        showModal.value = false
      }

      const cancelForm = () => {
        onCancel()
        showModal.value = false
        // Reset form
        formData.value = {
          name: '',
          email: '',
          role: '',
          notifications: false,
          newsletter: true
        }
      }

      return {
        showModal,
        formData,
        roleOptions,
        openModal,
        submitForm,
        cancelForm,
        args
      }
    },
    template: `
      <div>
        <QBtn color="primary" label="Open Form Modal" @click="openModal" />

        <QDialog
          v-model="showModal"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
          :position="args.position"
          :transition-show="args.transitionShow"
          :transition-hide="args.transitionHide"
        >
          <QCard style="${MODAL_SIZES.medium} position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              @click="cancelForm"
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection style="padding-right: 48px;">
              <div class="text-h6">User Registration</div>
            </QCardSection>

            <QCardSection>
              <div class="q-gutter-md">
                <QInput
                  v-model="formData.name"
                  label="Full Name *"
                  outlined
                  :rules="[val => !!val || 'Name is required']"
                />

                <QInput
                  v-model="formData.email"
                  label="Email Address *"
                  type="email"
                  outlined
                  :rules="[
                    val => !!val || 'Email is required',
                    val => /.+@.+\\..+/.test(val) || 'Please enter a valid email'
                  ]"
                />

                <QSelect
                  v-model="formData.role"
                  label="Role"
                  :options="roleOptions"
                  outlined
                  emit-value
                  map-options
                />

                <QSeparator />

                <div class="text-subtitle2">Preferences</div>

                <QCheckbox
                  v-model="formData.notifications"
                  label="Receive push notifications"
                />

                <QCheckbox
                  v-model="formData.newsletter"
                  label="Subscribe to newsletter"
                />
              </div>
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Cancel" color="grey" @click="cancelForm" />
              <QBtn
                label="Register"
                color="green"
                @click="submitForm"
                :disable="!formData.name || !formData.email"
              />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

export const LoginFormModal: Story = {
  render: (args, { updateArgs }) => ({
    components: { QDialog, QCard, QCardSection, QCardActions, QBtn, QInput, QCheckbox, QIcon },
    setup() {
      const showModal = ref(args.modelValue || false)
      const loginData = ref({
        username: '',
        password: '',
        rememberMe: false
      })
      const showPassword = ref(false)

      const onOpen = fn()
      const onLogin = fn()
      const onForgotPassword = fn()

      // Sync with Storybook controls
      watch(() => args.modelValue, (newValue) => {
        showModal.value = newValue
      })

      watch(showModal, (newValue) => {
        if (updateArgs) {
          updateArgs({ modelValue: newValue })
        }
      })

      const openModal = () => {
        showModal.value = true
        onOpen()
      }

      const login = () => {
        onLogin(loginData.value)
        showModal.value = false
      }

      const forgotPassword = () => {
        onForgotPassword()
      }

      return {
        showModal,
        loginData,
        showPassword,
        openModal,
        login,
        forgotPassword,
        args
      }
    },
    template: `
      <div>
        <QBtn color="primary" label="Open Login Modal" @click="openModal" />

        <QDialog
          v-model="showModal"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
          :position="args.position"
          :transition-show="args.transitionShow"
          :transition-hide="args.transitionHide"
        >
          <QCard style="width: 400px; max-width: 80vw; position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection class="text-center q-pt-lg">
              <QIcon name="account_circle" size="64px" color="blue" />
              <div class="text-h5 q-mt-md">Welcome Back</div>
              <div class="text-grey">Please sign in to your account</div>
            </QCardSection>

            <QCardSection>
              <div class="q-gutter-md">
                <QInput
                  v-model="loginData.username"
                  label="Username or Email"
                  outlined
                  :rules="[val => !!val || 'Username is required']"
                />

                <QInput
                  v-model="loginData.password"
                  :label="'Password'"
                  :type="showPassword ? 'text' : 'password'"
                  outlined
                  :rules="[val => !!val || 'Password is required']"
                >
                  <template v-slot:append>
                    <QIcon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </QInput>

                <QCheckbox
                  v-model="loginData.rememberMe"
                  label="Remember me"
                />
              </div>
            </QCardSection>

            <QCardActions align="right" class="q-px-lg q-pb-lg">
              <QBtn
                flat
                label="Forgot Password?"
                color="blue"
                @click="forgotPassword"
                class="q-mr-auto"
              />
              <QBtn flat label="Cancel" color="grey" v-close-popup />
              <QBtn
                label="Sign In"
                color="blue"
                @click="login"
                :disable="!loginData.username || !loginData.password"
              />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

// Confirmation Dialogs
export const SimpleConfirmationDialog: Story = {
  render: createModalRender({
    buttonLabel: 'Delete Item',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Delete Item'" @click="openModal" />

        <QDialog
          v-model="showModal"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
          :position="args.position"
          :transition-show="args.transitionShow"
          :transition-hide="args.transitionHide"
        >
          <QCard style="width: 350px; position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              @click="cancelAction"
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection class="row items-center" style="padding-right: 48px;">
              <QIcon name="warning" color="orange" size="32px" />
              <div class="text-h6 q-ml-md">Confirm Deletion</div>
            </QCardSection>

            <QCardSection>
              Are you sure you want to delete this item? This action cannot be undone.
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Cancel" color="grey" @click="cancelAction" />
              <QBtn label="Delete" color="negative" @click="confirmAction" />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

export const DestructiveConfirmationDialog: Story = {
  render: createModalRender({
    buttonLabel: 'Permanently Delete Account',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Permanently Delete Account'" @click="openModal" />

        <QDialog
          v-model="showModal"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
          :position="args.position"
          :transition-show="args.transitionShow"
          :transition-hide="args.transitionHide"
        >
          <QCard style="width: 400px; max-width: 80vw; position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              @click="cancelAction"
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection class="row items-center" style="padding-right: 48px;">
              <QIcon name="delete_forever" color="red" size="40px" />
              <div class="text-h6 q-ml-md">Danger Zone</div>
            </QCardSection>

            <QCardSection>
              <div class="text-weight-bold text-red q-mb-md">This action cannot be undone!</div>
              <p>Deleting your account will:</p>
              <ul>
                <li>Permanently remove all your data</li>
                <li>Cancel all active subscriptions</li>
                <li>Revoke access to all services</li>
                <li>Delete all associated files and projects</li>
              </ul>
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Keep Account" color="grey" @click="cancelAction" />
              <QBtn
                label="I understand, delete my account"
                color="red"
                @click="confirmAction"
                class="text-weight-bold"
              />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

// Modal with Different Positions and Animations
export const TopPositionModal: Story = {
  render: createModalRender({
    buttonLabel: 'Open Top Modal',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Open Top Modal'" @click="openModal" />

        <QDialog
          v-model="showModal"
          position="top"
          transition-show="slide-down"
          transition-hide="slide-up"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
        >
          <QCard style="width: 400px; position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection style="padding-right: 48px;">
              <div class="text-h6">Top Position Modal</div>
            </QCardSection>

            <QCardSection>
              This modal appears at the top of the screen with a slide-down animation.
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Close" color="indigo" v-close-popup />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

export const BottomPositionModal: Story = {
  render: createModalRender({
    buttonLabel: 'Open Bottom Modal',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Open Bottom Modal'" @click="openModal" />

        <QDialog
          v-model="showModal"
          position="bottom"
          transition-show="slide-up"
          transition-hide="slide-down"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
        >
          <QCard style="width: 400px; position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection style="padding-right: 48px;">
              <div class="text-h6">Bottom Position Modal</div>
            </QCardSection>

            <QCardSection>
              This modal appears at the bottom of the screen with a slide-up animation.
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Close" color="pink" v-close-popup />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

export const LeftPositionModal: Story = {
  render: createModalRender({
    buttonLabel: 'Open Left Modal',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Open Left Modal'" @click="openModal" />

        <QDialog
          v-model="showModal"
          position="left"
          transition-show="slide-right"
          transition-hide="slide-left"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
        >
          <QCard style="width: 300px; height: 400px; position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection style="padding-right: 48px;">
              <div class="text-h6">Left Position Modal</div>
            </QCardSection>

            <QCardSection>
              This modal appears on the left side of the screen with a slide-right animation.
              Perfect for sidebars or navigation panels.
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Close" color="cyan" v-close-popup />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

export const RightPositionModal: Story = {
  render: createModalRender({
    buttonLabel: 'Open Right Modal',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Open Right Modal'" @click="openModal" />

        <QDialog
          v-model="showModal"
          position="right"
          transition-show="slide-left"
          transition-hide="slide-right"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
        >
          <QCard style="width: 300px; height: 400px; position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection style="padding-right: 48px;">
              <div class="text-h6">Right Position Modal</div>
            </QCardSection>

            <QCardSection>
              This modal appears on the right side of the screen with a slide-left animation.
              Great for settings panels or additional information.
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Close" color="deep-orange" v-close-popup />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

export const FadeAnimationModal: Story = {
  render: createModalRender({
    buttonLabel: 'Open Fade Modal',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Open Fade Modal'" @click="openModal" />

        <QDialog
          v-model="showModal"
          transition-show="fade"
          transition-hide="fade"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
        >
          <QCard style="width: 400px; position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection style="padding-right: 48px;">
              <div class="text-h6">Fade Animation Modal</div>
            </QCardSection>

            <QCardSection>
              This modal uses a fade animation for a smooth, subtle appearance.
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Close" color="brown" v-close-popup />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

// Persistent vs Dismissible Modals
export const PersistentModal: Story = {
  render: (args, { updateArgs }) => ({
    components: { QDialog, QCard, QCardSection, QCardActions, QBtn, QLinearProgress },
    setup() {
      const showModal = ref(args.modelValue || false)
      const progress = ref(0)
      const onOpen = fn()
      const onComplete = fn()

      // Sync with Storybook controls
      watch(() => args.modelValue, (newValue) => {
        showModal.value = newValue
      })

      watch(showModal, (newValue) => {
        if (updateArgs) {
          updateArgs({ modelValue: newValue })
        }
      })

      const openModal = () => {
        showModal.value = true
        progress.value = 0
        onOpen()

        // Simulate a process
        const interval = setInterval(() => {
          progress.value += 10
          if (progress.value >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              showModal.value = false
              onComplete()
            }, 500)
          }
        }, 300)
      }

      return { showModal, progress, openModal, args }
    },
    template: `
      <div>
        <QBtn color="primary" label="Start Process (Persistent)" @click="openModal" />

        <QDialog
          v-model="showModal"
          persistent
          no-esc-dismiss
          no-backdrop-dismiss
        >
          <QCard style="width: 400px;">
            <QCardSection>
              <div class="text-h6">Processing...</div>
            </QCardSection>

            <QCardSection>
              <p>Please wait while we process your request. This modal cannot be dismissed until the process is complete.</p>

              <QLinearProgress
                :value="progress / 100"
                color="red"
                class="q-mt-md"
                size="8px"
              />

              <div class="text-center q-mt-sm">{{ progress }}% Complete</div>
            </QCardSection>

            <QCardActions align="center">
              <div class="text-grey">This process cannot be cancelled</div>
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

export const DismissibleModal: Story = {
  render: createModalRender({
    buttonLabel: 'Open Dismissible Modal',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Open Dismissible Modal'" @click="openModal" />

        <QDialog
          v-model="showModal"
          @hide="() => {}"
        >
          <QCard style="width: 400px; position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection style="padding-right: 48px;">
              <div class="text-h6">Dismissible Modal</div>
            </QCardSection>

            <QCardSection>
              <p>This modal can be dismissed in multiple ways:</p>
              <ul>
                <li>Click the X button</li>
                <li>Press the Escape key</li>
                <li>Click outside the modal (backdrop)</li>
                <li>Use the Close button</li>
              </ul>
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Close" color="green" v-close-popup />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}

export const MaximizedModal: Story = {
  render: createModalRender({
    buttonLabel: 'Open Maximized Modal',
    buttonColor: 'primary',
    content: `
      <div>
        <QBtn color="primary" :label="'Open Maximized Modal'" @click="openModal" />

        <QDialog
          v-model="showModal"
          maximized
          transition-show="slide-up"
          transition-hide="slide-down"
          :persistent="args.persistent"
          :no-esc-dismiss="args.noEscDismiss"
          :no-backdrop-dismiss="args.noBackdropDismiss"
        >
          <QCard class="column full-height" style="position: relative;">
            <QBtn
              icon="close"
              flat
              round
              dense
              color="white"
              v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 1;"
            />

            <QCardSection class="bg-purple text-white" style="padding-right: 48px;">
              <div class="text-h6">Maximized Modal</div>
            </QCardSection>

            <QCardSection class="col q-pa-lg">
              <div class="text-h4 q-mb-md">Full Screen Experience</div>
              <p>This modal takes up the entire screen, perfect for complex interfaces or detailed content.</p>
              <p>It's ideal for:</p>
              <ul>
                <li>Complex forms with multiple sections</li>
                <li>Data tables with many columns</li>
                <li>Rich text editors</li>
                <li>Image or video viewers</li>
                <li>Dashboard-like interfaces</li>
              </ul>

              <div class="q-mt-xl">
                <div class="text-h6">Sample Content Area</div>
                <p>You have plenty of space to work with in a maximized modal. This makes it perfect for applications that need to display complex data or provide rich editing capabilities.</p>
              </div>
            </QCardSection>

            <QCardActions align="right" class="q-pa-lg">
              <QBtn flat label="Cancel" color="grey" v-close-popup />
              <QBtn label="Save Changes" color="purple" v-close-popup />
            </QCardActions>
          </QCard>
        </QDialog>
      </div>
    `
  })
}
