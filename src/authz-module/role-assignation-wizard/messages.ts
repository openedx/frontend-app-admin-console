import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // AssignRoleWizardPage
  'wizard.page.breadcrumb': {
    id: 'wizard.page.breadcrumb',
    defaultMessage: 'Roles and Permissions Management',
    description: 'Breadcrumb label linking back to the team manager page',
  },
  'wizard.page.title': {
    id: 'wizard.page.title',
    defaultMessage: 'Assign Role',
    description: 'Page title for the assign role wizard page',
  },

  // AssignRoleWizard — step titles
  'wizard.step.selectUsersAndRole.error': {
    id: 'wizard.step.selectUsersAndRole.error',
    defaultMessage: 'Error',
    description: 'Error description shown on step 1 header when there are invalid users',
  },
  'wizard.step.selectUsersAndRole.title': {
    id: 'wizard.step.selectUsersAndRole.title',
    defaultMessage: 'Who and Role',
    description: 'Step 1 title in the assign role wizard',
  },
  'wizard.step.defineScope.title': {
    id: 'wizard.step.defineScope.title',
    defaultMessage: 'Where It Applies',
    description: 'Step 2 title in the assign role wizard',
  },

  // AssignRoleWizard — action buttons
  'wizard.button.cancel': {
    id: 'wizard.button.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button label in the wizard',
  },
  'wizard.button.back': {
    id: 'wizard.button.back',
    defaultMessage: 'Back',
    description: 'Back button label in the wizard',
  },
  'wizard.button.next': {
    id: 'wizard.button.next',
    defaultMessage: 'Next',
    description: 'Next button label in the wizard',
  },
  'wizard.button.next.pending': {
    id: 'wizard.button.next.pending',
    defaultMessage: 'Validating',
    description: 'Next button label while user validation is in progress',
  },
  'wizard.button.save': {
    id: 'wizard.button.save',
    defaultMessage: 'Save',
    description: 'Save button label in the wizard',
  },
  'wizard.button.save.pending': {
    id: 'wizard.button.save.pending',
    defaultMessage: 'Saving',
    description: 'Save button label while the save operation is in progress',
  },

  // AssignRoleWizard — messages
  'wizard.save.success': {
    id: 'wizard.save.success',
    defaultMessage: 'Role assigned successfully.',
    description: 'Toast message shown when a role is successfully assigned',
  },
  'wizard.save.error.user_already_has_role': {
    id: 'wizard.save.error.user_already_has_role',
    defaultMessage: '{userIdentifier} already has this role in {scope}',
    description: 'Error shown in the toast when the user already holds the role in the selected scope',
  },
  'wizard.save.error.user_not_found': {
    id: 'wizard.save.error.user_not_found',
    defaultMessage: 'User "{userIdentifier}" was not found',
    description: 'Error shown in the toast when the username or email does not match any account',
  },
  'wizard.save.error.role_assignment_error': {
    id: 'wizard.save.error.role_assignment_error',
    defaultMessage: 'Could not assign role to {userIdentifier} in {scope}',
    description: 'Error shown in the toast when an unexpected error occurs during role assignment',
  },
  'wizard.save.error.default': {
    id: 'wizard.save.error.default',
    defaultMessage: '{userIdentifier} ({scope}): {error}',
    description: 'Fallback error line shown in the toast for unknown role-assignment error codes',
  },

  // DefineApplicationScopeStep — filter bar
  'wizard.step2.search.placeholder': {
    id: 'wizard.step2.search.placeholder',
    defaultMessage: 'Search',
    description: 'Placeholder text for the scope search input in step 2',
  },
  'wizard.step2.filter.org.label': {
    id: 'wizard.step2.filter.org.label',
    defaultMessage: 'Organization',
    description: 'Default label for the organization filter dropdown in step 2',
  },
  'wizard.step2.filter.org.all': {
    id: 'wizard.step2.filter.org.all',
    defaultMessage: 'All Organizations',
    description: 'Option to clear the organization filter in step 2',
  },
  'wizard.step2.filter.applied': {
    id: 'wizard.step2.filter.applied',
    defaultMessage: 'Filter applied:',
    description: 'Label prefix shown before the active context-type filter badge in step 2',
  },
  'wizard.step2.count': {
    id: 'wizard.step2.count',
    defaultMessage: 'Showing {shown} of {total}.',
    description: 'Count of visible scopes vs total in step 2',
  },

  // SelectUsersAndRoleStep — users section
  'wizard.step1.users.heading': {
    id: 'wizard.step1.users.heading',
    defaultMessage: 'Users',
    description: 'Heading for the users input section in step 1',
  },
  'wizard.step1.users.label': {
    id: 'wizard.step1.users.label',
    defaultMessage: 'Add users by username or email',
    description: 'Label for the users textarea in step 1',
  },
  'wizard.step1.users.placeholder': {
    id: 'wizard.step1.users.placeholder',
    defaultMessage: 'Enter one or more email addresses or usernames',
    description: 'Placeholder text for the users textarea',
  },
  'wizard.step1.users.hint': {
    id: 'wizard.step1.users.hint',
    defaultMessage: 'The user must already have an account.',
    description: 'Hint text below the users textarea',
  },
  'wizard.step1.users.invalid': {
    id: 'wizard.step1.users.invalid',
    defaultMessage: '{count, plural, one {This email/username is not associated with an account in this platform.} other {Some of these emails or usernames are not associated with accounts in this platform.}}',
    description: 'Error shown when one or more entered users are invalid',
  },

  // SelectUsersAndRoleStep — roles section
  'wizard.step1.roles.heading': {
    id: 'wizard.step1.roles.heading',
    defaultMessage: 'Roles',
    description: 'Heading for the roles selection section in step 1',
  },
  'wizard.step1.roles.contextLabel.library': {
    id: 'wizard.step1.roles.contextLabel.library',
    defaultMessage: 'Libraries',
    description: 'Label for the library roles group',
  },
  'wizard.step1.roles.contextLabel.course': {
    id: 'wizard.step1.roles.contextLabel.course',
    defaultMessage: 'Courses',
    description: 'Label for the course roles group',
  },
  'wizard.step1.roles.disabled.tooltip': {
    id: 'wizard.step1.roles.disabled.tooltip',
    defaultMessage: 'We are expanding our permissions system. This role is currently unavailable but will be part of an upcoming update.',
    description: 'Tooltip shown on disabled role options',
  },

  // DefineApplicationScopeStep — context labels
  'wizard.step2.contextLabel.course': {
    id: 'wizard.step2.contextLabel.course',
    defaultMessage: 'Courses',
    description: 'Context label shown in the scope filter bar when the selected role applies to courses',
  },
  'wizard.step2.contextLabel.library': {
    id: 'wizard.step2.contextLabel.library',
    defaultMessage: 'Libraries',
    description: 'Context label shown in the scope filter bar when the selected role applies to libraries',
  },
  'wizard.step2.contextLabel.default': {
    id: 'wizard.step2.contextLabel.default',
    defaultMessage: 'Items',
    description: 'Fallback context label shown in the scope filter bar when no specific context type is matched',
  },

  // useScopeListData — platform/org aggregate scope items
  'wizard.step2.scope.aggregate.description.course': {
    id: 'wizard.step2.scope.aggregate.description.course',
    defaultMessage: 'Includes current and future courses',
    description: 'Description for the platform-wide aggregate scope item when context type is course',
  },
  'wizard.step2.scope.aggregate.description.library': {
    id: 'wizard.step2.scope.aggregate.description.library',
    defaultMessage: 'Includes current and future libraries',
    description: 'Description for the platform-wide aggregate scope item when context type is library',
  },
  'wizard.step2.scope.aggregate.platform.label.course': {
    id: 'wizard.step2.scope.aggregate.platform.label.course',
    defaultMessage: 'All courses in Platform',
    description: 'Display name for the platform-wide aggregate scope item when context type is course',
  },
  'wizard.step2.scope.aggregate.platform.label.library': {
    id: 'wizard.step2.scope.aggregate.platform.label.library',
    defaultMessage: 'All libraries in Platform',
    description: 'Display name for the platform-wide aggregate scope item when context type is library',
  },

  // ScopeList — org section header
  'wizard.step2.scopeList.orgLabel': {
    id: 'wizard.step2.scopeList.orgLabel',
    defaultMessage: 'Org: {orgName}',
    description: 'Label for the collapsible org section header in the scope list',
  },

  // ScopeList — org-level aggregate scope items
  'wizard.step2.scopeList.aggregate.label.course': {
    id: 'wizard.step2.scopeList.aggregate.label.course',
    defaultMessage: 'All courses in this organization',
    description: 'Display name for the org-wide aggregate scope item when context type is course',
  },
  'wizard.step2.scopeList.aggregate.label.library': {
    id: 'wizard.step2.scopeList.aggregate.label.library',
    defaultMessage: 'All libraries in this organization',
    description: 'Display name for the org-wide aggregate scope item when context type is library',
  },

  // ScopeList — loading / empty states
  'wizard.step2.scopeList.loading': {
    id: 'wizard.step2.scopeList.loading',
    defaultMessage: 'Loading scopes...',
    description: 'Screen reader text for the loading spinner while scopes are being fetched',
  },
  'wizard.step2.scopeList.loadingMore': {
    id: 'wizard.step2.scopeList.loadingMore',
    defaultMessage: 'Loading more...',
    description: 'Screen reader text for the spinner shown while fetching the next page of scopes',
  },
  'wizard.step2.scopeList.empty': {
    id: 'wizard.step2.scopeList.empty',
    defaultMessage: 'No scopes found.',
    description: 'Message shown when no scopes match the current filters',
  },

  // SelectUsersAndRoleStep — documentation link
  'wizard.step1.docs.heading': {
    id: 'wizard.step1.docs.heading',
    defaultMessage: "Can't find the role you want to assign?",
    description: 'Heading for the documentation link at the bottom of step 1',
  },
  'wizard.step1.docs.body': {
    id: 'wizard.step1.docs.body',
    defaultMessage: 'Some roles are managed outside this console',
    description: 'Text accompanying the external documentation link',
  },
  'wizard.step1.docs.link': {
    id: 'wizard.step1.docs.link',
    defaultMessage: 'View roles managed in LMS and Django Admin',
    description: 'Link text pointing to LMS and Django Admin role management',
  },
});

export default messages;
