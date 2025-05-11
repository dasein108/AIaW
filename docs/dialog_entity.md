# Dialog Entity: Business Logic and Structure

## Overview
The `Dialog` entity represents a single chat session, supporting not only linear conversations but also branching, forking, and revisiting previous points in the conversation. It is designed to handle complex conversational flows.

---

## Dialog Structure

```ts
interface Dialog {
  id: string
  name: string
  workspaceId: string
  assistantId?: string
  msgTree: Record<string, string[]>
  msgRoute: number[]
  inputVars: Record<string, PromptVarValue>
  modelOverride?: Model
}
```

### Field Explanations
- **id**: Unique identifier for the dialog (chat session).
- **name**: Human-readable name for the dialog.
- **workspaceId**: The workspace this dialog belongs to.
- **assistantId**: (Optional) The assistant (bot) used in this dialog.
- **msgTree**: `Record<string, string[]>` — A tree structure mapping message IDs to arrays of child message IDs.
- **msgRoute**: `number[]` — An array representing the current path (route) through the message tree.
- **inputVars**: Variables used for prompt customization.
- **modelOverride**: (Optional) Model settings specific to this dialog.

---

## Key Concepts

### `$root`
- The root message ID; start of the conversation tree.
- All message trees start from `$root`.

### msgTree
- Tree structure:
  - **Key**: message ID (e.g., `$root`, `msg1`, `msg2`)
  - **Value**: array of child message IDs
- Example:
  ```json
  {
    "$root": ["msg1"],
    "msg1": ["msg2", "msg3"],
    "msg2": [],
    "msg3": []
  }
  ```

### msgRoute
- Array of indices representing the path from root to the current message.
- Example: `msgRoute = [0, 1]` means: from `$root` take the 0th child (`msg1`), then from `msg1` take the 1st child (`msg3`).

### Chain
- The sequence of message IDs from root to the current message, constructed by following `msgRoute` through the tree.

---

## Business Logic (BL)

### Creating a Dialog
- Initialize with a root message (e.g., `$root`).
- `msgTree = { "$root": [] }`
- `msgRoute = []` (points to root)

### Adding a Message
1. Find the current node using `msgRoute`.
2. Generate a new message ID.
3. Add the new ID to the children array in `msgTree` for the current node.
4. Update `msgRoute` to point to the new child.

### Branching
- If a user replies to an earlier message (not the latest), a new branch is created in `msgTree` under that message.
- `msgRoute` is updated to reflect the new path.

### Traversing
- To reconstruct the current conversation, follow `msgRoute` from the root, collecting messages along the way.

### Forking
- You can "fork" a dialog at any message, creating a new branch (alternate history).

---

## Example: Building and Using msgTree

1. **Start**:
   - `msgTree = { "$root": [] }`
   - `msgRoute = []`
2. **User sends "Hello"**:
   - New ID: `msg1`
   - `msgTree = { "$root": ["msg1"], "msg1": [] }`
   - `msgRoute = [0]`
3. **Assistant replies**:
   - New ID: `msg2`
   - `msgTree = { "$root": ["msg1"], "msg1": ["msg2"], "msg2": [] }`
   - `msgRoute = [0, 0]`
4. **User goes back to "Hello" and sends a different message**:
   - New ID: `msg3`
   - `msgTree = { "$root": ["msg1"], "msg1": ["msg2", "msg3"], "msg2": [], "msg3": [] }`
   - `msgRoute = [0, 1]`

---

## Operations

### Add a Message
```js
function addMessage(msgTree, msgRoute, newMsgId) {
  let node = "$root";
  for (let idx of msgRoute) {
    node = msgTree[node][idx];
  }
  msgTree[node].push(newMsgId);
  msgTree[newMsgId] = [];
  msgRoute.push(msgTree[node].length - 1);
}
```

### Traverse the Current Chain
```js
function getCurrentChain(msgTree, msgRoute) {
  let chain = [];
  let node = "$root";
  for (let idx of msgRoute) {
    let children = msgTree[node];
    if (!children || idx >= children.length) break;
    node = children[idx];
    chain.push(node);
  }
  return chain;
}
```

### Fork/Branch
- To fork, copy the current `msgRoute` up to the desired point, then add a new child at that node.

---

## Summary Table

| Concept   | Meaning/Usage                                                                 |
|-----------|-------------------------------------------------------------------------------|
| `$root`   | The root message ID; start of the conversation tree.                          |
| msgTree   | Tree structure mapping message IDs to their children (branches).              |
| msgRoute  | Array of indices representing the path from root to the current message.      |
| chain     | The sequence of message IDs from root to the current message (via msgRoute).  |
| Branching | Creating alternate conversation paths by replying to earlier messages.        |
| Forking   | Creating a new dialog or branch from any point in the conversation.           |

---

## Practical Tips
- Always keep `msgTree` and `msgRoute` in sync.
- To display the current conversation, reconstruct the chain using `msgRoute`.
- To support branching, allow users to select any previous message and reply, updating `msgTree` and `msgRoute` accordingly.
- To support history/forking, allow users to view and switch between different branches.
