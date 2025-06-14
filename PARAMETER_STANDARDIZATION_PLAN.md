# Parameter Standardization Plan

This document outlines a plan to standardize function parameter patterns across the codebase.

## Current Issues

The codebase has several inconsistencies in parameter patterns:

1. **Inconsistent Parameter Order**: Some functions place IDs first, while others place content objects first
2. **Mixed Parameter Styles**: Some functions use object destructuring, others use explicit parameters
3. **Inconsistent Optional Parameter Handling**: Different approaches for default values and optional parameters
4. **Naming Inconsistencies**: Similar parameters have different names in different functions
5. **Implicit vs. Explicit Types**: Some functions rely on TypeScript inference, others use explicit types

## Standardization Guidelines

### 1. Parameter Order

Standard order for function parameters:

1. **Identifiers/Keys**: IDs and key values (e.g., `dialogId`, `messageId`, `workspaceId`)
2. **Content/Data**: Main data objects being manipulated (e.g., `message`, `content`)
3. **Options/Config**: Optional settings that modify behavior (e.g., `settings`, `options`)
4. **Callbacks**: Callback functions (e.g., `onComplete`, `onError`)

Example:
```typescript
// Before
function updateSomething(content: ContentType, id: string, options?: OptionsType) { ... }

// After
function updateSomething(id: string, content: ContentType, options?: OptionsType) { ... }
```

### 2. Object Destructuring vs. Explicit Parameters

Use explicit parameters for:
- Simple functions with 1-3 parameters
- Functions where most parameters are required
- Parameters that directly map to intuitive concepts

Use object destructuring for:
- Functions with >3 parameters
- Functions with many optional parameters
- Complex configuration objects

Example:
```typescript
// Before - unnecessary destructuring for simple cases
function simple({ id, name }: { id: string, name: string }) { ... }

// After
function simple(id: string, name: string) { ... }

// Before - too many explicit parameters
function complex(id: string, name: string, age: number, address: string, role: Role, isActive: boolean) { ... }

// After
function complex({ id, name, age, address, role, isActive }: UserOptions) { ... }
```

### 3. Optional Parameters

Use TypeScript optional parameters (`?`) and default values consistently:

```typescript
// Before - inconsistent approaches
function fn1(required, optional = defaultValue) { ... }
function fn2(required, options) { const { optional = defaultValue } = options; ... }

// After - consistent pattern for simple cases
function fn1(required: Type, optional: OptType = defaultValue) { ... }

// After - consistent pattern for complex cases
function fn2(required: Type, options?: { optional?: OptType }) { 
  const finalOptions = { optional: defaultValue, ...options };
  ...
}
```

### 4. Parameter Naming

Standardize parameter names across similar functions:

- Use `id` suffix for identifiers (e.g., `dialogId`, `messageId`)
- Use `options` for configuration objects
- Use descriptive verb-noun combinations for callbacks (e.g., `onComplete`, `handleError`)
- Use consistent names for similar concepts (e.g., always use `content` not mixing `content`/`data`/`value`)

### 5. Function Naming & Return Values

- Prefix functions with verbs that accurately describe their action
- Use consistent return types for similar functions
- Include JSDoc comments that document parameter and return types

## Specific Changes Required

### 1. Composables

#### `useAuth` Composable

```typescript
// Before
export function useAuth(loading: Ref<boolean>, onComplete: () => void) {
  // ...
  async function auth(email: string, password: string, isSignUp: boolean = false) { ... }
  // ...
}

// After
export function useAuth(options: { 
  loading: Ref<boolean>,
  onComplete: () => void 
}) {
  // ...
  async function authenticate(email: string, password: string, options?: { 
    mode?: 'signUp' | 'signIn' 
  }) {
    const { mode = 'signIn' } = options || {};
    const isSignUp = mode === 'signUp';
    // ...
  }
  // ...
}
```

#### Dialog Composables

Standardize parameter patterns across dialog-related composables:

```typescript
// Before - inconsistent parameters
export const useDialogInput = (dialogId: Ref<string>) => { ... }
export const useLlmDialog = (workspaceId: Ref<string>, dialogId: Ref<string>, assistant: Ref<AssistantMapped>) => { ... }

// After - consistent pattern
export const useDialogInput = (dialogId: Ref<string>, options?: DialogInputOptions) => { ... }
export const useLlmDialog = (dialogId: Ref<string>, options: {
  workspaceId: Ref<string>,
  assistant: Ref<AssistantMapped>
}) => { ... }
```

### 2. Store Functions

#### Dialog Message Store

```typescript
// Before - inconsistent ordering
async function addDialogMessage(dialogId: string, parentId: string | null, message: DialogMessageInput) { ... }
async function updateDialogMessage(dialogId: string, messageId: string, message: Partial<DialogMessageInput>) { ... }
async function deleteDialogMessage(dialogId: string, messageId: string) { ... }
async function deleteStoredItem(stored_item: StoredItemMapped) { ... }

// After - consistent ordering and parameter patterns
async function addDialogMessage(dialogId: string, parentId: string | null, message: DialogMessageInput) { ... }
async function updateDialogMessage(dialogId: string, messageId: string, message: Partial<DialogMessageInput>) { ... }
async function deleteDialogMessage(dialogId: string, messageId: string) { ... }
async function deleteStoredItem(dialogId: string, itemId: string, options?: DeleteStoredItemOptions) { ... }
```

### 3. Utility Functions

#### Network Utilities

```typescript
// Before - inconsistent styles
export async function corsFetch(url: string, { method = "GET", headers = {}, body }) { ... }

// After - consistent with other fetch-related functions
export async function corsFetch(url: string, options?: {
  method?: string,
  headers?: Record<string, string>,
  body?: any
}) {
  const { method = "GET", headers = {}, body } = options || {};
  // ...
}
```

#### Functions in `functions.ts`

```typescript
// Before - inconsistent parameter styles
function randomHash(digits = 64) { ... }
function JSONEqual(a, b) { ... }
function textBeginning(text: string, length = 10) { ... }

// After - consistent parameter styles with types
function randomHash(digits: number = 64): string { ... }
function areJsonEqual(a: any, b: any): boolean { ... }
function textBeginning(text: string, options?: { maxLength?: number }): string {
  const { maxLength = 10 } = options || {};
  // ...
}
```

### 4. Plugin-Related Functions

```typescript
// Before - inconsistent patterns
function buildLobePlugin(manifest: LobeChatPluginManifest, available: boolean): Plugin { ... }
function buildGradioPlugin(manifest: GradioPluginManifest, available: boolean): Plugin { ... }
function buildMcpPlugin(dump: McpPluginDump, available: boolean): Plugin { ... }

// After - consistent patterns
function buildLobePlugin(manifest: LobeChatPluginManifest, options?: PluginBuildOptions): Plugin {
  const { available = true } = options || {};
  // ...
}
function buildGradioPlugin(manifest: GradioPluginManifest, options?: PluginBuildOptions): Plugin {
  const { available = true } = options || {};
  // ...
}
function buildMcpPlugin(dump: McpPluginDump, options?: PluginBuildOptions): Plugin {
  const { available = true } = options || {};
  // ...
}
```

## Implementation Strategy

1. **Prioritize by Impact**: Start with frequently used functions and core composables
2. **Update in Batches**: Group related functions and update them together
3. **Update References**: Ensure all calls to modified functions are updated
4. **Add JSDoc Comments**: Document parameter patterns clearly
5. **Update Tests**: Ensure tests are updated to reflect new parameter patterns

## Benefits

- **Improved Readability**: Consistent parameter patterns make code easier to understand
- **Better Maintainability**: Standardized approach reduces cognitive load
- **Easier Onboarding**: New developers can quickly understand patterns
- **Fewer Bugs**: Consistent parameter handling reduces errors
- **Better IDE Support**: Consistent typing improves autocompletion and tooltips