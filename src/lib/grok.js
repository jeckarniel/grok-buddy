const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY

export async function sendToGrok(messages, onChunk) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'grok-3',
      messages: [
        {
          role: 'system',
          content: `You are Grok Buddy, an elite full-stack coding assistant powered by Grok. You can:
- Write complete, production-ready code for any stack (React, Vue, Node, Python, Go, Rust, etc.)
- Build full applications from scratch with no limits
- Debug complex issues and explain root causes clearly
- Design databases, APIs, and system architectures
- Write tests, CI/CD configs, Docker files, and deployment scripts
- Explain concepts at any depth level
Always provide complete, working code. Never truncate. Use markdown code blocks with language tags.`
        },
        ...messages
      ],
      stream: true
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Grok API error')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
    for (const line of lines) {
      const data = line.slice(6)
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        const delta = parsed.choices?.[0]?.delta?.content || ''
        if (delta) {
          fullText += delta
          onChunk(delta, fullText)
        }
      } catch {}
    }
  }
  return fullText
}
