<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    class="contacts-dialog"
  >
    <q-card class="contacts-card">
      <!-- Header with title and close button -->
      <q-card-section class="contacts-header">
        <div class="contacts-header__content">
          <div class="contacts-header__title">
            Contacts
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="$emit('update:modelValue', false)"
            class="contacts-header__close-btn"
          />
        </div>

        <!-- Search field -->
        <q-input
          v-model="searchQuery"
          placeholder="Search"
          outlined
          dense
          class="contacts-search"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>

      <!-- Contacts list -->
      <q-card-section class="contacts-list">
        <div class="contacts-list__container">
          <template
            v-for="(user, index) in filteredUsers"
            :key="user.id"
          >
            <UserProfileBlock
              :user="user"
              layout="horizontal"
              size="medium"
              :clickable="true"
              @click="handleUserClick"
              class="contacts-list__item"
            />
            <q-separator v-if="index < filteredUsers.length - 1" />
          </template>
        </div>
      </q-card-section>

      <!-- Footer with Add Contact button -->
      <q-card-section class="contacts-footer">
        <q-btn
          outline
          color="primary"
          label="Add Contact"
          icon="person_add"
          @click="handleAddContact"
          class="contacts-footer__add-btn"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import UserProfileBlock from './UserProfileBlock.vue'

// Props
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'user-click': [user: any]
  'add-contact': []
}>()

// Reactive data
const searchQuery = ref('')

// Sample users data (similar to the stories)
const users = ref([
  {
    id: 1,
    avatar: { type: 'text' as const, text: 'AS', hue: 220 },
    name: 'Alice Smith',
    displayName: 'Alice Smith',
    status: 'online' as const,
    subtitle: 'Product Manager'
  },
  {
    id: 2,
    avatar: { type: 'text' as const, text: 'JD', hue: 140 },
    name: 'John Doe',
    displayName: 'John Doe',
    status: 'online' as const,
    subtitle: 'Software Engineer'
  },
  {
    id: 3,
    avatar: { type: 'text' as const, text: 'SW', hue: 280 },
    name: 'Sarah Wilson',
    displayName: 'Sarah Wilson 🎨',
    status: 'online' as const,
    subtitle: 'UI/UX Designer'
  },
  {
    id: 4,
    avatar: { type: 'text' as const, text: 'MB', hue: 60 },
    name: 'Michael Brown',
    displayName: 'Mike Brown',
    status: 'busy' as const,
    subtitle: 'In a meeting'
  },
  {
    id: 5,
    avatar: { type: 'text' as const, text: 'EJ', hue: 340 },
    name: 'Emily Johnson',
    displayName: 'Emily J.',
    status: 'away' as const,
    subtitle: 'last seen 12 minutes ago'
  },
  {
    id: 6,
    avatar: { type: 'text' as const, text: 'DL', hue: 180 },
    name: 'David Lee',
    displayName: 'David Lee',
    status: 'away' as const,
    subtitle: 'last seen 1 hour ago'
  },
  {
    id: 7,
    avatar: { type: 'text' as const, text: 'LG', hue: 100 },
    name: 'Lisa Garcia',
    displayName: 'Lisa Garcia ⭐',
    status: 'away' as const,
    subtitle: 'last seen 3 hours ago'
  },
  {
    id: 8,
    avatar: { type: 'text' as const, text: 'RT', hue: 20 },
    name: 'Robert Taylor',
    displayName: 'Rob Taylor',
    status: 'offline' as const,
    subtitle: 'last seen yesterday'
  },
  {
    id: 9,
    avatar: { type: 'text' as const, text: 'JW', hue: 260 },
    name: 'Jessica White',
    displayName: 'Jess',
    status: 'offline' as const,
    subtitle: 'last seen 2 days ago'
  },
  {
    id: 10,
    avatar: { type: 'icon' as const, icon: 'person', hue: 200 },
    name: 'Admin User',
    displayName: 'Admin',
    status: 'online' as const,
    subtitle: 'System Administrator'
  }
])

// Computed properties
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) {
    return users.value
  }

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    (user.displayName && user.displayName.toLowerCase().includes(query))
  )
})

// Event handlers
const handleUserClick = (user: any) => {
  emit('user-click', user)
}

const handleAddContact = () => {
  emit('add-contact')
}
</script>

<style lang="scss">
@import '../css/Contacts.scss';
</style>
