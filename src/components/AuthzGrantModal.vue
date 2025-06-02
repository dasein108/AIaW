<template>
  <q-dialog
    v-model="dialogVisible"
    persistent
  >
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center">
        <div class="text-h6">
          Authz Grant Setup
        </div>
        <q-space />
        <q-btn
          icon="sym_o_close"
          flat
          round
          dense
          @click="dialogVisible = false"
        />
      </q-card-section>

      <q-card-section>
        <q-stepper
          v-model="step"
          vertical
          color="primary"
          animated
        >
          <!-- Step 1: Create/Select Grantee Wallet -->
          <q-step
            :name="1"
            title="Grantee Wallet"
            icon="account_balance_wallet"
            :done="step > 1"
          >
            <div v-if="!granteeWallet">
              <p class="text-body2 q-mb-md">
                Create a new grantee wallet that will execute transactions on your behalf.
              </p>
              <q-btn
                color="primary"
                label="Create New Grantee Wallet"
                @click="showPinModal = true"
                :loading="loading"
              />
            </div>
            <div
              v-else
              class="q-gutter-md"
            >
              <q-card
                flat
                bordered
                class="q-pa-md"
              >
                <div class="text-weight-medium q-mb-sm">
                  Grantee Address
                </div>
                <div class="text-caption text-grey-7 q-mb-md word-break-all">
                  {{ granteeWallet.address }}
                </div>
                <q-btn
                  flat
                  color="negative"
                  icon="sym_o_refresh"
                  label="Regenerate Wallet"
                  @click="regenerateWallet"
                  :loading="loading"
                  size="sm"
                />
              </q-card>
              <q-btn
                color="primary"
                label="Continue to Grant Setup"
                @click="step = 2"
              />
            </div>
          </q-step>

          <!-- Step 2: Grant Configuration -->
          <q-step
            :name="2"
            title="Grant Configuration"
            icon="settings"
            :done="step > 2"
          >
            <div class="q-gutter-md">
              <!-- Existing Grants Section -->
              <q-card
                v-if="hasExistingMsgExecGrant || hasExistingMsgSendGrant"
                flat
                bordered
              >
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">
                    <q-icon
                      name="sym_o_check_circle"
                      color="positive"
                      class="q-mr-sm"
                    />
                    Current Authorizations
                  </div>
                  <div class="q-gutter-sm">
                    <div
                      v-if="hasExistingMsgExecGrant"
                      class="row items-center justify-between"
                    >
                      <div class="text-body2">
                        <q-icon
                          name="sym_o_smart_toy"
                          class="q-mr-sm"
                        />
                        MsgExecuteContract (Smart Contract Execution)
                      </div>
                      <q-btn
                        flat
                        color="negative"
                        size="sm"
                        label="Revoke"
                        @click="revokeMsgExecGrant"
                        :loading="revokeLoading.msgExec"
                      />
                    </div>
                    <div
                      v-if="hasExistingMsgSendGrant"
                      class="row items-center justify-between"
                    >
                      <div class="text-body2">
                        <q-icon
                          name="sym_o_send"
                          class="q-mr-sm"
                        />
                        MsgSend (Token Transfers)
                      </div>
                      <q-btn
                        flat
                        color="negative"
                        size="sm"
                        label="Revoke"
                        @click="revokeMsgSendGrant"
                        :loading="revokeLoading.msgSend"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- New Grants Section -->
              <q-card
                flat
                bordered
              >
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">
                    <q-icon
                      name="sym_o_add_circle"
                      color="primary"
                      class="q-mr-sm"
                    />
                    New Authorizations to Grant
                  </div>
                  <div class="q-gutter-sm">
                    <q-checkbox
                      v-if="!hasExistingMsgExecGrant"
                      v-model="grantMsgExecContract"
                      label="MsgExecuteContract (Smart Contract Execution)"
                    />
                    <div
                      v-else
                      class="text-body2 text-grey-6"
                    >
                      <q-icon
                        name="sym_o_info"
                        class="q-mr-sm"
                      />
                      MsgExecuteContract already granted
                    </div>

                    <q-checkbox
                      v-if="!hasExistingMsgSendGrant"
                      v-model="grantMsgSend"
                      label="MsgSend (Token Transfers)"
                    />
                    <div
                      v-else
                      class="text-body2 text-grey-6"
                    >
                      <q-icon
                        name="sym_o_info"
                        class="q-mr-sm"
                      />
                      MsgSend already granted
                    </div>

                    <div
                      v-if="hasExistingMsgExecGrant && hasExistingMsgSendGrant"
                      class="text-body2 text-grey-6"
                    >
                      <q-icon
                        name="sym_o_done_all"
                        class="q-mr-sm"
                      />
                      All permissions already granted. Use revoke buttons above to remove permissions.
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-card
                flat
                bordered
              >
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">
                    Initial Token Transfer
                  </div>
                  <q-input
                    v-model="tokenAmount"
                    type="number"
                    label="Amount to transfer to grantee"
                    suffix="ustake"
                    filled
                    class="q-mb-sm"
                  />
                  <div class="text-caption text-grey-6">
                    The grantee wallet needs tokens to pay for transaction fees.
                  </div>
                </q-card-section>
              </q-card>

              <q-card
                flat
                bordered
              >
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">
                    Gas Settings
                  </div>
                  <q-input
                    v-model="gasAmount"
                    type="number"
                    label="Gas limit"
                    filled
                    class="q-mb-sm"
                  />
                  <q-input
                    v-model="gasPrice"
                    label="Gas price"
                    suffix="ustake"
                    filled
                  />
                </q-card-section>
              </q-card>

              <div class="row q-gutter-md">
                <q-btn
                  color="primary"
                  label="Review & Execute"
                  @click="step = 3"
                  :disable="(!grantMsgExecContract || hasExistingMsgExecGrant) && (!grantMsgSend || hasExistingMsgSendGrant)"
                />
                <q-btn
                  flat
                  label="Back"
                  @click="step = 1"
                />
              </div>
            </div>
          </q-step>

          <!-- Step 3: Review & Execute -->
          <q-step
            :name="3"
            title="Review & Execute"
            icon="sym_o_check_circle"
          >
            <div class="q-gutter-md">
              <q-card
                flat
                bordered
              >
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">
                    Summary
                  </div>
                  <q-list>
                    <q-item>
                      <q-item-section>
                        <q-item-label>Grantee Address</q-item-label>
                        <q-item-label caption>
                          {{ granteeWallet?.address }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label>New Permissions to Grant</q-item-label>
                        <q-item-label caption>
                          <span v-if="grantMsgExecContract && !hasExistingMsgExecGrant">MsgExecuteContract </span>
                          <span v-if="grantMsgSend && !hasExistingMsgSendGrant">MsgSend </span>
                          <span
                            v-if="(!grantMsgExecContract || hasExistingMsgExecGrant) && (!grantMsgSend || hasExistingMsgSendGrant)"
                            class="text-grey-6"
                          >
                            No new permissions to grant
                          </span>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label>Initial Transfer</q-item-label>
                        <q-item-label caption>
                          {{ tokenAmount }} ustake
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label>Gas Settings</q-item-label>
                        <q-item-label caption>
                          Limit: {{ gasAmount }}, Price: {{ gasPrice }}ustake
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>

              <div class="row q-gutter-md">
                <q-btn
                  color="primary"
                  label="Execute Setup"
                  @click="executeSetup"
                  :loading="loading"
                />
                <q-btn
                  flat
                  label="Back"
                  @click="step = 2"
                />
              </div>
            </div>
          </q-step>
        </q-stepper>
      </q-card-section>

      <pin-modal
        v-model="showPinModal"
        @submit="handlePinSubmit"
      />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PinModal from './PinModal.vue'
import { useAuthStore } from '../stores/auth'
import { WalletService, WalletInfo } from 'src/services/authz/wallet-service'
import { useQuasar } from 'quasar'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const $q = useQuasar()
const authStore = useAuthStore()

// Computed for v-model
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// State
const step = ref(1)
const loading = ref(false)
const showPinModal = ref(false)
const granteeWallet = ref<WalletInfo | null>(null)
const revokeLoading = ref({
  msgExec: false,
  msgSend: false
})

// Grant configuration
const grantMsgExecContract = ref(true)
const grantMsgSend = ref(true)
const tokenAmount = ref('1000000') // 1 token in ustake
const gasAmount = ref('200000')
const gasPrice = ref('0.025')

// Computed
const isGranterConnected = computed(() => authStore.isGranterActuallyConnected)
const hasExistingMsgExecGrant = ref(false)
const hasExistingMsgSendGrant = ref(false)

// Load existing wallet info on mount
onMounted(async () => {
  if (authStore.walletInfo) {
    granteeWallet.value = authStore.walletInfo
    step.value = 2

    // Check existing grants status
    if (authStore.granterSigner && granteeWallet.value.address) {
      try {
        const granterAccounts = await authStore.granterSigner.getAccounts()
        if (granterAccounts.length > 0) {
          const granterAddress = granterAccounts[0].address
          const grants = await WalletService.getInstance().checkExistingGrants(granterAddress, granteeWallet.value.address)
          hasExistingMsgExecGrant.value = grants.hasMsgExecGrant
          hasExistingMsgSendGrant.value = grants.hasMsgSendGrant
        }
      } catch (error) {
        console.error('Error checking existing grants:', error)
        // Fallback to auth store values
        hasExistingMsgExecGrant.value = authStore.isGranteeActuallyAuthorized
        hasExistingMsgSendGrant.value = false
      }
    } else {
      // Fallback to auth store values
      hasExistingMsgExecGrant.value = authStore.isGranteeActuallyAuthorized
      hasExistingMsgSendGrant.value = false
    }
  }
})

// Methods
const regenerateWallet = () => {
  granteeWallet.value = null
  step.value = 1
}

const handlePinSubmit = async (pin: string) => {
  loading.value = true
  try {
    const newWalletInfo = await authStore.createGranteeWallet(pin)
    granteeWallet.value = newWalletInfo

    if (newWalletInfo?.address && authStore.granterSigner) {
      // Transfer initial tokens
      await WalletService.getInstance().sendTokensToGrantee(
        authStore.granterSigner,
        newWalletInfo.address,
        'ustake', // amountDenom
        tokenAmount.value // amountValue
      )

      $q.notify({
        message: 'Grantee wallet created successfully!',
        color: 'positive'
      })

      step.value = 2
    } else {
      throw new Error('Failed to create grantee wallet or granter not connected.')
    }
  } catch (error) {
    console.error('Error creating grantee wallet:', error)
    $q.notify({
      message: `Error creating grantee: ${error.message || error}`,
      color: 'negative'
    })
  } finally {
    loading.value = false
    showPinModal.value = false
  }
}

const revokeMsgExecGrant = async () => {
  if (!granteeWallet.value?.address || !authStore.granterSigner) return

  revokeLoading.value.msgExec = true
  try {
    const granterAccounts = await authStore.granterSigner.getAccounts()
    const granterAddress = granterAccounts[0].address

    await authStore.revokeAgentAuthorization(granterAddress, granteeWallet.value.address)
    hasExistingMsgExecGrant.value = false

    $q.notify({
      message: 'MsgExecuteContract authorization revoked successfully!',
      color: 'positive'
    })
  } catch (error) {
    console.error('Error revoking MsgExec grant:', error)
    $q.notify({
      message: `Error revoking grant: ${error.message || error}`,
      color: 'negative'
    })
  } finally {
    revokeLoading.value.msgExec = false
  }
}

const revokeMsgSendGrant = async () => {
  if (!granteeWallet.value?.address || !authStore.granterSigner) return

  revokeLoading.value.msgSend = true
  try {
    const granterAccounts = await authStore.granterSigner.getAccounts()
    const granterAddress = granterAccounts[0].address

    await authStore.revokeAgentAuthorization(granterAddress, granteeWallet.value.address, '/cosmos.bank.v1beta1.MsgSend')
    hasExistingMsgSendGrant.value = false

    $q.notify({
      message: 'MsgSend authorization revoked successfully!',
      color: 'positive'
    })
  } catch (error) {
    console.error('Error revoking MsgSend grant:', error)
    $q.notify({
      message: `Error revoking grant: ${error.message || error}`,
      color: 'negative'
    })
  } finally {
    revokeLoading.value.msgSend = false
  }
}

const executeSetup = async () => {
  if (!granteeWallet.value?.address || !isGranterConnected.value || !authStore.granterSigner) {
    $q.notify({ message: 'Setup incomplete or granter not connected.', color: 'warning' })
    return
  }

  loading.value = true
  try {
    const granterAccounts = await authStore.granterSigner.getAccounts()
    if (granterAccounts.length === 0) {
      throw new Error('Granter account not found')
    }
    const granterAddress = granterAccounts[0].address

    // Grant MsgExecuteContract permission (only if not already granted)
    if (grantMsgExecContract.value && !hasExistingMsgExecGrant.value) {
      await authStore.grantAgentAuthorization(granterAddress, granteeWallet.value.address)
      hasExistingMsgExecGrant.value = true
    }

    // Grant MsgSend permission (only if not already granted)
    if (grantMsgSend.value && !hasExistingMsgSendGrant.value) {
      await authStore.grantMsgSendAuthorization(granterAddress, granteeWallet.value.address)
      hasExistingMsgSendGrant.value = true
    }

    $q.notify({
      message: 'Authz grant setup completed successfully!',
      color: 'positive'
    })

    emit('success')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error executing setup:', error)
    $q.notify({
      message: `Error executing setup: ${error.message || error}`,
      color: 'negative'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.word-break-all {
  word-break: break-all;
  font-family: monospace;
}
</style>
