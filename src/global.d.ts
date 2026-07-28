// Module augmentations and ambient platform types for external libraries.
// Application domain types belong in src/types.ts, not here.

export {};

declare global {
  /**
   * Error shape produced by @edx/frontend-platform's HTTP client, which attaches
   * the HTTP status under `customAttributes`. Read it with `getHttpErrorStatus`.
   */
  interface PlatformError extends Error {
    customAttributes?: {
      httpErrorStatus?: number;
    };
  }
}

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
