import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { Icon } from '../components/ui/Icon'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useToast } from '../components/ui/toast'
import { getErrorMessage } from '../lib/api'
import type { DocumentRecord } from '../lib/types'
import { useDocuments, useDeleteDocument } from '../features/documents/hooks'
import { StatCards } from '../features/documents/StatCards'
import { DocumentRow } from '../features/documents/DocumentRow'
import { UploadModal } from '../features/documents/UploadModal'

const PAGE_SIZE = 8

export function KnowledgeSourcesPage() {
  const { data, isLoading, isError, error } = useDocuments()
  const deleteMutation = useDeleteDocument()
  const toast = useToast()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DocumentRecord | null>(null)
  const [page, setPage] = useState(1)

  const items = data?.items ?? []
  const total = data?.total ?? items.length
  const processing = items.filter((d) => d.status === 'processing').length
  const failed = items.filter((d) => d.status === 'failed').length

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * PAGE_SIZE
  const visible = items.slice(start, start + PAGE_SIZE)

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success('Source deleted')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete source'))
    }
    setDeleteTarget(null)
  }

  return (
    <>
      <PageHeader
        title="Data Sources"
        description="Manage documents that feed your AI assistant's knowledge base."
        actions={
          <Button icon="upload_file" onClick={() => setUploadOpen(true)}>
            Add Source
          </Button>
        }
      />

      {!isLoading && !isError && items.length > 0 && (
        <StatCards total={total} processing={processing} failed={failed} />
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        {/* Column header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-outline-variant bg-surface-container-low font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
          <div className="col-span-6 sm:col-span-5">Filename</div>
          <div className="col-span-2 hidden sm:block">Size</div>
          <div className="col-span-3 sm:col-span-2">Upload Date</div>
          <div className="col-span-3">Status</div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-outline-variant">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center">
                <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="col-span-2 hidden sm:block">
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="col-span-3">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon="cloud_off"
            title="Couldn't load sources"
            description={getErrorMessage(error, 'Check that the API server is running.')}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon="database"
            title="No sources yet"
            description="Upload a PDF, DOCX, XLSX, CSV, or TXT file to start building your knowledge base."
            action={
              <Button icon="upload_file" onClick={() => setUploadOpen(true)}>
                Add Source
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-outline-variant">
            {visible.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-on-surface-variant">
          <span>
            Showing {start + 1} to {start + visible.length} of {items.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              <Icon name="chevron_left" />
            </button>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= pageCount}
              aria-label="Next page"
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>
      )}

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete source?"
        message={
          deleteTarget
            ? `"${deleteTarget.originalName}" and its embeddings will be permanently removed from the knowledge base.`
            : ''
        }
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  )
}
