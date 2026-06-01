import { api } from '../../lib/api'
import type { DocumentRecord, Paginated } from '../../lib/types'

// Demo-scale knowledge bases are small; pull a generous page and paginate the
// table client-side so the stat cards stay accurate without extra count queries.
const FETCH_LIMIT = 100

export async function fetchDocuments(): Promise<Paginated<DocumentRecord>> {
  const { data } = await api.get<Paginated<DocumentRecord>>('/api/documents', {
    params: { page: 1, limit: FETCH_LIMIT },
  })
  return data
}

export async function uploadDocument(file: File): Promise<DocumentRecord> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<DocumentRecord>('/api/documents', form)
  return data
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/api/documents/${id}`)
}
