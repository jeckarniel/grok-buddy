import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useChats(userId) {
  const [chats, setChats] = useState([])

  useEffect(() => {
    if (!userId) return
    fetchChats()
  }, [userId])

  const fetchChats = async () => {
    const { data } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false })
    if (data) setChats(data)
  }

  const createChat = async (title = 'New chat') => {
    const { data } = await supabase
      .from('chats')
      .insert({ user_id: userId, title })
      .select()
      .single()
    if (data) {
      setChats(prev => [data, ...prev])
      return data
    }
  }

  const updateChatTitle = async (chatId, title) => {
    await supabase
      .from('chats')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', chatId)
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, title } : c))
  }

  const deleteChat = async (chatId) => {
    await supabase.from('chats').delete().eq('id', chatId)
    setChats(prev => prev.filter(c => c.id !== chatId))
  }

  return { chats, createChat, updateChatTitle, deleteChat, refreshChats: fetchChats }
}
