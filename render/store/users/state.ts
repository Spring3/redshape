import type { User } from '../../../types';

type UserState = {
  currentUser?: User
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
