# Store Relationship Diagrams

This document provides visual representations of the relationships between stores in the AIaW application.

## Store Types and Organization

```mermaid
graph TD
    subgraph "Shared Stores"
        UserStore[useUserStore]
        UiStateStore[useUiStateStore]
        UserPrefsStore[userPrefsStore]
        UserDataStore[userDataStore]
    end

    subgraph "Feature Stores"
        WorkspacesStore[useWorkspacesStore]
        DialogsStore[useDialogsStore]
        DialogMessagesStore[useDialogMessagesStore]
        AssistantsStore[useAssistantsStore]
        PluginsStore[usePluginsStore]
        ArtifactsStore[useArtifactsStore]
        ChatsStore[useChatsStore]
        ProfileStore[useProfileStore]
    end

    subgraph "Utility Stores"
        KeyValueDbStore[createKeyValueDbStore]
        UserPluginsStore[useUserPluginsStore]
    end

    KeyValueDbStore --> UserPrefsStore
    KeyValueDbStore --> UserDataStore
    KeyValueDbStore --> UserPluginsStore
    UserStore -.-> Feature[Feature Stores]
    UserDataStore -- "defaultAssistantIds" --> DialogsStore
```

## State Persistence Flow

```mermaid
graph LR
    State[Store State] --> Memory[Memory Storage]
    State --> |Throttled| DbOps[Database Operations]
    DbOps --> Supabase[Supabase]
    Supabase --> |Subscription| RealTime[Real-time Updates]
    RealTime --> State
```

## Core Store Dependencies

```mermaid
graph TD
    %% Core Stores
    UserStore[useUserStore]
    UiStateStore[useUiStateStore]
    UserDataStore[userDataStore]
    UserPrefsStore[userPrefsStore]

    %% Feature Stores
    ProfileStore[useProfileStore]
    ChatsStore[useChatsStore]
    WorkspacesStore[useWorkspacesStore]
    DialogsStore[useDialogsStore]
    DialogMessagesStore[useDialogMessagesStore]
    AssistantsStore[useAssistantsStore]
    PluginsStore[usePluginsStore]
    UserPluginsStore[useUserPluginsStore]

    %% Utilities
    KeyValueDbStore[createKeyValueDbStore]

    %% Dependencies
    UserStore --> ProfileStore
    UserStore --> ChatsStore
    UserStore --> KeyValueDbStore

    KeyValueDbStore --> UserDataStore
    KeyValueDbStore --> UserPrefsStore
    KeyValueDbStore --> UserPluginsStore

    DialogsStore --> DialogMessagesStore
    UserDataStore -- "defaultAssistantIds" --> DialogsStore

    UserPluginsStore --> PluginsStore
    AssistantsStore --> PluginsStore

    %% Initialization dependencies are not shown for clarity
```

## Data Flow Between Stores

```mermaid
flowchart TD
    %% Main stores
    UserStore[useUserStore]
    WorkspacesStore[useWorkspacesStore]
    AssistantsStore[useAssistantsStore]
    DialogsStore[useDialogsStore]
    PluginsStore[usePluginsStore]
    UserDataStore[userDataStore]
    DialogMessagesStore[useDialogMessagesStore]

    %% Data flow
    UserStore -- "User ID" --> WorkspacesStore
    UserStore -- "User ID" --> AssistantsStore

    WorkspacesStore -- "Workspace context" --> DialogsStore
    WorkspacesStore -- "Workspace context" --> AssistantsStore

    AssistantsStore -- "Assistant config" --> DialogsStore
    PluginsStore -- "Plugin availability" --> AssistantsStore

    UserDataStore -- "defaultAssistantIds" --> DialogsStore

    DialogsStore -- "Dialog content" --> DialogMessagesStore[useDialogMessagesStore]
    DialogsStore -- "Creates initial message" --> DialogMessagesStore
```

## Store Initialization Flow

```mermaid
sequenceDiagram
    participant UserStore as useUserStore
    participant Auth as Supabase Auth
    participant KeyValueStore as createKeyValueDbStore
    participant FeatureStore as Feature Stores
    participant DialogsStore as useDialogsStore
    participant DialogMessagesStore as useDialogMessagesStore
    participant UserDataStore as userDataStore

    UserStore->>Auth: getSession()
    Auth-->>UserStore: session data
    UserStore->>Auth: onAuthStateChange()
    Auth-->>UserStore: auth events

    UserStore->>FeatureStore: useUserLoginCallback(init)
    FeatureStore->>FeatureStore: init()

    UserStore->>KeyValueStore: useUserLoginCallback(init)
    KeyValueStore->>KeyValueStore: init()
    KeyValueStore->>KeyValueStore: fetchData()

    DialogsStore->>UserDataStore: Read defaultAssistantIds
    DialogsStore->>DialogMessagesStore: Create initial message after dialog creation
```

## Store Database Relationships

```mermaid
erDiagram
    USER {
        string id PK
        string email
    }

    USER_DATA {
        string user_id FK
        string key
        jsonb value
    }

    PROFILE {
        string id FK
        string name
        jsonb avatar
    }

    WORKSPACE {
        string id PK
        string name
        string owner_id FK
    }

    DIALOG {
        string id PK
        string name
        string workspace_id FK
        string assistant_id FK
    }

    DIALOG_MESSAGE {
        string id PK
        string dialog_id FK
        string parent_id FK
    }

    MESSAGE_CONTENT {
        string message_id FK
        string type
        text content_text
    }

    ASSISTANT {
        string id PK
        string name
        string workspace_id FK
        jsonb model_settings
    }

    USER_PLUGIN {
        string id PK
        string key
        jsonb manifest
    }

    USER ||--o{ USER_DATA : "stores"
    USER ||--|| PROFILE : "has"
    USER ||--o{ WORKSPACE : "owns"
    WORKSPACE ||--o{ DIALOG : "contains"
    DIALOG ||--o{ DIALOG_MESSAGE : "contains"
    DIALOG_MESSAGE ||--o{ MESSAGE_CONTENT : "has"
    WORKSPACE ||--o{ ASSISTANT : "contains"
    USER ||--o{ USER_PLUGIN : "installs"
```

---

**Note:**
- When creating a dialog, `useDialogsStore` reads the default assistant ID for the workspace from `userDataStore` (key: `defaultAssistantIds`).
- After a dialog is created, an initial message is immediately created in `useDialogMessagesStore`.
- This flow ensures every new dialog starts with a message branch, ready for user input.
