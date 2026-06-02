import type { ChatSource } from '../../lib/types'

export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  time: Date
  sources?: ChatSource[]
  /** Gemini model that produced the reply, shown as a small badge. */
  model?: string
  /** Bot replied that it lacked enough context (no sources) — styled distinctly. */
  noContext?: boolean
}
