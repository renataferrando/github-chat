import type { UserMessage as UserMessageData } from '@/src/types/chat'
import { Avatar } from '@/src/components/ui/Avatar'

export interface UserMessageProps {
  message: UserMessageData
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <article className="flex gap-3 items-start">
      <Avatar username="viewer" name="You" size={28} rounded="full" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-fg">You</span>
          <span className="text-xs text-fg-dim">{formatTime(message.timestamp)}</span>
        </div>
        <p className="mt-1 text-base text-fg leading-relaxed">{message.content}</p>
      </div>
    </article>
  )
}
