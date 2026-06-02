import { Link } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { ThemeToggle } from '../components/ui/ThemeToggle'

interface Feature {
  icon: string
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  {
    icon: 'verified',
    title: 'Cited answers',
    desc: 'Every reply links back to the exact documents and Q&A pairs it drew from.',
  },
  {
    icon: 'shield',
    title: 'No hallucinations',
    desc: 'When the knowledge base has no answer, the assistant says so instead of inventing one.',
  },
  {
    icon: 'upload_file',
    title: 'Any format',
    desc: 'Drop in PDFs, Word docs, spreadsheets, CSVs or plain text — extracted and embedded automatically.',
  },
]

export function LandingPage() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-surface text-on-surface">
      {/* Ambient backdrop: mint glow + faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] max-w-[120vw] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[380px] w-[380px] rounded-full bg-tertiary/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.5]"
          style={{
            backgroundImage:
              'linear-gradient(to right, color-mix(in srgb, var(--c-on-surface) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--c-on-surface) 6%, transparent) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)',
          }}
        />
      </div>

      {/* Nav */}
      <header className="mx-auto flex h-16 w-full max-w-6xl shrink-0 items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 text-on-surface">
          <img src="/logo.png" alt="AskHive" className="h-8 w-8" />
          <span className="font-display text-lg font-bold tracking-tight">AskHive</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/sources"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface sm:block"
          >
            Admin
          </Link>
          <ThemeToggle />
          <Link
            to="/chat"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-on-primary shadow-sm transition-colors hover:bg-surface-tint"
          >
            Open chat
            <Icon name="arrow_forward" size={18} />
          </Link>
        </div>
      </header>

      {/* Everything below the nav fills the remaining viewport and spreads evenly. */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col justify-center gap-y-12 px-5 py-10 sm:px-8 lg:gap-y-20">
        {/* Hero */}
        <main className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Copy column */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 font-mono text-[12px] text-on-surface-variant">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              RAG-powered customer support
            </span>

            <h1 className="mt-5 font-display text-[2.4rem] font-bold leading-[1.06] tracking-tight sm:text-6xl">
              Support answers your{' '}
              <span className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                docs can back up.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-on-surface-variant sm:text-lg lg:mx-0">
              Turn your help docs, policies and FAQs into a chatbot that answers in seconds —
              grounded in your own content and citing every source. Upload once, let staff and
              customers ask anything.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/chat"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-on-primary shadow-sm transition-colors hover:bg-surface-tint sm:w-auto"
              >
                <Icon name="forum" fill size={20} />
                Try the chatbot
              </Link>
              <Link
                to="/sources"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-6 text-[15px] font-semibold text-on-surface transition-colors hover:bg-surface-container-low sm:w-auto"
              >
                <Icon name="dashboard" size={20} />
                Admin dashboard
              </Link>
            </div>

            <p className="mt-4 font-mono text-[12px] text-on-surface-variant">
              No setup needed to look around — the demo is live.
            </p>
          </div>

          {/* Mock chat preview */}
          <ChatPreview />
        </main>

        {/* Feature row */}
        <section className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-outline-variant bg-surface-container-low/60 p-5 backdrop-blur-sm transition-colors hover:border-primary/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
                <Icon name={f.icon} size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">{f.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

/** Static, non-interactive preview of a grounded answer with source chips. */
function ChatPreview() {
  return (
    <div className="relative mx-auto hidden w-full max-w-md lg:mx-0 lg:block">
      <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest/80 p-4 shadow-ambient backdrop-blur-md">
        {/* Window chrome */}
        <div className="mb-4 flex items-center gap-2 border-b border-outline-variant/60 px-1 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-tertiary/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          </div>
          <span className="ml-2 flex items-center gap-1.5 font-mono text-[11px] text-on-surface-variant">
            <img src="/logo.png" alt="" className="h-3.5 w-3.5" />
            AskHive Support
          </span>
        </div>

        {/* User question */}
        <div className="mb-3 flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-surface-container-high px-4 py-2.5 text-sm text-on-surface">
            Do you offer refunds after 30 days?
          </div>
        </div>

        {/* Bot answer */}
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <Icon name="smart_toy" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="rounded-2xl rounded-tl-sm border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm leading-relaxed text-on-surface">
              Refunds are available within 30 days of purchase. After that window, orders are
              eligible for store credit instead of a cash refund.
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {['refund-policy.pdf', 'returns-faq'].map((src) => (
                <span
                  key={src}
                  className="inline-flex items-center gap-1 rounded-md bg-surface-container px-2 py-1 font-mono text-[11px] text-on-surface-variant"
                >
                  <Icon name="description" size={13} />
                  {src}
                </span>
              ))}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 px-1 font-mono text-[10px] text-on-surface-variant">
              <Icon name="bolt" size={12} />
              answered in 1.2s · 2 sources
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
