import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'authz.team.members.table.column.username.title': {
    id: 'authz.team.members.table.column.username.title',
    defaultMessage: 'Username',
    description: 'Team members table username column header',
  },
  'authz.team.members.table.username.current': {
    id: 'authz.team.members.table.username.current',
    defaultMessage: '{username} (Me)',
    description: 'Indicates the current user in the team members table',
  },
  'authz.team.members.table.column.email.title': {
    id: 'authz.team.members.table.column.email.title',
    defaultMessage: 'Email',
    description: 'Team members table email column header',
  },
  'authz.team.members.table.column.organization.title': {
    id: 'authz.team.members.table.column.organization.title',
    defaultMessage: 'Organization',
    description: 'Team members table organization column header',
  },
  'authz.team.members.table.column.scope.title': {
    id: 'authz.team.members.table.column.scope.title',
    defaultMessage: 'Scope',
    description: 'Team members table scope column header',
  },
  'authz.team.members.table.column.role.title': {
    id: 'authz.team.members.table.column.role.title',
    defaultMessage: 'Role',
    description: 'Team members table role column header',
  },
  'authz.team.members.table.column.actions.title': {
    id: 'authz.team.members.table.column.actions.title',
    defaultMessage: 'Actions',
    description: 'Team members table actions column header',
  },
  'authz.team.members.table.column.assigned.roles.title': {
    id: 'authz.team.members.table.column.assigned.roles.title',
    defaultMessage: 'Assigned roles',
    description: 'Team members table assigned roles column header',
  },
  'authz.team.members.table.assigned.roles': {
    id: 'authz.team.members.table.assigned.roles',
    defaultMessage: '{role} in {scope}',
    description: 'One role assignment on a team member row, e.g. "Course Admin in Introduction to Data Analysis". {role} is the role badge and {scope} the course or library it applies to, so both the order and the connecting word can be changed per language.',
  },
  'authz.team.members.table.more.roles': {
    id: 'authz.team.members.table.more.roles',
    defaultMessage: '+{count, plural, one {# more role} other {# more roles}}',
    description: 'Link expanding a team member row to reveal their remaining roles. The count excludes the role already shown in the collapsed row.',
  },
  'authz.team.members.table.hide.roles': {
    id: 'authz.team.members.table.hide.roles',
    defaultMessage: 'Hide roles',
    description: 'Link collapsing an expanded team member row',
  },
  'authz.team.members.subtable.column.role.title': {
    id: 'authz.team.members.subtable.column.role.title',
    defaultMessage: 'Role',
    description: 'Role column header of the nested assignments table inside an expanded team member row',
  },
  'authz.team.members.subtable.column.scope.title': {
    id: 'authz.team.members.subtable.column.scope.title',
    defaultMessage: 'Scope',
    description: 'Scope column header of the nested assignments table inside an expanded team member row',
  },
  'authz.team.members.subtable.column.organization.title': {
    id: 'authz.team.members.subtable.column.organization.title',
    defaultMessage: 'Organization',
    description: 'Organization column header of the nested assignments table inside an expanded team member row',
  },
  'authz.team.members.subtable.showing.text': {
    id: 'authz.team.members.subtable.showing.text',
    defaultMessage: 'Showing {shown} of {total}',
    description: 'Footer of the nested assignments table stating how many of the user total number of roles are listed',
  },
  'authz.team.members.subtable.view.all.roles': {
    id: 'authz.team.members.subtable.view.all.roles',
    defaultMessage: 'View all roles',
    description: 'Link taking the user to the full profile listing every role assigned to a team member',
  },
  'authz.team.members.table.showing.users.text': {
    id: 'authz.team.members.table.showing.users.text',
    defaultMessage: 'Showing {pageSize, plural, one {# user} other {# users}} of {itemCount}.',
    description: 'Text stating how many team members are listed on the current page out of the total count',
  },
});

export default messages;
