import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { chatId } = req.query

  if (req.method === 'GET') {
    const { data: chat } = await supabase.from('chats').select('id').eq('id', chatId).eq('user_id', user.id).single()
    if (!chat) return res.status(403).json({ error: 'Forbidden' })
    const { data, error } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at')
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'POST') {
    const { role, content } = req.body
    const { data: chat } = await supabase.from('chats').select('id').eq('id', chatId).eq('user_id', user.id).single()
    if (!chat) return res.status(403).json({ error: 'Forbidden' })
    const { data, error } = await supabase.from('messages').insert({ chat_id: chatId, role, content }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    // update chat updated_at
    await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId)
    return res.json(data)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
