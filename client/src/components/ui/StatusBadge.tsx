import type { DocumentStatus } from '../../lib/types'
import { Icon } from './Icon'

interface StatusBadgeProps {
  status: DocumentStatus
}

const badgeBase =
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border'

/** Status pill for document processing state. Colors per the design system. */
export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'ready') {
    return (
      <span className={`${badgeBase} bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Ready
      </span>
    )
  }
  if (status === 'processing') {
    return (
      <span className={`${badgeBase} bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
        Processing
      </span>
    )
  }
  return (
    <span className={`${badgeBase} bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20`}>
      <Icon name="warning" size={12} />
      Failed
    </span>
  )
}
