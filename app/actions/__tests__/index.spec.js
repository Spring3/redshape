import actions from '../index';

describe('Actions aggregator', () => {
  it('should aggregate all the actions', () => {
    expect(actions).toBeDefined();
    expect(actions.user).toBeDefined();
    expect(actions.issues).toBeDefined();
    expect(actions.tracking).toBeDefined();
    expect(actions.projects).toBeDefined();
    expect(actions.time).toBeDefined();
    expect(actions.settings).toBeDefined();
  });
});
