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
  'wizard.step.selectUsersAndRole.title': {
    id: 'wizard.step.selectUsersAndRole.title',
    defaultMessage: 'Who and Role',
    description: 'Step 1 title in the assign role wizard',
  },
  'wizard.step.defineScope.title': {
    id: 'wizard.step.defineScope.title',
    defaultMessage: 'Where it applies',
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
    defaultMessage: 'Validating...',
    description: 'Next button label while user validation is in progress',
  },
  'wizard.button.save': {
    id: 'wizard.button.save',
    defaultMessage: 'Save',
    description: 'Save button label in the wizard',
  },
  'wizard.button.save.pending': {
    id: 'wizard.button.save.pending',
    defaultMessage: 'Saving...',
    description: 'Save button label while the save operation is in progress',
  },

  // AssignRoleWizard — messages
  'wizard.save.success': {
    id: 'wizard.save.success',
    defaultMessage: 'Role assigned successfully.',
    description: 'Toast message shown when a role is successfully assigned',
  },
  'wizard.validate.error': {
    id: 'wizard.validate.error',
    defaultMessage: 'An error occurred while validating users. Please try again.',
    description: 'Error message shown when user validation fails',
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
    defaultMessage: '{count, plural, one {This email is not associated with an account in this platform.} other {Some of these emails or usernames are not associated with accounts in this platform.}}',
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
