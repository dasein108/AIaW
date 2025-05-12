<template>
  <q-dialog
    ref="dialogRef"
  >
    <q-card min-w="320px">
      <q-card-section>
        <div class="text-h6">
          Address book
        </div>
      </q-card-section>
      <q-card-section p-0>
        <q-list class="">
          <q-item
            v-for="user in users"
            :key="user.id"
            class="row items-center justify-between"
          >
            <div>{{ user.name }}</div>
            <q-btn
              flat
              color="primary"
              icon="sym_o_person_add"
              @click="onSelectUser(user)"
            />
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          :label="$t('subscribeDialog.cancel')"
          @click="onDialogCancel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { supabase } from 'src/services/supabase/client'
import type { Profile } from '@/services/supabase/types'
import { onMounted, ref } from 'vue'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps<{
  currentUserId: string
}>()

const users = ref<Profile[]>([])

const onSelectUser = async (user: Profile) => {
  onDialogOK(user)
}

onMounted(async () => {
  const { data, error } = await supabase.from('profiles').select('*').neq('id', props.currentUserId)
  if (error) {
    users.value = []
    return
  }
  users.value = data
})

</script>
