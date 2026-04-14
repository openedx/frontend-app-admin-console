import {
  Add, Delete, DownloadDone, Edit, ManageAccounts, Sync, FileUpload, Visibility, FileDownload, Settings,
} from '@openedx/paragon/icons';

export const actionsDictionary = {
  create: Add,
  edit: Edit,
  delete: Delete,
  import: FileDownload,
  publish: DownloadDone,
  view: Visibility,
  reuse: Sync,
  team: ManageAccounts,
  export: FileUpload,
  manage: Settings,
};

export type ActionKey = keyof typeof actionsDictionary;
export const actionKeys = Object.keys(actionsDictionary);
