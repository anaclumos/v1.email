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
import dynamic from 'next/dynamic'

export type Props = {
  initialConversation: Message[]
  chatId: string
}

interface Artifact {
  title: string
  content: string
}

const V1EmailClient: React.FC<Props> = ({ initialConversation, chatId }) => {
  const [conversation, setConversation] = useState<Message[]>(initialConversation)
  const [input, setInput] = useState<string>('')
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const [activeTab, setActiveTab] = useState<string>('preview')
  const handledInitialMessageRef = useRef(false)
  const handleSendRef = useRef(false)

  const extractArtifacts = (content: string): Artifact[] => {
    const artifactRegex = /<Artifact title="(.*?)"\s*>([\s\S]*?)<\/Artifact>/g
    const matches = [...content.matchAll(artifactRegex)]
    return matches.map((match) => ({
      title: match[1],
      content: match[2].trim(),
    }))
  }

  const streamResponse = useCallback(
    async (messages: Message[], newMessage: StreamableValue<unknown, unknown>) => {
      let textContent = ''

      for await (const delta of readStreamableValue(newMessage)) {
        textContent += delta

        setConversation([...messages, { role: 'assistant', content: textContent }])

        const extractedArtifacts = extractArtifacts(textContent)
        if (extractedArtifacts.length > 0) {
          setSelectedArtifact(extractedArtifacts[0])
        }
      }
    },
    [setConversation, setSelectedArtifact]
  )

  const handleInitialMessage = useCallback(async () => {
    const { messages, newMessage } = await continueConversation({
      history: conversation,
      chatId,
    })
    await streamResponse(messages, newMessage)
  }, [chatId, conversation, streamResponse])

  useEffect(() => {
    if (conversation.length === 1 && conversation[0].role === 'user' && !handledInitialMessageRef.current) {
      handledInitialMessageRef.current = true
      handleInitialMessage()
    }
    if (conversation.length > 0 && conversation[conversation.length - 1].role === 'assistant') {
      const extractedArtifacts = extractArtifacts(conversation[conversation.length - 1].content)
      if (extractedArtifacts.length > 0) {
        setSelectedArtifact(extractedArtifacts[0])
      }
    }
  }, [conversation, handleInitialMessage])

  const handleSend = useCallback(async () => {
    if (input.trim() && !handleSendRef.current) {
      handleSendRef.current = true
      const newConversation = [...conversation, { role: 'user', content: input }] as Message[]
      setConversation(newConversation)
      setInput('')

      const { messages, newMessage } = await continueConversation({
        history: newConversation,
        chatId,
      })

      await streamResponse(messages, newMessage)
      handleSendRef.current = false
    }
  }, [chatId, conversation, input, streamResponse])

  useEffect(() => {
    const lastMessage = conversation[conversation.length - 1]
    if (conversation.length > 1 && lastMessage.role === 'user' && !handleSendRef.current) {
      handleSend()
    }
  }, [conversation, handleSend])

  const handleShowArtifact = (artifact: Artifact) => {
    setSelectedArtifact(artifact)
    setActiveTab('code')
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="flex w-1/2 flex-1 flex-col p-4">
        <ScrollArea className="flex-1 pr-4">
          {conversation.map((message, index) => (
            <div key={index} className={cn('flex items-start mb-4')}>
              <div
                className={cn(
                  `flex size-8 items-center justify-center rounded-full`,
                  message.role === 'user'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-primary text-primary-foreground'
                )}
              >
                {message.role === 'user' ? <UserIcon size={16} /> : <BotIcon size={16} />}
              </div>
              <div className={cn('mx-2 p-2 rounded-lg bg-secondary text-secondary-foreground')}>
                {message.role === 'assistant' && extractArtifacts(message.content).length > 0 ? (
                  <div>
                    {extractArtifacts(message.content).map((artifact, i) => (
                      <Button
                        key={i}
                        onClick={() => handleShowArtifact(artifact)}
                        variant="outline"
                        className="mr-2 mt-2"
                      >
                        <CodeIcon size={16} className="mr-2" />
                        {artifact.title}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div>{message.content}</div>
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <h2 className="mb-2 text-lg font-semibold">Artifacts Preview</h2>
            <pre className="rounded bg-secondary p-4 text-secondary-foreground">
              <code>{selectedArtifact ? selectedArtifact.content : 'No code to display'}</code>
            </pre>
          </TabsContent>
          <TabsContent value="code">
            <h2 className="mb-2 text-lg font-semibold">{selectedArtifact ? selectedArtifact.title : 'Full Code'}</h2>
            <pre className="rounded bg-secondary p-4 text-secondary-foreground">
              <code>{selectedArtifact ? selectedArtifact.content : 'No code to display'}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(V1EmailClient), { ssr: false })
