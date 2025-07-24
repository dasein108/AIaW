<template>
  <view-common-header
    v-if="showHeader"
    @toggle-drawer="$emit('toggle-drawer')"
  >
    <q-toolbar-title>
      {{ title }}
    </q-toolbar-title>
  </view-common-header>

  <!-- Common content wrapper -->
  <component :is="showPageContainer ? 'q-page-container' : 'div'">
    <component
      :is="showPageContainer ? 'q-page' : 'div'"
      v-bind="showPageContainer ? { p: 2, styleFn: pageFhStyle } : {}"
    >
      <!-- Search input -->
      <div>
        <a-input
          :label="searchLabel"
          outlined
          v-model="query"
        />
      </div>

      <!-- Transition group list with smooth animations -->
      <div class="q-mt-md">
        <transition-group
          name="fade-list"
          tag="div"
          class="fade-list-container"
        >
          <q-item
            v-for="(item, index) in filteredItems"
            :key="item.id"
            v-show="shouldShowItem(item)"
            class="fade-list-item"
          >
            <q-item-section avatar>
              <slot
                name="avatar"
                :item="item"
                :index="index"
              >
                <a-avatar :avatar="item.avatar" />
              </slot>
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <slot
                  name="title"
                  :item="item"
                  :index="index"
                >
                  {{ item.name }}
                </slot>
              </q-item-label>
              <q-item-label caption>
                <slot
                  name="subtitle"
                  :item="item"
                  :index="index"
                >
                  {{ item.description }}
                </slot>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <slot
                name="actions"
                :item="item"
                :index="index"
              >
                <q-btn
                  unelevated
                  bg-pri-c
                  text-on-pri-c
                  :label="actionLabel"
                  @click="$emit('action', item)"
                >
                  <q-menu v-if="actionMenuItems.length > 0">
                    <q-list>
                      <q-item
                        v-for="menuItem in actionMenuItems"
                        :key="menuItem.key"
                        clickable
                        v-close-popup
                        @click="$emit('menu-action', menuItem.key, item)"
                      >
                        <q-item-section>
                          {{ menuItem.label }}
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </slot>
            </q-item-section>
          </q-item>
        </transition-group>
      </div>

      <!-- Loading indicator -->
      <q-inner-loading :showing="loading" />

      <!-- Empty state -->
      <div
        v-if="!loading && visibleItemsCount === 0"
        class="text-center q-pa-lg"
      >
        <slot name="empty-state">
          <q-icon
            name="sym_o_folder_open"
            size="4em"
            class="text-grey-5 q-mb-md"
          />
          <div class="text-h6 text-grey-6">
            {{ emptyStateMessage }}
          </div>
        </slot>
      </div>
    </component>
  </component>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import AAvatar from "@/shared/components/avatar/AAvatar.vue"
import { caselessIncludes, pageFhStyle } from "@/shared/utils/functions"

import { useWorkspaceManager } from "@/features/workspaces/composables/useWorkspaceManager"

import ViewCommonHeader from "@/layouts/components/ViewCommonHeader.vue"

// Import workspace manager to access showJoinedWorkspaces state

interface ActionMenuItem {
  key: string
  label: string
}

interface Props {
  title: string
  searchLabel: string
  actionLabel: string
  emptyStateMessage: string
  items: any[]
  loading?: boolean
  actionMenuItems?: ActionMenuItem[]
  searchFields?: string[]
  showHeader?: boolean
  showPageContainer?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  actionMenuItems: () => [],
  searchFields: () => ['name', 'description'],
  showHeader: true,
  showPageContainer: true
})

defineEmits<{
  'toggle-drawer': []
  'action': [item: any]
  'menu-action': [key: string, item: any]
}>()

const query = ref("")

// Get workspace manager state for toggle functionality
const { showJoinedWorkspaces } = useWorkspaceManager()

const filteredItems = computed(() => {
  if (!query.value.trim()) {
    return props.items
  }

  const searchQuery = query.value.toLowerCase()

  return props.items.filter(item =>
    props.searchFields.some(field =>
      item[field] && caselessIncludes(String(item[field]), searchQuery)
    )
  )
})

// Function to determine if an item should be shown
function shouldShowItem(item: any): boolean {
  // If showJoinedWorkspaces is true, show all items
  // If showJoinedWorkspaces is false, only show items that are not joined
  if (showJoinedWorkspaces.value) {
    return true
  }

  // Only hide items if they have an isJoined property and it's true
  return !(item.isJoined === true)
}

// Computed property for visible items count (used for empty state)
const visibleItemsCount = computed(() => {
  return filteredItems.value.filter(item => shouldShowItem(item)).length
})
</script>

<style scoped>
/* Fade list transition styles */
.fade-list-container {
  position: relative;
}

.fade-list-item {
  transition: all 0.3s ease;
}

/* Enter animations */
.fade-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-list-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-list-enter-active {
  transition: all 0.3s ease;
}

/* Leave animations */
.fade-list-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-list-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}

/* Move animations for reordering */
.fade-list-move {
  transition: transform 0.3s ease;
}
</style>
