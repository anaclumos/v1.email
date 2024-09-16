'use client'

import { useFormStatus } from 'react-dom'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const SubmitButton = (props: { children: React.ReactNode; className?: string; variant?: ButtonProps['variant'] }) => {
  const { pending } = useFormStatus()

  return (
    <Button
      className={cn('flex items-center justify-center gap-2', props.className)}
      disabled={pending}
      type="submit"
      variant={props.variant ?? 'default'}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : props.children}
    </Button>
  )
}

export { SubmitButton }
