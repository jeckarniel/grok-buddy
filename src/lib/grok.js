export async function sendToGrok(messages, onChunk) {
  const response = await fetch('/api/grok', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
      ]
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Grok API error')
  }

  const data = await response.json()
  const fullText = data.choices?.[0]?.message?.content || ''
  onChunk(fullText, fullText)
  return fullText
}