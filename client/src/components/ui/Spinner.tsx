import { Icon } from './Icon'

interface SpinnerProps {
  size?: number
  className?: string
}

export function Spinner({ size = 24, className = '' }: SpinnerProps) {
  return (
    <Icon
      name="progress_activity"
      size={size}
      className={`animate-spin text-primary ${className}`}
    />
  )
}
