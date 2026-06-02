import type { ChatSource } from '../../lib/types'
import { Icon } from '../../components/ui/Icon'
import { formatClockTime } from '../../lib/format'
import type { ChatMessage } from './types'

function BotAvatar() {
  return (
    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 premium-shadow flex items-center justify-center shrink-0 mb-1">
      <Icon name="smart_toy" size={18} className="text-primary" />
    </div>
  )
}

function SourceChip({ source }: { source: ChatSource }) {
  const isDoc = source.type === 'document'
  return (
    <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant font-mono text-[12px] py-1.5 px-3 rounded-lg transition-colors hover:border-primary hover:text-primary">
      <Icon name={isDoc ? 'description' : 'quiz'} size={14} className="text-primary/70" />
      {source.title}
    </span>
  )
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end w-full group">
        <div className="bg-surface-container-low border border-outline-variant/30 text-on-surface text-base leading-relaxed p-5 rounded-3xl rounded-tr-sm max-w-[85%] md:max-w-[70%] whitespace-pre-wrap premium-shadow">
          {message.content}
        </div>
        <span className="font-mono text-[11px] text-outline mt-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatClockTime(message.time)}
        </span>
      </div>
    )
  }

  // Distinct "not enough information" treatment.
  if (message.noContext) {
    return (
      <div className="flex flex-col items-start w-full gap-2 group">
        <div className="flex items-end gap-3 w-full">
          <BotAvatar />
          <div className="bg-surface-container border border-dashed border-outline-variant/60 text-on-surface-variant text-base leading-relaxed p-5 rounded-3xl rounded-tl-sm max-w-[85%] md:max-w-[75%]">
            <div className="flex items-center gap-1.5 mb-1.5 text-on-surface-variant font-medium">
              <Icon name="info" size={18} className="text-primary/70" />
              <span className="text-sm">Not enough information</span>
            </div>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
        <span className="font-mono text-[11px] text-outline ml-[52px] opacity-0 group-hover:opacity-100 transition-opacity">
          {formatClockTime(message.time)}
        </span>
      </div>
    )
  }

  const sources = message.sources ?? []

  return (
    <div className="flex flex-col items-start w-full gap-2 group">
      <div className="flex items-end gap-3 w-full">
        <BotAvatar />
        <div className="bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-base leading-relaxed p-6 rounded-3xl rounded-tl-sm max-w-[85%] md:max-w-[75%] premium-shadow">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

          {sources.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-outline-variant/30">
                {sources.map((s, i) => (
                  <SourceChip key={i} source={s} />
                ))}
              </div>

              <details className="group/details mt-4">
                <summary className="font-mono text-[13px] text-primary cursor-pointer flex items-center gap-1.5 w-fit list-none outline-none hover:text-primary-container transition-colors">
                  <Icon
                    name="expand_more"
                    size={16}
                    className="transition-transform group-open/details:rotate-180"
                  />
                  View source snippet{sources.length > 1 ? 's' : ''}
                </summary>
                <div className="mt-3 flex flex-col gap-2">
                  {sources.map((s, i) => (
                    <div
                      key={i}
                      className="relative bg-surface-container-low/50 p-4 pl-5 rounded-xl border border-outline-variant/30 font-mono text-[12px] leading-relaxed text-on-surface-variant overflow-hidden"
                    >
                      <span className="absolute top-0 left-0 w-1 h-full bg-primary/40 rounded-l" />
                      <div className="text-[10px] uppercase tracking-wider text-outline mb-1.5">
                        {s.title}
                      </div>
                      {s.snippet}
                    </div>
                  ))}
                </div>
              </details>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-[52px] opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="font-mono text-[11px] text-outline">
          {formatClockTime(message.time)}
        </span>
        {message.model && (
          <span
            className="inline-flex items-center gap-1 font-mono text-[10px] text-on-surface-variant bg-surface-container py-0.5 px-1.5 rounded"
            title="Gemini model that generated this reply"
          >
            <Icon name="auto_awesome" size={11} />
            {message.model}
          </span>
        )}
      </div>
    </div>
  )
}
