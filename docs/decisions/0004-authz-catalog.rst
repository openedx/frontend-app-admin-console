4. AuthZ Catalog as the Source of Roles and Permissions
-------------------------------------------------------

Status
######

Proposed

Context
#######

The Admin Console shows the roles and permissions of the authorization system (`openedx-authz`) in several places:

* the **Roles and Permissions** matrix, which shows which permissions each role grants, grouped by category;
* the **permissions column** of a user's role assignments;
* the **role list** of the assignment wizard;
* the **roles filter** of the assignment tables.

Until now, every role, permission and category was hardcoded in the frontend (``roles-permissions/course/constants.ts`` and ``roles-permissions/library/constants.ts``), together with their names, descriptions and icons. This copy had to be kept in sync with the backend by hand. A role or permission added to the backend did not appear in the console until the frontend was changed and released, and a mistake in the copy showed users permissions a role does not grant.

`ADR 0021`_ in `openedx-authz` made the backend the source of truth for this information, and `ADR 0028 - API Contract for the Role and Permission Catalog`_ defined the response of ``GET /api/authz/v1/roles/``. For the requested scope types, one call returns:

* ``categories``: the categories the permissions are grouped in, with a display name, a description and an icon;
* ``permissions``: every permission, with a display name, a description, an icon, its category and the scope types it supports;
* ``roles``: the roles with grants in the requested scope types, each listing the identifiers of the permissions it grants and the scope types it applies to.

The response is normalized: a permission is described once and roles only reference it by identifier. Only the roles are paginated; categories and permissions are complete on every page. The endpoint requires the view-team permission of each requested scope type (``courses.view_course_team`` for ``course-v1``, ``content_libraries.view_library_team`` for ``lib``) and answers 403 otherwise.

Decision
########

**1. A dedicated** ``catalog`` **feature owns the catalog.**

Following `ADR 0002`_, the catalog lives in ``src/authz-module/catalog/``. Its barrel (``index.ts``) exposes only what other features consume: ``useAuthzCatalog``, ``invalidateAuthzCatalog``, ``CatalogIcon`` and the catalog types. Screens never call the API or read the raw response.

::

  catalog/
    index.ts         public API
    constants.ts     page size
    types.ts         Category, Permission, Role, AuthzCatalog, ScopeCatalog
    utils.ts         slicing by scope type and role ordering
    CatalogIcon.tsx  renders the icon the catalog names
    data/api.ts      getAuthzCatalog: fetches and merges every page
    data/hooks.ts    useAuthzCatalog: permissions, query and per-scope-type catalogs

The scope types the console knows today (``SCOPE_TYPES``: ``course-v1`` and ``lib``) and the view-team action of each one are not catalog data. They stay in ``src/authz-module/constants.ts``, with the rest of what the module knows about scopes, and the catalog imports them from there. They could move to the catalog once the backend informs the scope types (see *Future evolution*).

**2. The frontend speaks the catalog's vocabulary.**

The types mirror the API response (camelCased), without adapters to the old hardcoded shapes. Screens move to these types as they are switched over, and the old types are deleted once no screen uses them:

* a **category** (``id``, ``displayName``) replaces the old "resource";
* a **permission** (``id``, ``displayName``, ``categoryId``, ``scopeTypes``) replaces the old permission metadata;
* a **role** (``role``, ``displayName``, ``permissions``, ``scopeTypes``) replaces the old role metadata;
* a **scope type** (``course-v1``, ``lib``), the namespace of the scope keys, replaces the old context type (``course``, ``library``). It stays distinct from a **scope**, which is a concrete key such as ``course-v1:OpenedX+DemoX+Demo``.

**3. One shared catalog for the scope types the user can view.**

The catalog endpoint answers 403 when the user cannot view the team of a requested scope type. So ``useAuthzCatalog`` first checks the user's view-team permissions with ``usePermissions`` from ``@openedx/frontend-base`` (which calls ``/permissions/validate/me``), then loads the catalog for all viewable scope types together. A user who cannot view any scope type makes no catalog request.

The hook takes no arguments; consumers share the cached catalog for the user's viewable scope types. ``getAuthzCatalog(scopeTypes)`` still takes the scope types, for a caller that needs a subset.

**4. The whole catalog is loaded and shared through the cache.**

``getAuthzCatalog`` always returns the complete catalog for the requested scope types. The API paginates the roles, so it requests the first page with 100 roles, the maximum the API allows. If there are more roles, it requests the remaining pages at the same time and joins their roles in page order. Categories and permissions are not paginated (every page includes all of them), so they are taken from the first page.

Pages are not loaded on demand, because the current UI displays all the roles of a scope type at once: the matrix shows each role as a column, and the roles filter and the wizard list every role the user can choose. This design fits the limited number of roles per scope type and the scope types known today.

The catalog uses a thirty-minute ``staleTime`` to balance reuse across consumers with freshness as role definitions become editable.

Role-definition mutations should call ``invalidateAuthzCatalog(queryClient)`` after success, keeping query keys private to the catalog feature. Assigning or revoking an existing role does not change its definition and does not require catalog invalidation.

**5. Current consumers derive scope-specific views.**

The current UI derives scope-specific views from the shared catalog: a matrix tab, a role-filter section, the scope chosen in the wizard, or an assignment's permission breakdown. A screen can combine views of several scope types, as the roles filter does. ``getScopeCatalog(scopeType)`` returns that part of the catalog:

* **permissions**: those whose ``scopeTypes`` include the scope type;
* **categories**: those used by those permissions;
* **roles**: those whose ``scopeTypes`` include the scope type, each listing only its permissions of that scope type, ordered from most to fewest permissions. Roles with the same count keep the catalog order, so the order does not depend on the language.

The hook memoizes each scope type's catalog, so its identity is stable between renders and the screens can memoize what they build from it, such as the matrix and the roles filter choices, without rebuilding it on every render.

**6. CatalogIcon owns the mapping from catalog identifiers to icons.**

The backend and frontend will agree on a supported set of icon identifiers, independent of Paragon's exported names. The frontend will map each identifier to an available icon component. This keeps the catalog contract independent of the icon library and version selected by the downstream site. See the `backend icon contract discussion`_. The identifier set and its mappings have not been finalized yet.

Consumers pass the catalog's icon identifier to ``<CatalogIcon name={icon} />`` without interpreting it or importing the corresponding icon themselves. The component preserves an empty icon of the same size for unknown identifiers and renders nothing when the catalog sends no icon.

**Temporary implementation.** ``CatalogIcon`` currently accepts Paragon icon names and lazy-imports ``@openedx/paragon/icons/es5/<name>.js``, with one ``React.lazy`` component per name. While an icon loads, it renders the same empty placeholder. Webpack emits one small chunk per Paragon icon and excludes ``es5/index.js`` from those chunks.

Once the identifier set is agreed, the explicit frontend map will replace dynamic imports. The public ``name`` prop and fallback behavior remain unchanged, so consumers remain independent of how icons are resolved.

**7. The catalog describes; it does not authorize.**

``/permissions/validate/me`` stays the only source of what the user can do. The catalog only describes which roles and permissions exist and what each role grants.

Some screens check a specific permission before showing an action, for example whether the user can manage a course team before showing the button to assign roles. The names of those permissions are constants in the frontend, not read from the catalog, because each one is tied to a specific action in the UI.

Consequences
############

* Roles, permissions, categories, names and descriptions added or changed in the backend appear in catalog consumers without a frontend release. They can use any supported icon identifier; adding a new identifier requires agreement on the contract and an update to the frontend map.
* The console only shows what the catalog returns. Roles that the hardcoded copy listed as disabled no longer appear until the backend returns them.
* Names and descriptions come from the backend and are not translated by the frontend.
* Screens depend on loading the catalog. Until it loads, they show their loading state.
* The frontend still knows the scope types it supports (``SCOPE_TYPES`` in ``authz-module/constants.ts``), the view-team action of each one and their display order (courses, then libraries). A new scope type still needs a frontend change (see *Future evolution*).

Rejected Alternatives
#####################

**Keep the hardcoded copy, synchronized by hand**
  This is the situation the catalog replaces: two sources of truth that drift.

**Adapt the catalog to the old hardcoded shapes**
  It would let screens keep their code, but it would keep two vocabularies (resource and category, context type and scope type) and an adapter layer to maintain. Moving each screen to the catalog types once is simpler.

**Request the catalog per screen or per scope type**
  Each screen would compute its own scope types, different lists would make separate requests, and a wrong list would answer 403. Sharing the catalog for all viewable scope types avoids this duplication; consumers derive their views from it.

**Use Paragon export names as the permanent icon contract**
  This couples backend schemas to the icon library and version selected by each downstream site. Dynamic imports remain a temporary implementation; the intended contract is an agreed set of identifiers mapped to components by the frontend (Decision 6).

Future evolution
################

**Backend-provided scope-type metadata.** Moving scope-type metadata to the backend could allow new scope types (for example, those defined by a plugin; see the extensibility section of `ADR 0028`_) to appear without frontend changes. Whether that flexibility justifies the additional API and frontend complexity remains an open decision. The frontend currently defines:

* the view-team action of each scope type, used to build the request;
* the scope-type keys (``SCOPE_TYPES``) and their display order;
* the scope-type presentation metadata: the "Courses" and "Libraries" tab labels, role-filter section labels, their translations, and icons;
* the manage-team action of each scope type, used by the wizard.

Adding a new scope type therefore requires frontend changes. Role-filter sections group roles by scope type; catalog categories group permissions.

If this approach is adopted, the backend should:

1. Make ``scope_types`` optional in the request. Without it, the endpoint returns the catalog of every scope type the user can view and leaves out the others instead of answering 403.
2. Return the scope types as objects whose order is the display order, carrying their display name, description, icon, and view and manage permissions.

The frontend should then use this metadata to build matrix tabs, role-filter sections and permission mappings. ``useAuthzCatalog`` could keep its signature, fetching the catalog without ``scope_types`` and without first calling validate/me. Manage permissions would still be checked through validate/me.

The backend would also need to localize the scope-type labels currently translated in the frontend.

**Loading on demand.** The current UI displays all the roles of a scope type at once (Decision 4). Loading the roles on demand, with search or paging in the UI instead of showing every role at once, is only worth it if real cases show that the number of roles per scope type has grown too large for that, for example with user-defined roles. Until then, the current approach stays.

**User-defined roles.** The catalog types already distinguish ``static`` and ``user_defined`` roles through ``definitionKind``. Future role-management screens may also need to refresh affected role assignments after permission edits or role deletions.

**Display order.** The backend returns categories, permissions and roles in a stable order by identifier, and explicit display ordering is a backend follow-up. The frontend keeps the API order for categories and permissions, so a backend display order applies without a frontend change. Roles are ordered by permission count in the frontend, which could move to the backend as well.

References
##########

* `ADR 0002`_ — feature-based application organization
* `ADR 0021`_ — the authz model as the source of truth for authorization definitions
* `ADR 0028 - API Contract for the Role and Permission Catalog`_

.. _ADR 0002: ./0002-feature-based-application-organization.rst
.. _ADR 0021: https://github.com/openedx/openedx-authz/blob/main/docs/decisions/0021-authorization-definition-api.rst
.. _ADR 0028: https://github.com/openedx/openedx-authz/blob/main/docs/decisions/0028-api-contract-for-role-catalog.rst
.. _ADR 0028 - API Contract for the Role and Permission Catalog: https://github.com/openedx/openedx-authz/blob/main/docs/decisions/0028-api-contract-for-role-catalog.rst

.. _backend icon contract discussion: https://github.com/openedx/openedx-authz/pull/537#issuecomment-6425395515
