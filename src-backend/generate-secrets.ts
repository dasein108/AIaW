import crypto from 'crypto'

import jwt from 'jsonwebtoken'

const ref = "sdb" // замените на ваш реальный ref, если нужно
const secret = crypto.randomBytes(32).toString('hex')
const iat = Math.floor(Date.now() / 1000)
const exp = iat + 60 * 60 * 24 * 365 * 10 // 10 лет

const anon = jwt.sign(
  {
    iss: "supabase",
    ref,
    role: "anon",
    iat,
    exp
  },
  secret,
  { algorithm: 'HS256' }
)

const service = jwt.sign(
  {
    iss: "supabase",
    ref,
    role: "service_role",
    iat,
    exp
  },
  secret,
  { algorithm: 'HS256' }
)

console.log('JWT_SECRET=', secret)
console.log('ANON_KEY=', anon)
console.log('SERVICE_ROLE_KEY=', service)
