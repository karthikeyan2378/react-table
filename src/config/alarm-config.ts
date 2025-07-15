
type ChartType = 'pie' | 'bar' | 'doughnut';

const config = {
  fields: {
    Severity: {
      label: 'Severity',
      isColumnToFreeze: true,
      isSummarizedColumn: true,
      isFilterable: true,
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
      chartConfig: {
        defaultChartType: 'doughnut' as ChartType,
        colors: {
          'Critical': '#EF4444', // red-500
          'Major': '#F97316',    // orange-500
          'Minor': '#EAB308',    // yellow-500
          'Warning': '#3B82F6',  // blue-500
          'Indeterminate': '#6B7280', // gray-500
          'Cleared': '#22C55E',  // green-500
        }
      }
    },
    ObjectLabel: {
      label: 'Object Label',
      isColumnToFreeze: true,
      isFilterable: true,
      columnSize: 200,
    },
    NELabel: {
      label: 'NE Label',
      isFilterable: true,
      columnSize: 150,
    },
    AlarmIdentifier: {
      label: 'Identifier',
      isColumnToHide: true,
    },
    AlarmName: {
      label: 'Alarm Name',
      isSummarizedColumn: true,
      isFilterable: true,
      columnSize: 300,
      columnType: 'categorical',
      options: [
        { value: 'Link Down', label: 'Link Down' },
        { value: 'High Temperature', label: 'High Temperature' },
        { value: 'CPU Overload', label: 'CPU Overload' },
        { value: 'Packet Loss', label: 'Packet Loss' },
      ],
      chartConfig: {
        defaultChartType: 'doughnut' as ChartType,
      }
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
      isFilterable: true,
      columnSize: 150,
      columnType: 'categorical',
      options: [
        { value: 'TransportEMS', label: 'TransportEMS' },
        { value: 'TopologicalLink', label: 'TopologicalLink' },
        { value: 'PTP', label: 'PTP' },
        { value: 'ME', label: 'ME' },
        { value: 'Equipment', label: 'Equipment' },
      ],
      chartConfig: {
        defaultChartType: 'doughnut' as ChartType,
      }
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
      isFilterable: true,
      columnSize: 100,
      columnType: 'categorical',
      options: [
        {value: 'Active', label: 'Active'},
        {value: 'Cleared', label: 'Cleared'}
      ]
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
      isRecId: true, // Designates this field as the unique record identifier for a row.
    },
    IsSuppressed: {
      label: 'Is Suppressed',
      isColumnToHide: true,
    },
  },
};

/**
 * The base configuration for a single field in the alarm data.
 */
type FieldConfig = {
    label: string;
    isColumnToFreeze?: boolean;
    isSummarizedColumn?: boolean;
    isFilterable?: boolean;
    columnSize?: number;
    columnType?: 'categorical' | 'dateTime' | 'numerical' | 'text';
    options?: { value: string; label: string }[];
    sortOrder?: 'ASCENDING' | 'DESCENDING';
    isColumnToHide?: boolean;
    formatType?: string;
    /** A unique property that identifies a column as the record ID for a row. Only one field should have this property set to true. */
    isRecId?: boolean;
    chartConfig?: {
        defaultChartType?: ChartType;
        colors?: Record<string, string>;
    };
};

/**
 * A mapped type that enforces the structure of the configuration object,
 * ensuring all fields conform to the `FieldConfig` type.
 */
type ConfigWithChartConfig = {
  fields: {
    [K in keyof typeof config.fields]: FieldConfig;
  };
};

export const alarmConfig: ConfigWithChartConfig = config;

/**
 * A dynamically generated type for a single Alarm record.
 * It infers the data type of each field based on its `columnType` in the configuration.
 * - `dateTime` -> `Date`
 * - `numerical` -> `number`
 * - All others -> `string`
 */
export type Alarm = {
  [K in keyof typeof config.fields]: (typeof config.fields)[K] extends { columnType: 'dateTime' }
    ? Date
    : (typeof config.fields)[K] extends { columnType: 'numerical' }
    ? number
    : string;
} & { 
    /** This is here to ensure AlarmID is always part of the type, even if not explicitly defined with a specific type. */
    AlarmID: string 
};
