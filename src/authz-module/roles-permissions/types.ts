import type { DataTableCellProps } from '@openedx/paragon';

import type { Role } from '@src/authz-module/catalog';

/**
 * Props Paragon's DataTable passes to a roles table cell. Rows are the catalog roles as the
 * endpoint returns them, so the table and the catalog share one vocabulary (ADR 0004).
 */
export type RoleCellProps = DataTableCellProps<Role>;
