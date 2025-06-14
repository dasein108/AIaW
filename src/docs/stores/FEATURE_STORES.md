# Feature Stores

This document provides detailed information about the feature-specific stores in the AIaW application.

## useAssistantsStore

**File:** `/src/features/assistants/store/index.ts`

**Purpose:** Manages AI assistants available to the user.

**Key State:**
- `assistants`: Collection of available assistants
- `isLoaded`: Flag indicating if assistants are loaded

**Key Methods:**
- `add`: Creates a new assistant
- `update`: Updates an existing assistant
- `delete`: Removes an assistant
- `put`: Smart add/update operation

**Dependencies:**
- `useUserLoginCallback`: For initialization after login

**Database Integration:**
- Uses "user_assistants" table for assistant data

**Usage Example:**
```typescript
const assistantsStore = useAssistantsStore();

// Create a new assistant
const newAssistant = await assistantsStore.add({
  name: "Research Assistant",
  prompt: "You are a helpful research assistant...",
  model: "gpt-4"
});

// Update an assistant
await assistantsStore.update(assistantId, { name: "Updated Name" });

// Delete an assistant
await assistantsStore.delete(assistantId);
```

## usePluginsStore

**File:** `/src/features/plugins/store/index.ts`

**Purpose:** Manages plugin availability and configuration.

**Key State:**
- `plugins`: Available plugins
- `userPlugins`: User-installed plugins

**Key Methods:**
- `installPlugin`: Installs various types of plugins
- `enablePluginForAssistant`: Associates plugins with assistants
- `disablePluginForAssistant`: Removes plugin from an assistant

**Dependencies:**
- `useAssistantsStore`: For updating assistant plugins
- `useUserPluginsStore`: For plugin storage
- `useUserLoginCallback`: For initialization

**Database Integration:**
- Uses "user_data" table via useUserPluginsStore

**Usage Example:**
```typescript
const pluginsStore = usePluginsStore();

// Install a plugin
await pluginsStore.installPlugin({
  id: "web-search",
  name: "Web Search",
  type: "builtin"
});

// Enable plugin for an assistant
await pluginsStore.enablePluginForAssistant(
  assistantId,
  "web-search",
  { apiKey: "xyz123" }
);
```

## useDialogsStore

**File:** `/src/features/dialogs/store/dialogs.ts`

**Purpose:** Manages AI conversation dialogs.

**Key State:**
- `dialogs`: Collection of dialogs
- `isLoaded`: Flag indicating if dialogs are loaded

**Key Methods:**
- `addDialog`: Creates a new dialog
- `removeDialog`: Deletes a dialog
- `updateDialog`: Updates dialog properties
- `searchDialogs`: Searches dialog content

**Dependencies:**
- `useDialogMessagesStore`: For message operations
- `useUserLoginCallback`: For initialization

**Database Integration:**
- Uses "dialogs" table for dialog metadata

**Usage Example:**
```typescript
const dialogsStore = useDialogsStore();

// Create a new dialog
const newDialog = await dialogsStore.addDialog({
  name: "New Conversation",
  assistant_id: assistantId,
  workspace_id: workspaceId
});

// Add initial message
await dialogMessagesStore.addDialogMessage(
  newDialog.id,
  null,
  { role: "user", content: "Hello assistant" }
);

// Search dialogs
const results = await dialogsStore.searchDialogs("machine learning");
```

## useDialogMessagesStore

**File:** `/src/features/dialogs/store/dialogMessages.ts`

**Purpose:** Manages messages within dialogs.

**Key State:**
- `dialogMessages`: Map of messages by dialog ID

**Key Methods:**
- `addDialogMessage`: Adds a message to a dialog
- `updateDialogMessage`: Updates a message
- `switchActiveDialogMessage`: Changes the active branch
- `deleteDialogMessage`: Removes a message
- `deleteStoredItem`: Removes stored item from a message

**Dependencies:** No direct store dependencies

**Database Integration:**
- Uses "dialog_messages" table for message metadata
- Uses "message_contents" for actual message content
- Uses "stored_items" for attachments and generated files

**Usage Example:**
```typescript
const dialogMessagesStore = useDialogMessagesStore();

// Fetch messages for a dialog
const messages = await dialogMessagesStore.fetchDialogMessages(dialogId);

// Add a user message
await dialogMessagesStore.addDialogMessage(
  dialogId,
  parentId,
  {
    role: "user",
    status: "complete",
    message_contents: [
      { type: "text", text: "How do I implement a binary search?" }
    ]
  }
);

// Update message status
await dialogMessagesStore.updateDialogMessage(
  dialogId,
  messageId,
  { status: "complete" }
);
```

## useWorkspacesStore

**File:** `/src/features/workspaces/store/index.ts`

**Purpose:** Manages workspaces for organizing content.

**Key State:**
- `workspaces`: Collection of workspaces
- `isLoaded`: Flag indicating if workspaces are loaded

**Key Methods:**
- `addWorkspace`: Creates a new workspace
- `updateItem`: Updates workspace properties
- `deleteItem`: Deletes a workspace
- `addWorkspaceMember`: Adds a user to a workspace
- `removeWorkspaceMember`: Removes a user from a workspace
- `isUserWorkspaceAdmin`: Checks if a user is an admin in a workspace

**Dependencies:**
- `useWorkspacesWithSubscription`: For real-time workspace data

**Database Integration:**
- Uses "workspaces" table for workspace data
- Uses "workspace_members" for membership management

**Usage Example:**
```typescript
const workspacesStore = useWorkspacesStore();

// Create a new workspace
const workspace = await workspacesStore.addWorkspace({
  name: "Project Alpha",
  type: "workspace"
});

// Add a member to the workspace
await workspacesStore.addWorkspaceMember(
  workspace.id,
  userId,
  "member"
);

// Check if user is an admin
const role = await workspacesStore.isUserWorkspaceAdmin(workspace.id, userId);
if (role === "admin" || role === "owner") {
  // User has admin privileges
}
```

## useChatsStore

**File:** `/src/features/chats/store/index.ts`

**Purpose:** Manages user-to-user chat sessions.

**Key State:**
- `chats`: Collection of chat sessions
- `isLoaded`: Flag indicating if chats are loaded

**Key Methods:**
- `add`: Creates a new chat
- `update`: Updates an existing chat
- `remove`: Deletes a chat
- `search`: Searches chat messages
- `startPrivateChatWith`: Creates or finds a private chat

**Dependencies:**
- `useChatsWithSubscription`: For real-time chat data
- `useUserStore`: For current user identification

**Database Integration:**
- Uses "chats" table for chat metadata
- Uses "messages" table for chat messages
- Uses RPC function "start_private_chat_with" for private chats

**Usage Example:**
```typescript
const chatsStore = useChatsStore();

// Create a new group chat
const groupChat = await chatsStore.add({
  name: "Team Discussion",
  workspace_id: workspaceId,
  type: "group"
});

// Start a private chat with another user
const privateChatId = await chatsStore.startPrivateChatWith(otherUserId);

// Search for messages
const results = await chatsStore.search("meeting notes", workspaceId);
```

## useArtifactsStore

**File:** `/src/features/artifacts/store/index.ts`

**Purpose:** Manages code and document artifacts.

**Key State:**
- `artifacts`: All artifacts across workspaces
- `workspaceArtifacts`: Artifacts organized by workspace

**Key Methods:**
- `add`: Creates a new artifact
- `update`: Updates an artifact
- `remove`: Deletes an artifact

**Dependencies:**
- `useUserLoginCallback`: For initialization after login

**Database Integration:**
- Uses "artifacts" table for artifact data

**Usage Example:**
```typescript
const artifactsStore = useArtifactsStore();

// Create a new code artifact
const artifact = await artifactsStore.add({
  name: "Binary Search Implementation",
  type: "code",
  language: "javascript",
  content: "function binarySearch(arr, target) { ... }",
  workspace_id: workspaceId
});

// Update an artifact
await artifactsStore.update({
  id: artifact.id,
  workspace_id: workspaceId,
  content: "// Updated implementation\nfunction binarySearch(arr, target) { ... }"
});
```