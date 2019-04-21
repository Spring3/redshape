import actions from '../index';

describe('Actions aggregator', () => {
  it('should aggregate all the actions', () => {
    expect(actions).toBeTruthy();
    expect(actions.user).toBeTruthy();
    expect(actions.issues).toBeTruthy();
    expect(actions.tracking).toBeTruthy();
    expect(actions.projects).toBeTruthy();
    expect(actions.time).toBeTruthy();
    expect(actions.settings).toBeTruthy();
  });
});
