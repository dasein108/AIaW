<template>
  <div class="cyberlink-result">
    <div>Cyber transacion:</div>
    <pre v-if="transactionBody && !transactionBody.id">{{ transactionBody }}</pre>
    <div
      class="button-group"
    >
      <button
        @click="handleAccept"
        class="accept-button"
      >
        Accept
      </button>
      <button
        @click="handleDecline"
        class="decline-button"
      >
        Decline
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, inject } from 'vue'
import { KeplerWallet } from '@/services/kepler/KeplerWallet'

import { parseEvents } from '../services/kepler/utils'
import { DialogMessageMapped, MessageContentMapped } from '@/services/supabase/types'
import { useDialogsStore } from 'src/stores/dialogs'

const props = defineProps<{ result: any, message: DialogMessageMapped }>()
const itemMap = inject<ComputedRef>('itemMap')
const wallet = inject<KeplerWallet>('kepler')
const transactionBody = computed(() => JSON.parse(itemMap.value[props.result[0]].contentText))
const dialogsStore = useDialogsStore()
const handleAccept = async () => {
  const { message_contents } = props.message
  const updatedContents = message_contents.filter(content => content.type !== 'assistant-tool')

  try {
    const tx = await wallet.executeTransaction(transactionBody.value)
    const data = parseEvents(tx.events)
    console.log('Transaction executed', tx, data)

    updatedContents.push({
      type: 'assistant-message',
      text: `Transaction completed: ${Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(', ')}`
    })
  } catch (error) {
    console.error('Transaction failed', error)
    updatedContents.push({
      type: 'assistant-message',
      text: `Transaction failed: ${error.message}`
    })
  }
  dialogsStore.updateDialogMessage(props.message.dialog_id, props.message.id, {
    generating_session: null,
    status: 'processed',
    message_contents: updatedContents
  })
}

const handleDecline = async () => {
  dialogsStore.updateDialogMessage(props.message.dialog_id, props.message.id, {
    generating_session: null,
    status: 'processed',
    error: 'Transaction Declined',
    message_contents: props.message.message_contents.map(content => {
      if (content.type === 'assistant-message') {
        return {
          ...content,
          text: '[Transaction Declined]',
          status: 'processed',
          error: 'Transaction Declined'
        }
      }
      return content
    }) as MessageContentMapped[]
  })
}
</script>

<style scoped>
.cyberlink-result {
  padding: 12px;
  margin: 8px 0;
}

.button-group {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.accept-button {
  background-color: #4CAF50;
  color: white;
}

.decline-button {
  background-color: #f44336;
  color: white;
}

.declined-message {
  color: #f44336;
  font-weight: 500;
  margin-top: 12px;
}
</style>
