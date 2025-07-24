
'use client';

import * as React from 'react';
import { InfoCard } from './InfoCard';
import { highlightText } from '@/lib/utils';

const CardSearchInput = ({
    searchTerm,
    onSearchTermChange,
    placeholder = "Search",
    disabled = false
}: {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}) => (
    <div className="card-search-container">
        <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="card-search-input"
            disabled={disabled}
        />
        <svg className="card-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
        {searchTerm && (
            <button className="card-search-clear" onClick={() => onSearchTermChange('')} disabled={disabled}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="M6 6l12 12"></path></svg>
            </button>
        )}
    </div>
);

const ExportButton = ({ onExport, disabled }: { onExport: () => void; disabled?: boolean }) => (
    <button className="card-toolbar-btn" aria-label="Export data" onClick={onExport} disabled={disabled}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
    </button>
);

const PagePrevIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const PageNextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;

interface ListCardProps<T> {
    title: string;
    items: T[];
    renderItem: (item: T, searchTerm: string) => React.ReactNode;
    renderSkeleton: () => React.ReactNode;
    isLoading?: boolean;
    onExport?: () => void;
    itemsPerPage?: number;
    searchKeys: (keyof T)[];
    className?: string;
}

/**
 * A generic card for displaying a searchable, paginated list of items. It includes
 * loading skeletons, search, pagination, and an optional export button.
 */
export function ListCard<T extends object>({
    title,
    items,
    renderItem,
    renderSkeleton,
    isLoading = false,
    onExport,
    itemsPerPage = 5,
    searchKeys,
    className
}: ListCardProps<T>) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(0);

    const filteredItems = React.useMemo(() => {
        if (!searchTerm) return items;
        const lowercasedTerm = searchTerm.toLowerCase();
        return items.filter(item => 
            searchKeys.some(key => 
                String((item as any)[key] ?? '').toLowerCase().includes(lowercasedTerm)
            )
        );
    }, [items, searchTerm, searchKeys]);

    const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    React.useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    const toolbar = (
        <>
            <CardSearchInput
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                disabled={isLoading}
            />
            {onExport && <ExportButton onExport={onExport} disabled={isLoading} />}
        </>
    );

    return (
        <InfoCard title={title} toolbar={toolbar} className={className}>
            <div className="list-card-container">
                <div className="list-card-items">
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>)
                        : paginatedItems.length > 0
                        ? paginatedItems.map((item, index) => (
                              <React.Fragment key={index}>
                                  {renderItem(item, searchTerm)}
                              </React.Fragment>
                          ))
                        : (
                            <div className="details-placeholder">
                                <span className="details-placeholder-message">No Results</span>
                                <span className="details-placeholder-details">
                                    {searchTerm ? `No items match "${searchTerm}"` : 'There are no items to display.'}
                                </span>
                            </div>
                        )
                    }
                </div>

                {pageCount > 1 && (
                    <div className="list-card-pagination">
                        <span className="pagination-info">Page {currentPage + 1} of {pageCount}</span>
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(p => p - 1)}
                                disabled={currentPage === 0 || isLoading}
                            >
                                <PagePrevIcon />
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage >= pageCount - 1 || isLoading}
                            >
                                <PageNextIcon />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </InfoCard>
    );
}
