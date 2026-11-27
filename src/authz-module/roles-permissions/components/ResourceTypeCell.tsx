import ResourceTypeTags from '@src/authz-module/components/ResourceTypeTags';
import type { RoleCellProps } from '@src/authz-module/roles-permissions/types';

const ResourceTypeCell = ({ row }: RoleCellProps) => (
  <ResourceTypeTags scopeTypes={row.original.scopeTypes} />
);

export default ResourceTypeCell;
