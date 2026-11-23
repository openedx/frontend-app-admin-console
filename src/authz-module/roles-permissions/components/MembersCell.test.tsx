import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/testUtils';
import { buildCatalogRole } from '@src/authz-module/catalog/testUtils';
import MembersCell from './MembersCell';

const renderCell = (members: number) => {
  const role = buildCatalogRole('library_admin', { userCount: members });
  return renderWrapper(<MembersCell row={{ id: role.role, original: role }} />);
};

describe('MembersCell', () => {
  it('shows the number of members', () => {
    renderCell(5);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('groups the digits of large counts for the locale', () => {
    renderCell(1234);

    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('shows a role with no members as 0', () => {
    renderCell(0);

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
