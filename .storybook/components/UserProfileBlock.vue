<template>
  <div
    class="user-profile-block"
    :class="[
      `user-profile-block--${layout}`,
      `user-profile-block--${size}`,
      { 'user-profile-block--clickable': clickable }
    ]"
    @click="handleClick"
  >
    <!-- Avatar -->
    <div class="user-profile-block__avatar">
      <AAvatar
        :avatar="user.avatar"
        :size="avatarSize"
      />
      <!-- Status indicator positioned on right side of avatar for vertical layout only -->
      <div
        v-if="user.status && layout === 'vertical'"
        class="user-profile-block__status-indicator"
      >
        <UserProfileStatus
          :status="user.status"
          :show-text="false"
          :size="statusIndicatorSize"
        />
      </div>
    </div>

    <!-- Content area (name, displayName, subtitle, status) -->
    <div class="user-profile-block__content">
      <!-- Main name -->
      <div
        class="user-profile-block__name"
        :class="`user-profile-block__name--${size}`"
      >
        {{ user.displayName || user.name }}
      </div>

      <!-- Secondary info row -->
      <div
        v-if="user.subtitle || (user.status && layout === 'horizontal')"
        class="user-profile-block__secondary"
        :class="`user-profile-block__secondary--${size}`"
      >
        <!-- Status with text for horizontal layout -->
        <UserProfileStatus
          v-if="user.status && layout === 'horizontal'"
          :status="user.status"
          :show-text="true"
          :size="statusTextSize"
        />
        <!-- Subtitle -->
        <span
          v-if="user.subtitle"
          class="user-profile-block__subtitle"
          :class="{ 'user-profile-block__subtitle--with-status': user.status && layout === 'horizontal' }"
        >
          {{ user.subtitle }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Avatar } from '@/shared/utils/types'
import AAvatar from '../../src/components/AAvatar.vue'
import UserProfileStatus from './UserProfileStatus.vue'

// Type definitions
type StatusType = 'online' | 'away' | 'busy' | 'offline'
type LayoutType = 'horizontal' | 'vertical'
type SizeType = 'small' | 'medium' | 'large'

interface User {
  avatar: Avatar
  name: string
  displayName?: string
  status?: StatusType
  subtitle?: string
}

interface Props {
  user: User
  layout?: LayoutType
  size?: SizeType
  clickable?: boolean
}

// Component props with defaults
const props = withDefaults(defineProps<Props>(), {
  layout: 'horizontal',
  size: 'medium',
  clickable: false
})

// Emits
const emit = defineEmits<{
  click: [user: User]
}>()

// Computed properties for sizes
const avatarSize = computed(() => {
  const sizeMap = {
    small: '32px',
    medium: '40px',
    large: '48px'
  }
  return sizeMap[props.size]
})

const statusIndicatorSize = computed(() => {
  const sizeMap = {
    small: 'small',
    medium: 'small',
    large: 'medium'
  }
  return sizeMap[props.size] as 'small' | 'medium' | 'large'
})

const statusTextSize = computed(() => {
  const sizeMap = {
    small: 'small',
    medium: 'small',
    large: 'medium'
  }
  return sizeMap[props.size] as 'small' | 'medium' | 'large'
})

// Click handler
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.user)
  }
}
</script>

<style lang="scss">
// Import UserProfileBlock component styles
@import '../css/UserProfileBlock.scss';
</style>
