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

      <div className="sidebar-controls">
        <button className="new-chat-icon-btn" onClick={onNewChat} title="New chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button className="theme-toggle-icon-btn" onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </div>

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
