
'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import './button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
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
