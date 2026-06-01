import { forwardRef, type InputHTMLAttributes } from 'react'
import { Icon } from './Icon'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional leading Material Symbols icon (e.g. "search"). */
  icon?: string
}

const fieldBase =
  'w-full h-10 rounded-lg bg-surface-container-lowest border border-outline-variant ' +
  'text-sm text-on-surface placeholder:text-outline transition-shadow outline-none ' +
  'focus:border-primary focus:ring-2 focus:ring-primary/20'

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, className = '', ...props },
  ref,
) {
  if (icon) {
    return (
      <div className="relative flex items-center w-full">
        <Icon
          name={icon}
          size={18}
          className="absolute left-3 text-outline pointer-events-none"
        />
        <input ref={ref} className={`${fieldBase} pl-9 pr-3 ${className}`} {...props} />
      </div>
    )
  }
  return <input ref={ref} className={`${fieldBase} px-3 ${className}`} {...props} />
})
