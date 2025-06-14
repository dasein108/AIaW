# Chats Module

## Overview

The Chats module provides person-to-person communication capabilities within the AIaW application. It handles real-time messaging, chat history, and group conversations between users within workspaces.

## Responsibilities

- Managing chat creation and configuration
- Handling message sending and receiving
- Supporting real-time updates through subscriptions
- Providing chat search functionality
- Managing chat participants and permissions
- Offering UI components for chat interaction
- Storing and retrieving chat history

## Directory Structure

```
chats/
├── components/        # UI components for chat management
├── composables/       # Functional composition utilities
├── store/             # Pinia store for chat state management
├── utils/             # Utility functions for chat operations
└── views/             # Page-level components for chat pages
```

## Key Files

- `store/index.ts`: State management for chats
- `store/chatMessages.ts`: State management for chat messages
- `composables/useChatMessagesSubscription.ts`: Real-time subscription to chat messages
- `composables/useChatsWithSubscription.ts`: Real-time subscription to chats
- `composables/useIsChatAdmin.ts`: Chat permission checking
- `views/ChatView.vue`: Main chat interface
- `views/ChatSettings.vue`: Chat configuration interface

## Chat Structure

Each chat includes:

- Chat metadata (name, description, creation date)
- Participants with role information
- Associated workspace
- Messages with sender information and timestamps
- Unread message counts
- Privacy settings

## Dependencies

The Chats module integrates with several other modules:

- **Workspaces**: Chats exist within workspaces
- **Profile**: For user information in chat messages
- **Auth**: For permission checking
- **Media**: For handling file and image sharing

## Real-time Features

The module implements real-time capabilities:

- Live message updates
- Typing indicators
- Online presence information
- Unread message tracking
- Message delivery confirmation

## Usage Examples

### Creating a Chat

```typescript
import { useChatsStore } from '@/features/chats/store';

const chatsStore = useChatsStore();
const newChat = await chatsStore.add({
  name: 'Project Discussion',
  workspace_id: currentWorkspaceId,
  participants: [user1Id, user2Id]
});
```

### Sending a Message

```typescript
import { useChatMessagesStore } from '@/features/chats/store/chatMessages';

const messagesStore = useChatMessagesStore();
await messagesStore.sendMessage(chatId, {
  content: 'Hello team!',
  type: 'text'
});
```

### Starting a Private Chat

```typescript
import { useChatsStore } from '@/features/chats/store';

const chatsStore = useChatsStore();
const privateChat = await chatsStore.startPrivateChatWith(userId, workspaceId);
```

### Subscribing to Chat Updates

```typescript
import { useChatsWithSubscription } from '@/features/chats/composables';

const { chats, loading } = useChatsWithSubscription(workspaceId);
```

## Flow Diagram

```
Chat Creation → Participant Management → 
Message Sending → Real-time Updates →
Message Display → Chat History Retrieval
```