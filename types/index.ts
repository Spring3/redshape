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

type Collection<T = any> = {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

type PaginatedActionResponse<T = any> = {
  success: boolean;
  data: Collection<T>;
  hasMore: boolean;
  error?: Error;
};

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

type Pointer = {
  id: number;
  name: string;
}

type Issue = {
  id: number;
  project: Pointer;
  tracker: Pointer;
  status: Pointer;
  priority: Pointer;
  author: Pointer;
  assignee: Pointer;
  subject: string;
  description: string;
  startDate?: string;
  dueDate?: string;
  doneRatio: number;
  isPrivate: boolean;
  estimatedHours?: number;
  createdOn: string;
  updatedOn: string;
  closedOn?: string;
}

export {
  SessionAction
};

export type {
  Collection,
  IssueHeader,
  CreateOvermindConfigParams,
  Response,
  PaginatedActionResponse,
  User,
  Issue,
  Pointer
};
