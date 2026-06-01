// Shapes returned by the chatbot API (server controllers serialize these).

export type DocumentStatus = 'processing' | 'ready' | 'failed'

export interface DocumentRecord {
  id: string
  originalName: string
  mime: string
  typeLabel: string
  size: number
  status: DocumentStatus
  error?: string
  textLength: number
  createdAt: string
  updatedAt: string
}

export interface QAPair {
  id: string
  question: string
  answer: string
  createdAt: string
  updatedAt: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export type ChatSourceType = 'document' | 'qa'

export interface ChatSource {
  type: ChatSourceType
  title: string
  snippet: string
}

export interface ChatResponse {
  reply: string
  sources: ChatSource[]
}

export interface ChatHistoryTurn {
  role: 'user' | 'model'
  content: string
}
