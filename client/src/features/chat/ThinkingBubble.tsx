import { Icon } from '../../components/ui/Icon'

export function ThinkingBubble() {
  return (
    <div className="flex items-start gap-2 w-full">
      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
        <Icon name="smart_toy" size={16} className="text-on-primary-container" />
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-ambient">
        <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" />
      </div>
    </div>
  )
}
