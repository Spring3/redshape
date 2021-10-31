type UserState = {
  currentUser?: {
    id: string;
    firstName: string;
    lastName: string;
    createdOn: string;
  }
}

const state: UserState = {
  currentUser: undefined
};

export {
  state
};

export type {
  UserState
};
