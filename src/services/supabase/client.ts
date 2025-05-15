// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const testEmail = 'acidpictures@gmail.com'
const testPassword = '1234567890'
const chatId = 'c7e0948f-a00f-4835-a3d5-5297d1cd12f4'

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseKey, {
//   auth: {
//     persistSession: false
//   }
// })

// async function createPublicChat(name: string) {
//   const { data, error } = await supabase
//     .from('chats')
//     .insert({ name, is_public: true, is_group: true })
//     .select()
//     .single()

//   if (error) throw error
//   return data
// }

// export async function main2() {
//   // await signIn()
//   // await signIn2()
//   await new Promise(resolve => setTimeout(resolve, 1000))

//   const { data, error } = await supabase.from('messages').select('*')
//   console.log('messages', data, error)
//   const { data: { session } } = await supabaseAdmin.auth.getSession()

//   const channel2 = supabaseAdmin
//     .channel('chat-messages2')
//     .on(
//       'postgres_changes',
//       {
//         event: 'INSERT',
//         schema: 'public',
//         table: 'messages',
//         filter: `chat_id=eq.${chatId}`
//       },
//       (payload) => {
//         console.log('📩 New message:2', payload.new)
//       }
//     )
//     .subscribe((status) => {
//       if (status === 'SUBSCRIBED') {
//         console.log(`🔔 Subscribed 2 to new messages in chat ${chatId}`)
//       }
//     })

//   const channel = supabase
//     .channel('chat-messages')
//     .on(
//       'postgres_changes',
//       {
//         event: 'INSERT',
//         schema: 'public',
//         table: 'messages',
//         filter: `chat_id=eq.${chatId}`
//       },
//       (payload) => {
//         console.log('📩 New message:', payload.new)
//       }
//     )
//     .subscribe((status) => {
//       if (status === 'SUBSCRIBED') {
//         console.log(`🔔 Subscribed to new messages in chat ${chatId}`)
//       }
//     })

//   const user = (await supabaseAdmin.auth.getUser()).data.user

//   setTimeout(async () => {
//     // send message
//     await supabaseAdmin
//       .from('messages')
//       .insert({ chat_id: chatId, content: 'helloXXXX', sender_id: user.id })
//   }, 1000)
//   await test()
// }
// const test = async () => {
//   const {
//     data: user,
//     error: userError
//   } = await supabase.auth.getUser()
//   console.log('user', user, userError)
//   const { data, error } = await supabase.from('chats').select('*')
//   console.log('chats', data, error)
//   // const chat = await createPublicChat('test')
//   // console.log('chat', chat)
//   await sendMessageAuthed(chatId, 'Hello2')
//   // await signIn()
//   // await sendMessageAuthed('1', 'Hello')
// }

// async function sendMessageAuthed(chatId: string, content: string) {
//   const user = (await supabase.auth.getUser()).data.user
//   if (!user) throw new Error('Not logged in')

//   const { error } = await supabase.from('messages').insert({
//     chat_id: chatId,
//     content
//   })

//   if (error) throw error
//   console.log('Message sent')
// }

// async function signUp() {
//   const { data, error } = await supabase.auth.signUp({
//     email: testEmail,
//     password: testPassword
//   })

//   if (error) throw error
//   console.log('Signed up', data)
// }

// async function signIn() {
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email: testEmail,
//     password: testPassword
//   })

//   if (error) throw error
//   console.log('Signed in', data)
// }

// async function signIn2() {
//   const { data, error } = await supabaseAdmin.auth.signInWithPassword({
//     email: 'daseincore@gmail.com',
//     password: '1234567890'
//   })

//   if (error) throw error
//   console.log('Signed in2', data)
// }

// async function subscribeToBroadcastMessages() {
//   supabase
//     .channel('broadcast-sub')
//     .on(
//       'postgres_changes',
//       {
//         event: 'INSERT',
//         schema: 'public',
//         table: 'broadcast_messages'
//       },
//       (payload) => {
//         console.log('📩 New broadcast message:', payload.new)
//       }
//     )
//     .subscribe((status) => {
//       if (status === 'SUBSCRIBED') {
//         console.log('✅ Subscribed to broadcast_messages')
//       }
//     })
// }

// async function sendBroadcastMessage(content: string) {
//   const { error } = await supabaseAdmin
//     .from('broadcast_messages')
//     .insert({ content })

//   if (error) throw error
//   console.log('📤 Message sent:', content)
// }

// async function main() {
//   await signIn2()
//   await signIn()

//   // await subscribeToBroadcastMessages()
//   const channel = supabase
//     .channel('chat-messages')
//     .on(
//       'postgres_changes',
//       {
//         event: 'INSERT',
//         schema: 'public',
//         table: 'messages',
//         filter: `chat_id=eq.${chatId}`
//       },
//       (payload) => {
//         console.log('📩 New message:', payload.new)
//       }
//     )
//     .subscribe((status) => {
//       if (status === 'SUBSCRIBED') {
//         console.log(`🔔 Subscribed to new messages in chat ${chatId}`)
//       }
//     })
//   // // Delay before sending a message so the subscription is active
//   // setTimeout(async () => {
//   //   await sendBroadcastMessage('Hello everyone! 👋')
//   // }, 1000)
// }

// main().catch(console.error)
