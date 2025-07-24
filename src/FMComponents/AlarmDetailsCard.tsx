
'use client';

import * as React from 'react';
import { type Alarm } from '@/config/alarm-config';

// An object mapping alarm property keys to their respective SVG icons.
// This makes it easy to associate an icon with a piece of data.
const propertyIcons: Record<string, React.ReactNode> = {
  AlarmID: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  NELabel: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  NetworkRaisedTimeLong: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>,
  ProbableCause: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>,
  NativeProbableCause: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>,
  TTStatus: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>,
  TTID: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" x2="7.01" y1="7" y2="7"></line></svg>,
  TTCreatedTime: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
};

/**
 * A helper function to format date values for display.
 * @param {Date | string} date The date to format.
 * @returns {string} The formatted date string.
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
 * @param {object} props The props for the component.
 * @param {string} props.label The label (key) of the property.
 * @param {React.ReactNode} props.value The value of the property.
 * @param {React.ReactNode} props.icon The icon to display next to the label.
 */
const PropertyItem = ({ label, value, icon }: { label: string, value: React.ReactNode, icon: React.ReactNode }) => (
  <div className="details-property-item">
    <div className="details-property-icon">
      {icon}
    </div>
    <div className="details-property-content">
      <span className="details-property-label">{label}</span>
      <span className="details-property-value">{value}</span>
    </div>
  </div>
);

/**
 * A specialized card component that displays the main details of an alarm.
 * It lays out key properties in a two-column grid with corresponding icons.
 * @param {{ rowData: Alarm }} props The props for the component.
 */
export function AlarmDetailsCard({ rowData }: { rowData: Alarm }) {
  // Define which properties to display in the card and in what order.
  const propertiesToShow = [
    { key: 'AlarmID', label: 'Alarm ID' },
    { key: 'NELabel', label: 'NE Label' },
    { key: 'NetworkRaisedTimeLong', label: 'Network Raised Time' },
    { key: 'ProbableCause', label: 'Probable Cause' },
    { key: 'NativeProbableCause', label: 'Native Probable Cause' },
    { key: 'TTID', label: 'TT ID' },
    { key: 'TTStatus', label: 'TT Status' },
    { key: 'TTCreatedTime', label: 'TT Created Time' },
  ];

  return (
    <div className="details-card">
      <h3 className="details-card-title">Alarm Details</h3>
      <div className="details-card-content details-grid-2-col">
        {propertiesToShow.map(({ key, label }) => {
          // Get the raw value from the row data.
          let value = rowData[key as keyof Alarm] as string | Date;
          
          // Format the value if it's a date.
          if (key.includes('Time') && value) {
            value = formatDate(value);
          }

          return (
            <PropertyItem
              key={key}
              label={label}
              value={String(value || '-')}
              icon={propertyIcons[key] || propertyIcons['TTStatus']} // Default icon
            />
          );
        })}
      </div>
    </div>
  );
}
