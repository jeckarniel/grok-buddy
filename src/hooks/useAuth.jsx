import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://grok-buddy-h7av9pruv-jeckarniels-projects.vercel.app',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  })
}

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, loading, signInWithGoogle, signOut }
}
