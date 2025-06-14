# Core Stores

This document provides detailed information about the core stores in the AIaW application.

## useUserStore

**File:** `/src/shared/store/userStore.ts`

**Purpose:** Manages user authentication state and user identity information.

**Key State:**
- `currentUser`: The currently authenticated user object
- `isLoggedIn`: Computed boolean indicating authentication status
- `currentUserId`: Computed user ID of the current user

**Key Methods:**
- `login`: Authenticates a user with credentials
- `logout`: Signs out the current user
- `init`: Initializes the store with current auth state

**Dependencies:** None

**Database Integration:**
- Uses Supabase Auth for authentication
- Does not directly use database tables

**Usage Example:**
```typescript
const userStore = useUserStore();

// Check if user is logged in
if (userStore.isLoggedIn) {
  // Perform actions for authenticated users
  console.log(`Logged in as: ${userStore.currentUser.email}`);
}

// Get user ID for database operations
const userId = userStore.currentUserId;
```

## userDataStore

**File:** `/src/shared/store/userDataStore.ts`

**Purpose:** Persistent storage for user-specific application data, including default assistant IDs per workspace (used by useDialogsStore when creating dialogs).

**Key State:**
- `data`: User preferences and settings (including `defaultAssistantIds`)
- `ready`: Indicates if data is loaded and ready for use

**Key Methods:**
- `updateKey`: Updates a specific key in the store
- `reset`: Resets the store to default values

**Dependencies:**
- `useUserStore`: For user identification
- `createKeyValueDbStore`: For implementation

**Database Integration:**
- Uses "user_data" table with a key-value structure
- Stores JSON data with user-specific keys

**Usage Example:**
```typescript
const userDataStore = useUserDataStore();

// Read user data
const lastViewedDialog = userDataStore.data.lastViewedDialog;

// Update user data
userDataStore.data.lastViewedWorkspace = workspaceId;

// Read default assistant ID for a workspace (used by useDialogsStore)
const defaultAssistantId = userDataStore.data.defaultAssistantIds[workspaceId];
```

## userPrefsStore

**File:** `/src/shared/store/userPrefsStore.ts`

**Purpose:** Manages user preferences and settings.

**Key State:**
- `data`: User preferences (theme, language, etc.)
- `ready`: Indicates if preferences are loaded

**Key Methods:**
- Inherits methods from createKeyValueDbStore

**Dependencies:**
- `useUserStore`: For user identification
- `createKeyValueDbStore`: For implementation

**Database Integration:**
- Uses "user_data" table with "prefs" key
- Stores user preferences as JSON

**Usage Example:**
```typescript
const prefsStore = useUserPrefsStore();

// Read user preferences
const darkMode = prefsStore.data.darkMode;

// Update preferences
prefsStore.data.language = 'en-US';
```

## uiStateStore

**File:** `/src/shared/store/uiStateStore.ts`

**Purpose:** Manages global UI state for the application.

**Key State:**
- `mainDrawerOpen`: Controls main navigation drawer visibility
- `colors`: UI color scheme settings
- `dialogScrollTops`: Tracks scroll positions for dialogs

**Key Methods:**
- `toggleMainDrawer`: Toggles main drawer visibility
- `setDialogScrollTop`: Sets scroll position for a dialog

**Dependencies:** None

**Database Integration:** None (transient state)

**Usage Example:**
```typescript
const uiStore = useUiStateStore();

// Toggle drawer
uiStore.toggleMainDrawer();

// Set color theme
uiStore.colors.primary = '#123456';
```
