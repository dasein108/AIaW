# Parameter Standardization Examples

This document provides concrete examples of standardizing parameter patterns in key functions throughout the codebase.

## Example 1: Dialog Message Store Functions

### Before

```typescript
// Current inconsistent parameter patterns
async function addDialogMessage(
  dialogId: string,
  parentId: string | null,
  message: DialogMessageInput,
) { /* ... */ }

async function updateDialogMessage(
  dialogId: string,
  messageId: string,
  message: Partial<DialogMessageInput>
) { /* ... */ }

async function deleteDialogMessage(dialogId: string, messageId: string) { /* ... */ }

async function deleteStoredItem(stored_item: StoredItemMapped) { /* ... */ }

async function switchActiveDialogMessage(dialogId: string, activeMessageId: string, siblingMessageIds: string[]) { /* ... */ }
```

### After

```typescript
// Standardized parameter patterns
async function addDialogMessage(
  dialogId: string,
  parentId: string | null,
  message: DialogMessageInput,
  options?: { optimistic?: boolean }
) { /* ... */ }

async function updateDialogMessage(
  dialogId: string,
  messageId: string,
  message: Partial<DialogMessageInput>,
  options?: { optimistic?: boolean }
) { /* ... */ }

async function deleteDialogMessage(
  dialogId: string, 
  messageId: string,
  options?: { optimistic?: boolean }
) { /* ... */ }

async function deleteStoredItem(
  dialogId: string,
  itemId: string,
  options?: { optimistic?: boolean }
) { /* ... */ }

async function switchActiveDialogMessage(
  dialogId: string, 
  options: {
    activeMessageId: string,
    siblingMessageIds: string[]
  }
) { /* ... */ }
```

## Example 2: Composable Functions

### Before

```typescript
// Current inconsistent patterns
export const useDialogInput = (
  dialogId: Ref<string>,
) => { /* ... */ }

export const useLlmDialog = (
  workspaceId: Ref<string>,
  dialogId: Ref<string>,
  assistant: Ref<AssistantMapped>
) => { /* ... */ }

export function useAuth (loading: Ref<boolean>, onComplete: () => void) {
  async function auth (
    email: string,
    password: string,
    isSignUp: boolean = false
  ) { /* ... */ }
  
  return {
    signUp: async (email: string, password: string) =>
      await auth(email, password, true),
    signIn: async (email: string, password: string) =>
      await auth(email, password, false),
    signOut: async () => { /* ... */ },
  }
}
```

### After

```typescript
// Standardized patterns
export const useDialogInput = (
  dialogId: Ref<string>,
  options?: DialogInputOptions
) => { /* ... */ }

export const useLlmDialog = (
  dialogId: Ref<string>,
  options: {
    workspaceId: Ref<string>,
    assistant: Ref<AssistantMapped>
  }
) => { /* ... */ }

export function useAuth(options: { 
  loading: Ref<boolean>, 
  onComplete: () => void 
}) {
  const { loading, onComplete } = options;
  
  async function authenticate(
    credentials: { email: string, password: string },
    options?: { mode?: 'signUp' | 'signIn' }
  ) { 
    const { email, password } = credentials;
    const { mode = 'signIn' } = options || {};
    const isSignUp = mode === 'signUp';
    /* ... */ 
  }
  
  return {
    signUp: async (email: string, password: string) =>
      await authenticate({ email, password }, { mode: 'signUp' }),
    signIn: async (email: string, password: string) =>
      await authenticate({ email, password }, { mode: 'signIn' }),
    signOut: async () => { /* ... */ },
  }
}
```

## Example 3: Plugin Builder Functions

### Before

```typescript
function buildLobePlugin(
  manifest: LobeChatPluginManifest,
  available: boolean
): Plugin { /* ... */ }

function buildGradioPlugin(
  manifest: GradioPluginManifest,
  available: boolean
): Plugin { /* ... */ }

function buildMcpPlugin(
  dump: McpPluginDump, 
  available: boolean
): Plugin { /* ... */ }

async function dumpMcpPlugin(
  manifest: McpPluginManifest
): Promise<McpPluginDump> { /* ... */ }
```

### After

```typescript
// Define a common options interface
interface PluginBuilderOptions {
  available?: boolean;
  customSettings?: Record<string, any>;
}

function buildLobePlugin(
  manifest: LobeChatPluginManifest,
  options?: PluginBuilderOptions
): Plugin { 
  const { available = true, customSettings = {} } = options || {};
  /* ... */ 
}

function buildGradioPlugin(
  manifest: GradioPluginManifest,
  options?: PluginBuilderOptions
): Plugin { 
  const { available = true, customSettings = {} } = options || {};
  /* ... */ 
}

function buildMcpPlugin(
  dump: McpPluginDump, 
  options?: PluginBuilderOptions
): Plugin { 
  const { available = true, customSettings = {} } = options || {};
  /* ... */ 
}

async function dumpMcpPlugin(
  manifest: McpPluginManifest,
  options?: { includeCapabilities?: boolean }
): Promise<McpPluginDump> { 
  const { includeCapabilities = true } = options || {};
  /* ... */ 
}
```

## Example 4: Utility Functions

### Before

```typescript
// Inconsistent utility functions
export async function corsFetch (
  url: string,
  { method = "GET", headers = {}, body }
) { /* ... */ }

function randomHash (digits = 64) { /* ... */ }

function escapeRegex (str: string) { /* ... */ }

function textBeginning (text: string, length = 10) { /* ... */ }

function parsePageRange (range: string) { /* ... */ }
```

### After

```typescript
// Standardized utility functions
export async function corsFetch(
  url: string,
  options?: {
    method?: string,
    headers?: Record<string, string>,
    body?: any
  }
) { 
  const { method = "GET", headers = {}, body } = options || {};
  /* ... */ 
}

function randomHash(
  options?: { digits?: number }
): string { 
  const { digits = 64 } = options || {};
  /* ... */ 
}

function escapeRegex(
  str: string
): string { /* ... */ }

function textBeginning(
  text: string, 
  options?: { maxLength?: number }
): string { 
  const { maxLength = 10 } = options || {};
  /* ... */ 
}

function parsePageRange(
  range: string,
  options?: { startIndex?: number }
): number[] { 
  const { startIndex = 0 } = options || {};
  /* ... */ 
}
```

## Implementation Notes

When implementing these standardized parameter patterns, remember to:

1. **Add JSDoc Comments**: Document parameter patterns clearly with JSDoc comments
   ```typescript
   /**
    * Fetches dialog messages for a specific dialog
    * 
    * @param dialogId - The ID of the dialog to fetch messages for
    * @param options - Additional fetch options
    * @param options.includeDeleted - Whether to include deleted messages (default: false)
    * @returns A promise that resolves to an array of dialog messages
    */
   async function fetchDialogMessages(
     dialogId: string,
     options?: { includeDeleted?: boolean }
   ): Promise<DialogMessageMapped[]> { /* ... */ }
   ```

2. **Consider Migration Strategy**: Update function signatures gradually to minimize disruption
   - Add optional parameters first, keeping backward compatibility
   - Update calls to the function in batches
   - Remove deprecated parameters after all calls are updated

3. **Update Types**: Create proper TypeScript interfaces for options
   ```typescript
   interface DialogFetchOptions {
     includeDeleted?: boolean;
     limit?: number;
     offset?: number;
   }
   
   async function fetchDialogMessages(
     dialogId: string,
     options?: DialogFetchOptions
   ): Promise<DialogMessageMapped[]> { /* ... */ }
   ```

4. **Run Tests**: Ensure tests are updated to reflect new parameter patterns