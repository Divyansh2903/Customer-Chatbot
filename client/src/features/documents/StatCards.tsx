import { Icon } from '../../components/ui/Icon'

interface StatCardsProps {
  total: number
  processing: number
  failed: number
}

interface Stat {
  label: string
  value: number
  icon: string
  iconClass: string
  spin?: boolean
}

export function StatCards({ total, processing, failed }: StatCardsProps) {
  const stats: Stat[] = [
    { label: 'Total Files', value: total, icon: 'description', iconClass: 'bg-primary/10 text-primary' },
    { label: 'Processing', value: processing, icon: 'autorenew', iconClass: 'bg-blue-500/10 text-blue-500', spin: processing > 0 },
    { label: 'Failed', value: failed, icon: 'error', iconClass: 'bg-rose-500/10 text-rose-500' },
  ]

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex-1 min-w-[200px] flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.iconClass}`}>
            <Icon name={s.icon} className={s.spin ? 'animate-spin' : ''} />
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
              {s.label}
            </div>
            <div className="font-display text-xl font-bold text-on-surface">{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
