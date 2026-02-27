import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ekcoejynnkyaedfjiqtz.supabase.co'
const supabaseKey = 'dummy'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const file = new Blob(['Hello, world!'], { type: 'text/plain' })
  try {
    const { data, error } = await supabase.storage.from('documents').upload('test.txt', file)
    console.log('Data:', data)
    console.log('Error:', error)
  } catch (e) {
    console.error('Catch error:', e)
  }
}
test()
