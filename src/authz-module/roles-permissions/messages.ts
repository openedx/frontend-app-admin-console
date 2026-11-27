import { defineMessages } from '@openedx/frontend-base';

const messages = defineMessages({
  'authz.tabs.permissions': {
    id: 'authz.tabs.permissions',
    defaultMessage: 'Permissions',
    description: 'Libraries AuthZ title for the permissions tab',
  },
  'authz.tabs.permissionsRoles': {
    id: 'authz.tabs.permissionsRoles',
    defaultMessage: 'Roles and Permissions',
    description: 'Libraries AuthZ title for the permissions and roles tab',
  },
  'authz.tabs.permissionsRoles.courses.alert.title': {
    id: 'authz.tabs.permissionsRoles.courses.alert.title',
    defaultMessage: 'Course Roles',
    description: 'Libraries AuthZ title for the course roles alert',
  },
  'authz.tabs.permissionsRoles.courses.tab': {
    id: 'authz.tabs.permissionsRoles.courses.tab',
    defaultMessage: 'Courses',
    description: 'Libraries AuthZ title for the course roles tab',
  },
  'authz.tabs.permissionsRoles.libraries.tab': {
    id: 'authz.tabs.permissionsRoles.libraries.tab',
    defaultMessage: 'Libraries',
    description: 'Libraries AuthZ title for the libraries roles tab',
  },
  'authz.tabs.permissionsRoles.libraries.tab.title': {
    id: 'authz.tabs.permissionsRoles.libraries.tab.title',
    defaultMessage: 'Library Roles',
    description: 'Libraries AuthZ title for the library roles table',
  },
  'authz.tabs.permissionsRoles.courses.tab.title': {
    id: 'authz.tabs.permissionsRoles.courses.tab.title',
    defaultMessage: 'Course Roles',
    description: 'Libraries AuthZ title for the course roles table',
  },
  'authz.tabs.permissionsRoles.courses.alert.note': {
    id: 'authz.tabs.permissionsRoles.courses.alert.note',
    defaultMessage: 'Note:',
    description: 'Libraries AuthZ note for the course roles alert',
  },
  'authz.tabs.permissionsRoles.courses.alert.description': {
    id: 'authz.tabs.permissionsRoles.courses.alert.description',
    defaultMessage: 'This list shows the permissions currently available in Authoring Studio. Some roles may grant additional permissions managed outside this interface.',
    description: 'Libraries AuthZ description for the course roles alert',
  },
  'authz.tabs.permissionsRoles.courses.alert.link': {
    id: 'authz.tabs.permissionsRoles.courses.alert.link',
    defaultMessage: 'See full documentation',
    description: 'Libraries AuthZ link for the course roles alert',
  },
  'authz.tabs.permissionsRoles.loading': {
    id: 'authz.tabs.permissionsRoles.loading',
    defaultMessage: 'Loading roles and permissions',
    description: 'Libraries AuthZ screen reader text while the roles and permissions are loading',
  },
  'authz.tabs.permissionsRoles.error': {
    id: 'authz.tabs.permissionsRoles.error',
    defaultMessage: 'The roles and permissions could not be loaded. Please try again later.',
    description: 'Libraries AuthZ message shown when the roles and permissions fail to load',
  },
  'authz.roles.table.search.placeholder': {
    id: 'authz.roles.table.search.placeholder',
    defaultMessage: 'Search',
    description: 'Placeholder of the search input in the roles table',
  },
  'authz.roles.table.showing.roles.text': {
    id: 'authz.roles.table.showing.roles.text',
    defaultMessage: 'Showing {pageSize, plural, one {# role} other {# roles}} of {itemCount}.',
    description: 'Text stating how many roles are listed on the current page out of the total count',
  },
  'authz.roles.table.column.role.title': {
    id: 'authz.roles.table.column.role.title',
    defaultMessage: 'Role',
    description: 'Header of the role name column in the roles table',
  },
  'authz.roles.table.column.resource.type.title': {
    id: 'authz.roles.table.column.resource.type.title',
    defaultMessage: 'Type of resource',
    description: 'Header of the resource type column in the roles table, also used as the filter button text',
  },
  'authz.roles.table.column.members.title': {
    id: 'authz.roles.table.column.members.title',
    defaultMessage: 'Members',
    description: 'Header of the members count column in the roles table',
  },
  'authz.roles.table.column.permissions.title': {
    id: 'authz.roles.table.column.permissions.title',
    defaultMessage: 'Permissions',
    description: 'Header of the permissions column in the roles table',
  },
  'authz.roles.table.column.last.updated.title': {
    id: 'authz.roles.table.column.last.updated.title',
    defaultMessage: 'Last updated',
    description: 'Header of the last updated column in the roles table',
  },
  'authz.roles.table.column.actions.title': {
    id: 'authz.roles.table.column.actions.title',
    defaultMessage: 'Actions',
    description: 'Header of the actions column in the roles table',
  },
  'authz.roles.table.resource.type.courses': {
    id: 'authz.roles.table.resource.type.courses',
    defaultMessage: 'Courses',
    description: 'Label for roles that apply to courses',
  },
  'authz.roles.table.resource.type.libraries': {
    id: 'authz.roles.table.resource.type.libraries',
    defaultMessage: 'Libraries',
    description: 'Label for roles that apply to libraries',
  },
  'authz.roles.table.custom.role.label': {
    id: 'authz.roles.table.custom.role.label',
    defaultMessage: 'Custom Role',
    description: 'Label shown under the name of a role created by the user',
  },
  'authz.roles.table.permissions.granted': {
    id: 'authz.roles.table.permissions.granted',
    defaultMessage: '{count} Granted',
    description: 'Number of permissions granted by a role',
  },
  'authz.roles.table.action.view.alt': {
    id: 'authz.roles.table.action.view.alt',
    defaultMessage: 'View {role}',
    description: 'Accessible label of the button that opens a built-in role. {role} is the role name, so screen reader users know which row the button acts on.',
  },
  'authz.roles.table.action.edit.alt': {
    id: 'authz.roles.table.action.edit.alt',
    defaultMessage: 'Edit {role}',
    description: 'Accessible label of the button that edits a custom role. {role} is the role name, so screen reader users know which row the button acts on.',
  },
  'authz.roles.table.action.more.alt': {
    id: 'authz.roles.table.action.more.alt',
    defaultMessage: 'More actions for {role}',
    description: 'Accessible label of the toggle, and so of the menu, with more actions for a role. {role} is the role name, so screen reader users know which row the menu acts on.',
  },
  'authz.roles.table.action.duplicate': {
    id: 'authz.roles.table.action.duplicate',
    defaultMessage: 'Duplicate',
    description: 'Menu item that duplicates a role',
  },
  'authz.roles.table.action.assign': {
    id: 'authz.roles.table.action.assign',
    defaultMessage: 'Assign role',
    description: 'Menu item that assigns a role to users',
  },
  'authz.roles.table.empty': {
    id: 'authz.roles.table.empty',
    defaultMessage: 'No roles found.',
    description: 'Message shown in the roles table when there are no roles, or none match the search and filters',
  },
  'authz.roles.table.filter.remove.alt': {
    id: 'authz.roles.table.filter.remove.alt',
    defaultMessage: 'Remove {filter} filter',
    description: 'Accessible label of the button that removes an applied filter chip in the roles table',
  },
  'authz.roles.create.button': {
    id: 'authz.roles.create.button',
    defaultMessage: 'Create Custom Role',
    description: 'Header button that opens the create custom role wizard',
  },
  'authz.roles.create.wizard.title': {
    id: 'authz.roles.create.wizard.title',
    defaultMessage: 'Create a new role',
    description: 'Title of the create custom role wizard',
  },
  'authz.roles.create.wizard.step.nameAndResource': {
    id: 'authz.roles.create.wizard.step.nameAndResource',
    defaultMessage: 'Name & Resource',
    description: 'Title of the first step of the create custom role wizard',
  },
  'authz.roles.create.wizard.step.permissions': {
    id: 'authz.roles.create.wizard.step.permissions',
    defaultMessage: 'Permissions',
    description: 'Title of the second step of the create custom role wizard',
  },
  'authz.roles.create.wizard.step.status': {
    id: 'authz.roles.create.wizard.step.status',
    defaultMessage: 'Step {current} of {total}: {title}',
    description: 'Accessible name of the content of the active step of the create custom role wizard, which a screen reader reads when focus moves to the step',
  },
  'authz.roles.create.wizard.button.cancel': {
    id: 'authz.roles.create.wizard.button.cancel',
    defaultMessage: 'Cancel',
    description: 'Button that closes the create custom role wizard',
  },
  'authz.roles.create.wizard.button.next': {
    id: 'authz.roles.create.wizard.button.next',
    defaultMessage: 'Next',
    description: 'Button that moves the create custom role wizard to the permissions step',
  },
  'authz.roles.create.wizard.button.back': {
    id: 'authz.roles.create.wizard.button.back',
    defaultMessage: 'Back',
    description: 'Button that moves the create custom role wizard back to the name and resource step',
  },
  'authz.roles.create.wizard.button.next.hint.name': {
    id: 'authz.roles.create.wizard.button.next.hint.name',
    defaultMessage: 'Enter a role name to continue.',
    description: 'Screen reader text that explains why the Next button of the create custom role wizard does nothing: the role name is missing',
  },
  'authz.roles.create.wizard.button.next.hint.nameRejected': {
    id: 'authz.roles.create.wizard.button.next.hint.nameRejected',
    defaultMessage: 'Change the role name to continue.',
    description: 'Screen reader text that explains why the Next button of the create custom role wizard does nothing: the role name was rejected',
  },
  'authz.roles.create.wizard.button.next.hint.sourceRole': {
    id: 'authz.roles.create.wizard.button.next.hint.sourceRole',
    defaultMessage: 'Select a role to clone to continue.',
    description: 'Screen reader text that explains why the Next button of the create custom role wizard does nothing: no role to clone is selected',
  },
  'authz.roles.create.wizard.button.next.hint.catalogLoading': {
    id: 'authz.roles.create.wizard.button.next.hint.catalogLoading',
    defaultMessage: 'Roles are still loading. Wait to continue.',
    description: 'Screen reader text that explains why the Next button of the create custom role wizard does nothing: the roles are still loading',
  },
  'authz.roles.create.wizard.button.next.hint.catalogError': {
    id: 'authz.roles.create.wizard.button.next.hint.catalogError',
    defaultMessage: 'Roles could not be loaded, so you cannot continue.',
    description: 'Screen reader text that explains why the Next button of the create custom role wizard does nothing: the roles failed to load or none are available',
  },
  'authz.roles.create.wizard.name.error': {
    id: 'authz.roles.create.wizard.name.error',
    defaultMessage: 'Enter a role name.',
    description: 'Error shown under the custom role name field when it is empty',
  },
  'authz.roles.create.wizard.name.alert.taken': {
    id: 'authz.roles.create.wizard.name.alert.taken',
    defaultMessage: 'A role with this name already exists. Enter a different role name.',
    description: 'Alert shown on the first step of the create custom role wizard when the role name is already used',
  },
  'authz.roles.create.wizard.name.alert.invalid': {
    id: 'authz.roles.create.wizard.name.alert.invalid',
    defaultMessage: 'This role name is not valid. Enter a different role name.',
    description: 'Alert shown on the first step of the create custom role wizard when the role name breaks the naming rules',
  },
  'authz.roles.create.wizard.name.alert.failed': {
    id: 'authz.roles.create.wizard.name.alert.failed',
    defaultMessage: 'The role name could not be checked. Please try again.',
    description: 'Alert shown on the first step of the create custom role wizard when the role name check request fails',
  },
  'authz.roles.create.wizard.sourceRole.error': {
    id: 'authz.roles.create.wizard.sourceRole.error',
    defaultMessage: 'Select a role to clone.',
    description: 'Error shown under the picker of the role a custom role is cloned from when none is selected',
  },
  'authz.roles.create.wizard.name.label': {
    id: 'authz.roles.create.wizard.name.label',
    defaultMessage: 'Role name',
    description: 'Label of the custom role name field',
  },
  'authz.roles.create.wizard.name.placeholder': {
    id: 'authz.roles.create.wizard.name.placeholder',
    defaultMessage: 'e.g. Course designer',
    description: 'Placeholder of the custom role name field',
  },
  'authz.roles.create.wizard.name.helper': {
    id: 'authz.roles.create.wizard.name.helper',
    defaultMessage: 'Shown when administrators assign access.',
    description: 'Helper text of the custom role name field',
  },
  'authz.roles.create.wizard.startFrom.label': {
    id: 'authz.roles.create.wizard.startFrom.label',
    defaultMessage: 'Start from',
    description: 'Label of the choice between building a custom role from scratch or cloning a role',
  },
  'authz.roles.create.wizard.startFrom.scratch.title': {
    id: 'authz.roles.create.wizard.startFrom.scratch.title',
    defaultMessage: 'Start from scratch',
    description: 'Title of the option that builds the custom role without permissions',
  },
  'authz.roles.create.wizard.startFrom.scratch.description': {
    id: 'authz.roles.create.wizard.startFrom.scratch.description',
    defaultMessage: 'Build the role from zero permissions.',
    description: 'Description of the option that builds the custom role without permissions',
  },
  'authz.roles.create.wizard.startFrom.clone.title': {
    id: 'authz.roles.create.wizard.startFrom.clone.title',
    defaultMessage: 'Clone from role',
    description: 'Title of the option that starts the custom role from an existing role',
  },
  'authz.roles.create.wizard.startFrom.clone.description': {
    id: 'authz.roles.create.wizard.startFrom.clone.description',
    defaultMessage: 'Start with pre-configured permissions from an existing role.',
    description: 'Description of the option that starts the custom role from an existing role',
  },
  'authz.roles.create.wizard.resourceType.label': {
    id: 'authz.roles.create.wizard.resourceType.label',
    defaultMessage: 'Resource type',
    description: 'Label of the custom role resource type field',
  },
  'authz.roles.create.wizard.resourceType.helper': {
    id: 'authz.roles.create.wizard.resourceType.helper',
    defaultMessage: 'Select the target resource. Custom roles currently apply to a single resource type.',
    description: 'Helper text of the custom role resource type field',
  },
  'authz.roles.create.wizard.sourceRole.label': {
    id: 'authz.roles.create.wizard.sourceRole.label',
    defaultMessage: 'Role',
    description: 'Label of the picker of the role a custom role is cloned from',
  },
  'authz.roles.create.wizard.sourceRole.placeholder': {
    id: 'authz.roles.create.wizard.sourceRole.placeholder',
    defaultMessage: 'Select a role',
    description: 'Placeholder of the picker of the role a custom role is cloned from',
  },
  'authz.roles.create.wizard.sourceRole.group.standard': {
    id: 'authz.roles.create.wizard.sourceRole.group.standard',
    defaultMessage: 'Standard Roles',
    description: 'Header of the built-in roles in the clone source role picker',
  },
  'authz.roles.create.wizard.sourceRole.group.custom': {
    id: 'authz.roles.create.wizard.sourceRole.group.custom',
    defaultMessage: 'Custom Roles',
    description: 'Header of the custom roles in the clone source role picker',
  },
  'authz.roles.create.wizard.sourceRole.custom': {
    id: 'authz.roles.create.wizard.sourceRole.custom',
    defaultMessage: '{role} (Custom Role)',
    description: 'A selected custom role in the clone source role picker',
  },
  'authz.roles.create.wizard.loading': {
    id: 'authz.roles.create.wizard.loading',
    defaultMessage: 'Loading roles',
    description: 'Screen reader text while the create custom role wizard loads the roles',
  },
  'authz.roles.create.wizard.error': {
    id: 'authz.roles.create.wizard.error',
    defaultMessage: 'The roles could not be loaded. Please try again later.',
    description: 'Message shown when the create custom role wizard fails to load the roles',
  },
  'authz.team.remove.user.toast.success.description': {
    id: 'authz.team.remove.user.toast.success.description',
    defaultMessage: 'The {role} role has been successfully removed.{rolesCount, plural, =0 { The user no longer has access to this library and has been removed from the member list.} other {}}',
    description: 'Libraries team management remove user toast success',
  },
  'authz.team.toast.default.error.message': {
    id: 'authz.team.toast.default.error.message',
    defaultMessage: '<Bold>Something went wrong on our end.</Bold> <Br></Br>Please try again later.',
    description: 'Libraries default error message',
  },
});

export default messages;
