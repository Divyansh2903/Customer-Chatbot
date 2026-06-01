import { forwardRef, type TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = '', rows = 5, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={
        'w-full rounded-lg bg-surface-container-lowest border border-outline-variant ' +
        'px-3 py-2 text-sm text-on-surface placeholder:text-outline transition-shadow ' +
        'outline-none resize-y focus:border-primary focus:ring-2 focus:ring-primary/20 ' +
        className
      }
      {...props}
    />
  )
})
