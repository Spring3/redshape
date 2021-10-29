type IssueHeader = {
  label: string;
  isFixed: boolean;
  value: string;
};

type AuthenticationHeader = {
  'X-Redmine-API-Key': string;
  Authorization: string;
}

type CreateOvermindConfigParams = {
  authenticationHeader: Partial<AuthenticationHeader>;
  endpoint: string;
}

type Response = {
  data: any;
  success: boolean;
  error?: Error;
}

enum StorageAction {
  READ = 'READ',
  SAVE = 'SAVE'
}

export {
  StorageAction
};

export type {
  IssueHeader,
  CreateOvermindConfigParams,
  Response
};
