import { type Table } from '@tanstack/react-table';
import { format } from 'date-fns';

type ColumnConfig = {
    fields: {
        [key: string]: {
            label: string;
            columnType?: string;
            formatType?: string;
        }
    }
}

export function getExportableData<TData>(table: Table<TData> | null, columnConfig: ColumnConfig) {
    if (!table) return null;

    const visibleColumns = table.getVisibleFlatColumns().filter(
        (col) => col.id !== 'select'
    );

    const headers = visibleColumns.map((col) => {
        const config = columnConfig.fields[col.id];
        return config?.label || col.id;
    });

    const body = table.getFilteredRowModel().rows.map((row) =>
        visibleColumns.map((col) => {
            const value = row.getValue(col.id);
            const config = columnConfig.fields[col.id];

            if (config?.columnType === 'dateTime' && value instanceof Date) {
                try {
                    const formatString = config.formatType?.replace(/mi/g, 'mm') || 'PPpp';
                    return format(value, formatString);
                } catch {
                    return 'Invalid Date';
                }
            }
            return String(value ?? '');
        })
    );

    return { headers, body };
}
