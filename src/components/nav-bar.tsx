import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/utils/supabase/server'
import { signInWithGitHub } from '@/app/sign-in/action'
import { signOut } from '@/app/sign-out/action'
import { GitHub } from '@/components/icons/github'
import { UserIcon } from 'lucide-react'
import { Suspense } from 'react'
import { User } from '@supabase/supabase-js'
import { SubmitButton } from './submit'

export function Nav({ user }: { user?: User | null }) {
  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex shrink-0 items-center">
              <span className="text-2xl font-bold text-primary">
                <Link href="/">
                  v1.email <span className="text-xs">alpha</span>
                </Link>
              </span>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative size-8 rounded-full">
                    <Avatar className="size-8">
                      <AvatarImage src={user.user_metadata.avatar_url} alt={user.email} />
                      <AvatarFallback>
                        <UserIcon className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <form action={signOut}>
                    <SubmitButton className="w-full" variant="outline">
                      Sign Out
                    </SubmitButton>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <form action={signInWithGitHub}>
                <SubmitButton>
                  <GitHub className="size-4" />
                  Sign In
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default async function NavBar() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return (
    <Suspense fallback={<Nav user={null} />}>
      <Nav user={user} />
    </Suspense>
  )
}
