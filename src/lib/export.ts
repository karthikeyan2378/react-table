
import type { ColumnDef, ColumnFiltersState } from "@/app/types";

type Alarm = { [key: string]: any };

export function getExportableData(
    data: Alarm[],
    columns: ColumnDef<Alarm>[],
    columnFilters: ColumnFiltersState,
    globalFilter: string
) {
    if (!data || !columns) return null;

    // Apply filtering
    let filteredData = [...data];
    if (globalFilter) {
      const lowerGlobalFilter = globalFilter.toLowerCase();
      filteredData = filteredData.filter(row => 
        Object.values(row).some(val => String(val).toLowerCase().includes(lowerGlobalFilter))
      );
    }
    if (columnFilters.length > 0) {
        columnFilters.forEach(filter => {
            filteredData = filteredData.filter(row => {
                const rowValue = row[filter.id];
                if (Array.isArray(filter.value)) {
                    return filter.value.includes(rowValue);
                }
                return String(rowValue).toLowerCase().includes(String(filter.value).toLowerCase());
            });
        });
    }

    const visibleColumns = columns.filter(col => col.accessorKey !== 'select');

    const headers = visibleColumns.map(col => col.id);

    const body = filteredData.map(row =>
        visibleColumns.map(col => {
            const value = row[col.accessorKey as keyof Alarm];
            if (value instanceof Date) {
                return value.toLocaleString(); // Simplified date formatting
            }
            return String(value ?? '');
        })
    );

    return { headers, body };
}
