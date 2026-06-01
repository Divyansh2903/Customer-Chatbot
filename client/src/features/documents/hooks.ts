import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchDocuments, uploadDocument, deleteDocument } from './api'

export const DOCUMENTS_KEY = ['documents'] as const

const POLL_INTERVAL_MS = 3000

export function useDocuments() {
  return useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: fetchDocuments,
    // Auto-poll while any document is still processing, then stop.
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? []
      return items.some((d) => d.status === 'processing') ? POLL_INTERVAL_MS : false
    },
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  })
}
