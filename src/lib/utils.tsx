
import * as React from 'react';

/**
 * A utility function to highlight occurrences of a search term within a text.
 * It can handle both string and ReactNode inputs, and the highlight term can be a string or an array of strings.
 * @param text The text or ReactNode to search within.
 * @param highlight The search term(s) to highlight.
 * @returns A ReactNode with the highlighted text.
 */
export function highlightText(text: React.ReactNode, highlight: string | string[]): React.ReactNode {
  if (!highlight || (typeof highlight === 'string' && !highlight.trim()) || (Array.isArray(highlight) && highlight.length === 0)) {
    return text;
  }

  // Sanitize each part of the highlight term to escape special regex characters.
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const highlightPattern = Array.isArray(highlight)
    ? highlight.filter(Boolean).map(escapeRegExp).join('|')
    : escapeRegExp(highlight);
  
  if (!highlightPattern) {
    return text;
  }

  const highlightRegex = new RegExp(`(${highlightPattern})`, 'gi');

  const highlightNode = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      if (!node.match(highlightRegex)) return node;
      
      const parts = node.split(highlightRegex);
      return parts.map((part, i) =>
        highlightRegex.test(part) ? (
          <span key={i} className="bg-[#f3e22f7a] rounded-sm px-0.5">
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
