'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Message, continueConversation } from '@/app/api/ai'
import { readStreamableValue, StreamableValue } from 'ai/rsc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserIcon, BotIcon, SendIcon, CodeIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'

export type Props = {
  initialConversation: Message[]
  chatId: string
}

const V1EmailClient: React.FC<Props> = ({ initialConversation, chatId }) => {
  const [conversation, setConversation] = useState<Message[]>(initialConversation)
  const [input, setInput] = useState<string>('')
  const [codeContent, setCodeContent] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('preview')
  const { resolvedTheme } = useTheme()
  const handledInitialMessage = useRef(false)

  const streamResponse = useCallback(
    async (messages: Message[], newMessage: StreamableValue<unknown, unknown>) => {
      let textContent = ''
      let codeBlock = ''
      let isInCodeBlock = false

      for await (const delta of readStreamableValue(newMessage)) {
        if (typeof delta === 'string' && delta.startsWith('```') && !isInCodeBlock) {
          isInCodeBlock = true
        } else if (typeof delta === 'string' && delta.includes('```') && isInCodeBlock) {
          isInCodeBlock = false
        }

        if (isInCodeBlock) {
          codeBlock += delta
          setCodeContent(codeBlock)
        } else {
          textContent += delta
        }

        setConversation([...messages, { role: 'assistant', content: textContent }])
      }
    },
    [setCodeContent, setConversation]
  )

  const handleInitialMessage = useCallback(async () => {
    const { messages, newMessage } = await continueConversation({
      history: conversation,
      chatId,
    })

    await streamResponse(messages, newMessage)
  }, [chatId, conversation, streamResponse])

  useEffect(() => {
    if (conversation.length === 1 && conversation[0].role === 'user' && !handledInitialMessage.current) {
      handledInitialMessage.current = true
      handleInitialMessage()
    }
  }, [conversation, handleInitialMessage])

  const handleSend = useCallback(async () => {
    if (input.trim()) {
      const newConversation = [...conversation, { role: 'user', content: input }] as Message[]
      setConversation(newConversation)
      setInput('')
      setCodeContent('')

      const { messages, newMessage } = await continueConversation({
        history: newConversation,
        chatId,
      })

      await streamResponse(messages, newMessage)
    }
  }, [chatId, conversation, input, streamResponse])

  useEffect(() => {
    const lastMessage = conversation[conversation.length - 1]
    if (conversation.length > 1 && lastMessage.role === 'user') {
      handleSend()
    }
  }, [conversation, handleSend])

  const handleShowCode = (messageContent: string) => {
    const codeRegex = /```(?:[\w.-]+)?\s*\n([\s\S]*?)```/g
    const codeBlocks = messageContent.match(codeRegex)

    if (codeBlocks) {
      const cleanedCode = codeBlocks
        .map((block) => block.replace(/```(?:[\w.-]+)?\s*\n/, '').replace(/```$/, ''))
        .join('\n\n')

      setCodeContent(cleanedCode)
      setActiveTab('code')
    }
  }

  const user = resolvedTheme === 'dark' ? `bg-gray-800 text-white` : `bg-gray-200 text-black`
  const bot = resolvedTheme === 'dark' ? `bg-gray-900 text-white` : `bg-gray-300 text-black`

  return (
    <div className="flex flex-col md:flex-row">
      <div className="flex flex-1 flex-col p-4 md:max-w-[50%]">
        <ScrollArea className="flex-1 pr-4">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={cn('flex items-start mb-4', message.role === 'assistant' ? 'flex-row-reverse' : '')}
            >
              <div
                className={cn(
                  `flex size-8 items-center justify-center rounded-full`,
                  message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
                )}
              >
                {message.role === 'user' ? <UserIcon size={16} /> : <BotIcon size={16} />}
              </div>
              <div className={cn('mx-2 p-2 rounded-lg', message.role === 'user' ? user : bot)}>
                {message.content}
                {message.role === 'assistant' && message.content.includes('```') && (
                  <Button onClick={() => handleShowCode(message.content)} className="mt-2">
                    <CodeIcon size={16} className="mr-2" />
                    Show Code
                  </Button>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="mt-4 flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="mr-2 flex-1"
          />
          <Button onClick={handleSend}>
            <SendIcon size={16} />
          </Button>
        </div>
      </div>
      <div className="flex-1 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <div className="rounded-lg bg-background p-4 shadow">
              <h2 className="mb-2 text-lg font-semibold">Code Preview</h2>
              <pre className="rounded p-4">
                <code>{codeContent || 'No code to display'}</code>
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="code">
            <div className="rounded-lg p-4 shadow">
              <h2 className="mb-2 text-lg font-semibold">Full Code</h2>
              <pre className="rounded p-4">
                <code>{codeContent || 'No code to display'}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(V1EmailClient), { ssr: false })
