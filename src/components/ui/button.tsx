import React, { ButtonHTMLAttributes, forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const buttonClasses = cn(
      'inline-flex items-center justify-center font-medium transition-all duration-300 ease-in-out',
      {
        'rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50': true,
        'bg-accent text-foreground hover:bg-accent/90 hover:shadow-md active:scale-95': variant === 'primary',
        'bg-secondary text-foreground hover:bg-secondary/90 hover:shadow-md active:scale-95': variant === 'secondary',
        'border-2 border-accent bg-transparent text-foreground hover:bg-accent/10 hover:shadow-md active:scale-95': variant === 'outline',
        'h-8 px-4 text-sm': size === 'sm',
        'h-10 px-6 text-base': size === 'md',
        'h-12 px-8 text-lg': size === 'lg',
      },
      className
    )

    if (asChild) {
      const { children, ...rest } = props
      const child = children as React.ReactElement<HTMLAttributes<HTMLElement>>
      return React.cloneElement(child, {
        ...child.props,
        className: cn(buttonClasses, child.props.className),
        ...rest,
      })
    }

    return (
      <button
        className={buttonClasses}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button } 