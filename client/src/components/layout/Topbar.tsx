import type { ReactNode } from 'react'
import { Icon } from '../ui/Icon'
import { ThemeToggle } from '../ui/ThemeToggle'

interface TopbarProps {
  title: string
  /** Page-specific actions rendered before the theme toggle. */
  right?: ReactNode
  onMenuClick: () => void
}

export function Topbar({ title, right, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-surface border-b border-outline-variant">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="md:hidden text-on-surface-variant hover:text-primary transition-colors"
        >
          <Icon name="menu" size={24} />
        </button>
        <h2 className="font-display text-xl font-bold text-on-surface">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {right}
        <ThemeToggle />
      </div>
    </header>
  )
}
