import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL или SERVICE_ROLE_KEY не найдены в .env.self-hosted')
  process.exit(1)
}

console.log('Тестируем подключение к:', supabaseUrl)
console.log('Используем ключ:', supabaseKey.substring(0, 10) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Простой тест - проверка здоровья API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    })

    console.log('HTTP статус:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      console.log('✅ Базовое подключение к Supabase работает!')
    } else {
      console.log('❌ Ошибка подключения:', response.statusText)
    }
  } catch (error) {
    console.error('❌ Ошибка сети:', error)
  }
}

async function testAuthUsers() {
  console.log('\nТестируем доступ к auth.users...')
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Ошибка auth.users:', error)
  } else {
    console.log('✅ auth.users работает! Данные:', data)
  }
}
// Запускаем тесты
testConnection().catch(console.error)
testAuthUsers().catch(console.error)
