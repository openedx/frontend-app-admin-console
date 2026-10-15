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

const getAuthzCatalogPage = async (scopeTypes: string[], page: number): Promise<GetAuthzCatalogResponse> => {
  const url = new URL(getApiUrl('/api/authz/v1/roles/'));
  url.searchParams.set('scope_types', scopeTypes.join(','));
  url.searchParams.set('page', page.toString());
  url.searchParams.set('page_size', CATALOG_PAGE_SIZE.toString());
  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data);
};

/**
 * Fetches the complete roles, permissions and categories catalog of the given scope types.
 *
 * Only the roles are paginated; categories and permissions are complete on every page, so they
 * are taken from the first one. The first page is requested at the maximum page size and, if
 * there are more, the remaining pages are fetched in parallel and their roles appended in order.
 */
export const getAuthzCatalog = async (scopeTypes: string[]): Promise<AuthzCatalog> => {
  const firstPage = await getAuthzCatalogPage(scopeTypes, 1);
  const pages = [firstPage];

  if (firstPage.next) {
    const totalPages = Math.ceil(firstPage.count / CATALOG_PAGE_SIZE);
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => getAuthzCatalogPage(scopeTypes, index + 2)),
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
