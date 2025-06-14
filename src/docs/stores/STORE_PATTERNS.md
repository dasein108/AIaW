# Store Patterns

This document describes common patterns and best practices for working with stores in the AIaW application.

## Store Factory Functions

### createKeyValueDbStore

**File:** `/src/shared/store/utils/createKeyValueDbStore.ts`

**Purpose:** Factory function that creates key-value stores with Supabase persistence.

**Created Store Structure:**
- `data`: Reactive object for storing the key-value data
- `ready`: Boolean indicating if the store is initialized
- `clearData`: Method to reset the store to default values
- `init`: Method to initialize the store

**Dependencies:**
- `useUserStore`: For user identification
- `useUserLoginCallback`: For initialization after login

**Database Integration:**
- Uses "user_data" table with a specific key for each store instance
- Serializes store data as JSON in the "value" column

**Usage Example:**
```typescript
// Creating a new key-value store
export const useCustomStore = () => {
  return createKeyValueDbStore<{
    setting1: string;
    setting2: boolean;
    items: string[];
  }>(
    "custom-store-key",
    {
      setting1: "default",
      setting2: false,
      items: []
    }
  )();
}

// Using the store
const customStore = useCustomStore();

// Reading values
const currentSetting = customStore.data.setting1;

// Writing values (automatically persisted)
customStore.data.setting2 = true;
customStore.data.items.push("new item");
```

## Common Initialization Pattern

Most stores follow this initialization pattern:

```typescript
// Store initialization pattern
export const useSomeStore = defineStore("storeName", () => {
  // State declarations
  const items = ref<Item[]>([]);
  const isLoaded = ref(false);
  
  // Fetch data from backend
  async function fetchItems() {
    const { data, error } = await supabase
      .from("table_name")
      .select("*");
      
    if (error) {
      console.error("Error fetching items:", error);
    }
    
    items.value = data || [];
  }
  
  // Initialization function
  const init = async () => {
    isLoaded.value = false;
    items.value = []; // Clear existing data
    await fetchItems();
    isLoaded.value = true;
  }
  
  // Register for login/logout events
  useUserLoginCallback(init);
  
  // Return store public API
  return {
    items,
    isLoaded,
    init,
    // Other methods...
  };
});
```

## Real-time Subscription Pattern

For stores that need real-time updates:

```typescript
// Create a subscription composable
export function useItemsWithSubscription() {
  const items = ref<Item[]>([]);
  const isLoaded = ref(false);
  
  onMounted(async () => {
    // Initial data fetch
    const { data } = await supabase.from("items").select("*");
    items.value = data || [];
    isLoaded.value = true;
    
    // Subscribe to changes
    const subscription = supabase
      .channel('public:items')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'items'
      }, (payload) => {
        // Handle different change types
        if (payload.eventType === 'INSERT') {
          items.value.push(payload.new as Item);
        } else if (payload.eventType === 'UPDATE') {
          const index = items.value.findIndex(i => i.id === payload.new.id);
          if (index >= 0) {
            items.value[index] = payload.new as Item;
          }
        } else if (payload.eventType === 'DELETE') {
          items.value = items.value.filter(i => i.id !== payload.old.id);
        }
      })
      .subscribe();
      
    // Cleanup on unmount
    onUnmounted(() => {
      supabase.removeChannel(subscription);
    });
  });
  
  return {
    items: readonly(items),
    isLoaded
  };
}

// Use in store
export const useSomeStore = defineStore("storeName", () => {
  const { items, isLoaded } = useItemsWithSubscription();
  
  // Rest of store implementation
  // ...
  
  return {
    items,
    isLoaded,
    // Other methods...
  };
});
```

## Throttled Update Pattern

For reducing database writes during frequent updates:

```typescript
// Throttled update pattern
const throttledUpdate = throttle(async (id: string, changes: Partial<Item>) => {
  const { error } = await supabase
    .from("items")
    .update(changes)
    .eq("id", id);
    
  if (error) {
    console.error("Error updating item:", error);
  }
}, 2000); // Throttle to max once per 2 seconds

// Usage in methods
async function updateItem(id: string, changes: Partial<Item>, immediate = false) {
  // Update local state immediately
  const index = items.value.findIndex(item => item.id === id);
  if (index >= 0) {
    items.value[index] = { ...items.value[index], ...changes };
  }
  
  // Persist to database (throttled or immediate)
  if (immediate) {
    // Immediate update
    const { error } = await supabase
      .from("items")
      .update(changes)
      .eq("id", id);
      
    if (error) {
      console.error("Error updating item:", error);
    }
  } else {
    // Throttled update
    throttledUpdate(id, changes);
  }
}
```

## Error Handling Pattern

Consistent error handling across stores:

```typescript
// Standard error handling pattern
async function someOperation() {
  try {
    const { data, error } = await supabase
      .from("table_name")
      .select("*");
      
    if (error) {
      console.error("❌ Operation failed:", error.message);
      // Optional: Show UI notification
      // Optional: Throw for caller to handle
      throw error;
    }
    
    return data;
  } catch (e) {
    console.error("❌ Unexpected error:", e);
    // Optional: Show UI notification
    throw e;
  }
}
```

## Best Practices

1. **Single Responsibility**: Each store should focus on a specific feature or entity
2. **Dependency Clarity**: Make dependencies explicit in JSDoc comments
3. **Re-export Strategy**: Export all stores through feature's index.ts file
4. **Error Handling**: Always handle and log database errors
5. **State Reset**: Always reset state before fetching new data
6. **TypeScript Types**: Use proper TypeScript types for all store state and methods
7. **Initialization**: Use `useUserLoginCallback` for stores that need initialization after login
8. **Documentation**: Document store purpose, dependencies, and database interactions
9. **Reactivity**: Use Vue's reactivity system correctly (ref, computed, etc.)
10. **Throttling**: Use throttling for frequent updates to reduce database load