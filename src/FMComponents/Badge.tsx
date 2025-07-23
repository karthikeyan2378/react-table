
'use client';

import * as React from 'react';
import './css/badge.css';

/**
 * Props for the Badge component.
 * Extends standard HTML div attributes.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The variant of the badge, which can alter its appearance.
   * - `filter`: A specific style for badges used in filter controls, often to indicate an active filter.
   */
  variant?: 'filter';
}

/**
 * A simple, reusable component for displaying badges or tags.
 * It supports different visual variants and can be extended with standard HTML attributes.
 * @param {BadgeProps} props The props for the component.
 * @param {string} [props.className] - Additional classes for custom styling.
 * @param {'filter'} [props.variant] - The visual variant of the badge.
 * @param {React.ReactNode} [props.children] - The content to display inside the badge.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  const badgeClasses = [
    'cygnet-badge',
    variant ? `cygnet-badge--${variant}` : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={badgeClasses} {...props} />
  );
}

export { Badge };
