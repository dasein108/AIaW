<template>
  <q-card class="wallet-component">
    <!-- Loading State -->
    <template v-if="loading">
      <q-card-section class="wallet-header">
        <div class="text-center">
          <q-skeleton
            type="text"
            class="text-subtitle2 q-mb-sm"
          />
          <q-skeleton
            type="text"
            class="text-h2"
          />
          <q-skeleton
            type="text"
            class="text-caption q-mt-sm"
          />
        </div>
      </q-card-section>

      <q-card-section class="action-buttons">
        <div class="row q-gutter-md justify-center">
          <q-skeleton
            type="QBtn"
            width="120px"
            height="48px"
          />
          <q-skeleton
            type="QBtn"
            width="120px"
            height="48px"
          />
        </div>
      </q-card-section>
    </template>

    <!-- Main Wallet Display -->
    <template v-else>
      <!-- Balance Section -->
      <q-card-section class="wallet-header text-center">
        <div class="text-subtitle2 q-mb-sm">
          Your Token Balance
        </div>
        <div class="balance-display q-mb-xs">
          <q-icon
            name="generating_tokens"
            size="32px"
            color="primary"
            class="q-mr-sm"
          />
          <span class="text-h2">
            {{ formatTokenBalance(tokenBalance) }}
          </span>
        </div>
        <div class="text-body2">
          Equivalent to ${{ (tokenBalance * tokenPrice).toFixed(2) }} USD
        </div>
      </q-card-section>

      <!-- Action Buttons -->
      <q-card-section class="action-buttons">
        <div class="row q-gutter-md justify-center">
          <q-btn
            color="primary"
            size="lg"
            icon="download"
            label="Deposit"
            unelevated
            class="action-btn"
            @click="handleDeposit"
          />
          <q-btn
            color="negative"
            size="lg"
            icon="upload"
            label="Withdraw"
            unelevated
            class="action-btn"
            @click="handleWithdraw"
          />
        </div>
      </q-card-section>

      <!-- Additional Info -->
      <q-card-section class="wallet-info">
        <div class="row items-center justify-between">
          <div class="text-body2">
            Token Price: ${{ tokenPrice.toFixed(4) }}
          </div>
          <div class="text-body2">
            Last Updated: {{ lastUpdated }}
          </div>
        </div>
      </q-card-section>
    </template>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props interface
interface Props {
  tokenBalance?: number
  tokenPrice?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tokenBalance: 1250, // Mock token balance
  tokenPrice: 0.0025, // Mock token price in USD
  loading: false
})

// Define emits
const emit = defineEmits(['deposit', 'withdraw'])

// Component data
const tokenBalance = ref(props.tokenBalance)
const tokenPrice = ref(props.tokenPrice)

// Computed properties
const lastUpdated = computed(() => {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Methods
const formatTokenBalance = (balance: number): string => {
  return balance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const handleDeposit = () => {
  console.log('Deposit clicked')
  emit('deposit')
}

const handleWithdraw = () => {
  console.log('Withdraw clicked')
  emit('withdraw')
}
</script>
