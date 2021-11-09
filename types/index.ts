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
  payload?: T;
  success: boolean;
  error?: Error;
}

// eslint-disable-next-line no-shadow
enum SessionAction {
  READ = 'READ',
  SAVE = 'SAVE',
  RESET = 'RESET'
}

type User = {
  id: string;
  firstName: string;
  lastName: string;
  createdOn: string;
}

export {
  SessionAction
};

export type {
  IssueHeader,
  CreateOvermindConfigParams,
  Response,
  User
};
