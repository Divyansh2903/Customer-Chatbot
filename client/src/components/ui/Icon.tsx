interface IconProps {
  name: string
  /** Render the filled glyph variant. */
  fill?: boolean
  /** Pixel size of the glyph. Defaults to 20. */
  size?: number
  className?: string
}

/** Thin wrapper over Material Symbols Outlined. */
export function Icon({ name, fill = false, size = 20, className = '' }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${fill ? 'icon-fill' : ''} ${className}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  )
}
