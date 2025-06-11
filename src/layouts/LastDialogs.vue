<template>
  <q-list
    class="q-pa-none"
    pt-0
    pb-0
  >
    <q-item
      v-for="dialog in lastDialogsWithWorkspace"
      :key="dialog.id"
      clickable
      @click="goToDialog(dialog.workspace_id, dialog.id)"
      dense
      class="q-pa-xs q-mb-xs"
    >
      <q-item-section
        side
        class="q-mr-xs q-pa-none"
      >
        <AAvatar
          :avatar="dialog.workspace?.avatar"
          :label="dialog.workspace?.name"
          :flat="true"
          size="xs"
        />
      </q-item-section>
      <q-item-section class="q-pa-none q-pt-xs q-pl-xs">
        <div class="text-body2 ellipsis">
          {{ dialog.name }}
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import AAvatar from "src/components/AAvatar.vue"
import { DialogMapped } from "src/services/supabase/types"
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useDialogsStore, useWorkspacesStore } from "@/app/store"

const MAX_LAST_DIALOGS = 3
const router = useRouter()
const workspacesStore = useWorkspacesStore()
const { dialogs } = storeToRefs(useDialogsStore())
const dialogsMapped = computed(() => Object.values<DialogMapped>(dialogs.value))

const lastDialogs = computed(() => {
  return [...dialogsMapped.value]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, MAX_LAST_DIALOGS)
})

const lastDialogsWithWorkspace = computed(() =>
  workspacesStore.workspaces.length > 0
    ? lastDialogs.value.map((d) => {
      const workspace = workspacesStore.workspaces?.find(
        (w) => w.id === d.workspace_id
      )

      return {
        ...d,
        workspace,
      }
    })
    : []
)

function goToDialog (workspaceId: string, dialogId: string) {
  router.push(`/workspaces/${workspaceId}/dialogs/${dialogId}`)
}
</script>
