'use client';

import * as React from 'react';
import './css/modal.css';

type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  position?: ModalPosition;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  position = 'center',
  children,
  footer,
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="cygnet-modal-portal">
      <div className="cygnet-modal-overlay" onClick={onClose} />
      <div className={`cygnet-modal-content cygnet-modal--${position}`}>
        <div className="cygnet-modal-header">
          <h2 className="cygnet-modal-title">{title}</h2>
          <button className="cygnet-modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="cygnet-modal-body">{children}</div>
        {footer && <div className="cygnet-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
