import React from 'react'

export default function Sidebar({
  user,
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onClose,
  isMobile,
  theme,
  onToggleTheme,
  onSignOut
}) {
  const avatar = user?.user_metadata?.avatar_url
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0]
  const email = user?.email

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div>
          <div className="sidebar-logo"><span className="brand-mark">V</span> Vibe AI</div>
          <div className="creator-name">Greggy Company</div>
        </div>
        {isMobile && <button className="close-btn" onClick={onClose} aria-label="Close menu">x</button>}
      </div>

      <div className="sidebar-actions">
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <span>+</span> New chat
      </button>

      <div className="chats-list">
        <div className="chats-label">Recent</div>
        {chats.length === 0 && <div className="no-chats">No chats yet</div>}
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
            onClick={() => { onSelectChat(chat.id); if (isMobile) onClose() }}
          >
            <span className="chat-item-title">{chat.title}</span>
            <button className="chat-delete" onClick={e => { e.stopPropagation(); onDeleteChat(chat.id) }}>x</button>
          </div>
        ))}
      </div>

      <div className="sidebar-user">
        {avatar
          ? <img src={avatar} alt={name} className="user-avatar" />
          : <div className="user-avatar-placeholder">{name?.[0]?.toUpperCase()}</div>
        }
        <div className="user-info">
          <div className="user-name">{name}</div>
          <div className="user-email">{email}</div>
        </div>
        <button className="logout-sidebar-btn-small" onClick={onSignOut} title="Sign out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
