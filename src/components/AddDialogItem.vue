<template>
  <q-btn
    v-if="mainLayout"
    icon="sym_o_rate_review"
    dense
    color="primary"
    @click="onAdd"
  >
    <q-tooltip>
      Create AI chat
    </q-tooltip>
  </q-btn>
  <q-item
    v-else
    clickable
    @click="onAdd"
    text-sec
    item-rd
    fit
    class="full-width"
  >
    <q-item-section
      avatar
      min-w-0
    >
      <q-icon
        name="sym_o_rate_review"
      />
    </q-item-section>
    <q-item-section>
      {{ $t('dialogList.createDialog') }}
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { isPlatformEnabled } from 'src/utils/functions'
import { dialogOptions } from 'src/utils/values'
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCreateDialog } from 'src/composables/create-dialog'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useListenKey } from 'src/composables/listen-key'
import { storeToRefs } from 'pinia'
import { useUserDataStore } from 'src/stores/user-data'
import { useCheckLogin } from 'src/composables/auth/useCheckLogin'

const { t } = useI18n()
const props = defineProps<{
  workspaceId: string,
  mainLayout?: boolean
}>()
const emit = defineEmits(['added'])

const $q = useQuasar()
const { ensureLogin } = useCheckLogin()
const { data: userData } = storeToRefs(useUserDataStore())
const { data: perfs } = storeToRefs(useUserPerfsStore())
const workspaceId = toRef(props, 'workspaceId')
const { createDialog } = useCreateDialog(workspaceId.value)

async function onAdd() {
  ensureLogin()
  await createDialog()
  emit('added')
}

if (isPlatformEnabled(perfs.value.enableShortcutKey)) {
  useListenKey(toRef(perfs.value, 'createDialogKey'), onAdd)
}
</script>
