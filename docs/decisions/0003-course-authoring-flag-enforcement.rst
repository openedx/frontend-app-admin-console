3. Course Authoring Flag Enforcement in the Admin Console
---------------------------------------------------------

Status
######

Proposed

.. note::

    This is a **temporary** measure for the flag-gated rollout period. It is
    expected to be removed and re-evaluated once the authz system is enabled by
    default and `authz.enable_course_authoring` is deprecated (see `ADR 0010`_).
    See *Temporary nature and future work* below.

Context
#######

The authorization backend (`openedx-authz`) is rolling out the course
authoring domain behind the Waffle flag
`authz.enable_course_authoring`. The flag can be enabled globally
(instance-wide), per organization, or per course.

The rollout is defined by the following backend decisions:

* `ADR 0010 - Course Authoring Flag`_ introduces the multi-level Waffle flag.
* `ADR 0013 - Course Authoring Automatic Migration`_ makes the flag the source
  of truth. When the flag changes for a scope, role assignments migrate between
  the legacy `CourseAccessRole` model and the new authz (Casbin) system.
* `ADR 0007 - Enforcement Mechanisms (MFEs)`_ establishes that frontends enforce
  authorization by querying the backend rather than deriving policy from tokens.

The Admin Console manages role assignments for two authorization domains:

* **Content libraries**, which are always enabled.
* **Course authoring**, which is gated by the feature flag.

When course authoring is disabled for a scope, the UI must not expose that
domain. Specifically:

* The **Scope** filter must not list courses where authoring is disabled.
* The **Role** filter must not list course-authoring roles when the domain is
  disabled.
* The **Organization** filter must not hide organizations that are reachable
  through libraries, but it must exclude organizations that expose only disabled
  course authoring.
* The **assignment lists** must not display users or assignments that belong
  only to course authoring. Users with both library and authoring roles should
  display only their library roles.

Because the flag is evaluated per scope, a single instance-wide boolean is
insufficient. For example, the global flag may be disabled while a specific
organization or course is enabled, and vice versa. The frontend must therefore
resolve enablement for the specific scope it is rendering.

Enablement must also remain independent of permission validation.

A natural implementation would infer whether course authoring is enabled from
`/permissions/validate/me`. However, permission validation reflects Casbin role
assignments, while enablement reflects the current Waffle flag. These sources can
temporarily diverge.

As described in `ADR 0013`_, Casbin assignments exist only after migration has
been executed. Automatic migration is disabled by default
(`ENABLE_AUTOMATIC_AUTHZ_COURSE_AUTHORING_MIGRATION = False`). Even when
enabled, only organization- and course-level changes migrate automatically;
global flag changes still require manual migration commands.

Consequently, a runtime change to the global flag may not be reflected in the
permission data returned by the authorization APIs. During rollout, the frontend
must therefore determine whether the course authoring domain should be displayed
from the flag state itself rather than from permission validation.

To support this, the backend exposes
`GET /api/authz/v1/waffle-flag-states/`::


  {
    "global": false,
    "org_overrides": { "on": ["Demo"], "off": [] },
    "course_overrides": {
      "on": [],
      "off": ["course-v1:testing+CT01+CT01-2024"]
    }
  }


The endpoint returns the global flag value together with only those
organization and course overrides whose value differs from the global flag.
Because overrides are separated into `on` and `off` lists, each scope's
effective value can be resolved without ambiguity while preserving override
precedence.

Decision
########

**1. Consume flag state through a single cached hook.**

The frontend exposes `getCourseAuthoringFlagStates` and the React Query hook
`useCourseAuthoringFlagStates` to fetch the endpoint. The hook uses the same
React Query configuration as the permission-validation hooks to keep caching
behavior consistent.

**2. Centralize enablement resolution.**

A derived hook, `useCourseAuthoringFlag`, encapsulates all resolution logic.
Components consume only its public API:

* `isCourseAuthoringEnabled` — returns whether the authoring domain is enabled
  anywhere (globally or through any `on` override). This is used for coarse
  domain-level gating.
* `isCourseEnabled(courseId)` — resolves enablement using precedence:
  **course override -> organization override -> global**.
* `isOrgAuthoringEnabled(org)` — returns `true` when the organization is
  explicitly enabled, contains at least one enabled course, or inherits a global
  `on` value without an explicit organization `off` override.

While flag states are loading, all resolvers return `false` so course
authoring remains hidden until enablement is known.

**3. Apply gating only to client-owned UI elements.**

* **Role filter:** course-authoring roles require both the corresponding view
  permission and `isCourseAuthoringEnabled`.
* **Scope filter:** course options are filtered with `isCourseEnabled`;
  library scopes are always included.
* **Organization filter:** organizations are filtered with
  `isOrgAuthoringEnabled` only for users without library-view permissions.
  Users with library access—and all users while permissions are loading—see all
  organizations.
* **Assignment wizard:** assignable course roles require both the appropriate
  management permission and `isCourseAuthoringEnabled`.

**4. Leave paginated assignment data to the backend.**

The role, scope, and organization filters operate on small client-owned data
sets, making client-side filtering appropriate.

The assignment lists (`/assignments/` and the per-user assignment view) are
server-driven and paginated. Client-side filtering would invalidate pagination,
counts, and sorting. The backend therefore remains responsible for hiding
authoring-only assignments. As described in `ADR 0013`_, only authoring
assignments for enabled scopes are expected to exist in Casbin, so the frontend
renders the backend response without additional filtering.

Implications and Assumptions
############################

Behavior depends on
`ENABLE_AUTOMATIC_AUTHZ_COURSE_AUTHORING_MIGRATION` (`ADR 0013`_).

**When the setting is enabled (`True`)**

* Organization- and course-level flag changes synchronously migrate role
  assignments between the legacy model and Casbin, keeping authorization data
  largely aligned with the flag.
* Global flag changes are **not** migrated automatically. The flag-state
  endpoint immediately reflects the new value, but Casbin data does not until
  migration commands are executed.
* Migration may fail or complete only partially (`ADR 0013`_), creating
  temporary inconsistencies between flag state and authorization data.

**When the setting is disabled (default, `False`)**

* Flag changes never migrate authorization data automatically.
* The flag-state endpoint reflects runtime configuration, while Casbin continues
  to reflect the most recent manual migration.
* The frontend uses the flag only to determine which UI controls are available.
  Paginated assignment lists continue to reflect Casbin and may therefore appear
  stale. This inconsistency cannot be resolved by the frontend.

Assumptions
***********

* `waffle-flag-states` is the authoritative runtime source of enablement.
* Permission validation and assignment lists reflect Casbin state, which may lag
  behind the current flag configuration.
* Content libraries are never gated by this flag.
* The frontend mirrors the backend's course-key parsing and override precedence
  (course -> organization -> global).

Temporary nature and future work
################################

This enforcement exists only for the feature-flag rollout period. It is required
because enablement can temporarily diverge from migrated authorization data.

Once the authz system is enabled by default and
`authz.enable_course_authoring` is deprecated (`ADR 0010`_), enablement will
be unconditional. At that point, the
`waffle-flag-states` endpoint, `useCourseAuthoringFlag`, and all
feature-flag-based UI gating should be removed, allowing the console to rely
solely on permission validation.


## References

* `ADR 0010 - Course Authoring Flag`_
* `ADR 0013 - Course Authoring Automatic Migration`_
* `ADR 0007 - Enforcement Mechanisms (MFEs)`_

.. _ADR 0010 - Course Authoring Flag: https://github.com/openedx/openedx-authz/blob/main/docs/decisions/0010-course-authoring-flag.rst
.. _ADR 0010: https://github.com/openedx/openedx-authz/blob/main/docs/decisions/0010-course-authoring-flag.rst
.. _ADR 0013 - Course Authoring Automatic Migration: https://github.com/openedx/openedx-authz/blob/main/docs/decisions/0013-course-authoring-automatic-migration.rst
.. _ADR 0013: https://github.com/openedx/openedx-authz/blob/main/docs/decisions/0013-course-authoring-automatic-migration.rst
.. _ADR 0007 - Enforcement Mechanisms (MFEs): https://github.com/openedx/openedx-authz/blob/main/docs/decisions/0007-enforcement-mechanisms-mfe.rst
