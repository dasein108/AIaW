// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const testEmail = 'acidpictures@gmail.com'
const testPassword = '1234567890'
const chatId = 'c7e0948f-a00f-4835-a3d5-5297d1cd12f4'

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export async function main(workspaceId: string) {
  // Get the current session/user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.error('Error getting user:', userError)
    return
  }
  if (!user) {
    console.error('No user logged in')
    return
  }
  console.log('user.id', user.id)
  // Query the workspace_members table
  const { data, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('role', 'admin')

  console.log('workspace_members', data, error)

  const { data: workspaceData, error: workspaceError } = await supabase
    .from('workspaces')
    .select('id, owner_id')
    .eq('id', workspaceId)

  console.log('workspaces', workspaceData, workspaceError)
}
