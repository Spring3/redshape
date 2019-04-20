import MockAdapter from 'axios-mock-adapter';
import * as axios from '../../../modules/request';

import request, { IssueFilter, notify, login } from '../helper';

jest.mock('electron-store');

const axiosMock = new MockAdapter(axios.default);

describe('Helper module', () => {
  it('should expose all the necesary items', () => {
    expect(request).toBeDefined();
    expect(notify).toBeDefined();
    expect(login).toBeDefined();
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

      expect(typeof filter).toBe('object');
      expect(filter).toEqual({
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
      });
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

    it('should initialize the axios instance if fullfilled and correctly handle responses', async () => {
      expect(axios.getInstance()).toBe(undefined);

      try {
        await request({ url: '/test' });
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

      axiosMock.onGet('/user').replyOnce(() => Promise.resolve([200, response]));

      await expect(login({
        redmineEndpoint: 'redmine.test.com',
        url: '/user'
      })).resolves.toEqual({ data: response });


      expect(axios.getInstance()).toBeDefined();
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe('redmine.test.com/user');

      const axiosInstanceMock = new MockAdapter(axios.getInstance());
      axiosInstanceMock.onGet('/test').replyOnce(() => Promise.resolve([200, undefined]));

      const error = new Error('Test request error');
      error.status = 500;
      axiosInstanceMock.onGet('/errortest').replyOnce(() => Promise.reject(error));

      await expect(request({ url: '/test' })).resolves.toEqual({ data: undefined });
      expect(axiosInstanceMock.history.get.length).toBe(1);
      expect(axiosInstanceMock.history.get[0].url).toBe('redmine.test.com/test');

      try {
        await request({ url: '/errortest' });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('Error 500 (Test request error)');
      }

      axiosInstanceMock.restore();
      axios.reset();
    });

    it('should throw if failed', async () => {
      expect(axios.getInstance()).toBe(undefined);

      const error = new Error('Test response error');
      axiosMock.onGet('/user').replyOnce(() => Promise.reject(error));

      try {
        await login({
          redmineEndpoint: 'redmine.test.com',
          url: '/user'
        });
      } catch (e) {
        expect(e).toEqual(error);
      }

      expect(axios.getInstance()).toBe(undefined);
      expect(axiosMock.history.get.length).toBe(1);
    });
  });
});
