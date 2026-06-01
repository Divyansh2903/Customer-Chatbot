import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { Icon } from '../components/ui/Icon'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { useToast } from '../components/ui/toast'
import { getErrorMessage } from '../lib/api'
import type { ChatHistoryTurn } from '../lib/types'
import { useSendChat } from '../features/chat/hooks'
import { MessageBubble } from '../features/chat/MessageBubble'
import { ThinkingBubble } from '../features/chat/ThinkingBubble'
import type { ChatMessage } from '../features/chat/types'

// How many prior turns to send as context (server also trims).
const HISTORY_TURNS = 12

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const sendChat = useSendChat()
  const toast = useToast()

  // Scroll to the latest message after each render that adds one.
  function scrollToBottom() {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sendChat.isPending) return

    const history: ChatHistoryTurn[] = messages.slice(-HISTORY_TURNS).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      content: m.content,
    }))

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: text, time: new Date() },
    ])
    setInput('')
    scrollToBottom()

    try {
      const res = await sendChat.mutateAsync({ message: text, history })
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'bot',
          content: res.reply,
          sources: res.sources,
          noContext: res.sources.length === 0,
          time: new Date(),
        },
      ])
      scrollToBottom()
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 429) {
        toast.error("You're sending messages too quickly. Please wait a moment.")
      } else {
        toast.error(getErrorMessage(err, 'Could not reach the assistant'))
      }
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="flex items-center justify-between h-16 px-6 bg-surface border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-2 text-primary">
          <Icon name="forum" fill size={24} />
          <h1 className="font-display text-xl font-bold">KnowledgeBase Support</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/sources"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            title="Admin"
            aria-label="Go to admin"
          >
            <Icon name="admin_panel_settings" />
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[820px] mx-auto w-full px-4 md:px-6 py-8 flex flex-col gap-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center text-center pt-20">
              <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container mb-4">
                <Icon name="smart_toy" size={28} />
              </div>
              <h2 className="font-display text-2xl font-semibold text-on-surface">
                How can I help?
              </h2>
              <p className="text-sm text-on-surface-variant mt-1 max-w-sm">
                Ask a question and I'll answer from your knowledge base, citing the sources I used.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <span className="font-mono text-[11px] text-on-surface-variant bg-surface-container py-1 px-3 rounded-full">
                  Today
                </span>
              </div>
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </>
          )}
          {sendChat.isPending && <ThinkingBubble />}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="shrink-0 bg-surface border-t border-outline-variant px-4 md:px-6 py-4">
        <div className="max-w-[820px] mx-auto w-full">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-full pl-5 pr-2 py-1.5 shadow-ambient focus-within:ring-2 focus-within:ring-primary/20 transition-all"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              aria-label="Message"
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-on-surface placeholder:text-on-surface-variant py-1.5"
            />
            <button
              type="submit"
              disabled={!input.trim() || sendChat.isPending}
              aria-label="Send"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-primary text-on-primary hover:bg-surface-tint transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="send" size={18} />
            </button>
          </form>
          <p className="text-center font-mono text-[11px] text-on-surface-variant mt-2">
            KnowledgeBase AI answers only from your knowledge base and may occasionally be wrong.
          </p>
        </div>
      </footer>
    </div>
  )
}
