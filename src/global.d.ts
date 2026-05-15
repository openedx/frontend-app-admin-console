// Module augmentations for external libraries.
// Application domain types belong in src/types.ts, not here.

export {};

declare module '@openedx/paragon' {
  export interface DataTableRow<T> {
    original: T;
    id: string;
    isExpanded?: boolean;
    toggleRowExpanded?: () => void;
  }

  export interface DataTableCellProps<T> {
    row: DataTableRow<T>;
    value?: unknown;
    cell?: {
      getCellProps: (props?: Record<string, string>) => Record<string, string>;
    };
  }
}
