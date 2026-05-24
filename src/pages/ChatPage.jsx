import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Message from '../components/Message'
import { useChats } from '../hooks/useChats'
import { supabase } from '../lib/supabase'
import { sendToGrok } from '../lib/grok'

const SUGGESTION_POOL = [
  'Build a REST API with Node.js and Express',
  'Create a React component with hooks',
  'Write a Python web scraper',
  'Set up a PostgreSQL database schema',
  'Implement an authentication system using JWT',
  'Design a responsive landing page with Tailwind CSS',
  'Configure a Docker container for a Node application',
  'Optimize SQL queries for better performance',
  'Create a real-time chat with Socket.io',
  'Build a mobile app with React Native',
  'Write unit tests using Jest and React Testing Library',
  'Deploy a full-stack app to Vercel and Supabase',
  'Explore GraphQL with Apollo Client',
]

export default function ChatPage({ user, onSignOut, theme, onToggleTheme }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('openai/gpt-oss-120b')
  const [displaySuggestions, setDisplaySuggestions] = useState(SUGGESTION_POOL.slice(0, 4))
  const [isFading, setIsFading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const { chats, createChat, updateChatTitle, deleteChat } = useChats(user.id)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handles the random rotation of suggestions every 5 seconds
  useEffect(() => {
    if (messages.length > 0) return;

    const interval = setInterval(() => {
      setIsFading(true); // Trigger fade out
      
      setTimeout(() => {
        const shuffled = [...SUGGESTION_POOL].sort(() => 0.5 - Math.random());
        setDisplaySuggestions(shuffled.slice(0, 4));
        setIsFading(false); // Trigger fade in
      }, 500); // Duration should match CSS transition
      
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

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
    if (textareaRef.current) textareaRef.current.style.height = 'inherit';

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

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

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
            Vibe AI
          </span>
        </div>

        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon">V</div>
              <h2>What can I help you build?</h2>
              <p>Your full-stack AI coding assistant, powered by Groq</p>
              <div className="suggestions">
                {displaySuggestions.map((s, i) => (
                  <button 
                    key={s} 
                    className={`suggestion-chip ${isFading ? 'fading' : ''}`} 
                    onClick={() => handleSend(s)}
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    {s}
                  </button>
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
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about code..."
              rows={1}
            />
            <div className="model-selector-pill">
              <button className="model-pill-btn" type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
                <span>{model === 'openai/gpt-oss-120b' ? 'GPT(Elite)' : model === 'openai/gpt-oss-20b' ? 'GPT(Fast)' : 'Llama(Versatile)'}</span>
              </button>
              <select className="model-select-hidden" value={model} onChange={e => setModel(e.target.value)}>
                <option value="openai/gpt-oss-120b">GPT(Elite)</option>
                <option value="openai/gpt-oss-20b">GPT(Fast)</option>
                <option value="llama-3.3-70b-versatile">Llama(Versatile)</option>
              </select>
            </div>
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
