import { cn } from './utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface-900 border border-surface-800 shadow-card',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div className={cn('px-5 pt-5 pb-3 border-b border-surface-800', className)} {...props} />
  )
}

export function CardBody({ className, ...props }: CardProps) {
  return <div className={cn('p-5', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div className={cn('px-5 pb-5 pt-3 border-t border-surface-800', className)} {...props} />
  )
}
