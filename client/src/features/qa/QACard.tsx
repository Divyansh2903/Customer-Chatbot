import type { QAPair } from '../../lib/types'
import { Icon } from '../../components/ui/Icon'
import { formatRelativeTime } from '../../lib/format'

interface QACardProps {
  pair: QAPair
  onEdit: (pair: QAPair) => void
  onDelete: (pair: QAPair) => void
}

export function QACard({ pair, onEdit, onDelete }: QACardProps) {
  return (
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 hover:border-outline hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-start gap-4">
        <h3 className="font-display text-base font-semibold text-on-surface flex-1">
          {pair.question}
        </h3>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(pair)}
            aria-label="Edit pair"
            title="Edit"
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <Icon name="edit" size={18} />
          </button>
          <button
            onClick={() => onDelete(pair)}
            aria-label="Delete pair"
            title="Delete"
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-surface-container-high transition-colors"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      </div>

      <p className="text-sm text-on-surface-variant line-clamp-2">{pair.answer}</p>

      <div className="flex items-center gap-1.5 pt-3 border-t border-surface-container font-mono text-[11px] text-outline">
        <Icon name="schedule" size={13} />
        Updated {formatRelativeTime(pair.updatedAt)}
      </div>
    </div>
  )
}
