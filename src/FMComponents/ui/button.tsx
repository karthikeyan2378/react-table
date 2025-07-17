
'use client';

import * as React from "react"
import './button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const Comp = "button"
    
    const buttonClasses = [
      'cygnet-btn',
      `cygnet-btn--variant-${variant}`,
      `cygnet-btn--size-${size}`,
      className
    ].filter(Boolean).join(' ');

    return (
      <Comp
        className={buttonClasses}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
