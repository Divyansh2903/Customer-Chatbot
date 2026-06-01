import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'

interface NavItem {
  to: string
  label: string
  icon: string
}

// Only routes backed by the API. (Dashboard/Analytics/etc. from the reference
// design are intentionally omitted — no backend.)
const NAV_ITEMS: NavItem[] = [
  { to: '/sources', label: 'Knowledge Sources', icon: 'database' },
  { to: '/qa', label: 'Q&A Pairs', icon: 'quiz' },
]

interface SidebarProps {
  /** Mobile drawer open state. */
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-on-background/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={
          'fixed left-0 top-0 z-50 h-screen w-60 bg-surface border-r border-outline-variant ' +
          'flex flex-col py-8 transition-transform duration-200 md:translate-x-0 ' +
          (open ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="px-6 mb-8 flex items-center gap-2">
          <Icon name="psychology" fill size={26} className="text-primary" />
          <h1 className="font-display text-xl font-bold text-primary">KnowledgeBase</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ' +
                (isActive
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} fill={isActive} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}

          <NavLink
            to="/chat"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <Icon name="forum" />
            Open Chatbot
          </NavLink>
        </nav>

        <div className="mt-auto px-4 pt-4 border-t border-outline-variant/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
              SA
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-on-surface truncate">
                Support Admin
              </span>
              <span className="font-mono text-[11px] text-on-surface-variant truncate">
                KnowledgeBase AI
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
