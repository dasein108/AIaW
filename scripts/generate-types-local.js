import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Настройки подключения к локальной базе
const DB_USER = process.env.PGUSER || 'postgres'
const DB_PASSWORD = process.env.PGPASSWORD || 'postgres'
const DB_HOST = 'localhost'
const DB_PORT = 54321
const DB_NAME = process.env.PGDATABASE || 'postgres'

const TYPES_FILE_PATH = './src/services/data/supabase/database.types.ts'

console.log('Generating types from local database...')

const dbUrl = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
execSync(`supabase gen types typescript --db-url "${dbUrl}" --schema public > ${TYPES_FILE_PATH}`)

const typesFilePath = path.resolve(TYPES_FILE_PATH)
let content = fs.readFileSync(typesFilePath, 'utf8')

console.log('Applying patch...')

content = content.replace(/export type Json =\s*\|\s*string\s*\|\s*number\s*\|\s*boolean\s*\|\s*null\s*\|\s*{\s*\[key: string\]: Json \| undefined\s*}\s*\|\s*Json\[\]/g,
  'export type Json = Record<string, any> | any[]')

fs.writeFileSync(typesFilePath, content)

console.log('Types generated from local database and Json type patched successfully.')
