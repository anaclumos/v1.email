'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Message, continueConversation } from '@/app/api/ai'
import { readStreamableValue, StreamableValue } from 'ai/rsc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SendIcon, CodeIcon, CopyIcon, CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'

import { JetBrains_Mono as FontMono } from 'next/font/google'

const fontMono = FontMono({
  weight: '400',
  subsets: ['latin'],
})

export type Props = {
  initialConversation: Message[]
  chatId: string
}
interface Artifact {
  title: string
  content: string
  language?: string
}

const V1EmailClient: React.FC<Props> = ({ initialConversation, chatId }) => {
  const [conversation, setConversation] = useState<Message[]>(initialConversation)
  const [input, setInput] = useState<string>('')
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const [activeTab, setActiveTab] = useState<string>('preview')
  const [isCopied, setIsCopied] = useState(false)
  const handledInitialMessageRef = useRef(false)
  const handleSendRef = useRef(false)

  const extractArtifacts = (content: string): Artifact[] => {
    const artifactRegex = /<Artifact title="(.*?)"(?:\s+language="(.*?)")?\s*>([\s\S]*?)<\/Artifact>/g
    const matches = [...content.matchAll(artifactRegex)]
    return matches.map((match) => ({
      title: match[1],
      language: match[2] || 'typescript',
      content: match[3].trim(),
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

  const handleCopyCode = () => {
    if (selectedArtifact) {
      navigator.clipboard.writeText(selectedArtifact.content).then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
    }
  }

  return (
    <div className="flex h-[calc(100vh-4.25rem)] flex-col overflow-hidden md:flex-row">
      <div className="flex size-full flex-col p-4 md:w-1/2">
        <ScrollArea className="grow">
          {conversation.map((message, index) => (
            <div key={index} className={cn('flex items-start mb-4')}>
              {message.role === 'user' ? (
                <div className={cn('p-2 rounded-lg bg-secondary text-secondary-foreground')}>
                  <div>{message.content}</div>
                </div>
              ) : message.role === 'assistant' && extractArtifacts(message.content).length > 0 ? (
                <div>
                  {extractArtifacts(message.content).map((artifact, i) => (
                    <Button key={i} onClick={() => handleShowArtifact(artifact)} variant="outline">
                      <CodeIcon size={16} className="mr-2" />
                      {artifact.title}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className={fontMono.className}>{message.content}</div>
              )}
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
      <div className="flex size-full flex-col p-4 md:w-1/2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="grow overflow-scroll">
            <ScrollArea className="h-full">Work in progress...</ScrollArea>
          </TabsContent>
          <TabsContent value="code" className="grow overflow-scroll">
            <ScrollArea className="h-full rounded">
              <Button
                onClick={handleCopyCode}
                className="absolute right-2 top-2 z-10 gap-2"
                variant="outline"
                size="sm"
              >
                {isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                {isCopied ? 'Copied!' : 'Copy'}
              </Button>
              <div className="relative">
                <SyntaxHighlighter
                  language={selectedArtifact?.language || 'typescript'}
                  style={vscDarkPlus}
                  customStyle={{
                    padding: '1rem',
                    borderRadius: '0.25rem',
                    fontSize: '1rem',
                    margin: 0,
                  }}
                >
                  {selectedArtifact ? selectedArtifact.content : 'No code to display'}
                </SyntaxHighlighter>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(V1EmailClient), { ssr: false })
