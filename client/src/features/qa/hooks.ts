import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createQAPair,
  deleteQAPair,
  fetchQAPairs,
  updateQAPair,
  type QAInput,
} from './api'

export const QA_KEY = ['qa'] as const

export function useQAPairs(search: string, page: number, limit = 10) {
  return useQuery({
    queryKey: [...QA_KEY, { search, page, limit }],
    queryFn: () => fetchQAPairs({ search: search || undefined, page, limit }),
    placeholderData: keepPreviousData,
  })
}

export function useCreateQAPair() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: QAInput) => createQAPair(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QA_KEY }),
  })
}

export function useUpdateQAPair() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: QAInput }) => updateQAPair(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QA_KEY }),
  })
}

export function useDeleteQAPair() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteQAPair(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QA_KEY }),
  })
}
