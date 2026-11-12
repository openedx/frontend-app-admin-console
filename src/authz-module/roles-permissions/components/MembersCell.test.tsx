import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/testUtils';
import type { RoleRow } from '../types';
import MembersCell from './MembersCell';

const renderCell = (members: number) => {
  const row: RoleRow = {
    id: 'library_admin',
    name: 'Library Admin',
    resourceTypes: ['lib'],
    members,
    permissionCount: 0,
    lastUpdated: null,
    isCustom: false,
  };
  return renderWrapper(<MembersCell row={{ original: row }} />);
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
