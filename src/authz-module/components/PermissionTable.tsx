import { Check, Close } from "@openedx/paragon/icons";
import { actionsDictionary } from "./RoleCard/constants";
import { Icon } from "@openedx/paragon";

const PermissionTable = ({ permissionsTable, roles }) => (
  <table className="pgn__data-table bg-light-100">
    <thead>
      <tr>
        <th className='bg-light-100'></th>
        {roles.map(role => (
          <th key={role.name} className="text-center bg-light-100 py-3">{role.name}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {permissionsTable.map(resourceGroup => (
        <>
          <tr className="bg-info-100 text-primary">
            <td colSpan={roles.length + 1} className="text-start py-3 px-4">
              <strong>{resourceGroup.resourceLabel}</strong>
            </td>
          </tr>
          {
            resourceGroup.permissions.map(permission => (
              <tr key={permission.key} className='border-top'>
                <td className="text-start d-flex align-items-center small px-4 py-3">{
                  <Icon className="d-inline-block mr-2" size="sm" src={actionsDictionary[permission.actionKey]} />}
                  {permission.label}
                </td>
                {roles.map(role => (
                  <td key={role.name} className="text-center">
                    {permission.roles[role.name] ? <Icon className="d-inline-block" src={Check} /> : <Icon className="text-danger d-inline-block" src={Close} />}
                  </td>
                ))}
              </tr>
            ))
          }
        </>
      ))}
    </tbody>
  </table>
);

export default PermissionTable;