import { api } from '../../lib/api'
import type { Paginated, QAPair } from '../../lib/types'

export interface ListQAParams {
  search?: string
  page?: number
  limit?: number
}

export interface QAInput {
  question: string
  answer: string
}

export async function fetchQAPairs(params: ListQAParams): Promise<Paginated<QAPair>> {
  const { data } = await api.get<Paginated<QAPair>>('/api/qa', { params })
  return data
}

export async function createQAPair(input: QAInput): Promise<QAPair> {
  const { data } = await api.post<QAPair>('/api/qa', input)
  return data
}

export async function updateQAPair(id: string, input: QAInput): Promise<QAPair> {
  const { data } = await api.put<QAPair>(`/api/qa/${id}`, input)
  return data
}

export async function deleteQAPair(id: string): Promise<void> {
  await api.delete(`/api/qa/${id}`)
}
