
import { type Alarm, alarmConfig } from '@/config/alarm-config';

let alarmIdCounter = 1;
const severities = ['Critical', 'Major', 'Minor', 'Warning', 'Indeterminate', 'Cleared'];
const alarmNames = ['Link Down', 'High Temperature', 'CPU Overload', 'Packet Loss'];
const objectTypes = ['TransportEMS', 'TopologicalLink', 'PTP', 'ME', 'Equipment'];
const states = ['Active', 'Cleared'];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const newAlarm = (): Alarm => {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  return {
    AlarmID: `ALM-${alarmIdCounter++}`,
    Severity: getRandom(severities),
    ObjectLabel: `Device-${Math.floor(Math.random() * 1000)}`,
    NELabel: `NE-${Math.floor(Math.random() * 100)}`,
    AlarmIdentifier: `uuid-${Math.random().toString(36).substring(2, 15)}`,
    AlarmName: getRandom(alarmNames),
    NetworkRaisedTimeLong: randomDate(thirtyDaysAgo, now),
    NetworkLastModifiedTimeLong: randomDate(thirtyDaysAgo, now),
    LastModificationTimeLong: randomDate(thirtyDaysAgo, now),
    ObjectType: getRandom(objectTypes),
    EMSName: 'EMS-Primary',
    Vendor: 'Vendor-A',
    DomainType: 'Core',
    NativeProbableCause: 'Signal Fail',
    ProbableCause: 'Signal Failure',
    ProbableCauseQualifier: 'N/A',
    ElementAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    ProductName: `Router-X${Math.floor(Math.random() * 100)}`,
    LayerRate: '10G',
    ActivePull: Math.random() > 0.5 ? 'Yes' : 'No',
    GatewayId: `GW-${Math.floor(Math.random() * 5)}`,
    InventoryAttached: Math.random() > 0.5 ? 'Yes' : 'No',
    AcknowledgedBy: 'unacked',
    AcknowledgedTimeLong: randomDate(thirtyDaysAgo, now),
    State: getRandom(states),
    FlapCount: Math.floor(Math.random() * 50),
    AdditionalText: 'Additional details here',
    IsSuppressed: Math.random() > 0.5 ? 'Yes' : 'No',
  };
};

export function makeData(count: number): Alarm[] {
    alarmIdCounter = 1;
    return Array.from({ length: count }, newAlarm);
}
