'use client'

import { useEffect, useState } from 'react'
import { Message, continueConversation } from '@/app/api/ai'
import { readStreamableValue } from 'ai/rsc'

export type Props = {
  initialConversation: Message[]
  chatId: string
}

export const V1EmailClient = ({ initialConversation, chatId }: Props) => {
  const [conversation, setConversation] = useState<Message[]>(initialConversation)
  const [input, setInput] = useState<string>('')

  useEffect(() => {
    if (conversation.length === 1 && conversation[0].role === 'user') {
      continueConversation({ history: conversation, chatId: chatId }).then(async ({ messages, newMessage }) => {
        let textContent = ''
        for await (const delta of readStreamableValue(newMessage)) {
          textContent = `${textContent}${delta}`
          setConversation([...messages, { role: 'assistant', content: textContent }])
        }
      })
    }
  }, [conversation, chatId])

  return (
    <div>
      <div>
        {conversation.map((message, index) => (
          <div key={index}>
            {message.role}: {message.content}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value)
          }}
        />
        <button
          onClick={async () => {
            const { messages, newMessage } = await continueConversation({
              history: [...conversation, { role: 'user', content: input }],
              chatId,
            })

            let textContent = ''

            for await (const delta of readStreamableValue(newMessage)) {
              textContent = `${textContent}${delta}`
              setConversation([...messages, { role: 'assistant', content: textContent }])
            }
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  )
}
