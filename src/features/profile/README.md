# Profile Module

## Overview

The Profile module manages user profile information and settings within the AIaW application. It handles user avatars, display names, preferences, and account management functionality.

## Responsibilities

- Managing user profile information
- Handling user avatar images
- Storing user preferences
- Providing account management functionality
- Offering UI components for profile interaction
- Supporting profile editing and updates

## Directory Structure

```
profile/
├── components/        # UI components for profile management
├── composables/       # Functional composition utilities
├── store/             # Pinia store for profile state management
├── utils/             # Utility functions for profile operations
└── views/             # Page-level components for profile pages
```

## Key Files

- `store/profile.ts`: State management for user profiles
- `composables/avatar-image.ts`: Avatar image handling
- `components/AccountBtn.vue`: Account button component
- `components/ImageAvatar.vue`: Avatar display component
- `views/AccountPage.vue`: Account settings page

## Profile Structure

Each user profile includes:

- Display name
- Avatar (image or text)
- Email address
- Account settings
- User preferences
- Account creation date
- Last active timestamp

## Dependencies

The Profile module integrates with several other modules:

- **Auth**: For user authentication information
- **Workspaces**: For workspace membership
- **Media**: For avatar image processing
- **Storage**: For avatar image storage

## Usage Examples

### Getting Profile Information

```typescript
import { useProfileStore } from '@/features/profile/store';

const profileStore = useProfileStore();
const { displayName, avatar } = profileStore.profile;
```

### Updating Avatar

```typescript
import { useAvatarImage } from '@/features/profile/composables';

const { uploadAvatarImage } = useAvatarImage();
await uploadAvatarImage(imageFile);
```

### Updating Profile

```typescript
import { useProfileStore } from '@/features/profile/store';

const profileStore = useProfileStore();
await profileStore.updateProfile({
  display_name: 'New Name',
  // other fields...
});
```

### Displaying Avatar

```vue
<template>
  <ImageAvatar :avatar="userAvatar" size="md" />
</template>

<script setup lang="ts">
import { ImageAvatar } from '@/features/profile/components';
import { useProfileStore } from '@/features/profile/store';

const profileStore = useProfileStore();
const userAvatar = computed(() => profileStore.profile.avatar);
</script>
```

## Flow Diagram

```
Profile Creation → Profile Configuration → 
Avatar Management → Profile Updates →
Profile Display → Account Management
```