
'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import './modal.css';

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
            <X size={20} />
          </button>
        </div>
        <div className="cygnet-modal-body">{children}</div>
        {footer && <div className="cygnet-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
