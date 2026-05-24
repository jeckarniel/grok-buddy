import React from 'react'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner">⚡</div>
    </div>
  )

  if (!user) return <LoginPage onLogin={signInWithGoogle} />

  return <ChatPage user={user} onSignOut={signOut} />
}
