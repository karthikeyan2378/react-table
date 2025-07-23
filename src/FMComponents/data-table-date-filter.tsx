
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { DayPicker, type DateRange } from 'react-day-picker';
import { useDropdown } from '@/hooks/use-dropdown';

// Import the stylesheet for react-day-picker
import 'react-day-picker/dist/style.css'; 

/** Reusable Icons as Components **/
const CalendarIcon = ({ color = 'hsl(var(--primary))' }: {color?: string}) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', color }}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>;

interface DataTableDateFilterProps {
  /** The title displayed on the filter's trigger button. */
  title?: string;
  /** A callback function to execute when the entire filter component is removed. */
  onRemove: () => void;
  /** The currently selected date range. */
  selectedDateRange?: DateRange;
  /** A callback function to notify the parent component of a change in the date range. */
  onFilterChange: (dateRange: DateRange | undefined) => void;
}

/**
 * A date range filter component for the data table. It uses `react-day-picker`
 * to provide a calendar in a popover for selecting a "from" and "to" date.
 */
export function DataTableDateFilter({
  title,
  onRemove,
  selectedDateRange,
  onFilterChange,
}: DataTableDateFilterProps) {
  const { dropdownRef, isOpen, setIsOpen } = useDropdown();
  const [date, setDate] = React.useState<DateRange | undefined>(selectedDateRange);

  // When the date state changes, call the onFilterChange callback
  React.useEffect(() => {
    onFilterChange(date);
  }, [date, onFilterChange]);

  const handleClearFilter = () => {
    setDate(undefined);
    onRemove(); // This also triggers removing the filter from the active list
  };

  return (
    <div className="cygnet-dt-facet-filter-container">
      <div ref={dropdownRef} className="cygnet-dt-dropdown-container">
        {/* The main button that triggers the dropdown to open. */}
        <button className="cygnet-dt-button cygnet-dt-button--outline" onClick={() => setIsOpen(!isOpen)}>
          <CalendarIcon />
          {title}
        </button>
        {isOpen && (
          <div className="cygnet-dt-dropdown-content" style={{ right: 'auto', left: 0, padding: 0 }}>
            <DayPicker
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </div>
        )}
      </div>

      {date?.from && (
        <div className="cygnet-dt-button cygnet-dt-button--outline">
          {format(date.from, 'LLL dd, y')}
          {date.to && ` - ${format(date.to, 'LLL dd, y')}`}
          <button
            className="cygnet-badge-remove"
            style={{ marginLeft: '0.5rem' }}
            onClick={handleClearFilter}
          >
            <XIcon />
          </button>
        </div>
      )}
    </div>
  );
}
