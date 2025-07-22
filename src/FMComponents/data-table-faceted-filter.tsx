
'use client';

import * as React from "react";
import { highlightText } from '../lib/utils.tsx';
import { useDropdown } from "@/hooks/use-dropdown.ts";

/** Reusable Icons as Components **/
const PlusCircleIcon = ({ color = 'hsl(var(--primary))' }: {color?: string}) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', color }}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>;

/**
 * Interface defining the structure for a filterable column.
 * This configures how a specific column can be filtered in the table toolbar.
 */
export interface FilterableColumn {
  /** The unique identifier for the column, which should match a key in the data objects. */
  id: string;
  /** The user-friendly name for the filter, displayed in the UI. */
  name: string;
  /** The type of filter input to render ('text' for free-form input, 'categorical' for a multi-select dropdown). */
  type: 'text' | 'categorical';
  /** An optional array of predefined options for a 'categorical' filter. */
  options?: { value: string; label: string }[];
  /** 
   * An optional async function for 'categorical' filters to fetch options dynamically.
   * This is triggered as the user types in the filter's search box.
   * @param query The search string entered by the user.
   * @returns A Promise that resolves to an array of options.
   */
  onSearch?: (query: string) => Promise<{ value: string; label: string }[]>;
}

/**
 * A generic faceted filter component for categorical data. It allows users to select
 * one or more values from a list to filter the data table. The list of options
 * can be provided statically or fetched dynamically from a backend via the `onSearch` prop.
 */
export function DataTableFacetedFilter<TData>({
  columnId,
  title,
  options: staticOptions = [],
  onSearch,
  onRemove,
  selectedValues,
  onFilterChange,
}: {
  /** The ID of the column this filter is associated with. */
  columnId: string;
  /** The title displayed on the filter's trigger button. */
  title?: string;
  /** A static list of options to display in the dropdown. Used if `onSearch` is not provided. */
  options?: { label: string; value: string }[];
  /** An async function to fetch options dynamically based on a search query. */
  onSearch?: (query: string) => Promise<{ label: string; value: string }[]>;
  /** A callback function to execute when the entire filter component is removed. */
  onRemove: () => void;
  /** A Set containing the currently selected filter values for this column. */
  selectedValues: Set<string>;
  /** 
   * A callback function to notify the parent component of a change in the filter selection.
   * @param value The value of the option that was changed.
   * @param isSelected The previous selection state of the option.
   */
  onFilterChange: (value: string, isSelected: boolean) => void;
}) {
  const { dropdownRef, isOpen, setIsOpen } = useDropdown();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [fetchedOptions, setFetchedOptions] = React.useState<{ label: string; value: string }[]>(staticOptions);
  const [isLoading, setIsLoading] = React.useState(false);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Handles changes to the search input field. If `onSearch` is provided, it debounces
   * the function call to prevent excessive network requests while the user is typing.
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    // If onSearch is provided, use it to fetch options dynamically.
    if (onSearch) {
      // Clear the previous debounce timer.
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      setIsLoading(true);
      // Set a new timer to execute the search after a short delay.
      debounceTimeoutRef.current = setTimeout(() => {
        onSearch(query)
          .then(results => {
            setFetchedOptions(results);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }, 300); // 300ms debounce delay.
    }
  };

  /**
   * Memoizes the list of options to display, filtering them based on the search term
   * if `onSearch` is not being used.
   */
  const filteredOptions = React.useMemo(() => {
    if (onSearch) {
      return fetchedOptions; // If searching is dynamic, display the fetched options directly.
    }
    if (!searchTerm) return staticOptions; // If no search term, show all static options.
    // Otherwise, filter the static options based on the search term.
    return staticOptions.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staticOptions, fetchedOptions, searchTerm, onSearch]);
  
  /**
   * Effect to fetch initial results when the dropdown is opened,
   * but only if it's a dynamic `onSearch` filter.
   */
  React.useEffect(() => {
    if (isOpen && onSearch) {
      setIsLoading(true);
      onSearch('').then(results => {
        setFetchedOptions(results);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [isOpen, onSearch]);


  return (
    <div className="cygnet-dt-facet-filter-container">
        <div ref={dropdownRef} className="cygnet-dt-dropdown-container">
            {/* The main button that triggers the dropdown to open. */}
            <button className="cygnet-dt-button cygnet-dt-button--outline" onClick={() => setIsOpen(!isOpen)}>
                <PlusCircleIcon />
                {title}
            </button>
            {isOpen && (
                <div className="cygnet-dt-dropdown-content" style={{right: 'auto', left: 0}}>
                    {/* Search input appears at the top of the dropdown. */}
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="cygnet-dt-input"
                        style={{ height: '2rem' }}
                      />
                    </div>
                    {/* Display a loading indicator while fetching results. */}
                    {isLoading ? (
                      <div className="cygnet-dt-dropdown-item">Loading...</div>
                    ) : (
                      <>
                        {/* If there are options, map over them and display as selectable items. */}
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map((option) => {
                            const isSelected = selectedValues.has(option.value);
                            return (
                              <label key={option.value} className="cygnet-dt-dropdown-item cygnet-dt-dropdown-item--checkbox">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => onFilterChange(option.value, isSelected)}
                                />
                                {highlightText(option.label, searchTerm)}
                              </label>
                            );
                          })
                        ) : (
                          // If there are no options, display a "No results" message.
                          <div className="cygnet-dt-dropdown-item" style={{ color: '#6b7280', cursor: 'default' }}>
                            No results found.
                          </div>
                        )}
                      </>
                    )}
                    {/* If any options are selected, show a "Clear filters" button. */}
                    {selectedValues.size > 0 && !isLoading && (
                        <>
                        <div className="cygnet-dt-dropdown-separator" />
                        <button
                            onClick={() => {
                                // De-select each of the currently selected values.
                                selectedValues.forEach(value => onFilterChange(value, true));
                                setIsOpen(false);
                            }}
                            className="cygnet-dt-dropdown-item justify-center"
                        >
                            Clear filters
                        </button>
                        </>
                    )}
                </div>
            )}
        </div>

        {/* Display badges for each currently selected value. */}
        {Array.from(selectedValues).map(value => (
            <span
                key={value}
                className="cygnet-dt-badge cygnet-dt-badge--filter"
                style={{ backgroundColor: '#6B7280' }}
            >
                {value}
                {/* Button within the badge to remove that specific filter value. */}
                <button
                    className="cygnet-dt-badge-remove"
                    onClick={() => onFilterChange(value, true)}
                >
                    <XIcon />
                </button>
            </span>
        ))}
    </div>
  );
}
