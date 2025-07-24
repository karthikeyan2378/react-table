
'use client';

import * as React from 'react';

// An object mapping property keys to their respective SVG icons.
const defaultIcons: Record<string, React.ReactNode> = {
  default: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>,
  id: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  location: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  time: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>,
  cause: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>,
  status: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>,
  user: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  tag: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" x2="7.01" y1="7" y2="7"></line></svg>,
};

/**
 * A helper function to format date values for display.
 */
const formatDate = (date: Date | string) => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
         d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

/**
 * A reusable component to render a single key-value property with an icon.
 */
const PropertyItem = ({ label, value, icon }: { label: string, value: React.ReactNode, icon: React.ReactNode }) => (
  <div className="details-property-item">
    <div className="details-property-icon">{icon}</div>
    <div className="details-property-content">
      <span className="details-property-label">{label}</span>
      <span className="details-property-value">{value}</span>
    </div>
  </div>
);

const SkeletonPropertyItem = () => (
    <div className="details-property-item animate-pulse">
        <div className="details-property-icon bg-gray-200 rounded-full w-6 h-6"></div>
        <div className="details-property-content w-full">
            <div className="details-property-label bg-gray-200 h-4 w-1/3 rounded"></div>
            <div className="details-property-value bg-gray-200 h-5 w-2/3 rounded mt-1"></div>
        </div>
    </div>
);


export interface PropertyConfig {
  key: string;
  label: string;
  icon?: keyof typeof defaultIcons;
  type?: 'date' | 'string';
}

interface KeyValueCardProps<T extends object> {
  title: string;
  data: T | null;
  propertyConfig: PropertyConfig[];
  isLoading?: boolean;
  columns?: 2 | 3;
}

/**
 * A generic card component that displays key-value pairs from a data object
 * based on a provided configuration. It supports loading skeletons and a configurable number of columns.
 * @param {number} [props.columns=2] - The number of columns to display (2 or 3).
 */
export function KeyValueCard<T extends object>({
  title,
  data,
  propertyConfig,
  isLoading = false,
  columns = 2
}: KeyValueCardProps<T>) {
  const cardStyle = { '--columns': columns } as React.CSSProperties;

  return (
    <div className="details-card">
      <h3 className="details-card-title">{title}</h3>
      <div className="details-card-content details-grid-var-col" style={cardStyle}>
        {isLoading && (
            // Render skeleton loaders if isLoading is true
            Array.from({ length: 8 }).map((_, index) => <SkeletonPropertyItem key={index} />)
        )}
        {!isLoading && data && propertyConfig.map(({ key, label, icon, type }) => {
          let value = (data as any)[key] as string | Date;
          
          if (type === 'date' && value) {
            value = formatDate(value);
          }

          return (
            <PropertyItem
              key={key}
              label={label}
              value={String(value || '-')}
              icon={defaultIcons[icon || 'default']}
            />
          );
        })}
      </div>
    </div>
  );
}
