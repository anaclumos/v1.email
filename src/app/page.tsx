import { GitHub } from '@/components/icons/github'
import { createClient } from '@/utils/supabase/server'
import { signInWithGitHub } from '@/app/sign-in/action'
import { Input } from '@/components/ui/input'
import { redirect } from 'next/navigation'
import { SubmitButton } from '@/components/submit'
import { WandSparkles } from 'lucide-react'

const createChat = async (formData: FormData) => {
  'use server'
  const supabase = await createClient()
  const prompt = formData.get('prompt')
  const { data: client } = await supabase.auth.getUser()
  if (!client || !client.user) {
    throw new Error('Client not authenticated')
  }

  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .insert({ owned_by: client.user.id, is_public: false })
    .select()
    .single()

  if (chatError) {
    console.error('Error creating chat:', chatError)
    throw new Error('Failed to create chat')
  }

  const { error: messageError } = await supabase.from('messages').insert({
    chat_id: chat.id,
    sent_by: client.user!.id,
    content: prompt as string,
    is_user_message: true,
  })

  if (messageError) {
    console.error('Error creating message:', messageError)
    await supabase.from('chats').delete().match({ id: chat.id })
    throw new Error('Failed to create message')
  }

  redirect(`/emails/${chat.public_id}`)
}

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const signedIn = Boolean(user)
  return (
    <>
      <div className="m-16 mx-auto gap-2 text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight">
          What kind of email template do you want to create?
        </h1>
      </div>
      {signedIn ? (
        <form action={createChat} className="mx-auto flex w-full max-w-lg flex-col gap-2">
          <Input placeholder="A user sign-up welcome email..." name="prompt" required className="w-full" />
          <SubmitButton>
            <WandSparkles className="size-4" />
            Imagine
          </SubmitButton>
        </form>
      ) : (
        <form action={signInWithGitHub} className="mx-auto flex w-full max-w-lg flex-col gap-2">
          <Input placeholder="A user sign-up welcome email..." disabled />
          <SubmitButton>
            <GitHub className="size-4" />
            Sign in with GitHub
          </SubmitButton>
        </form>
      )}
    </>
  )
}
