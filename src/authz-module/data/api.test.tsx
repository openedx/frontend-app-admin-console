import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { mockHttpClient } from '@src/setupTest';
import {
  getUserAssignedRoles,
  assignTeamMembersRole,
  revokeUserRoles,
  getOrgs,
  getScopes,
} from './api';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

const mockQuerySettings = {
  roles: null,
  scopes: null,
  organizations: null,
  search: null,
  order: null,
  sortBy: null,
  pageSize: 10,
  pageIndex: 0,
};

describe('API functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserAssignedRoles', () => {
    it('should fetch user assignments successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: '1', role: 'admin', scope: 'lib:test' },
          ],
          count: 1,
        },
      };

      mockHttpClient().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getUserAssignedRoles('testuser', mockQuerySettings);

      expect(result.results).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });

    it('should handle all query parameters including organizations', async () => {
      const mockResponse = { data: { results: [], count: 0 } };
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      mockHttpClient().mockReturnValue({
        get: mockGet,
      });

      const queryWithAllParams = {
        roles: 'admin',
        organizations: 'edx,mit',
        search: 'library',
        sortBy: 'role',
        order: 'asc' as const,
        scopes: null,
        pageSize: 15,
        pageIndex: 1,
      };

      await getUserAssignedRoles('testuser', queryWithAllParams);

      expect(mockGet).toHaveBeenCalled();
      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl.toString()).toContain('roles=admin');
      expect(calledUrl.toString()).toContain('orgs=edx%2Cmit');
      expect(calledUrl.toString()).toContain('search=library');
      expect(calledUrl.toString()).toContain('sort_by=role');
      expect(calledUrl.toString()).toContain('order=asc');
    });
  });

  describe('assignTeamMembersRole', () => {
    it('should assign role successfully', async () => {
      const mockResponse = {
        data: {
          completed: [{ userIdentifier: 'user1', status: 'role_added' }],
          errors: [],
        },
      };

      mockHttpClient().mockReturnValue({
        put: jest.fn().mockResolvedValue(mockResponse),
      });

      const requestData = {
        users: ['user1'],
        role: 'admin',
        scopes: ['lib:123'],
      };

      const result = await assignTeamMembersRole(requestData);

      expect(result.completed).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });
  });

  describe('revokeUserRoles', () => {
    it('should revoke role successfully', async () => {
      const mockResponse = {
        data: {
          completed: [{ userIdentifiers: 'user1', status: 'role_removed' }],
          errors: [],
        },
      };

      mockHttpClient().mockReturnValue({
        delete: jest.fn().mockResolvedValue(mockResponse),
      });

      const requestData = {
        users: 'user1',
        role: 'admin',
        scope: 'lib:123',
      };

      const result = await revokeUserRoles(requestData);

      expect(result.completed).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });
  });

  describe('getOrgs', () => {
    it('should fetch organizations successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            { shortName: 'org1', name: 'Organization 1' },
          ],
          count: 1,
        },
      };

      mockHttpClient().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getOrgs();

      expect(result.results).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });

    it('should handle search, page, and pageSize parameters', async () => {
      const mockResponse = { data: { results: [], count: 0 } };
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      mockHttpClient().mockReturnValue({
        get: mockGet,
      });

      await getOrgs('test org', 2, 25);

      expect(mockGet).toHaveBeenCalled();
      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl.toString()).toContain('search=test+org');
      expect(calledUrl.toString()).toContain('page=2');
      expect(calledUrl.toString()).toContain('page_size=25');
    });
  });

  describe('getScopes', () => {
    it('should fetch scopes successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            { displayName: 'Library 1', scope: 'lib:test1' },
          ],
          count: 1,
          next: null,
          previous: null,
        },
      };

      mockHttpClient().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getScopes({});

      expect(result.results).toHaveLength(1);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });

    it('should handle search, page, and pageSize parameters', async () => {
      const mockResponse = {
        data: {
          results: [], count: 0, next: null, previous: null,
        },
      };
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      mockHttpClient().mockReturnValue({
        get: mockGet,
      });

      await getScopes({ search: 'library', page: 3, pageSize: 50 });

      expect(mockGet).toHaveBeenCalled();
      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl.toString()).toContain('search=library');
      expect(calledUrl.toString()).toContain('page=3');
      expect(calledUrl.toString()).toContain('page_size=50');
    });
  });
});
