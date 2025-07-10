import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as React from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * A utility function to highlight occurrences of a search term within a text.
 * @param text The full text to search within.
 * @param highlight The search term to highlight.
 * @returns A React fragment with the highlighted text.
 */
export function highlightText(text: string, highlight: string) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <React.Fragment>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-300 rounded-sm px-0.5">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </React.Fragment>
  );
}
