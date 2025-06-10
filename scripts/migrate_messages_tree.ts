import * as fs from 'fs'
import * as path from 'path'
import { createClient } from "@supabase/supabase-js"
import { Database } from "../src/services/supabase/database.types"

// Load environment from .env.local
const envPath = path.join(process.cwd(), '.env.local')
console.log(envPath)

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  for (const line of envConfig.split('\n')) {
    const [key, ...valueParts] = line.split('=')

    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()

      if (value && !process.env[key]) {
        process.env[key] = value
      }
    }
  }
}

// Service account configuration
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:')
  console.error('- SUPABASE_URL:', !!SUPABASE_URL)
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_ROLE_KEY)
  process.exit(1)
}

// Create Supabase client with service role key for admin access
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Type definitions
type DialogRecord = Database['public']['Tables']['dialogs']['Row']
type DialogMessageRecord = Database['public']['Tables']['dialog_messages']['Row']

// Global maps to store data
const dialogsMap: Map<string, DialogRecord> = new Map()
const dialogMessagesMap: Map<string, DialogMessageRecord> = new Map()

async function fetchAllDialogs(): Promise<void> {
  console.log('🔍 Fetching all dialogs...')

  const { data: dialogs, error: dialogsError } = await supabase
    .from('dialogs')
    .select('*')
    .order('created_at', { ascending: false })

  if (dialogsError) {
    console.error('❌ Error fetching dialogs:', dialogsError)
    throw dialogsError
  }

  console.log(`✅ Found ${dialogs?.length || 0} dialogs`)

  // Store dialogs in map
  dialogsMap.clear()

  if (dialogs) {
    for (const dialog of dialogs) {
      dialogsMap.set(dialog.id, dialog)
    }
  }
}

async function fetchAllDialogMessages(): Promise<void> {
  console.log('🔍 Fetching all dialog messages...')

  const { data: messages, error: messagesError } = await supabase
    .from('dialog_messages')
    .select('*')
    .order('dialog_id')

  if (messagesError) {
    console.error('❌ Error fetching dialog messages:', messagesError)
    throw messagesError
  }

  console.log(`✅ Found ${messages?.length || 0} dialog messages`)

  // Store messages in map
  dialogMessagesMap.clear()

  if (messages) {
    for (const message of messages) {
      dialogMessagesMap.set(message.id, message)
    }
  }
}

const updateMessage = async(messageId: string, parentId: string | null, isActive: boolean) => {
  const { data: message, error: messageError } = await supabase
    .from('dialog_messages')
    .update({ is_active: isActive, parent_id: parentId })
    .eq('id', messageId)
    .select()
    .single()

  if (messageError) {
    console.error(`❌ Error updating message ${messageId}:`, messageError)
  }

  return message
}

async function migrateDialogMessages(dialog_id: string): Promise<void> {
  const dialog = dialogsMap.get(dialog_id)

  console.log(`🔍 Migrating dialog messages for dialog ${dialog_id} ${dialog?.name}...`)

  const { msg_route, msg_tree } = dialog
  let index = -1
  for (const parentId of Object.keys(msg_tree)) {
    index += 1

    if (parentId === "null") {
      continue
    }

    const activeIndex = msg_route[index]
    const childrenIds = msg_tree[parentId]

    if (childrenIds === undefined) {
      console.error(`❌ Children ids not found for parent ${parentId}`)
      continue
    }

    let childIndex = 0
    for (const childId of childrenIds) {
      await updateMessage(childId, parentId, activeIndex === childIndex)
      childIndex += 1
    }
  }
}

async function migrateDialogs(): Promise<void> {
  console.log('🔍 Migrating dialogs...')

  for (const dialog of dialogsMap.values()) {
    await migrateDialogMessages(dialog.id)
  }
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting dialog and message migration script...')
    console.log(`📡 Supabase URL: ${SUPABASE_URL}`)

    // Fetch all data
    await fetchAllDialogs()
    await fetchAllDialogMessages()
    await migrateDialogs()

    console.log('\n✅ Migration completed successfully!')
    console.log('📊 Data is now available in global maps:')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
