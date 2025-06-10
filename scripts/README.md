# Dialog and Message Migration Script

This script fetches all dialogs and messages from the Supabase database using a service account with full access permissions.

## Setup

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration for Service Account Access
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important:** Use the `SERVICE_ROLE_KEY` (not the anon key) to bypass Row Level Security (RLS) policies and access all data.

### 2. Install Dependencies

Make sure you have all required dependencies installed:

```bash
npm install
# or
pnpm install
```

## Usage

### Fetch All Dialogs and Messages

```bash
npx ts-node scripts/migrate_messages_tree.ts all
```

This will fetch all dialogs, messages, message contents, and stored items (attachments) from the entire database.

### Fetch by Workspace

```bash
npx ts-node scripts/migrate_messages_tree.ts workspace <workspace-id>
```

Example:
```bash
npx ts-node scripts/migrate_messages_tree.ts workspace 123e4567-e89b-12d3-a456-426614174000
```

### Fetch by User

```bash
npx ts-node scripts/migrate_messages_tree.ts user <user-id>
```

Example:
```bash
npx ts-node scripts/migrate_messages_tree.ts user user_abc123
```

## Output

The script will create an `output/` directory in your project root and save the data as JSON files:

- `all_dialogs_and_messages.json` - All dialogs (when using `all` command)
- `workspace_<id>_dialogs.json` - Workspace-specific dialogs
- `user_<id>_dialogs.json` - User-specific dialogs

## Data Structure

The script outputs a complete hierarchical structure:

```typescript
type DialogWithMessages = {
  id: string
  name: string
  created_at: string
  user_id: string
  workspace_id: string
  assistant_id: string | null
  input_vars: any
  model_override: any | null
  msg_route: number[]
  msg_tree: any
  messages: DialogMessageWithContent[]
}

type DialogMessageWithContent = {
  id: string
  dialog_id: string
  parent_id: string | null
  type: string
  status: string
  model_name: string | null
  assistant_id: string | null
  error: string | null
  usage: any | null
  warnings: any | null
  is_active: boolean | null
  generating_session: string | null
  workspace_id: string | null
  contents: MessageContent[]
  stored_items: StoredItem[]
}

type MessageContent = {
  id: string
  message_id: string
  type: string
  text: string | null
  reasoning: string | null
  plugin_id: string | null
  name: string | null
  args: any | null
  result: any | null
  status: string | null
  error: string | null
}

type StoredItem = {
  id: string
  dialog_id: string
  message_content_id: string
  type: string
  name: string | null
  mime_type: string | null
  file_url: string | null
  content_text: string | null
}
```

## Features

- **Service Account Access**: Uses Supabase service role key to bypass authentication and RLS
- **Complete Data Retrieval**: Fetches dialogs, messages, contents, and attachments
- **Hierarchical Structure**: Organizes data in a nested, easy-to-process format
- **Filtering Options**: Fetch all data, or filter by workspace/user
- **Progress Indicators**: Shows detailed progress and statistics
- **Error Handling**: Comprehensive error handling with clear messages
- **Export to JSON**: Saves data in structured JSON format for easy processing

## Database Tables Accessed

The script reads from these Supabase tables:

- `dialogs` - Main dialog records
- `dialog_messages` - Individual messages within dialogs
- `message_contents` - Content of each message (text, tool calls, etc.)
- `stored_items` - File attachments and stored content

## Performance Notes

- The script uses efficient batch queries to minimize database calls
- Uses `Map` objects for fast data grouping and lookup
- Processes data in memory, so ensure adequate RAM for large datasets
- For very large datasets, consider implementing pagination

## Troubleshooting

### Missing Environment Variables
```
❌ Missing required environment variables:
- SUPABASE_URL: false
- SUPABASE_SERVICE_ROLE_KEY: false
```

Make sure your `.env` file is properly configured with valid Supabase credentials.

### Connection Issues
Verify that:
1. Your Supabase URL is correct
2. Your service role key has the correct permissions
3. Your network allows connections to your Supabase instance

### Permission Errors
The script requires the `SERVICE_ROLE_KEY` (not the anon key) to bypass RLS policies and access all data regardless of user permissions.
