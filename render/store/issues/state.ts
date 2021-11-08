type IssuesState = {
  list: [];
  status: 'idle' | 'fetching';
}

const state: IssuesState = {
  list: [],
  status: 'idle',
};

export {
  state
};

export type {
  IssuesState
};
