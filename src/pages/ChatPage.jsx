import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Message from '../components/Message'
import { useChats } from '../hooks/useChats'
import { supabase } from '../lib/supabase'
import { sendToGrok } from '../lib/grok'

const SUGGESTIONS = [
  'Build a REST API with Node.js and Express',
  'Create a React component with hooks',
  'Write a Python web scraper',
  'Set up a PostgreSQL database schema',
]

function createAttachment(file) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`,
    name: file.name,
    type: file.type,
    size: file.size,
    url: URL.createObjectURL(file),
  }
}

function formatAttachmentSummary(attachments) {
  if (!attachments.length) return ''
  const names = attachments.map(file => file.name).join(', ')
  return `

Attachments: ${names}`
}

export default function ChatPage({ user, onSignOut, theme, onToggleTheme }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('openai/gpt-oss-120b')
  const [attachments, setAttachments] = useState([])
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const attachmentsRef = useRef([])

  const { chats, createChat, updateChatTitle, deleteChat } = useChats(user.id)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    attachmentsRef.current = attachments
  }, [attachments])

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach(file => URL.revokeObjectURL(file.url))
    }
  }, [])

  const loadMessages = async (chatId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const handleSelectChat = async (chatId) => {
    setActiveChatId(chatId)
    await loadMessages(chatId)
  }

  const handleNewChat = () => {
    setActiveChatId(null)
    setMessages([])
    setAttachments([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeleteChat = async (chatId) => {
    await deleteChat(chatId)
    if (activeChatId === chatId) handleNewChat()
  }

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setAttachments(prev => [...prev, ...files.map(createAttachment)])
    e.target.value = ''
  }

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const next = prev.filter(file => file.id !== id)
      const removed = prev.find(file => file.id === id)
      if (removed) URL.revokeObjectURL(removed.url)
      return next
    })
  }

  const handleSend = async (text) => {
    const content = text || input.trim()
    if ((!content && attachments.length === 0) || loading) return
    setInput('')

    let chatId = activeChatId
    if (!chatId) {
      const chat = await createChat(content.slice(0, 50) || 'New chat')
      chatId = chat.id
      setActiveChatId(chatId)
    }

    const attachmentSummary = formatAttachmentSummary(attachments)
    const userContent = `${content}${attachmentSummary}`.trim()

    const userMsg = { role: 'user', content: userContent, chat_id: chatId }
    const { data: savedUser } = await supabase.from('messages').insert(userMsg).select().single()
    const displayUserMessage = savedUser || { ...userMsg, id: crypto.randomUUID?.() || Date.now() }
    const newMessages = [...messages, displayUserMessage]
    setMessages(newMessages)

    setLoading(true)
    const assistantMsg = { role: 'assistant', content: '', chat_id: chatId }
    setMessages(prev => [...prev, assistantMsg])

    const uploadedAttachments = attachments
    setAttachments([])
    if (fileInputRef.current) fileInputRef.current.value = ''

    try {
      const history = newMessages.map(m => ({ role: m.role, content: m.content }))
      let fullText = ''
      await sendToGrok(history, model, (_delta, full) => {
        fullText = full
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...assistantMsg, content: full }
          return updated
        })
      })

      const { data: savedAssistant } = await supabase
        .from('messages')
        .insert({ ...assistantMsg, content: fullText })
        .select().single()

      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = savedAssistant
        return updated
      })

      if (newMessages.length === 1) {
        await updateChatTitle(chatId, content.slice(0, 50) || 'New chat')
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { ...assistantMsg, content: `Error: ${err.message}` }
        return updated
      })
    } finally {
      uploadedAttachments.forEach(file => URL.revokeObjectURL(file.url))
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          user={user}
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={() => { handleNewChat(); setSidebarOpen(false) }}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onSignOut={onSignOut}
          onClose={() => setSidebarOpen(false)}
          isMobile={sidebarOpen}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      </div>

      <div className="chat-main">
        <div className="chat-topbar">
          <button className="burger-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
          <span className="topbar-title"><span className="brand-mark">V</span> Vibe AI</span>
          <select className="model-select" value={model} onChange={e => setModel(e.target.value)}>
            <option value="openai/gpt-oss-120b">gpt-oss-120b</option>
            <option value="openai/gpt-oss-20b">gpt-oss-20b</option>
            <option value="llama-3.3-70b-versatile">llama-3.3-70b</option>
          </select>
          <button className="signout-btn" onClick={onSignOut} title="Sign out">Sign out</button>
        </div>

        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon">V</div>
              <h2>What can I help you build?</h2>
              <p>Your full-stack AI coding assistant, powered by Groq</p>
              <div className="suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="suggestion-chip" onClick={() => handleSend(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <Message key={msg.id || i} role={msg.role} content={msg.content} attachments={msg.attachments} />
            ))
          )}
          {loading && messages[messages.length - 1]?.content === '' && (
            <div className="typing-indicator"><span /><span /><span /></div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          {!!attachments.length && (
            <div className="attachment-preview-list">
              {attachments.map(file => (
                <div key={file.id} className="attachment-preview-card">
                  {file.type.startsWith('image/') ? (
                    <img src={file.url} alt={file.name} className="attachment-thumb" />
                  ) : (
                    <div className="attachment-file-icon">File</div>
                  )}
                  <div className="attachment-meta">
                    <div className="attachment-name">{file.name}</div>
                    <div className="attachment-size">{Math.max(1, Math.round(file.size / 1024))} KB</div>
                  </div>
                  <button className="attachment-remove" onClick={() => removeAttachment(file.id)} aria-label={`Remove ${file.name}`}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="input-box">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden-file-input"
              multiple
              onChange={handleFilesChange}
            />
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              type="button"
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Upload files
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about code..."
              rows={1}
            />
            <button className="send-btn" onClick={() => handleSend()} disabled={(!input.trim() && attachments.length === 0) || loading}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
          <p className="input-hint">Shift+Enter for new line / Enter to send</p>
        </div>
      </div>
    </div>
  )
}
