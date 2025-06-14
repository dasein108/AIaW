import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Run the Supabase type generator normally (change to your project ID and types file path ie.: ./app/types/database.types.ts)
const TYPES_FILE_PATH = './src/services/data/supabase/database.types.ts'
console.log('Generating types...')
execSync(`supabase gen types typescript --project-id "$PROJECT_ID" --schema public  > ${TYPES_FILE_PATH}`)
// Get the path to the output file
const typesFilePath = path.resolve(TYPES_FILE_PATH)

let content = fs.readFileSync(typesFilePath, 'utf8')

console.log('Applying patch...')

// Find the Json type on the generated file and replace it
content = content.replace(/export type Json =\s*\|\s*string\s*\|\s*number\s*\|\s*boolean\s*\|\s*null\s*\|\s*{\s*\[key: string\]: Json \| undefined\s*}\s*\|\s*Json\[\]/g,
  'export type Json = Record<string, any> | any[]') // You can change the type to any other type you want

fs.writeFileSync(typesFilePath, content)

console.log('Types generated and Json type patched successfully.')
