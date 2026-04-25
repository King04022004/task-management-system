interface BadgeProps {
  label: string
  colorClass: string
  className?: string
}

export const Badge = ({ label, colorClass, className = '' }: BadgeProps) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass} ${className}`}>
    {label}
  </span>
)
