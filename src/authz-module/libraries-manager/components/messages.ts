import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'libraries.authz.manage.assign.new.role.title': {
    id: 'libraries.authz.manage.assign.new.role.title',
    defaultMessage: 'Add New Role',
    description: 'Libraries AuthZ assign a new role to a user button title',
  },
  'libraries.authz.manage.cancel.button': {
    id: 'libraries.authz.manage.cancel.button',
    defaultMessage: 'Cancel',
    description: 'Libraries AuthZ cancel button title',
  },
  'libraries.authz.manage.saving.button': {
    id: 'libraries.authz.manage.saving.button',
    defaultMessage: 'Saving...',
    description: 'Libraries AuthZ saving button title',
  },
  'libraries.authz.manage.save.button': {
    id: 'libraries.authz.manage.save.button',
    defaultMessage: 'Save',
    description: 'Libraries AuthZ save button title',
  },
  'libraries.authz.manage.assign.role.success': {
    id: 'libraries.authz.manage.assign.role.success',
    defaultMessage: 'Role added successfully.',
    description: 'Libraries AuthZ assign role success message',
  },
  'library.authz.team.remove.user.modal.title': {
    id: 'library.authz.team.remove.user.modal.title',
    defaultMessage: 'Remove role?',
    description: 'Libraries team management remove user modal title',
  },
  'library.authz.team.remove.user.modal.body.1': {
    id: 'library.authz.team.remove.user.modal.body',
    defaultMessage: 'Are you sure you want to remove the {role} role from the user “{userName}” in the library {scope}?',
    description: 'Libraries team management remove user modal body',
  },
  'library.authz.team.remove.user.modal.body.2': {
    id: 'library.authz.team.remove.user.modal.body',
    defaultMessage: "This is the user's only role in this library. Removing it will revoke their access completely, and they will no longer appear in the library's member List.",
    description: 'Libraries team management remove user modal body',
  },
  'library.authz.team.remove.user.modal.body.3': {
    id: 'library.authz.team.remove.user.modal.body',
    defaultMessage: 'Are you sure you want to proceed?',
    description: 'Libraries team management remove user modal body',
  },
  'library.authz.manage.role.select.label': {
    id: 'library.authz.role.select.label',
    defaultMessage: 'Roles',
    description: 'Libraries team management label for roles select',
  },
  'libraries.authz.manage.removing.button': {
    id: 'libraries.authz.manage.removing.button',
    defaultMessage: 'Removing...',
    description: 'Libraries AuthZ removing button title',
  },
  'libraries.authz.manage.remove.button': {
    id: 'libraries.authz.manage.remove.button',
    defaultMessage: 'Remove',
    description: 'Libraries AuthZ remove button title',
  },
  'libraries.authz.public.read.toggle.label': {
    id: 'libraries.authz.public.read.toggle.label',
    defaultMessage: 'Allow public read',
    description: 'Library label toggle to allow public read',
  },
  'libraries.authz.public.read.toggle.subtext': {
    id: 'libraries.authz.public.read.toggle.subtext',
    defaultMessage: 'Allows reuse of library content in courses.',
    description: 'Library description toggle to allow public read',
  },
  'libraries.authz.public.read.toggle.success': {
    id: 'libraries.authz.public.read.toggle.success',
    defaultMessage: 'The library setting has been updated successfully.',
    description: 'Sucessfull message for allow public read',
  },
});

export default messages;
