import { AreaChart, Bell, Gauge, Shield, Users } from 'lucide-react';

const config = {
  fields: {
    Severity: {
      label: 'Severity',
      isColumnToFreeze: true,
      isSummarizedColumn: true,
      columnSize: 110,
      columnType: 'categorical',
      options: [
        { value: 'Critical', label: 'Critical' },
        { value: 'Major', label: 'Major' },
        { value: 'Minor', label: 'Minor' },
        { value: 'Warning', label: 'Warning' },
        { value: 'Indeterminate', label: 'Indeterminate' },
        { value: 'Cleared', label: 'Cleared' },
      ],
      summaryInfo: {
        possibleTypes: ["doughnut", "pie", "bar"],
      },
    },
    ObjectLabel: {
      label: 'Object Label',
      isColumnToFreeze: true,
      columnSize: 200,
    },
    NELabel: {
      label: 'NE Label',
      columnSize: 150,
    },
    AlarmIdentifier: {
      label: 'Identifier',
      isColumnToHide: true,
    },
    AlarmName: {
      label: 'Alarm Name',
      isSummarizedColumn: true,
      columnSize: 300,
      columnType: 'categorical',
      options: [
        { value: 'Link Down', label: 'Link Down' },
        { value: 'High Temperature', label: 'High Temperature' },
        { value: 'CPU Overload', label: 'CPU Overload' },
        { value: 'Packet Loss', label: 'Packet Loss' },
      ],
      summaryInfo: {
        possibleTypes: ["doughnut", "pie", "bar"],
      },
    },
    NetworkRaisedTimeLong: {
      label: 'Network Raised Time',
      columnType: 'dateTime',
      formatType: 'dd-MMM-yyyy HH:mm:ss',
      columnSize: 200,
    },
    NetworkLastModifiedTimeLong: {
      label: 'Network Last Modified Time',
      sortOrder: 'DESCENDING',
      columnType: 'dateTime',
      formatType: 'dd-MMM-yyyy HH:mm:ss',
      columnSize: 200,
    },
    LastModificationTimeLong: {
      label: 'CygNet Last Modified Time',
      columnType: 'dateTime',
      formatType: 'dd-MMM-yyyy HH:mm:ss',
      isColumnToHide: true,
    },
    ObjectType: {
      label: 'Object Type',
      isSummarizedColumn: true,
      columnSize: 150,
      columnType: 'categorical',
      options: [
        { value: 'TransportEMS', label: 'TransportEMS' },
        { value: 'TopologicalLink', label: 'TopologicalLink' },
        { value: 'PTP', label: 'PTP' },
        { value: 'ME', label: 'ME' },
        { value: 'Equipment', label: 'Equipment' },
      ],
      summaryInfo: {
        possibleTypes: ["doughnut", "pie", "bar"],
      },
    },
    EMSName: {
      label: 'EMS Name',
      isColumnToHide: true,
    },
    Vendor: {
      label: 'Vendor',
      isColumnToHide: true,
    },
    DomainType: {
      label: 'Domain',
      isColumnToHide: true,
    },
    NativeProbableCause: {
      label: 'Native Probable Cause',
      isColumnToHide: true,
    },
    ProbableCause: {
      label: 'Probable Cause',
      isColumnToHide: true,
    },
    ProbableCauseQualifier: {
      label: 'Probable Cause Qualifier',
      isColumnToHide: true,
    },
    ElementAddress: {
      label: 'NE IP Address',
      isColumnToHide: true,
    },
    ProductName: {
      label: 'NE Type',
      isColumnToHide: true,
    },
    LayerRate: {
      label: 'Layer Rate',
      isColumnToHide: true,
    },
    ActivePull: {
      label: 'Active Pull',
      isColumnToHide: true,
    },
    GatewayId: {
      label: 'Gateway Id',
      isColumnToHide: true,
    },
    InventoryAttached: {
      label: 'Inventory Attached',
      columnSize: 150,
    },
    AcknowledgedBy: {
      label: 'Acknowledged By',
      columnSize: 150,
    },
    AcknowledgedTimeLong: {
      label: 'Acknowledged Time',
      columnType: 'dateTime',
      formatType: 'dd-MMM-yyyy HH:mm:ss',
      isColumnToHide: true,
    },
    State: {
      label: 'State',
      columnSize: 100,
    },
    FlapCount: {
      label: 'Flap Count',
      isColumnToHide: false,
      isSummarizedColumn: true,
      columnSize: 120,
      columnType: 'numerical',
    },
    AdditionalText: {
      label: 'Additional Text',
      columnSize: 150,
    },
    AlarmID: {
      label: 'Alarm ID',
      isColumnToHide: true,
    },
    IsSuppressed: {
      label: 'Is Suppressed',
      isColumnToHide: true,
    },
  },
};

export const alarmConfig = config;

export type Alarm = {
  [K in keyof typeof config.fields]: (typeof config.fields)[K] extends { columnType: 'dateTime' }
    ? Date
    : (typeof config.fields)[K] extends { columnType: 'numerical' }
    ? number
    : string;
} & { AlarmID: string };
