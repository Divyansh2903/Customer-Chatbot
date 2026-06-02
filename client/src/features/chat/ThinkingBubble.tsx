import { Icon } from '../../components/ui/Icon'

export function ThinkingBubble() {
  return (
    <div className="flex items-end gap-3 w-full">
      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 premium-shadow flex items-center justify-center shrink-0 mb-1">
        <Icon name="smart_toy" size={18} className="text-primary" />
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl rounded-tl-sm w-[72px] h-[48px] flex items-center justify-center premium-shadow">
        <div className="dot-flashing ml-2" />
      </div>
    </div>
  )
}
