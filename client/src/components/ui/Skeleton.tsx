interface SkeletonProps {
  className?: string
}

/** Pulsing placeholder block for loading states. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded bg-surface-container-high ${className}`} />
}
