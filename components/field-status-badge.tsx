import { Check, AlertTriangle, X } from "lucide-react"

interface FieldStatusBadgeProps {
  status: "complete" | "partial" | "missing"
}

const variants = {
  complete: {
    label: "Completo",
    icon: Check,
    className: "bg-success/10 text-success",
  },
  partial: {
    label: "Parcial",
    icon: AlertTriangle,
    className: "bg-warning/10 text-warning",
  },
  missing: {
    label: "Ausente",
    icon: X,
    className: "bg-error/10 text-error animate-pulse",
  },
} as const

export function FieldStatusBadge({ status }: FieldStatusBadgeProps) {
  const variant = variants[status]
  const Icon = variant.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${variant.className}`}
    >
      <Icon className="h-3 w-3" />
      {variant.label}
    </span>
  )
}
