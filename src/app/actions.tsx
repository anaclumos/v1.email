'use server'

import { createClient } from '@/utils/supabase/server'
import { openai } from '@ai-sdk/openai'
import { streamUI } from 'ai/rsc'

export async function streamComponent(chatPublicId: string) {
  const supabase = await createClient()
  const { data: chat, error } = await supabase
    .from('chats')
    .select(
      `
      id,
      public_id,
      owned_by,
      is_public,
      created_at,
      deleted_at,
      messages (
        id,
        public_id,
        chat_id,
        sent_by,
        parent_message_id,
        content,
        is_user_message,
        created_at,
        deleted_at,
        branch_number
      )
    `
    )
    .eq('public_id', chatPublicId)
    .order('created_at', { foreignTable: 'messages', ascending: true })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching chat and messages:', error)
    return []
  }

  if (!chat || !chat.messages || chat.messages.length === 0) {
    console.error('No messages found for this chat')
    return []
  }

  const result = await streamUI({
    model: openai('gpt-4'),
    prompt: chat.messages[0].content,
    text: ({ content }) => <div>{content}</div>,
  })

  return result.value
}
