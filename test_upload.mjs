import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Key:", supabaseKey?.substring(0, 10) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const file = new Blob(['Hello, world!'], { type: 'text/plain' })
  try {
    console.log("Starting upload...")
    const { data, error } = await supabase.storage.from('documents').upload('test.txt', file, { upsert: true })
    console.log('Data:', data)
    console.log('Error:', error)
  } catch (e) {
    console.error('Catch error:', e)
  }
}
test()
