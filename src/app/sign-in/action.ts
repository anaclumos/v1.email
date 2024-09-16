'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function signInWithGitHub() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: process.env.NEXT_HOST_URL + '/auth/callback',
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url) // use the redirect API for your server framework
  }  

  return { error: 'No URL provided' }
}
