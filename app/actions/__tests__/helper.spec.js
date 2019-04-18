import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import request, { IssueFilter, notify, login, reset } from '../helper';

jest.mock('electron-store');

const axiosMock = new MockAdapter(axios);

describe('Helper module', () => {
  it('should expose all the necesary items', () => {
    expect(request).toBeDefined();
    expect(notify).toBeDefined();
    expect(login).toBeDefined();
    expect(reset).toBeDefined();
    expect(IssueFilter).toBeDefined();
  });

  describe('IssueFilter', () => {
    it('should provide a builder for issue related query params per Redmine API', () => {
      const filter = new IssueFilter();
      expect(filter).toBeDefined();
      expect(filter.issue).toBeDefined();
      expect(filter.project).toBeDefined();
      expect(filter.subproject).toBeDefined();
      expect(filter.tracker).toBeDefined();
      expect(filter.status).toBeDefined();
      expect(filter.assignee).toBeDefined();
      expect(filter.author).toBeDefined();
      expect(filter.title).toBeDefined();
      expect(filter.due).toBeDefined();
      expect(filter.createdAt).toBeDefined();
      expect(filter.createdBetween).toBeDefined();
      expect(filter.priority).toBeDefined();
      expect(filter.sort).toBeDefined();
      expect(filter.build).toBeDefined();
    });

    it('should eventually build a query param string', () => {
      const date = new Date();
      const filter = new IssueFilter()
        .issue(['123', '456'])
        .project('projectId')
        .subproject('subprojectId')
        .tracker('trackerId')
        .status({ open: true, closed: true })
        .assignee('personId')
        .author('authorId')
        .title('Hello world')
        .due(date)
        .createdAt(date)
        .priority(1)
        .sort('name', 'asc')
        .build();
      expect(typeof filter).toBe('string');
      expect(filter).toBe(new URLSearchParams({
        issue_id: '123,456',
        project_id: 'projectId',
        subprojectId: 'subprojectId',
        tracker_id: 'trackerId',
        status_id: '*',
        assigned_to_id: 'personId',
        author_id: 'authorId',
        subject: `~${encodeURIComponent('Hello world')}`,
        due_date: date.toISOString(),
        created_on: date.toISOString(),
        priority_id: 1,
        sort: 'name:asc'
      }).toString());
    });
  });

  describe('Notifier', () => {
    it('should populate the action with status', () => {
      expect(notify.start).toBeDefined();
      expect(notify.paginate).toBeDefined();
      expect(notify.ok).toBeDefined();
      expect(notify.nok).toBeDefined();
      expect(notify.cancel).toBeDefined();

      const TEST_ACTION = 'TEST_ACTION';

      expect(notify.start(TEST_ACTION)).toEqual({
        type: TEST_ACTION,
        status: 'START',
        id: undefined
      });
      expect(notify.paginate(TEST_ACTION)).toEqual({
        type: TEST_ACTION,
        status: 'PAGE_NEXT',
        id: undefined
      });
      expect(notify.ok(TEST_ACTION, { test: 'aloalo' })).toEqual({
        type: TEST_ACTION,
        data: { test: 'aloalo' },
        status: 'OK',
        id: undefined
      });
      const error = new Error('Test');
      expect(notify.nok(TEST_ACTION, error)).toEqual({
        type: TEST_ACTION,
        data: error,
        status: 'NOK',
        id: undefined
      });
      expect(notify.cancel(TEST_ACTION)).toEqual({
        type: TEST_ACTION,
        status: 'CANCELLED'
      });
    });
  });

  describe('Login', () => {
    afterEach(() => axiosMock.reset());

    it('should initialize the axios instance if fullfilled', async () => {
      try {
        await request({ url: '123abc' });
        throw new Error('SHOULD NOT RESOLVE');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('401 - Unauthorized');
      }

      const response = {
        user: {
          api_key: '123abc'
        }
      };

      axiosMock.onGet('/user').reply(200, () => Promise.resolve(response));

      const res = await login({
        redmineEndpoint: 'redmine.test.com',
        url: '/user'
      });

      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].data).toEqual(response);
      expect(res).toEqual(response);

      axiosMock.onGet('/123abc').reply(200, () => Promise.resolve());
      await expect(request({ url: '/123abc' })).resolves.toEqual(undefined);

      expect(axiosMock.history.get.length).toBe(2);
    });

    it('should throw if failed', () => {

    });
  });
});
