export async function sendToGrok(messages, model = 'openai/gpt-oss-120b', onChunk) {
  const response = await fetch('/api/grok', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
      content: `You are Grok Buddy, an elite full-stack coding assistant powered by Groq. You can:
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
    const err = await readJson(response)
    throw new Error(getErrorMessage(err) || `Groq API error (${response.status})`)
  }

  const data = await readJson(response)
  const fullText = data.choices?.[0]?.message?.content || ''
  onChunk(fullText, fullText)
  return fullText
}

async function readJson(response) {
  const text = await response.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return { error: { message: text } }
  }
}

function getErrorMessage(err) {
  if (typeof err?.error === 'string') return err.error
  if (typeof err?.error?.message === 'string') return err.error.message
  if (typeof err?.message === 'string') return err.message
  return ''
}
