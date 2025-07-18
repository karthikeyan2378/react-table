'use client';

import * as React from "react"

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>;

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  // This provider is now just a pass-through, as state is managed by the useToast hook.
  return <>{children}</>;
};

const ToastViewport = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={`cygnet-toast-viewport ${className || ''}`}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

type ToastVariant = 'default' | 'destructive';

interface ToastProps extends React.HTMLAttributes<HTMLLIElement> {
    variant?: ToastVariant;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const Toast = React.forwardRef<
  HTMLLIElement,
  ToastProps
>(({ className, variant, open, onOpenChange, ...props }, ref) => {
  const variantClass = variant === 'destructive' ? 'cygnet-toast--destructive' : '';
  
  React.useEffect(() => {
    if (!open && onOpenChange) {
      const timer = setTimeout(() => onOpenChange(false), 500); // Allow for exit animation
      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  return (
    <li
      ref={ref}
      className={`cygnet-toast ${variantClass} ${className || ''}`}
      data-state={open ? 'open' : 'closed'}
      {...props}
    />
  );
});
Toast.displayName = "Toast";

const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={`cygnet-toast-action ${className || ''}`}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={`cygnet-toast-close ${className || ''}`}
    {...props}
  >
    <XIcon />
  </button>
));
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`cygnet-toast-title ${className || ''}`}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`cygnet-toast-description ${className || ''}`}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

type ToastPropsWithSchema = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastPropsWithSchema as ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
