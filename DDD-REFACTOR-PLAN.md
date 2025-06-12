# Domain-Driven Design (DDD) Refactoring Plan for AIaW

## 1. Domain Analysis & Strategic Design

### Identified Bounded Contexts
- **Conversation Context** - Dialog management, messages, streaming
- **Workspace Context** - Organization structure, permissions, sharing
- **Identity Context** - User profiles, authentication, preferences
- **Assistant Context** - AI models, providers, configurations
- **Artifact Context** - Generated content, storage, transformation
- **Plugin Context** - Extensions, tool integration, customization

### Context Map
- **Conversation ↔ Assistant**: Customer/Supplier (Assistant provides capabilities to Conversation)
- **Workspace ↔ Conversation**: Partnership (bidirectional integration)
- **Identity ↔ Workspace**: Conformist (Identity adapts to Workspace)
- **Artifact ↔ Conversation**: Partnership (bidirectional integration)
- **Plugin ↔ Assistant**: Open-Host Service (Plugin extends Assistant capabilities)

## 2. Implementation Plan

### Phase 1: Restructure Directory Layout
```
src/
├── domain/                   # Domain model (entities, value objects, domain services)
│   ├── conversation/         # Conversation domain
│   ├── workspace/            # Workspace domain
│   ├── identity/             # Identity domain
│   ├── assistant/            # Assistant domain
│   ├── artifact/             # Artifact domain
│   └── plugin/               # Plugin domain
├── application/              # Application services, commands & queries
│   ├── conversation/         # Conversation application services
│   ├── workspace/            # ...etc
│   └── ...
├── infrastructure/           # External concerns, technical implementations
│   ├── persistence/          # Database, storage
│   │   ├── supabase/         # Supabase implementation
│   │   └── local-storage/    # Browser storage implementation
│   ├── llm/                  # LLM providers integration
│   ├── ui/                   # UI frameworks & libraries
│   ├── api/                  # External API integration
│   └── messaging/            # Event bus, domain events
├── interface/                # User interface layer
│   ├── components/           # Reusable UI components
│   ├── pages/                # Route-based page components
│   ├── views/                # Complex view components
│   └── composables/          # UI-related hooks
└── shared/                   # Shared kernel (common types, utilities)
    ├── types/                # Shared type definitions
    ├── utils/                # Common utilities
    └── constants/            # Shared constants
```

### Phase 2: Domain Model Implementation

#### For Each Bounded Context:
1. **Define Core Domain Model**
   - Entities (with identity)
   - Value Objects (immutable, no identity)
   - Aggregates (transactional boundaries)
   - Domain Events (significant occurrences)
   - Domain Services (operations not belonging to entities)

2. **Implement Repository Interfaces**
   - Define repository interfaces in domain layer
   - Repository per aggregate root
   - Query specifications

3. **Create Domain Services**
   - Extract business logic from composables and stores
   - Implement domain logic in domain services

### Phase 3: Application Layer Implementation

1. **Command/Query Handlers**
   - Commands: state-changing operations
   - Queries: read-only operations
   - Use cases implementation

2. **Application Services**
   - Orchestration of domain operations
   - Transaction management
   - Event publication

3. **Domain Event Handlers**
   - Cross-domain coordination
   - Side-effect management

### Phase 4: Infrastructure Implementation

1. **Repository Implementations**
   - Supabase implementation
   - Local storage fallback

2. **External Services Integration**
   - LLM providers
   - Authentication providers
   - Storage services

3. **Event Bus Implementation**
   - Domain event distribution
   - Cross-context communication

### Phase 5: Interface Layer Refactoring

1. **Component Organization**
   - Align with bounded contexts
   - Create specialized components per domain

2. **State Management**
   - Refactor stores to align with domains
   - Implement query-based data access

3. **Composable Refactoring**
   - Convert to application service consumers
   - Remove direct infrastructure dependencies

## 3. Migration Strategy

### Incremental Approach
1. **Start with Core Domains**
   - Begin with Conversation and Assistant domains
   - Establish patterns for other domains

2. **Parallel Implementation**
   - Keep existing structure working
   - Implement new structure alongside
   - Gradually switch over components

3. **Testing Strategy**
   - Unit tests for domain model
   - Integration tests for application services
   - E2E tests for critical flows

### Risk Mitigation
- **Feature Toggles**: Use feature flags to control migration
- **Backward Compatibility**: Ensure backward compatibility during transition
- **Monitoring**: Implement detailed logging during migration

## 4. Specific Refactorings

### Current → DDD Migration Examples

#### Example 1: Dialog Management
**Current:**
```typescript
// src/stores/dialogMessages.ts
export const useDialogMessagesStore = defineStore('dialogMessages', {
  state: () => ({
    messages: {},
    currentDialog: null
  }),
  actions: {
    async addMessage(dialogId, message) {
      // Direct DB operations mixed with business logic
    }
  }
})
```

**DDD Approach:**
```typescript
// src/domain/conversation/entities/Message.ts
export class Message {
  constructor(
    public readonly id: string,
    public readonly content: MessageContent,
    public readonly metadata: MessageMetadata
  ) {}
  
  isFromUser(): boolean {
    return this.metadata.role === 'user';
  }
}

// src/domain/conversation/repositories/MessageRepository.ts
export interface MessageRepository {
  findByDialogId(dialogId: string): Promise<Message[]>;
  save(message: Message): Promise<void>;
}

// src/application/conversation/commands/AddMessageCommand.ts
export class AddMessageCommand {
  constructor(
    private messageRepository: MessageRepository,
    private eventBus: EventBus
  ) {}
  
  async execute(dialogId: string, content: string): Promise<void> {
    const message = new Message(/* ... */);
    await this.messageRepository.save(message);
    this.eventBus.publish(new MessageAddedEvent(dialogId, message));
  }
}
```

#### Example 2: Assistant Configuration
**Current:**
```typescript
// src/stores/assistants.ts + composables
export const useAssistantsStore = defineStore('assistants', {
  // Mixed concerns: storage, business logic, UI state
})

// Multiple composables accessing store directly
```

**DDD Approach:**
```typescript
// src/domain/assistant/entities/Assistant.ts
export class Assistant {
  constructor(
    public readonly id: string,
    private name: string,
    private modelConfig: ModelConfiguration,
    private systemPrompt: string
  ) {}
  
  updateSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }
  
  configureModel(config: Partial<ModelConfiguration>): void {
    this.modelConfig = { ...this.modelConfig, ...config };
  }
}

// src/application/assistant/queries/GetAssistantsQuery.ts
export class GetAssistantsQuery {
  constructor(private assistantRepository: AssistantRepository) {}
  
  async execute(): Promise<AssistantDTO[]> {
    const assistants = await this.assistantRepository.findAll();
    return assistants.map(a => AssistantMapper.toDTO(a));
  }
}

// src/interface/composables/useAssistants.ts
export function useAssistants() {
  const assistantService = inject('assistantService');
  const assistants = ref([]);
  
  onMounted(async () => {
    assistants.value = await assistantService.getAssistants();
  });
  
  return { assistants };
}
```

## 5. Timeline & Priorities

### Phase 1: Foundation (2-3 weeks)
- Set up new directory structure
- Create core domain models
- Establish patterns and guidelines

### Phase 2: Core Domains (4-6 weeks)
- Implement Conversation and Assistant domains
- Create infrastructure adapters
- Update UI components for these domains

### Phase 3: Supporting Domains (4-6 weeks)
- Implement Workspace and Artifact domains
- Integrate with core domains
- Refactor UI components

### Phase 4: Completion (2-4 weeks)
- Implement remaining domains
- Full integration testing
- Documentation update

## 6. Benefits

- **Maintainability**: Clear separation of concerns
- **Testability**: Domain logic isolated from infrastructure
- **Flexibility**: Easier to change infrastructure implementations
- **Scalability**: Better support for team collaboration
- **Extensibility**: Clearer extension points for new features