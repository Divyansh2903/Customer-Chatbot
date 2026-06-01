import type { ChatSource } from '../../lib/types'
import { Icon } from '../../components/ui/Icon'
import { formatClockTime } from '../../lib/format'
import type { ChatMessage } from './types'

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
      <Icon name="smart_toy" size={16} className="text-on-primary-container" />
    </div>
  )
}

function SourceChip({ source }: { source: ChatSource }) {
  const isDoc = source.type === 'document'
  return (
    <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant font-mono text-xs py-1 px-2 rounded">
      <Icon name={isDoc ? 'description' : 'quiz'} size={14} />
      {isDoc ? `from: ${source.title}` : source.title}
    </span>
  )
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end w-full">
        <div className="bg-surface-container-high text-on-surface text-[15px] leading-relaxed p-3 rounded-xl rounded-tr-sm max-w-[85%] md:max-w-[70%] whitespace-pre-wrap">
          {message.content}
        </div>
        <span className="font-mono text-[11px] text-on-surface-variant mt-1 mr-1">
          {formatClockTime(message.time)}
        </span>
      </div>
    )
  }

  // Distinct "not enough information" treatment.
  if (message.noContext) {
    return (
      <div className="flex flex-col items-start w-full gap-2">
        <div className="flex items-start gap-2 w-full">
          <BotAvatar />
          <div className="bg-surface-container border border-dashed border-outline-variant text-on-surface-variant text-[15px] leading-relaxed p-3 rounded-xl rounded-tl-sm max-w-[85%] md:max-w-[70%]">
            <div className="flex items-center gap-1.5 mb-1 text-on-surface-variant font-medium">
              <Icon name="info" size={16} />
              <span className="text-sm">Not enough information</span>
            </div>
            {message.content}
          </div>
        </div>
        <span className="font-mono text-[11px] text-on-surface-variant ml-10">
          {formatClockTime(message.time)}
        </span>
      </div>
    )
  }

  const sources = message.sources ?? []

  return (
    <div className="flex flex-col items-start w-full gap-2">
      <div className="flex items-start gap-2 w-full">
        <BotAvatar />
        <div className="bg-surface-container-lowest border border-outline-variant text-on-surface text-[15px] leading-relaxed p-3 rounded-xl rounded-tl-sm max-w-[85%] md:max-w-[70%] shadow-ambient">
          <p className="whitespace-pre-wrap">{message.content}</p>

          {sources.length > 0 && (
            <>
              <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-outline-variant">
                {sources.map((s, i) => (
                  <SourceChip key={i} source={s} />
                ))}
              </div>

              <details className="group mt-2">
                <summary className="font-mono text-[11px] text-primary cursor-pointer hover:underline flex items-center gap-1 w-fit list-none">
                  <Icon
                    name="expand_more"
                    size={16}
                    className="transition-transform group-open:rotate-180"
                  />
                  View source snippet{sources.length > 1 ? 's' : ''}
                </summary>
                <div className="mt-2 flex flex-col gap-2">
                  {sources.map((s, i) => (
                    <div
                      key={i}
                      className="relative bg-surface border border-outline-variant rounded p-2 pl-3 font-mono text-xs text-on-surface-variant"
                    >
                      <span className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l" />
                      <div className="text-[10px] uppercase tracking-wider text-outline mb-1">
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
      <span className="font-mono text-[11px] text-on-surface-variant ml-10">
        {formatClockTime(message.time)}
      </span>
    </div>
  )
}
