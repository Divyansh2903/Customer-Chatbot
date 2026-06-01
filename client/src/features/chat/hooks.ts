import { useMutation } from '@tanstack/react-query'
import type { ChatHistoryTurn } from '../../lib/types'
import { sendChat } from './api'

export function useSendChat() {
  return useMutation({
    mutationFn: ({ message, history }: { message: string; history: ChatHistoryTurn[] }) =>
      sendChat(message, history),
  })
}
