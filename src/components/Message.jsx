import React from 'react'

function formatInlineText(text) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part.replace(/\*\*/g, '')
    })
}

function getCodeCaption(lang) {
  if (!lang) return 'Code example'
  return `Code example in ${lang}`
}

function formatContent(content) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const lines = part.slice(3, -3).split('\n')
      const lang = lines[0].trim()
      const code = lines.slice(1).join('\n')

      return (
        <div key={i} className="code-block-wrap">
          <div className="code-description">{getCodeCaption(lang)}</div>
          <div className="code-block">
            {lang && <div className="code-lang">{lang}</div>}
            <pre><code>{code}</code></pre>
          </div>
        </div>
      )
    }
    return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{formatInlineText(part)}</span>
  })
}

function MessageAvatar({ role }) {
  if (role === 'assistant') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="avatar-icon">
        <path d="M12 2l2.2 5.6L20 10l-5.8 2.4L12 18l-2.2-5.6L4 10l5.8-2.4L12 2z" />
        <circle cx="12" cy="10" r="1.2" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="avatar-icon">
      <path d="M12 12.2a4.2 4.2 0 1 0-4.2-4.2 4.2 4.2 0 0 0 4.2 4.2z" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

export default function Message({ role, content }) {
  return (
    <div className={`message message-${role}`}>
      <div className="message-avatar">
        <MessageAvatar role={role} />
      </div>
      <div className="message-content">
        {role === 'assistant' && <div className="message-label">AI assistant</div>}
        {role === 'user' && <div className="message-label">You</div>}
        {formatContent(content)}
      </div>
    </div>
  )
}
