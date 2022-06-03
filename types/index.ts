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
  data?: T;
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

type TimeEntryNote = {
  isoDate: string;
  note: string;
}

type TimeTrackingRecord = {
  action: TimeTrackingAction;
  issueId: number;
  isoDate: string;
  notes: TimeEntryNote[];
  id: string;
}

type User = {
  id: number;
  firstName: string;
  lastName: string;
  createdOn: string;
}

type Identifier = {
  id: number;
}

type Activity = {
  id: number;
  name: string;
  isDefault: boolean;
}

type Pointer = {
  id: number;
  name: string;
}

type JournalEntry = {
  id: number;
  user: Pointer;
  createdOn: string;
  notes?: string;
  privateNotes: boolean;
  details?: [];
}

type CustomField = {
  name: string;
  value: string;
}

type Project = {
  id: number;
  name: string;
  identifier: string;
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

type IssueStatus = {
  id: string;
  name: string;
  isClosed: boolean;
}

type TimeEntry = {
  id: number;
  project: Pointer;
  issue: Identifier;
  user: Pointer;
  activity: Pointer;
  hours: number;
  comments: string;
  spentOn: string;
  createdOn: string;
  updatedOn: string;
}

type VersionStatus = 'open' | 'locked' | 'closed';

type VersionSharing = 'none' | 'descendants' | 'hierarchy' | 'tree' | 'system';

type Version = {
  id: number;
  project: Pointer;
  name: string;
  description: string;
  status: VersionStatus;
  dueDate: string;
  sharing: VersionSharing;
  createdOn: string;
  updatedOn: string;
  wikiPageTitle: string;
}

export {
  SessionAction,
  TimeTrackingAction
};

export type {
  Activity,
  Collection,
  CreateOvermindConfigParams,
  Issue,
  IssueHeader,
  IssueStatus,
  PaginatedActionResponse,
  Pointer,
  Project,
  Response,
  SortingDirection,
  JournalEntry,
  TimeEntry,
  TimeTrackingRecord,
  User,
  Version
};
