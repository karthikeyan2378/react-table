
'use client';

import * as React from 'react';
import { ListCard } from './ListCard';

export interface Service {
    id: string;
    name: string;
    status: 'Online' | 'Offline' | 'Degraded';
    type: string;
}

const statusColors: Record<Service['status'], string> = {
    Online: '#22C55E',    // green-500
    Offline: '#EF4444',   // red-500
    Degraded: '#F97316',  // orange-500
};

const ServiceItem = ({ item }: { item: Service }) => (
    <div className="service-item" key={item.id}>
        <div className="service-item-main">
            <span className="service-item-name">{item.name}</span>
            <span className="service-item-type">{item.type}</span>
        </div>
        <div className="service-item-aside">
            <span className="service-item-status" style={{ backgroundColor: statusColors[item.status] }}>
                {item.status}
            </span>
        </div>
    </div>
);

const SkeletonServiceItem = () => (
    <div className="service-item animate-pulse">
        <div className="service-item-main w-2/3">
            <div className="h-5 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
        </div>
        <div className="service-item-aside w-1/3">
            <div className="h-6 bg-gray-300 rounded-full w-24 ml-auto"></div>
        </div>
    </div>
);

interface ServicesCardProps {
    services: Service[];
    isLoading?: boolean;
}

/**
 * A specialized card for displaying related services.
 */
export function ServicesCard({ services, isLoading }: ServicesCardProps) {
    return (
        <ListCard<Service>
            title="Services"
            items={services}
            isLoading={isLoading}
            renderItem={(item) => <ServiceItem item={item} />}
            renderSkeleton={() => <SkeletonServiceItem />}
            searchKeys={['name', 'type']}
            itemsPerPage={4}
        />
    );
}
