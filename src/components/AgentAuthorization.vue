<template>
  <div class="agent-authorization">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">
          Agent Authorization Control
        </div>
      </q-card-section>

      <q-card-section>
        <div v-if="!isConnected">
          <q-tabs
            v-model="walletTab"
            class="text-primary"
          >
            <q-tab
              name="create"
              label="Create New Wallet"
            />
            <q-tab
              name="connect"
              label="Connect Existing Wallet"
            />
          </q-tabs>

          <q-tab-panels
            v-model="walletTab"
            animated
          >
            <q-tab-panel name="create">
              <q-btn
                color="primary"
                label="Create New Wallet"
                @click="createWallet"
                class="q-mb-md"
              />
              <div
                v-if="walletInfo"
                class="q-mt-md"
              >
                <div class="text-subtitle2">
                  Your new wallet:
                </div>
                <div class="text-caption">
                  Address: {{ walletInfo.address }}
                </div>
                <div class="text-caption">
                  Mnemonic: {{ walletInfo.mnemonic }}
                </div>
                <q-btn
                  color="positive"
                  label="Connect Wallet"
                  @click="connectWallet"
                  class="q-mt-md"
                />
              </div>
            </q-tab-panel>

            <q-tab-panel name="connect">
              <q-input
                v-model="mnemonicInput"
                label="Enter Wallet Mnemonic"
                type="textarea"
                class="q-mb-md"
              />
              <q-btn
                color="primary"
                label="Connect Wallet"
                @click="connectExistingWallet"
                :disable="!mnemonicInput"
              />
            </q-tab-panel>
          </q-tab-panels>
        </div>

        <div v-else>
          <q-input
            v-model="agentAddress"
            label="Agent Address"
            class="q-mb-md"
          />
          <q-select
            v-model="selectedMsgType"
            :options="msgTypes"
            label="Authorization Type"
            class="q-mb-md"
          />
          <q-input
            v-model="expirationDate"
            label="Expiration Date"
            type="datetime-local"
            class="q-mb-md"
          />
          <div class="row q-gutter-md">
            <q-btn
              color="primary"
              label="Grant Authorization"
              @click="grantAuthorization"
              :disable="!agentAddress || !selectedMsgType"
            />
            <q-btn
              color="negative"
              label="Revoke Authorization"
              @click="revokeAuthorization"
              :disable="!agentAddress || !selectedMsgType"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'
import { WalletService } from 'src/services/authz/wallet'
import { CosmosWallet } from 'src/services/cosmos/CosmosWallet'

const wallet = inject<CosmosWallet>('cosmos')
const $q = useQuasar()
const authStore = useAuthStore()

const isConnected = computed(() => authStore.isConnected)
const walletInfo = ref<{ address: string; mnemonic: string } | null>(null)
const agentAddress = ref('')
const selectedMsgType = ref('')
const expirationDate = ref('')
const walletTab = ref('create')
const mnemonicInput = ref('')

const msgTypes = [
  '/cosmos.bank.v1beta1.MsgSend',
  '/cosmos.staking.v1beta1.MsgDelegate',
  '/cosmos.staking.v1beta1.MsgUndelegate',
  '/cosmos.staking.v1beta1.MsgWithdrawDelegatorReward',
  '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission'
]

onMounted(async () => {
  if (authStore.walletInfo) {
    walletInfo.value = authStore.walletInfo
    agentAddress.value = authStore.walletInfo.address
  }
})

async function createWallet() {
  try {
    walletInfo.value = await authStore.createWallet()
    agentAddress.value = walletInfo.value.address
  } catch (error) {
    console.error('Error creating wallet', error)
    $q.notify({
      type: 'negative',
      message: 'Error creating wallet'
    })
  }
}

async function connectWallet() {
  if (!walletInfo.value?.mnemonic) return

  try {
    await authStore.connectWithExternalSigner(wallet.getOfflineSigner())
    agentAddress.value = walletInfo.value.address
    $q.notify({
      type: 'positive',
      message: 'Wallet connected successfully'
    })
  } catch (error) {
    console.error('Error connecting wallet', error)
    $q.notify({
      type: 'negative',
      message: 'Error connecting wallet'
    })
  }
}

async function connectExistingWallet() {
  if (!mnemonicInput.value) return

  try {
    await authStore.connectWallet(mnemonicInput.value)
    const walletService = WalletService.getInstance()
    const [account] = await walletService.getAccounts()
    agentAddress.value = account.address
    walletInfo.value = {
      address: account.address,
      mnemonic: mnemonicInput.value
    }
    authStore.$patch({
      walletInfo: walletInfo.value,
      isConnected: true
    })
    $q.notify({
      type: 'positive',
      message: 'Wallet connected successfully'
    })
  } catch (error) {
    console.error('Error connecting wallet', error)
    $q.notify({
      type: 'negative',
      message: 'Error connecting wallet'
    })
  }
}

async function grantAuthorization() {
  if (!agentAddress.value || !selectedMsgType.value) return

  console.log('Attempting to grant authorization:', {
    isConnected: authStore.isConnected,
    walletInfo: authStore.walletInfo,
    agentAddress: agentAddress.value,
    walletAddress: wallet.state.value.address,
    selectedMsgType: selectedMsgType.value
  })

  try {
    const expiration = expirationDate.value
      ? new Date(expirationDate.value)
      : undefined

    await authStore.grantAgentAuthorization(
      wallet.state.value.address,
      agentAddress.value,
      selectedMsgType.value,
      expiration
    )

    $q.notify({
      type: 'positive',
      message: 'Authorization granted successfully'
    })
  } catch (error) {
    console.error('Error granting authorization', error)
    $q.notify({
      type: 'negative',
      message: 'Error granting authorization'
    })
  }
}

async function revokeAuthorization() {
  if (!agentAddress.value || !selectedMsgType.value) return

  console.log('Attempting to revoke authorization:', {
    isConnected: authStore.isConnected,
    walletInfo: authStore.walletInfo,
    agentAddress: agentAddress.value,
    selectedMsgType: selectedMsgType.value
  })

  try {
    await authStore.revokeAgentAuthorization(
      wallet.state.value.address,
      agentAddress.value,
      selectedMsgType.value
    )

    $q.notify({
      type: 'positive',
      message: 'Authorization revoked successfully'
    })
  } catch (error) {
    console.error('Error revoking authorization', error)
    $q.notify({
      type: 'negative',
      message: 'Error revoking authorization'
    })
  }
}
</script>

<style scoped>
.agent-authorization {
  max-width: 600px;
  margin: 0 auto;
}
</style>
