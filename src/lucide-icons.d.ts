
declare module 'lucide-react' {
    import { SVGProps, FC } from 'react';
  
    export type LucideProps = SVGProps<SVGSVGElement> & {
      size?: string | number;
      absoluteStrokeWidth?: boolean;
    };
  
    export type LucideIcon = FC<LucideProps>;

    export const Wand2: LucideIcon;
    export const Loader2: LucideIcon;
    export const Check: LucideIcon;
    export const ChevronUp: LucideIcon;
    export const ChevronDown: LucideIcon;
    export const ChevronLeft: LucideIcon;
    export const ChevronRight: LucideIcon;
    export const ChevronsLeft: LucideIcon;
    export const ChevronsRight: LucideIcon;
    export const Circle: LucideIcon;
    export const X: LucideIcon;
    export const PlusCircle: LucideIcon;
    export const Download: LucideIcon;
    export const File: LucideIcon;
    export const FileSpreadsheet: LucideIcon;
    export const FileText: LucideIcon;
    export const Filter: LucideIcon;
    export const MoreVertical: LucideIcon;
    export const Search: LucideIcon;
    export const SlidersHorizontal: LucideIcon;
    export const Play: LucideIcon;
    export const Square: LucideIcon;
    export const Trash2: LucideIcon;
    export const Code: LucideIcon;
    export const ArrowUp: LucideIcon;
    export const ArrowDown: LucideIcon;
    export const ChevronsUpDown: LucideIcon;
    export const PieChart: LucideIcon;
    export const BarChart2: LucideIcon;
    export const Donut: LucideIcon;
    export const Edit: LucideIcon;
  }
  
    