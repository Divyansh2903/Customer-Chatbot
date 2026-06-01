import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { Icon } from './Icon'

type ToastKind = 'success' | 'error' | 'info'

interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const DURATION_MS = 4000
let nextId = 1

const kindStyles: Record<ToastKind, { icon: string; accent: string }> = {
  success: { icon: 'check_circle', accent: 'text-emerald-500' },
  error: { icon: 'error', accent: 'text-rose-500' },
  info: { icon: 'info', accent: 'text-blue-500' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId++
      setToasts((list) => [...list, { id, kind, message }])
      setTimeout(() => remove(id), DURATION_MS)
    },
    [remove],
  )

  const api: ToastApi = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const style = kindStyles[t.kind]
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-ambient px-4 py-3"
            >
              <Icon name={style.icon} size={20} className={style.accent} />
              <p className="flex-1 text-sm text-on-surface">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                aria-label="Dismiss"
                className="text-outline hover:text-on-surface transition-colors"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
