import jwt from 'jsonwebtoken'

const token = process.env.SUPABASE_KEY
const secret = process.env.SUPABASE_JWT_SECRET

try {
  const payload = jwt.verify(token, secret, { algorithms: ['HS256'] })
  console.log('✔️  Signature is valid.')
  console.log('Payload:', payload) // role, sub, aud, exp …
} catch (e) {
  console.error('❌ Invalid token:', e.message)
  process.exit(1)
}
