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

// Shown on the empty state to give first-time users a starting point.
const EXAMPLE_QUESTIONS = [
  'What is your refund policy?',
  'How do I reset my password?',
  'What are your support hours?',
]

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

  async function sendMessage(raw: string) {
    const text = raw.trim()
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
          model: res.model,
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

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    void sendMessage(input)
  }

  const isEmpty = messages.length === 0

  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-surface">
      <header className="glass-panel sticky top-0 z-10 flex items-center justify-between h-[72px] px-4 md:px-6 border-b border-outline-variant/30 shrink-0">
        <Link to="/" className="flex items-center gap-3 group" title="Back to home">
          <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:border-primary/30 transition-colors">
            <img src="/logo.png" alt="AskHive" className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-on-surface">
            AskHive Support
          </h1>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            to="/sources"
            className="flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            title="Admin"
            aria-label="Go to admin"
          >
            <Icon name="admin_panel_settings" />
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[900px] mx-auto w-full px-4 md:px-6 py-8 pb-[170px] flex flex-col gap-8">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center text-center pt-16">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 premium-shadow flex items-center justify-center text-primary mb-5">
                <Icon name="smart_toy" size={28} />
              </div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-on-surface">
                How can I help?
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 max-w-sm leading-relaxed">
                Ask a question and I'll answer from your knowledge base, citing the sources I used.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void sendMessage(q)}
                    disabled={sendChat.isPending}
                    className="flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-container-lowest px-4 py-2 text-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-50 premium-shadow"
                  >
                    <Icon name="chat_bubble" size={15} className="text-primary/70" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <span className="font-mono text-[11px] uppercase tracking-widest text-outline bg-surface-container-low border border-outline-variant/40 py-1.5 px-4 rounded-full">
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

      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[800px] z-20">
        <div className="glass-panel border border-outline-variant/40 rounded-full p-1.5 premium-shadow shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:border-primary/40 transition-colors">
          <form onSubmit={handleSend} className="flex items-center w-full">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              aria-label="Message"
              className="flex-1 bg-transparent border-none outline-none text-base text-on-surface placeholder:text-outline py-3 pl-5 pr-3"
            />
            <button
              type="submit"
              disabled={!input.trim() || sendChat.isPending}
              aria-label="Send"
              className="shrink-0 w-10 h-10 mr-1 flex items-center justify-center rounded-full bg-primary text-on-primary hover:bg-surface-tint transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Icon name="arrow_upward" size={18} />
            </button>
          </form>
        </div>
        <p className="text-center font-mono text-[11px] text-outline mt-3 px-4">
          AskHive answers only from your knowledge base and may occasionally be wrong.
        </p>
      </footer>
    </div>
  )
}
