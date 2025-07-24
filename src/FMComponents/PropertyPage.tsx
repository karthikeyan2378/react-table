
'use client';

import * as React from 'react';
import { type Alarm } from '@/config/alarm-config';

// --- Placeholder Components ---
// These are mock components based on the legacy PropertyPage class provided.
// You can replace them with your actual component implementations.

/**
 * Placeholder for the HeaderInfoPanelBuilder functionality.
 * Displays the main identifier of the alarm.
 */
const HeaderInfoPanel = ({ rowData }: { rowData: Alarm }) => (
  <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{rowData.ObjectLabel}</h2>
    <p style={{ color: '#6b7280' }}>ID: {rowData.AlarmID}</p>
  </div>
);

/**
 * Placeholder for the ContentDivManager functionality.
 * Displays a summary of the alarm.
 */
const ContentSummary = ({ rowData }: { rowData: Alarm }) => (
  <div style={{ marginBottom: '1rem' }}>
    <p>
      This is a <strong>{rowData.Severity}</strong> severity alarm named "{rowData.AlarmName}" on the "{rowData.ObjectType}" object type.
    </p>
  </div>
);

/**
 * Placeholder for a generic property card.
 */
const PropertyCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', backgroundColor: '#ffffff' }}>
    <h3 style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', fontWeight: 500 }}>{title}</h3>
    <div style={{ padding: '1rem' }}>{children}</div>
  </div>
);

// --- Main PropertyPage Component ---

interface PropertyPageProps {
  rowData: Alarm;
  // These props are based on the legacy class constructor.
  // In React, you'd typically pass data or components directly.
  loadedTabs?: React.ReactNode[];
  loadingTabs?: ((rowData: Alarm) => React.ReactNode)[];
  userDefinedTabs?: ((rowData: Alarm) => React.ReactNode)[];
}

/**
 * A React component to display detailed properties for a given data row.
 * This component is a conversion of the legacy PropertyPage class.
 */
export function PropertyPage({
  rowData,
  loadedTabs = [],
  loadingTabs = [],
  userDefinedTabs = [],
}: PropertyPageProps) {

  // --- Mock Tab/Card Content ---
  // This simulates the logic from _load...Tabs methods.

  const generalInfoCard = (
    <PropertyCard key="general" title="General Information">
      <p><strong>NE Label:</strong> {rowData.NELabel}</p>
      <p><strong>State:</strong> {rowData.State}</p>
      <p><strong>Vendor:</strong> {rowData.Vendor}</p>
    </PropertyCard>
  );

  const timeInfoCard = (
    <PropertyCard key="time" title="Timestamps">
        <p><strong>Raised Time:</strong> {new Date(rowData.NetworkRaisedTimeLong).toLocaleString()}</p>
        <p><strong>Last Modified:</strong> {new Date(rowData.NetworkLastModifiedTimeLong).toLocaleString()}</p>
    </PropertyCard>
  );

  const allLoadedTabs = [generalInfoCard, ...loadedTabs];

  const allLoadingTabs = loadingTabs.map((fn, i) => <React.Fragment key={`loading-${i}`}>{fn(rowData)}</React.Fragment>);

  const allUserDefinedTabs = userDefinedTabs.map((fn, i) => <React.Fragment key={`user-${i}`}>{fn(rowData)}</React.Fragment>);

  return (
    <div>
      {/* Replicates mainHeaderDiv */}
      <div style={{ width: '100%' }}>
        <HeaderInfoPanel rowData={rowData} />
      </div>

      {/* Replicates the content added by ContentDivManager */}
      <div style={{ marginTop: '1rem' }}>
        <ContentSummary rowData={rowData} />
      </div>

      {/* Replicates propertiesInnerDiv */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {allLoadedTabs}
        {timeInfoCard}
        {allLoadingTabs}
      </div>

      {/* Replicates userDefinedInnerDiv */}
      {allUserDefinedTabs.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          {allUserDefinedTabs}
        </div>
      )}
    </div>
  );
}
