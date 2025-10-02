import {
  Add, Delete, DownloadDone, Edit, ManageAccounts, Sync, Tag, Visibility,
} from '@openedx/paragon/icons';

export const actionsDictionary = {
  create: Add,
  edit: Edit,
  delete: Delete,
  import: Sync,
  publish: DownloadDone,
  view: Visibility,
  reuse: Sync,
  tag: Tag,
  team: ManageAccounts,
};

export type ActionKey = keyof typeof actionsDictionary;
export const actionKeys = Object.keys(actionsDictionary);
