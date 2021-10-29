type State = {
  currentUser?: {
    id: string;
    firstName: string;
    lastName: string;
    createdOn: Date;
    lastLoggedOn: Date;
  }
}

const state: State = {
  currentUser: undefined
};

export {
  state
};

export type {
  State
};
