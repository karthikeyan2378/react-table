
'use client';

import * as React from 'react';
import { InfoCard } from './InfoCard';

/**
 * A placeholder component that shows a message indicating no content is available.
 * @param {object} props The props for the component.
 * @param {React.ReactNode} props.icon The icon to display.
 * @param {string} props.message The main message text.
 * @param {string} props.details The detailed sub-message.
 */
const Placeholder = ({ icon, message, details }: { icon: React.ReactNode, message: string, details: string }) => (
    <div className="details-placeholder">
      <div className="details-placeholder-icon">{icon}</div>
      <span className="details-placeholder-message">{message}</span>
      <span className="details-placeholder-details">{details}</span>
    </div>
  );

/**
 * An icon for the "No Services" placeholder.
 */
const NoServicesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 22v-2.1l1.8-1.8c.4-.4.8-.7 1.3-1 .4-.3.9-.6 1.4-.8.5-.2 1.1-.4 1.8-.5 1.3-.3 2.8-.3 4.2 0 .6.1 1.2.3 1.8.5.5.2 1 .5 1.4.8.5.3.9.6 1.3 1l1.8 1.8V22"/><path d="M5.5 2h.1l1.8 1.8c.4.4.8.7 1.3 1 .4.3.9.6 1.4.8.5.2 1.1.4 1.8.5 1.3.3 2.8-.3 4.2 0 .6.1 1.2.3 1.8.5.5.2 1 .5 1.4.8.5.3.9.6 1.3 1L22 7.5V2h-.1"/><path d="M2 16.5v.1l1.8-1.8c.4-.4.8-.7 1.3-1 .4-.3.9-.6 1.4-.8.5-.2 1.1-.4 1.8-.5 1.3-.3 2.8.3 4.2 0 .6-.1 1.2-.3 1.8-.5.5-.2 1-.5 1.4-.8.5-.3.9-.6 1.3-1l1.8-1.8v-.1"/><path d="M22 12.5v-.1l-1.8-1.8c-.4-.4-.8-.7-1.3-1-.4-.3-.9-.6-1.4-.8-.5-.2-1.1-.4-1.8-.5-1.3-.3-2.8.3-4.2 0-.6-.1-1.2-.3-1.8-.5-.5-.2-1-.5-1.4-.8-.5-.3-.9-.6-1.3-1L2 2.5v.1"/><circle cx="12" cy="12" r="3"/></svg>
);


/**
 * A specialized card for displaying related services.
 * Currently, it shows a placeholder as there is no service data.
 */
export function ServicesCard() {
  return (
    <InfoCard title="Services">
        <Placeholder
          icon={<NoServicesIcon />}
          message="No Services"
          details="Services details not available at the moment"
        />
    </InfoCard>
  );
}
