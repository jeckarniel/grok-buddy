module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }

  if (!process.env.GROK_API_KEY) {
    return res.status(500).json({
      error: { message: 'Missing GROK_API_KEY on the server.' }
    })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const messages = Array.isArray(body.messages) ? body.messages : []
    const validMessages = messages
      .filter(message => (
        message &&
        ['system', 'user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.trim()
      ))
      .map(message => ({
        role: message.role,
        content: message.content
      }))

    if (validMessages.length === 0) {
      return res.status(400).json({
        error: { message: 'At least one message is required.' }
      })
    }

    const payload = {
      model: typeof body.model === 'string' && body.model.trim() ? body.model : 'grok-3',
      messages: validMessages,
      stream: false
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROK_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    const text = await response.text()
    let data
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { error: { message: text || 'Grok returned a non-JSON response.' } }
    }

    if (!response.ok) {
      console.error('Grok API error:', response.status, JSON.stringify(data).slice(0, 500))
    }

    return res.status(response.status).json(data)
  } catch (err) {
    console.error('Proxy error:', err)
    return res.status(500).json({
      error: { message: err.message || 'Unexpected proxy error.' }
    })
  }
}
