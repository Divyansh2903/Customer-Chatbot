import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  /** Right-aligned actions (search, primary button). */
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-on-surface">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 w-full sm:w-auto">{actions}</div>
      )}
    </div>
  )
}
