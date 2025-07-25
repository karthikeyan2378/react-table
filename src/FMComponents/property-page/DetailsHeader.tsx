
'use client';

import * as React from 'react';
import { type Alarm, alarmConfig } from '@/config/alarm-config';

interface DetailsHeaderProps {
  rowData: Alarm;
  onBack: () => void;
}

/**
 * A component to render the main header for the details page.
 * It displays the primary alarm name, severity badges, and secondary information.
 * @param {DetailsHeaderProps} props The props for the component.
 * @param {Alarm} props.rowData The data for the alarm to be displayed.
 */
export function DetailsHeader({ rowData, onBack }: DetailsHeaderProps) {
  const { AlarmName, Severity, NELabel } = rowData;
  const severityColor = alarmConfig.fields.Severity.chartConfig?.colors[Severity] || '#6B7280';

  return (
    <div className="details-header">
       <button onClick={onBack} className="details-header-back-btn" aria-label="Go back">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
      </button>
      <div className="details-header-content">
        <div className="details-header-title-row">
          {/* The main title of the alarm. */}
          <h2 className="details-header-title">{AlarmName}</h2>
          <div className="details-header-badges">
            {/* A badge for the alarm's severity, colored appropriately. */}
            <span className="details-header-badge" style={{ backgroundColor: severityColor }}>
              {Severity}
            </span>
            {/* Example of other status badges. */}
            <span className="details-header-badge" style={{ backgroundColor: '#22C55E' }}>
              Raised
            </span>
            <span className="details-header-badge" style={{ backgroundColor: '#3B82F6' }}>
              CIENA
            </span>
          </div>
        </div>
        <div className="details-header-subtitle">
          {/* An icon indicating the network element. */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          {/* The secondary information line. */}
          <span>On ME : {NELabel} [CIENA-MCP-NMS]</span>
        </div>
      </div>
    </div>
  );
}
