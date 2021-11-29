type IssueHeader = {
  label: string;
  isFixed: boolean;
  value: 'id' | 'subject' | 'project.name' | 'tracker.name' | 'status.name' | 'priority.name' | 'estimated_hours' | 'due_date';
};

type SortingDirection = 'asc' | 'desc';

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

// eslint-disable-next-line no-shadow
enum TimeTrackingAction {
  START = 'START',
  PAUSE = 'PAUSE',
  CONTINUE = 'CONTINUE',
  STOP = 'STOP'
}

type TimeEntryNode = {
  isoDate: string;
  note: string;
}

type TimeTrackingRecord = {
  action: TimeTrackingAction;
  issueId: number;
  isoDate: string;
  notes: TimeEntryNode[];
}

type User = {
  id: number;
  firstName: string;
  lastName: string;
  createdOn: string;
}

type Pointer = {
  id: number;
  name: string;
}

type JournalEntry = {
  id: string;
  user: Pointer;
  createdOn: string;
  notes?: string[];
}

type CustomField = {
  name: string;
  value: string;
}

type Project = {
  id: number;
  name: string;
  identified: string;
  description: string;
  status: number;
  isPublic: boolean;
  inheritMembers: boolean;
  timeEntryActivities: Pointer[];
  createdOn: string;
  updatedOn: string;
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
  totalEstimatedHours?: number;
  spentHours?: number;
  totalSpentHours?: number;
  subTasks?: Issue[];
  journals?: JournalEntry[];
  customFields?: CustomField[];
  createdOn: string;
  updatedOn: string;
  closedOn?: string;
}

export {
  SessionAction,
  TimeTrackingAction
};

export type {
  Collection,
  CreateOvermindConfigParams,
  Issue,
  IssueHeader,
  PaginatedActionResponse,
  Pointer,
  Project,
  Response,
  SortingDirection,
  TimeTrackingRecord,
  User,
};
