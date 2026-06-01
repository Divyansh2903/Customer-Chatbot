import type { ChatSource } from '../../lib/types'

export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  time: Date
  sources?: ChatSource[]
  /** Bot replied that it lacked enough context (no sources) — styled distinctly. */
  noContext?: boolean
}
