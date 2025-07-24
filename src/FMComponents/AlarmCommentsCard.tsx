
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
 * An icon for the "No Comments" placeholder.
 */
const NoCommentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    <line x1="8" y1="10" x2="16" y2="10"></line>
    <line x1="8" y1="14" x2="12" y2="14"></line>
  </svg>
);

/**
 * An "Add" icon for the comment submission button.
 */
const AddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="1"><path d="M11 11v-11h1v11h11v1h-11v11h-1v-11h-11v-1h11z"/></svg>
);

/**
 * A specialized card for displaying and adding alarm comments.
 * It uses the generic InfoCard and provides specific content for comments.
 */
export function AlarmCommentsCard() {
  return (
    <InfoCard title="Alarm Comments">
      <div className="comments-card-container">
        {/* The text input area for new comments. */}
        <div className="comment-input-area">
          <textarea
            className="comment-textarea"
            placeholder="Add comments here..."
          />
          <button className="comment-add-btn" aria-label="Add comment">
            <AddIcon />
          </button>
        </div>
        
        {/* Placeholder shown when there are no comments. In a real app, this would be a list of comments. */}
        <Placeholder
          icon={<NoCommentsIcon />}
          message="No Comments"
          details="Comments not available at the moment"
        />
      </div>
    </InfoCard>
  );
}
