import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Icon } from './ui/Icon'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** Catches render-time errors so a crash shows a recoverable screen, not a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-4">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Icon name="error" size={28} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-on-surface">
              Something went wrong
            </h1>
            <p className="text-sm text-on-surface-variant mt-1 max-w-sm">
              An unexpected error occurred. Reloading usually fixes it.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-surface-tint transition-colors"
          >
            <Icon name="refresh" size={18} />
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
