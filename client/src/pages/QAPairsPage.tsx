import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { Icon } from '../components/ui/Icon'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useToast } from '../components/ui/toast'
import { getErrorMessage } from '../lib/api'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import type { QAPair } from '../lib/types'
import { useQAPairs, useDeleteQAPair } from '../features/qa/hooks'
import { QACard } from '../features/qa/QACard'
import { QAFormModal } from '../features/qa/QAFormModal'

const LIMIT = 10

export function QAPairsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<QAPair | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<QAPair | null>(null)

  const { data, isLoading, isError, error, isFetching } = useQAPairs(
    debouncedSearch,
    page,
    LIMIT,
  )
  const deleteMutation = useDeleteQAPair()
  const toast = useToast()

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / LIMIT))
  const rangeStart = total === 0 ? 0 : (page - 1) * LIMIT + 1
  const rangeEnd = (page - 1) * LIMIT + items.length

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(pair: QAPair) {
    setEditing(pair)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success('Q&A pair deleted')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete Q&A pair'))
    }
    setDeleteTarget(null)
  }

  return (
    <>
      <PageHeader
        title="Curated Q&A Pairs"
        description="Manage structured question and answer data used by the AI agent to resolve customer inquiries."
        actions={
          <>
            <div className="w-full sm:w-64">
              <Input
                icon="search"
                placeholder="Search entries..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1) // a new search starts from the first page
                }}
              />
            </div>
            <Button icon="add" onClick={openCreate} className="shrink-0">
              Add Pair
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col gap-3"
            >
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
          <EmptyState
            icon="cloud_off"
            title="Couldn't load Q&A pairs"
            description={getErrorMessage(error, 'Check that the API server is running.')}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
          <EmptyState
            icon="quiz"
            title={debouncedSearch ? 'No matching pairs' : 'No Q&A pairs yet'}
            description={
              debouncedSearch
                ? 'Try a different search term.'
                : 'Author a curated question and answer to guide the assistant.'
            }
            action={
              !debouncedSearch && (
                <Button icon="add" onClick={openCreate}>
                  Add Pair
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className={`flex flex-col gap-3 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          {items.map((pair) => (
            <QACard key={pair.id} pair={pair} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {total > 0 && (
        <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant">
          <span>
            Showing {rangeStart} to {rangeEnd} of {total} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              <Icon name="chevron_left" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
              aria-label="Next page"
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>
      )}

      <QAFormModal open={formOpen} pair={editing} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Q&A pair?"
        message={
          deleteTarget
            ? `"${deleteTarget.question}" will be permanently removed from the knowledge base.`
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
