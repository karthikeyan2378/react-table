
'use client';

import * as React from "react"
import { Check } from "lucide-react"


const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div style={{ position: 'relative', display: 'inline-block' }}>
      <input
        type="checkbox"
        ref={ref}
        className={`peer h-4 w-4 shrink-0 rounded-sm border border-gray-400 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gray-500 data-[state=checked]:text-white ${className || ''}`}
        {...props}
      />
      {props.checked && (
          <Check style={{ position: 'absolute', top: '2px', left: '2px', height: '12px', width: '12px', color: 'white', pointerEvents: 'none' }} />
      )}
  </div>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
