
'use client';

import * as React from 'react';

// --- Generic Placeholder Components ---

/**
 * A generic header panel that displays the first two properties of any data object.
 */
const HeaderInfoPanel = <T extends object>({ rowData }: { rowData: T }) => {
  const keys = Object.keys(rowData) as (keyof T)[];
  const primaryField = keys.length > 0 ? String(rowData[keys[1]]) : 'N/A';
  const secondaryField = keys.length > 1 ? String(rowData[keys[0]]) : 'N/A';

  return (
    <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{primaryField}</h2>
      <p style={{ color: '#6b7280' }}>ID: {secondaryField}</p>
    </div>
  );
};

/**
 * A generic summary component.
 */
const ContentSummary = <T extends object>({ rowData }: { rowData: T }) => (
  <div style={{ marginBottom: '1rem' }}>
    <p>Detailed properties for the selected item.</p>
  </div>
);

/**
 * A generic property card for displaying content with a title.
 */
const PropertyCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', backgroundColor: '#ffffff' }}>
    <h3 style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', fontWeight: 500 }}>{title}</h3>
    <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem' }}>{children}</div>
  </div>
);

// --- Main Generic PropertyPage Component ---

interface PropertyPageProps<T extends object> {
  rowData: T;
  // In a real implementation, you might pass custom tab/card components as children or props.
}

/**
 * A generic React component to display detailed properties for a given data row.
 */
export function PropertyPage<T extends object>({
  rowData
}: PropertyPageProps<T>) {

  // Dynamically generate property listings from rowData
  const generalInfoCard = (
    <PropertyCard key="general" title="General Information">
      {Object.entries(rowData).map(([key, value]) => (
        <React.Fragment key={key}>
          <strong style={{ textAlign: 'right' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>
          <span>{value instanceof Date ? value.toLocaleString() : String(value)}</span>
        </React.Fragment>
      ))}
    </PropertyCard>
  );

  return (
    <div>
      {/* Main header displaying the object's primary identifier */}
      <div style={{ width: '100%' }}>
        <HeaderInfoPanel rowData={rowData} />
      </div>

      {/* A summary section */}
      <div style={{ marginTop: '1rem' }}>
        <ContentSummary rowData={rowData} />
      </div>

      {/* The main properties section, dynamically rendered */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {generalInfoCard}
      </div>
    </div>
  );
}
