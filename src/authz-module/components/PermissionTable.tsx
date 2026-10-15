import React from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Check, Close } from '@openedx/paragon/icons';
import { Card, Icon } from '@openedx/paragon';
import { CatalogIcon } from '@src/authz-module/catalog';
import type { Role } from '@src/authz-module/catalog';
import type { MatrixCategory } from '@src/authz-module/roles-permissions';
import CategoryTooltip from './CategoryTooltip';
import messages from './messages';

interface PermissionTableProps {
  roles: Role[];
  matrix: MatrixCategory[];
  title?: string;
}

const PermissionTable = ({ matrix, roles, title }: PermissionTableProps) => {
  const { formatMessage } = useIntl();
  return (
    // Only the narrowest viewports are too small for the matrix, so the card scrolls there
    // (see `.permission-table-scroll`). Above that it is not a scroll container, which is
    // what lets the header row stick to the viewport as the page scrolls.
    <Card className="permission-table-scroll">
      <table className="permission-table w-100">
        <thead>
          <tr>
            <th className="sticky-top bg-white px-4 py-3">
              {title}
            </th>
            {roles.map(role => (
              <th key={role.role} className="text-center py-3 sticky-top bg-white">
                {role.displayName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map(({ category, permissions }) => (
            <React.Fragment key={category.id}>
              <tr className="bg-info-100 text-primary">
                <td colSpan={roles.length + 1} className="text-start py-3 px-4">
                  <div className="d-flex align-items-center">
                    <CatalogIcon className="d-inline-block mr-2" size="xs" name={category.icon} />
                    <span className="small"> <strong>{category.displayName}</strong></span>
                    <CategoryTooltip category={category} permissions={permissions.map(({ permission }) => permission)} />
                  </div>
                </td>
              </tr>
              {permissions.map(({ permission, grantedTo }) => (
                <tr key={permission.id} className="border-top">
                  <td className="text-start d-flex align-items-center small px-4 py-3">
                    <CatalogIcon className="d-inline-block mr-2" size="xs" name={permission.icon} />
                    {permission.displayName}
                  </td>
                  {roles.map(role => (
                    <td key={role.role} className="text-center">
                      {
                        grantedTo[role.role]
                          ? (
                              <Icon
                                className="d-inline-block text-success"
                                src={Check}
                                aria-label={formatMessage(messages['authz.role.card.permission.for.role.status.granted'], {
                                  roleName: role.displayName,
                                })}
                                screenReaderText={formatMessage(messages['authz.role.card.permission.for.role.status.granted'], {
                                  roleName: role.displayName,
                                })}
                              />
                            )
                          : (
                              <Icon
                                className="d-inline-block text-danger"
                                src={Close}
                                aria-label={formatMessage(messages['authz.role.card.permission.for.role.status.not.granted'], {
                                  roleName: role.displayName,
                                })}
                                screenReaderText={formatMessage(messages['authz.role.card.permission.for.role.status.not.granted'], {
                                  roleName: role.displayName,
                                })}
                              />
                            )
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default PermissionTable;
