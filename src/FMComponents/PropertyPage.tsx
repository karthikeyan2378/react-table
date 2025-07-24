
'use client';

import * as React from 'react';
import { type Alarm } from '@/config/alarm-config';
import { DetailsHeader } from './DetailsHeader';
import { KeyValueCard, type PropertyConfig } from './KeyValueCard';
import { CommentsCard, type Comment } from './CommentsCard';
import { ProblemsCard, type Problem } from './ProblemsCard';
import { ServicesCard, type Service } from './ServicesCard';
import './css/details-page.css';

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
]), 2000));

const getMockServices = (): Promise<Service[]> => new Promise(resolve => setTimeout(() => resolve([
    { id: 'svc-1', name: 'MPLS-VPN-CUSTOMER-A', type: 'L3 VPN', status: 'Online' },
    { id: 'svc-2', name: 'INTERNET-BACKBONE-TRANSIT', type: 'IP Transit', status: 'Degraded' },
    { id: 'svc-3', name: 'VOIP-TRUNK-INTERNATIONAL', type: 'SIP Trunk', status: 'Online' },
    { id: 'svc-4', name: 'DARK-FIBER-LEASE-XYZ', type: 'Leased Line', status: 'Offline' },
    { id: 'svc-5', name: 'CLOUD-CONNECT-AWS-USEAST1', type: 'Cloud', status: 'Online' },
]), 2500));

interface PropertyPageProps {
  rowData: Alarm;
}

/**
 * A detailed dashboard-style component to display all information related to a single alarm.
 * It serves as the main layout container for various specialized cards.
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
    getMockComments().then(data => { setComments(data); setIsCommentsLoading(false); });
    getMockProblems().then(data => { setProblems(data); setIsProblemsLoading(false); });
    getMockServices().then(data => { setServices(data); setIsServicesLoading(false); });
    // Simulate loading for the main details card
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

  const alarmDetailsConfig: PropertyConfig[] = [
    { key: 'AlarmID', label: 'Alarm ID', icon: 'id' },
    { key: 'NELabel', label: 'NE Label', icon: 'location' },
    { key: 'NetworkRaisedTimeLong', label: 'Network Raised Time', icon: 'time', type: 'date' },
    { key: 'ProbableCause', label: 'Probable Cause', icon: 'cause' },
    { key: 'NativeProbableCause', label: 'Native Probable Cause', icon: 'cause' },
    { key: 'TTID', label: 'TT ID', icon: 'tag' },
    { key: 'TTStatus', label: 'TT Status', icon: 'status' },
    { key: 'TTCreatedTime', label: 'TT Created Time', icon: 'time', type: 'date' },
  ];

  return (
    <div className="details-page-container">
      <DetailsHeader rowData={rowData} />

      <div className="details-page-grid">
        <div className="details-card-large">
          <KeyValueCard
            title="Alarm Details"
            data={rowData}
            propertyConfig={alarmDetailsConfig}
            isLoading={isDetailsLoading}
          />
        </div>
        
        <div className="details-card-small">
          <CommentsCard
              title="Alarm Comments"
              comments={comments}
              isLoading={isCommentsLoading}
              onAddComment={handleAddComment}
          />
        </div>
        
        <div className="details-card-large">
          <ProblemsCard problems={problems} isLoading={isProblemsLoading} />
        </div>
        
        <div className="details-card-small">
          <ServicesCard services={services} isLoading={isServicesLoading} />
        </div>
      </div>
    </div>
  );
}
