<template>
  <q-expansion-item
    header-class="text-lg py-0"
    expand-icon-class="important:pl-2"
  >
    <template #header>
      <q-item-section>
        {{ $t("dialogsExpansion.dialogs") }}
      </q-item-section>
      <q-item-section side>
        <q-btn
          flat
          dense
          round
          icon="sym_o_search"
          :title="$t('dialogsExpansion.search')"
          @click.prevent.stop="showSearchDialog = true"
        />
      </q-item-section>
    </template>
    <template #default>
      <dialog-list :workspace-id="workspaceId" />
      <search-dialog
        v-model="showSearchDialog"
        :workspace-id="workspaceId"
      />
    </template>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { ref, toRef } from "vue"
import DialogList from "./DialogList.vue"
import SearchDialog from "./SearchDialog.vue"
import { useUserPerfsStore } from "@/app/store"
import { useListenKey } from "@/shared/composables/listen-key"
import { isPlatformEnabled } from "@/shared/utils/functions"

defineProps<{
  workspaceId: string
}>()

const showSearchDialog = ref(false)

const { data: perfs } = useUserPerfsStore()

if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, "searchDialogKey"), () => {
    showSearchDialog.value = true
  })
}
</script>
