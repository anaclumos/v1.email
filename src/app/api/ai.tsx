'use server'

import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createStreamableValue } from 'ai/rsc'
import { createClient } from '@/utils/supabase/server'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function continueConversation({ history, chatId }: { history: Message[]; chatId: string }) {
  'use server'
  const supabase = createClient()
  const stream = createStreamableValue('')
  const file = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/prompt/generate-email.md`).then((res) => res.text())

  const { data: client } = await supabase.auth.getUser()

  if (!client || !client.user) {
    throw new Error('Client not authenticated')
  }

  const { data: existingMessage, error: checkError } = await supabase
    .from('messages')
    .select()
    .eq('chat_id', chatId)
    .eq('content', history[history.length - 1].content)
    .eq('is_user_message', true)
    .eq('sent_by', client?.user?.id)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking for existing message:', checkError)
  }

  if (!existingMessage) {
    const { error: userMessageError } = await supabase.from('messages').insert({
      chat_id: chatId,
      content: history[history.length - 1].content,
      is_user_message: true,
      sent_by: client?.user?.id,
    })

    if (userMessageError) {
      console.error('Error saving user message to Supabase:', userMessageError)
    }
  }

  ;(async () => {
    const { textStream } = await streamText({
      model: openai('gpt-3.5-turbo'),
      system: file,
      messages: history,
    })

    let fullContent = ''

    for await (const text of textStream) {
      fullContent += text
      stream.update(text)
    }

    const databaseData = {
      chat_id: chatId,
      content: fullContent,
      is_user_message: false,
      sent_by: client.user!.id,
    }

    const { error } = await supabase.from('messages').upsert(databaseData)

    if (error) {
      console.error('Error saving message to Supabase:', error)
    }

    stream.done()
  })()

  return {
    messages: history,
    newMessage: stream.value,
  }
}
