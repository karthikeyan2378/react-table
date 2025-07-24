
'use client';

import * as React from 'react';

interface InfoCardProps {
  title: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A generic, reusable card component for displaying information.
 * It provides a consistent structure with a title, an optional toolbar area, and a content body.
 * @param {InfoCardProps} props The props for the component.
 * @param {string} props.title The title to be displayed in the card's header.
 * @param {React.ReactNode} [props.toolbar] Optional controls like search or buttons to display in the header.
 * @param {React.ReactNode} props.children The main content to be rendered inside the card.
 */
export function InfoCard({ title, toolbar, children }: InfoCardProps) {
  return (
    <div className="details-card">
      <div className="details-card-header">
        <h3 className="details-card-title">{title}</h3>
        {toolbar && <div className="details-card-toolbar">{toolbar}</div>}
      </div>
      <div className="details-card-content">
        {children}
      </div>
    </div>
  );
}
