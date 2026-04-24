import React from 'react';
import { screen } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWrapper } from '@src/setupTest';
import { getCellHeader, getScopeManageAction, getScopeManageActionPermission } from './utils';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from './constants';

const renderCellHeader = (columnId: string, columnTitle: string, filtersApplied: string[]) => {
  const result = getCellHeader(columnId, columnTitle, filtersApplied);
  if (typeof result === 'function') {
    const Component = result;
    return renderWrapper(<Component />);
  }
  return renderWrapper(<div>{result}</div>);
};

describe('utils', () => {
  describe('getCellHeader', () => {
    beforeEach(() => {
      initializeMockApp({
        authenticatedUser: {
          userId: 1,
          username: 'testuser',
          email: 'testuser@example.com',
        },
      });
    });

    it('displays column title without filter icon when no filters are applied', () => {
      const { container } = renderCellHeader('scope', 'Scope', []);

      expect(screen.getByText('Scope')).toBeInTheDocument();
      expect(container.querySelector('svg')).not.toBeInTheDocument();
    });

    it('displays column title without filter icon when column is not in filters applied', () => {
      const { container } = renderCellHeader('scope', 'Scope', ['role', 'organization']);

      expect(screen.getByText('Scope')).toBeInTheDocument();
      expect(container.querySelector('svg')).not.toBeInTheDocument();
    });

    it('displays column title with filter icon when column has filter applied', () => {
      const { container } = renderCellHeader('scope', 'Scope', ['scope', 'role']);

      expect(screen.getByText('Scope')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('displays filter icon only for matching column when multiple filters applied', () => {
      const { container } = renderCellHeader('organization', 'Organization', ['scope', 'organization', 'role']);

      expect(screen.getByText('Organization')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('handles empty column title', () => {
      const { container } = renderCellHeader('scope', '', ['scope']);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('handles special characters in column title', () => {
      const { container } = renderCellHeader('scope', 'Scope & Context', ['scope']);

      expect(screen.getByText('Scope & Context')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('is case sensitive when matching column ID', () => {
      const { container } = renderCellHeader('scope', 'Scope', ['SCOPE', 'Role']);

      expect(screen.getByText('Scope')).toBeInTheDocument();
      expect(container.querySelector('svg')).not.toBeInTheDocument();
    });

    it('handles long column titles with filters', () => {
      const { container } = renderCellHeader('organization', 'Very Long Organization Column Title', ['organization']);

      expect(screen.getByText('Very Long Organization Column Title')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('displays correct structure when filter is applied', () => {
      renderCellHeader('role', 'Role', ['role']);

      const container = screen.getByText('Role').closest('span');
      expect(container).toHaveClass('d-flex', 'flex-row', 'align-items-center');
    });
  });

  describe('getScopeManageAction', () => {
    it('returns MANAGE_LIBRARY_TEAM for library scopes', () => {
      expect(getScopeManageAction('lib:testorg:library-123')).toBe(
        CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM,
      );
    });

    it('returns MANAGE_LIBRARY_TEAM for library scope with different format', () => {
      expect(getScopeManageAction('lib:example:collection-456')).toBe(
        CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM,
      );
    });

    it('returns MANAGE_COURSE_TEAM for course scopes', () => {
      expect(getScopeManageAction('course-v1:testorg+course123+2023')).toBe(
        CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
      );
    });

    it('returns MANAGE_COURSE_TEAM for course scope with different format', () => {
      expect(getScopeManageAction('course-v1:example+math101+fall2023')).toBe(
        CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
      );
    });

    it('returns default MANAGE_COURSE_TEAM for unknown scope types', () => {
      expect(getScopeManageAction('unknown:scope:type')).toBe(
        CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
      );
    });

    it('returns default MANAGE_COURSE_TEAM for empty scope', () => {
      expect(getScopeManageAction('')).toBe(
        CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
      );
    });

    it('handles scope that starts with "course" but not exactly "course-v1"', () => {
      expect(getScopeManageAction('course:example:test')).toBe(
        CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
      );
    });

    it('handles scope that starts with "lib" variations', () => {
      expect(getScopeManageAction('library:test:scope')).toBe(
        CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM,
      );
    });
  });

  describe('getScopeManageActionPermission', () => {
    it('returns correct permission object for library scope', () => {
      const scope = 'lib:testorg:library-123';
      const result = getScopeManageActionPermission(scope);

      expect(result).toEqual({
        action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM,
        scope,
      });
    });

    it('returns correct permission object for course scope', () => {
      const scope = 'course-v1:testorg+course123+2023';
      const result = getScopeManageActionPermission(scope);

      expect(result).toEqual({
        action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
        scope,
      });
    });

    it('returns correct permission object for unknown scope type', () => {
      const scope = 'unknown:scope:type';
      const result = getScopeManageActionPermission(scope);

      expect(result).toEqual({
        action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
        scope,
      });
    });

    it('preserves original scope string in the returned object', () => {
      const scope = 'lib:example:very-long-library-identifier-12345';
      const result = getScopeManageActionPermission(scope);

      expect(result.scope).toBe(scope);
      expect(result.action).toBe(CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM);
    });
  });
});
