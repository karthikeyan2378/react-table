
import * as React from 'react';

/**
 * A utility function to highlight occurrences of a search term within a text.
 * @param text The full text to search within.
 * @param highlight The search term to highlight.
 * @returns An array of strings and JSX elements with the highlighted text.
 */
export function highlightText(text: string, highlight: string) {
  if (!highlight.trim() || typeof text !== 'string') {
    return text;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-300 rounded-sm px-0.5">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
