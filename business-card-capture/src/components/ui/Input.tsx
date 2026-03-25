import { forwardRef } from 'react'
import { cn } from './utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-surface-400 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-surface-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl bg-surface-800 border border-surface-700 px-3 py-2.5 text-sm text-white placeholder:text-surface-500',
              'transition-all duration-150',
              'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'hover:border-surface-600',
              icon && 'pl-9',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
              className
            )}
            {...props}
          />
        </div>
        {(hint || error) && (
          <p className={cn('text-xs', error ? 'text-red-400' : 'text-surface-500')}>
            {error ?? hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
