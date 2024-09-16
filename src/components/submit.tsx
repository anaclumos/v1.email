'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const SubmitButton = (props: { children: React.ReactNode; className?: string }) => {
  const { pending } = useFormStatus()

  return (
    <Button className={cn('flex items-center justify-center gap-1', props.className)} disabled={pending} type="submit">
      {pending ? <Loader2 className="size-4 animate-spin" /> : props.children}
    </Button>
  )
}

export { SubmitButton }
