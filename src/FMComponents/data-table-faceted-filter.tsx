
'use client';

import * as React from "react";
import { highlightText } from '../lib/utils.tsx';
import { useDropdown } from "@/hooks/use-dropdown.ts";

/** Reusable Icons as Components **/
const PlusCircleIcon = ({ color = 'hsl(var(--primary))' }: {color?: string}) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', color }}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>;

/**
 * Interface defining the structure for a filterable column.
 */
export interface FilterableColumn {
  id: string;
  name: string;
  type: 'text' | 'categorical';
  options?: { value: string; label: string }[];
  onSearch?: (query: string) => Promise<{ value: string; label: string }[]>;
}

/**
 * A generic faceted filter component for categorical data.
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
  columnId: string;
  title?: string;
  options?: { label: string; value: string }[];
  onSearch?: (query: string) => Promise<{ label: string; value: string }[]>;
  onRemove: () => void;
  selectedValues: Set<string>;
  onFilterChange: (value: string, isSelected: boolean) => void;
}) {
  const { dropdownRef, isOpen, setIsOpen } = useDropdown();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [fetchedOptions, setFetchedOptions] = React.useState<{ label: string; value: string }[]>(staticOptions);
  const [isLoading, setIsLoading] = React.useState(false);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (onSearch) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      setIsLoading(true);
      debounceTimeoutRef.current = setTimeout(() => {
        onSearch(query)
          .then(results => {
            setFetchedOptions(results);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }, 300); // 300ms debounce
    }
  };

  const filteredOptions = React.useMemo(() => {
    if (onSearch) {
      return fetchedOptions;
    }
    if (!searchTerm) return staticOptions;
    return staticOptions.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staticOptions, fetchedOptions, searchTerm, onSearch]);
  
  // When dropdown opens, if it's an onSearch filter, fetch initial results
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
            <button className="cygnet-dt-button cygnet-dt-button--outline" onClick={() => setIsOpen(!isOpen)}>
                <PlusCircleIcon />
                {title}
            </button>
            {isOpen && (
                <div className="cygnet-dt-dropdown-content" style={{right: 'auto', left: 0}}>
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
                    {isLoading ? (
                      <div className="cygnet-dt-dropdown-item">Loading...</div>
                    ) : (
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
                    )}
                    {selectedValues.size > 0 && !isLoading && (
                        <>
                        <div className="cygnet-dt-dropdown-separator" />
                        <button
                            onClick={() => {
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

        {Array.from(selectedValues).map(value => (
            <span
                key={value}
                className="cygnet-dt-badge cygnet-dt-badge--filter"
                style={{ backgroundColor: '#6B7280' }}
            >
                {value}
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
