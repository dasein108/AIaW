<template>
  <data-list-manager
    :title="title"
    :search-label="searchLabel"
    :action-label="''"
    :empty-state-message="emptyStateMessage"
    :items="items"
    :loading="loading"
    :show-header="showHeader"
    :show-page-container="showPageContainer"
    @action="$emit('action', $event)"
  >
    <template #avatar="{ item }">
      <a-avatar :avatar="item.avatar" />
    </template>

    <template #title="{ item }">
      <div class="row items-center q-gutter-sm">
        <span>{{ item.name }}</span>
      </div>
    </template>

    <template #subtitle="{ item }">
      <div>
        <div>{{ item.description || $t('workspaces.noDescription') }}</div>
        <div>{{ $t('workspaces.createdBy') }}: {{ getOwnerName(item) }}</div>
        <div v-if="item.isJoined">
          {{ $t('workspaces.joinedAt') }}: {{ formatDate(item.createdAt) }}
        </div>
        <div v-else-if="item.isOwned">
          {{ $t('workspaces.createdAt') }}: {{ formatDate(item.createdAt) }}
        </div>
        <div v-else>
          {{ $t('workspaces.createdAt') }}: {{ formatDate(item.createdAt) }}
        </div>
      </div>
    </template>

    <template #actions="{ item }">
      <q-btn
        v-if="item.actionType === 'delete'"
        icon="sym_o_delete"
        color="negative"
        :label="$t('workspaces.delete')"
        flat
        dense
        size="md"
        style="min-width: 80px"
        @click="deleteWorkspace(item)"
        :loading="removing[item.id]"
      />
      <!--       <q-btn
        v-else-if="item.actionType === 'leave'"
        unelevated
        color="negative"
        text-color="white"
        :label="$t('workspaces.leave')"
        @click="leaveWorkspace(item)"
        :loading="removing[item.id]"
      /> -->
      <q-btn
        v-else-if="item.actionType === 'leave'"
        icon="sym_o_exit_to_app"
        color="negative"
        :label="$t('myWorkspaces.leave')"
        flat
        dense
        size="md"
        style="min-width: 80px"
        @click="leaveWorkspace(item)"
        :loading="removing[item.id]"
      />
      <q-btn
        v-else-if="item.actionType === 'join'"
        icon="sym_o_group_add"
        color="primary"
        :label="$t('workspaces.join')"
        flat
        dense
        size="md"
        style="min-width: 80px"
        @click="joinWorkspace(item)"
        :loading="adding[item.id]"
      />
    </template>

    <template #empty-state>
      <slot name="empty-state" />
    </template>
  </data-list-manager>
</template>

<script setup lang="ts">

import AAvatar from "@/shared/components/avatar/AAvatar.vue"
import DataListManager from "@/shared/components/data/DataListManager.vue"

import { useWorkspaceManager } from "@/features/workspaces/composables/useWorkspaceManager"

interface Props {
  title: string
  searchLabel: string
  emptyStateMessage: string
  items: any[]
  loading?: boolean
  showHeader?: boolean
  showPageContainer?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  showHeader: true,
  showPageContainer: true
})

defineEmits<{
  'action': [item: any]
}>()

// Use workspace manager for common functionality
const {
  adding,
  removing,
  getOwnerName,
  joinWorkspace,
  leaveWorkspace,
  deleteWorkspace,
  formatDate
} = useWorkspaceManager()
</script>
