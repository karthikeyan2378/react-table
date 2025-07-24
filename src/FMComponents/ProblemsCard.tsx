
'use client';

import * as React from 'react';
import { ListCard } from './ListCard';

export interface Problem {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    tag: string;
}

const ProblemItem = ({ item }: { item: Problem }) => (
    <div className="problem-item">
        <div className="problem-item-main">
            <span className="problem-item-title">{item.title}</span>
            <span className="problem-item-subtitle">{item.subtitle}</span>
        </div>
        <div className="problem-item-aside">
            <span className="problem-item-tag">{item.tag}</span>
            <div className="problem-item-date">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                <span>{item.date}</span>
            </div>
        </div>
    </div>
);

const SkeletonProblemItem = () => (
    <div className="problem-item animate-pulse">
        <div className="problem-item-main w-2/3">
            <div className="h-5 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
        </div>
        <div className="problem-item-aside w-1/3">
            <div className="h-5 bg-gray-300 rounded w-20 ml-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mt-2 ml-auto"></div>
        </div>
    </div>
);

interface ProblemsCardProps {
    problems: Problem[];
    isLoading?: boolean;
}

/**
 * A specialized card for displaying a list of related problems.
 * It uses the generic ListCard to provide search and pagination.
 */
export function ProblemsCard({ problems, isLoading }: ProblemsCardProps) {
    const handleExport = () => {
        console.log("Exporting problems:", problems);
        alert(`Exporting ${problems.length} problems... (Not implemented)`);
    };

    return (
        <ListCard<Problem>
            title="Problems"
            items={problems}
            isLoading={isLoading}
            renderItem={(item) => <ProblemItem key={item.id} item={item} />}
            renderSkeleton={() => <SkeletonProblemItem />}
            searchKeys={['title', 'subtitle']}
            onExport={handleExport}
            itemsPerPage={3}
        />
    );
}
