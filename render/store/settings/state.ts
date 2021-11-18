type SettingsState = {
  showClosedIssues: boolean;
  endpoint?: string;
}

const defaultSettingsState = {
  showClosedIssues: false,
  endpoint: undefined
};

const state: SettingsState = {
  ...defaultSettingsState
};

export {
  state,
  defaultSettingsState
};

export type {
  SettingsState
};
