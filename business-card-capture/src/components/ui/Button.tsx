import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-bold tracking-wide transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none touch-manipulation',
  ],
  {
    variants: {
      variant: {
        primary: [
          // T-Mobile CTA — solid magenta, white text
          'bg-brand-500 text-white',
          'hover:bg-brand-400 active:bg-brand-600',
        ],
        secondary: [
          'bg-surface-800 text-white shadow-sm',
          'hover:bg-surface-700 active:bg-surface-900',
          'border border-surface-700',
        ],
        ghost: [
          'bg-transparent text-surface-400',
          'hover:bg-surface-800 hover:text-white active:bg-surface-900',
        ],
        danger: [
          'bg-red-600 text-white shadow-sm',
          'hover:bg-red-500 active:bg-red-700',
        ],
        glass: [
          'bg-white/10 text-white backdrop-blur-md border border-white/20',
          'hover:bg-white/20 active:bg-white/5',
        ],
      },
      size: {
        sm:   'h-8  px-4 text-xs rounded-full',
        md:   'h-10 px-5 text-sm rounded-full',
        lg:   'h-12 px-7 text-base rounded-full',
        xl:   'h-14 px-8 text-lg rounded-full',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
