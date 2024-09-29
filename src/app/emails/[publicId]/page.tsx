import { createClient } from '@/utils/supabase/server'
import V1EmailClient from './v1-email-client'
import { Message } from '@/app/api/ai'

async function getChat(chatPublicId: string) {
  'use server'
  const supabase = createClient()
  const { data, error } = await supabase
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
    .single()

  if (error) {
    console.error('Error fetching chat and messages:', error)
    return { data: null, error }
  }

  if (!data || !data.messages || data.messages.length === 0) {
    return { data: null, error: new Error('No messages found for this chat') }
  }

  return { data, error }
}

export default async function Page({ params }: { params: { publicId: string } }) {
  const { data, error } = await getChat(params.publicId)

  if (error) {
    return <div>Error fetching chat</div>
  }

  if (!data) {
    return <div>No messages found for this chat</div>
  }

  const conversations: Message[] = data.messages.map((message) => ({
    role: message.is_user_message ? 'user' : 'assistant',
    content: message.content,
  }))

  return <V1EmailClient initialConversation={conversations} chatId={data.id} />
}
