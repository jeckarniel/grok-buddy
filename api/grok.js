export const config = { api: { bodyParser: true } }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const payload = { ...body, stream: false }

    console.log('Sending to Grok, model:', payload.model)
    console.log('GROK_API_KEY set:', !!process.env.GROK_API_KEY)

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    console.log('Grok status:', response.status)
    console.log('Grok response:', JSON.stringify(data).slice(0, 300))
    return res.status(response.status).json(data)
  } catch (err) {
    console.error('Proxy error:', err.message)
    return res.status(500).json({ error: { message: err.message } })
  }
}