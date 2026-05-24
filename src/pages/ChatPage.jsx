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

export default function ChatPage({ user, onSignOut, theme, onToggleTheme }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('openai/gpt-oss-120b')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const { chats, createChat, updateChatTitle, deleteChat } = useChats(user.id)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
  }

  const handleDeleteChat = async (chatId) => {
    await deleteChat(chatId)
    if (activeChatId === chatId) handleNewChat()
  }

  const handleSend = async (text) => {
    const content = text || input.trim()
    if (!content || loading) return
    setInput('')

    let chatId = activeChatId
    if (!chatId) {
      const chat = await createChat(content.slice(0, 50) || 'New chat')
      chatId = chat.id
      setActiveChatId(chatId)
    }

    const userMsg = { role: 'user', content: content, chat_id: chatId }
    const { data: savedUser } = await supabase.from('messages').insert(userMsg).select().single()
    const displayUserMessage = savedUser || { ...userMsg, id: crypto.randomUUID?.() || Date.now() }
    const newMessages = [...messages, displayUserMessage]
    setMessages(newMessages)

    setLoading(true)
    const assistantMsg = { role: 'assistant', content: '', chat_id: chatId }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const history = [...messages, { role: 'user', content: content }]
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
          <span className="topbar-title">
            <div className={`ai-head-container ${loading ? 'ai-shining' : ''}`} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.85 8.65L22 9.24L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.24L9.15 8.65L12 2Z" fill="#6366f1"/>
                <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.4" />
              </svg>
            </div>
            Vibe AI
          </span>
          <select className="model-select" value={model} onChange={e => setModel(e.target.value)}>
            <option value="openai/gpt-oss-120b">gpt-oss-120b</option>
            <option value="openai/gpt-oss-20b">gpt-oss-20b</option>
            <option value="llama-3.3-70b-versatile">llama-3.3-70b</option>
          </select>
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
              <Message key={msg.id || i} role={msg.role} content={msg.content} />
            ))
          )}
          {loading && messages[messages.length - 1]?.content === '' && (
            <div className="typing-indicator"><span /><span /><span /></div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <div className="input-box">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about code..."
              rows={1}
            />
            <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim() || loading}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
          <p className="input-hint">Shift+Enter for new line / Enter to send</p>
        </div>
      </div>
    </div>
  )
}
