import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium text-xs px-2.5 py-0.5',
  {
    variants: {
      variant: {
        default:  'bg-surface-700 text-surface-300',
        brand:    'bg-brand-600/20 text-brand-400 border border-brand-600/30',
        success:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        warning:  'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        danger:   'bg-red-500/20 text-red-400 border border-red-500/30',
        info:     'bg-sky-500/20 text-sky-400 border border-sky-500/30',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
