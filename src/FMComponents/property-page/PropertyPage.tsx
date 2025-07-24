
'use client';

import * as React from 'react';
import { type Alarm } from '@/config/alarm-config';
import { DetailsHeader } from './DetailsHeader';
import { KeyValueCard, type PropertyConfig } from './KeyValueCard';
import { CommentsCard, type Comment } from './CommentsCard';
import { ListCard } from './ListCard';
import { highlightText } from '@/lib/utils';
import './css/details-page.css';

// Mock Data Types
export interface Problem {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    tag: string;
}

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

// Mock Data Fetching
const getMockComments = (): Promise<Comment[]> => new Promise(resolve => setTimeout(() => resolve([
    { id: 1, author: 'Admin', text: 'Initial investigation shows a possible fiber cut. Assigning to field ops.', time: '2 hours ago' },
    { id: 2, author: 'John Doe', text: 'Field team dispatched. ETA 45 minutes.', time: '1 hour ago' },
    { id: 3, author: 'Jane Smith', text: 'Cable has been repaired. Monitoring service levels.', time: '15 minutes ago' },
]), 1500));

const getMockProblems = (): Promise<Problem[]> => new Promise(resolve => setTimeout(() => resolve([
    { id: 'prob-1', title: 'Cable FiberPair Failure', subtitle: 'EAC-2B1_MNL01-FP3_TSA13-FP3', date: '24-Jul-2025 16:46:41', tag: 'FiberPair' },
    { id: 'prob-2', title: 'Power Outage Zone A', subtitle: 'ZONE-A-POWER-GRID', date: '23-Jul-2025 10:00:00', tag: 'Power' },
    { id: 'prob-3', title: 'Repeater Unit Offline', subtitle: 'RPT-55_BLD-C', date: '22-Jul-2025 08:30:11', tag: 'Equipment' },
    { id: 'prob-4', title: 'Packet Loss High', subtitle: 'CORE-RTR-1_INTERFACE-2', date: '21-Jul-2025 11:05:00', tag: 'Network' },
    { id: 'prob-5', title: 'Authentication Failure', subtitle: 'RADIUS-SERVER-1', date: '20-Jul-2025 18:00:00', tag: 'Security' },
]), 2000));

const getMockServices = (): Promise<Service[]> => new Promise(resolve => setTimeout(() => resolve([
    { id: 'svc-1', name: 'MPLS-VPN-CUSTOMER-A', type: 'L3 VPN', status: 'Online' },
    { id: 'svc-2', name: 'INTERNET-BACKBONE-TRANSIT', type: 'IP Transit', status: 'Degraded' },
    { id: 'svc-3', name: 'VOIP-TRUNK-INTERNATIONAL', type: 'SIP Trunk', status: 'Online' },
    { id: 'svc-4', name: 'DARK-FIBER-LEASE-XYZ', type: 'Leased Line', status: 'Offline' },
    { id: 'svc-5', name: 'CLOUD-CONNECT-AWS-USEAST1', type: 'Cloud', status: 'Online' },
    { id: 'svc-6', name: 'METRO-ETHERNET-CUST-B', type: 'L2 VPN', status: 'Online' },
    { id: 'svc-7', name: 'SD-WAN-ENTERPRISE-NETWORK', type: 'SD-WAN', status: 'Degraded' },

]), 2500));


// --- Reusable Item Renderers ---

const ProblemItem = ({ item, searchTerm }: { item: Problem, searchTerm: string }) => (
    <div className="problem-item">
        <div className="problem-item-main">
            <span className="problem-item-title">{highlightText(item.title, searchTerm)}</span>
            <span className="problem-item-subtitle">{highlightText(item.subtitle, searchTerm)}</span>
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

const ServiceItem = ({ item, searchTerm }: { item: Service, searchTerm: string }) => (
    <div className="service-item">
        <div className="service-item-main">
            <span className="service-item-name">{highlightText(item.name, searchTerm)}</span>
            <span className="service-item-type">{highlightText(item.type, searchTerm)}</span>
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


interface PropertyPageProps {
  rowData: Alarm;
}

/**
 * A detailed dashboard-style component to display all information related to a single alarm.
 * It serves as the main layout container for various specialized cards, simulating data fetching
 * with loading skeletons.
 */
export function PropertyPage({ rowData }: PropertyPageProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [problems, setProblems] = React.useState<Problem[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  
  const [isCommentsLoading, setIsCommentsLoading] = React.useState(true);
  const [isProblemsLoading, setIsProblemsLoading] = React.useState(true);
  const [isServicesLoading, setIsServicesLoading] = React.useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = React.useState(true);
  
  // This useEffect simulates fetching data for all cards when the component mounts.
  React.useEffect(() => {
    setIsCommentsLoading(true);
    getMockComments().then(data => { setComments(data); setIsCommentsLoading(false); });
    
    setIsProblemsLoading(true);
    getMockProblems().then(data => { setProblems(data); setIsProblemsLoading(false); });
    
    setIsServicesLoading(true);
    getMockServices().then(data => { setServices(data); setIsServicesLoading(false); });

    // Simulate loading for the main details card
    setIsDetailsLoading(true);
    setTimeout(() => setIsDetailsLoading(false), 1000);
  }, []);
  
  const handleAddComment = (text: string) => {
      const newComment: Comment = {
          id: Date.now(),
          text,
          author: 'You',
          time: 'Just now'
      };
      setComments(prev => [newComment, ...prev]);
  };

  const handleExportProblems = () => {
    console.log("Exporting problems:", problems);
    alert(`Exporting ${problems.length} problems... (Not implemented)`);
  };

  const alarmDetailsConfig: PropertyConfig[] = [
    { key: 'AlarmID', label: 'Alarm ID', icon: 'id' },
    { key: 'NELabel', label: 'NE Label', icon: 'location' },
    { key: 'NetworkRaisedTimeLong', label: 'Network Raised Time', icon: 'time', type: 'date' },
    { key: 'ProbableCause', label: 'Probable Cause', icon: 'cause' },
    { key: 'State', label: 'State', icon: 'status' },
    { key: 'AcknowledgedBy', label: 'Acknowledged By', icon: 'user'},
    { key: 'NativeProbableCause', label: 'Native Probable Cause', icon: 'cause' },
    { key: 'TTID', label: 'TT ID', icon: 'tag' },
    { key: 'TTCreatedTime', label: 'TT Created Time', icon: 'time', type: 'date' },
  ];

  return (
    <div className="details-page-container">
      <DetailsHeader rowData={rowData} />

      <div className="details-page-grid">
        <KeyValueCard
          title="Alarm Details"
          data={rowData}
          propertyConfig={alarmDetailsConfig}
          isLoading={isDetailsLoading}
          columns={3}
          className="details-card-large"
        />
        
        <CommentsCard
            title="Alarm Comments"
            comments={comments}
            isLoading={isCommentsLoading}
            onAddComment={handleAddComment}
        />
        
        <ListCard<Problem>
            className="details-card-large"
            title="Problems"
            items={problems}
            isLoading={isProblemsLoading}
            renderItem={(item, searchTerm) => <ProblemItem key={item.id} item={item} searchTerm={searchTerm} />}
            renderSkeleton={SkeletonProblemItem}
            searchKeys={['title', 'subtitle']}
            onExport={handleExportProblems}
            itemsPerPage={3}
        />
        
        <ListCard<Service>
            title="Services"
            items={services}
            isLoading={isServicesLoading}
            renderItem={(item, searchTerm) => <ServiceItem key={item.id} item={item} searchTerm={searchTerm} />}
            renderSkeleton={SkeletonServiceItem}
            searchKeys={['name', 'type']}
            itemsPerPage={4}
        />
      </div>
    </div>
  );
}
