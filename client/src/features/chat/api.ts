import { api } from '../../lib/api'
import type { ChatHistoryTurn, ChatResponse } from '../../lib/types'

export async function sendChat(
  message: string,
  history: ChatHistoryTurn[],
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/api/chat', { message, history })
  return data
}
