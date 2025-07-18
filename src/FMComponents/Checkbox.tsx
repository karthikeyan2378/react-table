
'use client';

import * as React from "react"

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
           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '2px', left: '2px', pointerEvents: 'none' }}><polyline points="20 6 9 17 4 12"/></svg>
      )}
  </div>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
