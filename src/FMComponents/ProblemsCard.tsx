
'use client';

import * as React from 'react';
import { InfoCard } from './InfoCard';

/**
 * A search input component specifically for the card toolbar.
 */
const CardSearchInput = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  return (
    <div className="card-search-container">
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="card-search-input"
      />
      {/* Search icon inside the input */}
      <svg className="card-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
      {/* Clear button appears when there is text */}
      {searchTerm && (
        <button className="card-search-clear" onClick={() => setSearchTerm('')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="M6 6l12 12"></path></svg>
        </button>
      )}
    </div>
  );
};

/**
 * An export icon button for the card toolbar.
 */
const ExportButton = () => (
    <button className="card-toolbar-btn" aria-label="Export data">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
    </button>
)

/**
 * A mock data item representing a "Problem".
 */
const ProblemItem = ({ title, subtitle, date }: { title: string, subtitle: string, date: string }) => (
    <div className="problem-item">
        <div className="problem-item-main">
            <span className="problem-item-title">{title}</span>
            <span className="problem-item-subtitle">{subtitle}</span>
        </div>
        <div className="problem-item-aside">
            <span className="problem-item-tag">FiberPair</span>
            <div className="problem-item-date">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                <span>{date}</span>
            </div>
        </div>
    </div>
);


/**
 * A specialized card for displaying a list of related problems.
 * It includes a toolbar with search and export functionality.
 */
export function ProblemsCard() {
  const toolbar = (
    <>
      <CardSearchInput />
      <ExportButton />
    </>
  );

  return (
    <InfoCard title="Problems" toolbar={toolbar}>
        {/* In a real app, this would be a list of dynamically fetched problems. */}
        <div className="problems-list">
            <ProblemItem 
                title="Cable FiberPair Failure"
                subtitle="EAC-2B1_MNL01-FP3_TSA13-FP3"
                date="24-Jul-2025 16:46:41"
            />
        </div>
    </InfoCard>
  );
}
