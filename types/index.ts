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

type Response<T = any> = {
  payload: T;
  success: boolean;
  error?: Error;
}

// eslint-disable-next-line no-shadow
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
