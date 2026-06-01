import type { DocumentRecord } from '../../lib/types'
import { Icon } from '../../components/ui/Icon'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatBytes, formatDate } from '../../lib/format'

interface DocumentRowProps {
  doc: DocumentRecord
  onDelete: (doc: DocumentRecord) => void
}

// Map the server's type label to a Material Symbols glyph + accent color.
const TYPE_ICON: Record<string, { icon: string; className: string }> = {
  PDF: { icon: 'picture_as_pdf', className: 'text-rose-500' },
  DOCX: { icon: 'description', className: 'text-blue-500' },
  XLSX: { icon: 'table_chart', className: 'text-emerald-600' },
  CSV: { icon: 'grid_on', className: 'text-emerald-600' },
  TXT: { icon: 'article', className: 'text-on-surface-variant' },
}

export function DocumentRow({ doc, onDelete }: DocumentRowProps) {
  const type = TYPE_ICON[doc.typeLabel] ?? { icon: 'draft', className: 'text-on-surface-variant' }

  return (
    <div className="grid grid-cols-12 gap-4 p-4 items-center group hover:bg-surface-container-low/50 transition-colors">
      <div className="col-span-6 sm:col-span-5 flex items-center gap-3 overflow-hidden">
        <Icon name={type.icon} fill className={`shrink-0 ${type.className}`} />
        <div className="min-w-0">
          <div className="text-sm font-medium text-on-surface truncate" title={doc.originalName}>
            {doc.originalName}
          </div>
          {doc.status === 'failed' && doc.error && (
            <div className="text-xs text-rose-500 truncate" title={doc.error}>
              {doc.error}
            </div>
          )}
        </div>
      </div>
      <div className="col-span-2 hidden sm:block text-sm text-on-surface-variant">
        {formatBytes(doc.size)}
      </div>
      <div className="col-span-3 sm:col-span-2 text-sm text-on-surface-variant">
        {formatDate(doc.createdAt)}
      </div>
      <div className="col-span-3 flex justify-between items-center gap-2">
        <StatusBadge status={doc.status} />
        <button
          onClick={() => onDelete(doc)}
          aria-label={`Delete ${doc.originalName}`}
          title="Delete"
          className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
        >
          <Icon name="delete" />
        </button>
      </div>
    </div>
  )
}
