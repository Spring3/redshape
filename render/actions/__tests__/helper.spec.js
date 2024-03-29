import MockAdapter from 'axios-mock-adapter';

import request, {
  IssueFilter, notify
} from '../helper';
import axios from '../../../common/request';

let axiosMock;

describe('Helper module', () => {
  beforeAll(() => {
    axiosMock = new MockAdapter(axios.default);
  });

  afterEach(() => {
    axiosMock.reset();
  });

  afterAll(() => {
    axiosMock.restore();
  });

  it('should expose all the necesary items', () => {
    expect(request).toBeTruthy();
    expect(notify).toBeTruthy();
    expect(IssueFilter).toBeTruthy();
  });

  describe('IssueFilter', () => {
    it('should provide a builder for issue related query params per Redmine API', () => {
      const filter = new IssueFilter();
      expect(filter).toBeTruthy();
      expect(filter.issue).toBeTruthy();
      expect(filter.project).toBeTruthy();
      expect(filter.subproject).toBeTruthy();
      expect(filter.tracker).toBeTruthy();
      expect(filter.status).toBeTruthy();
      expect(filter.assignee).toBeTruthy();
      expect(filter.author).toBeTruthy();
      expect(filter.title).toBeTruthy();
      expect(filter.due).toBeTruthy();
      expect(filter.createdAt).toBeTruthy();
      expect(filter.createdBetween).toBeTruthy();
      expect(filter.priority).toBeTruthy();
      expect(filter.sort).toBeTruthy();
      expect(filter.build).toBeTruthy();
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
      expect(notify.start).toBeTruthy();
      expect(notify.ok).toBeTruthy();
      expect(notify.nok).toBeTruthy();
      expect(notify.cancel).toBeTruthy();

      const TEST_ACTION = 'TEST_ACTION';

      expect(notify.start(TEST_ACTION)).toEqual({
        type: TEST_ACTION,
        status: 'START',
        info: {}
      });
      expect(notify.ok(TEST_ACTION, { test: 'aloalo' })).toEqual({
        type: TEST_ACTION,
        data: { test: 'aloalo' },
        status: 'OK',
        info: {}
      });
      const error = new Error('Test');
      expect(notify.nok(TEST_ACTION, error)).toEqual({
        type: TEST_ACTION,
        data: error,
        status: 'NOK',
        info: {}
      });
      expect(notify.cancel(TEST_ACTION)).toEqual({
        type: TEST_ACTION,
        status: 'CANCELLED',
        info: {}
      });
    });
  });

  describe('Login', () => {
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

      expect(axios.getInstance()).toBeTruthy();
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe('/user');

      const axiosInstanceMock = new MockAdapter(axios.getInstance());
      axiosInstanceMock.onGet('/test').replyOnce(() => Promise.resolve([200, undefined]));

      const error = new Error('Test request error');
      error.status = 500;
      axiosInstanceMock.onGet('/errortest').replyOnce(() => Promise.reject(error));

      await expect(request({ url: '/test' })).resolves.toEqual({ data: undefined });
      expect(axiosInstanceMock.history.get.length).toBe(1);
      expect(axiosInstanceMock.history.get[0].url).toBe('/test');

      try {
        await request({ url: '/errortest' });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('Error 500 (Test request error)');
      }

      axiosInstanceMock.restore();
      axios.reset();
    });
  });

  describe('Logout action', () => {
    it('should reset the axios instnace', () => {
      const spy = jest.spyOn(axios, 'reset');
      expect(spy).toHaveBeenCalled();
    });
  });
});
