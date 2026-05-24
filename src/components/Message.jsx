import React from 'react'

function formatContent(content) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const lines = part.slice(3, -3).split('\n')
      const lang = lines[0].trim()
      const code = lines.slice(1).join('\n')
      return (
        <div key={i} className="code-block">
          {lang && <div className="code-lang">{lang}</div>}
          <pre><code>{code}</code></pre>
        </div>
      )
    }
    return <span key={i} style={{whiteSpace:'pre-wrap'}}>{part}</span>
  })
}

export default function Message({ role, content }) {
  return (
    <div className={`message message-${role}`}>
      <div className="message-avatar">
        {role === 'assistant' ? '⚡' : '👤'}
      </div>
      <div className="message-content">
        {formatContent(content)}
      </div>
    </div>
  )
}
