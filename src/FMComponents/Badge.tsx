
'use client';

import * as React from 'react';
import './css/badge.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'filter';
}

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
