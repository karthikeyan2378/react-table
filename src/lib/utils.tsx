
import * as React from 'react';

/**
 * A utility function to highlight occurrences of a search term within a text.
 * It can handle both string and ReactNode inputs, allowing for chained highlighting.
 * @param text The text or ReactNode to search within.
 * @param highlight The search term to highlight.
 * @returns A ReactNode with the highlighted text.
 */
export function highlightText(text: React.ReactNode, highlight: string): React.ReactNode {
  if (!highlight.trim()) {
    return text;
  }

  const highlightRegex = new RegExp(`(${highlight})`, 'gi');

  const highlightNode = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      if (!node.match(highlightRegex)) return node;
      
      const parts = node.split(highlightRegex);
      return parts.map((part, i) =>
        highlightRegex.test(part) ? (
          <span key={i} className="bg-yellow-300 rounded-sm px-0.5">
            {part}
          </span>
        ) : (
          part
        )
      );
    }

    if (React.isValidElement(node) && node.props.children) {
      return React.cloneElement(node, {
        ...node.props,
        children: highlightNode(node.props.children),
      });
    }
    
    if (Array.isArray(node)) {
        return node.map((child, index) => <React.Fragment key={index}>{highlightNode(child)}</React.Fragment>);
    }

    return node;
  };

  return highlightNode(text);
}
