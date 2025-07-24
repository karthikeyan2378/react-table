
'use client';

import * as React from 'react';
import { type Alarm } from '@/config/alarm-config';
import { DetailsHeader } from './DetailsHeader';
import { AlarmDetailsCard } from './AlarmDetailsCard';
import { AlarmCommentsCard } from './AlarmCommentsCard';
import { ProblemsCard } from './ProblemsCard';
import { ServicesCard } from './ServicesCard';
import './css/details-page.css';

interface PropertyPageProps {
  rowData: Alarm;
}

/**
 * A detailed dashboard-style component to display all information related to a single alarm.
 * It serves as the main layout container for various specialized cards.
 * @param {PropertyPageProps} props The props for the component.
 * @param {Alarm} props.rowData The full data object for the alarm to be displayed.
 */
export function PropertyPage({ rowData }: PropertyPageProps) {
  return (
    <div className="details-page-container">
      {/* The main header section displaying the alarm title and status. */}
      <DetailsHeader rowData={rowData} />

      {/* A grid layout for all the informational cards. */}
      <div className="details-page-grid">
        {/* The main card for displaying key-value alarm properties. */}
        <div className="details-card-large">
          <AlarmDetailsCard rowData={rowData} />
        </div>
        
        {/* A card for displaying and adding alarm comments. */}
        <div className="details-card-small">
          <AlarmCommentsCard />
        </div>
        
        {/* A card listing associated problems, with search functionality. */}
        <div className="details-card-large">
          <ProblemsCard />
        </div>
        
        {/* A card for showing related services. */}
        <div className="details-card-small">
          <ServicesCard />
        </div>
      </div>
    </div>
  );
}
