
import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook to manage dropdown behavior.
 * @returns An object containing the dropdown ref, its open state, and functions to control it.
 */
export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return { dropdownRef, isOpen, setIsOpen, position, setPosition };
}
