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

export function Nav({ user }: { user?: User | null }) {
  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex shrink-0 items-center">
              <span className="text-2xl font-bold text-primary">
                <Link href="/">v1.email</Link>
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                Home
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Contact
              </Link>
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
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <form action={signOut}>
                      <Button>Sign Out</Button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <form action={signInWithGitHub}>
                <Button className="gap-2">
                  <GitHub className="size-4" />
                  Sign In
                </Button>
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
