import React, { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(current => current === 'dark' ? 'light' : 'dark')
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner">V</div>
    </div>
  )

  if (!user) return <LoginPage onLogin={signInWithGoogle} />

  return (
    <ChatPage
      user={user}
      onSignOut={signOut}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  )
}
