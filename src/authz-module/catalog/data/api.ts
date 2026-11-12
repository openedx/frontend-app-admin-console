import { camelCaseObject, getAuthenticatedHttpClient } from '@openedx/frontend-base';
import { getApiUrl } from '@src/data/utils';
import { CATALOG_PAGE_SIZE } from '../constants';
import type {
  AuthzCatalog, Category, Permission, Role,
} from '../types';

export interface GetAuthzCatalogResponse {
  count: number;
  next: string | null;
  previous: string | null;
  scopeTypes: string[];
  categories: Category[];
  permissions: Permission[];
  results: Role[];
}

export type RolesSortBy = 'display_name' | 'scope_type' | 'user_count' | 'updated_at';

export type RolesSortOrder = 'asc' | 'desc';

/** One page of roles to ask the roles endpoint for. */
export interface RolesQueryParams {
  // Required by the endpoint: the roles with grants in any of them are listed.
  scopeTypes: string[];
  // Case-insensitive substring of the role display name.
  search?: string | null;
  // Without both, the endpoint sorts by display name, ascending, ties by role id.
  sortBy?: RolesSortBy | null;
  order?: RolesSortOrder | null;
  pageIndex: number;
  pageSize: number;
}

/**
 * Fetches one page of roles from the roles endpoint, the one request behind both the roles table
 * and the complete catalog. Search, sort and pagination run on the server, so `count`, `next`
 * and `previous` already reflect the search; an empty search or an unset sort is left out so
 * the endpoint's defaults apply. The categories and permissions come complete on every page,
 * whatever the search or page.
 */
export const getAuthzCatalogPage = async (params: RolesQueryParams): Promise<GetAuthzCatalogResponse> => {
  const url = new URL(getApiUrl('/api/authz/v1/roles/'));
  url.searchParams.set('scope_types', params.scopeTypes.join(','));
  if (params.search) {
    url.searchParams.set('search', params.search);
  }
  if (params.sortBy && params.order) {
    url.searchParams.set('sort_by', params.sortBy);
    url.searchParams.set('order', params.order);
  }
  url.searchParams.set('page', (params.pageIndex + 1).toString());
  url.searchParams.set('page_size', params.pageSize.toString());
  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data);
};

/**
 * Fetches the complete roles, permissions and categories catalog of the given scope types.
 *
 * Only the roles are paginated; categories and permissions are complete on every page, so they
 * are taken from the first one. The first page is requested at the maximum page size and, if
 * there are more, the remaining pages are fetched in parallel and their roles appended in order.
 * No search or sort is sent, so every role comes back in the endpoint's default order, whose
 * tie-break by role id keeps the pages fetched in parallel free of gaps and repeats.
 */
export const getAuthzCatalog = async (scopeTypes: string[]): Promise<AuthzCatalog> => {
  const getPage = (pageIndex: number) => getAuthzCatalogPage({ scopeTypes, pageIndex, pageSize: CATALOG_PAGE_SIZE });
  const firstPage = await getPage(0);
  const pages = [firstPage];

  if (firstPage.next) {
    const totalPages = Math.ceil(firstPage.count / CATALOG_PAGE_SIZE);
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => getPage(index + 1)),
    );
    pages.push(...remainingPages);
  }

  return {
    scopeTypes: firstPage.scopeTypes,
    categories: firstPage.categories,
    permissions: firstPage.permissions,
    roles: pages.flatMap((page) => page.results),
  };
};
