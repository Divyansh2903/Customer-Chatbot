import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  /** Optional call-to-action (e.g. a Button). */
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-4">
        <Icon name={icon} size={28} />
      </div>
      <h3 className="font-display text-lg font-semibold text-on-surface">{title}</h3>
      {description && (
        <p className="text-sm text-on-surface-variant mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
