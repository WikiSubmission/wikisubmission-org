'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:rounded-lg group-[.toaster]:border group-[.toaster]:border-[var(--ed-rule)] group-[.toaster]:bg-[var(--ed-surface)] group-[.toaster]:text-[var(--ed-fg)] group-[.toaster]:shadow-xl group-[.toaster]:backdrop-blur-md',
          title: 'group-[.toast]:text-[var(--ed-fg)]',
          description: 'group-[.toast]:text-[var(--ed-fg-muted)]',
          icon: 'group-[.toast]:text-[var(--ed-accent)]',
          actionButton:
            'group-[.toast]:bg-[var(--ed-accent)] group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:border group-[.toast]:border-[var(--ed-rule)] group-[.toast]:bg-[var(--ed-bg-alt)] group-[.toast]:text-[var(--ed-fg)]',
          closeButton:
            'group-[.toast]:border-[var(--ed-rule)] group-[.toast]:bg-[var(--ed-surface)] group-[.toast]:text-[var(--ed-fg-muted)]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
