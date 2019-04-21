import MockAdapter from 'axios-mock-adapter';
import moment from 'moment';
import { notify } from '../helper';
import * as timeActions from '../time.actions';
import * as axios from '../../../modules/request';

const redmineEndpoint = 'redmine.test.com';
const token = 'multipass';
let axiosMock;

describe('Time actions', () => {
  beforeAll(() => {
    axios.initialize(redmineEndpoint, token);
    expect(axios.getInstance()).toBeTruthy();
    axiosMock = new MockAdapter(axios.getInstance());
  });

  afterAll(() => {
    axiosMock.restore();
    axios.reset();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  it('should expose all the necessary actions', () => {
    expect(timeActions).toBeTruthy();
    expect(timeActions.TIME_ADD).toBeTruthy();
    expect(timeActions.TIME_UPDATE).toBeTruthy();
    expect(timeActions.TIME_DELETE).toBeTruthy();
    expect(timeActions.TIME_GET_ALL).toBeTruthy();

    expect(timeActions.default.add).toBeTruthy();
    expect(timeActions.default.update).toBeTruthy();
    expect(timeActions.default.remove).toBeTruthy();
    expect(timeActions.default.getAll).toBeTruthy();
  });

  describe('add action', () => {
    it('should make request and return the response with correct actions', async () => {
      const response = {
        time_entry: {}
      };

      const state = {
        user: {
          id: 1,
          name: 'John Wayne'
        }
      };

      const timeEntry = {
        issue: {
          id: 1
        },
        spent_on: new Date(),
        hours: 1.5,
        activity: {
          id: 1
        },
        comments: 'Hello world',
        user: {
          id: 1
        }
      };

      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue(state);
      axiosMock.onPost('/time_entries.json').replyOnce(() => Promise.resolve([200, response]));
      await timeActions.default.add(timeEntry)(dispatch, getState);

      expect(getState).toHaveBeenCalledTimes(1);
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(`${redmineEndpoint}/time_entries.json`);
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({
        time_entry: {
          issue_id: timeEntry.issue.id,
          spent_on: moment(timeEntry.spent_on).format('YYYY-MM-DD'),
          hours: timeEntry.hours,
          activity_id: timeEntry.activity.id,
          comments: timeEntry.comments,
          user_id: state.user.id
        }
      }));
      expect(axiosMock.history.post[0].headers['X-Redmine-API-Key']).toBe(token);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(timeActions.TIME_ADD));
      expect(dispatch).toBeCalledWith(notify.ok(timeActions.TIME_ADD, response));
    });

    it('should pass the error further with dispatch', async () => {
      const timeEntry = {
        issue: {
          id: 1
        },
        spent_on: new Date(),
        hours: 1.5,
        activity: {
          id: 1
        },
        comments: 'Hello world',
        user: {
          id: 1
        }
      };
      const state = {
        user: {
          id: 1,
          name: 'John Wayne'
        }
      };
      const response = new Error('Whoops');
      response.status = 500;
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue(state);
      axiosMock.onPost('/time_entries.json').replyOnce(() => Promise.reject(response));
      await timeActions.default.add(timeEntry)(dispatch, getState);
      expect(getState).toHaveBeenCalledTimes(1);
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(`${redmineEndpoint}/time_entries.json`);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(timeActions.TIME_ADD));
      expect(dispatch).toBeCalledWith(notify.nok(timeActions.TIME_ADD, new Error(`Error ${response.status} (${response.message})`)));
    });
  });

  describe('update action', () => {
    it('should make request and return the response with correct actions', async () => {
      const response = {};

      const timeEntry = {
        id: 1,
        issue: {
          id: 1
        },
        spent_on: new Date(),
        hours: 1.5,
        activity: {
          id: 1
        },
        comments: 'Hello world',
        user: {
          id: 1
        }
      };

      const changes = {
        comments: 'I win',
        hours: 1.5,
        activity: {
          id: 2
        },
        spent_on: new Date()
      };

      const dispatch = jest.fn();
      axiosMock.onPut(`/time_entries/${timeEntry.id}.json`).replyOnce(() => Promise.resolve([200, response]));
      await timeActions.default.update(timeEntry, changes)(dispatch);

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].url).toBe(`${redmineEndpoint}/time_entries/${timeEntry.id}.json`);
      expect(axiosMock.history.put[0].data).toEqual(JSON.stringify({
        time_entry: {
          comments: changes.comments,
          hours: changes.hours,
          activity_id: changes.activity.id,
          spent_on: moment(changes.spent_on).format('YYYY-MM-DD')
        }
      }));
      expect(axiosMock.history.put[0].headers['X-Redmine-API-Key']).toBe(token);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(timeActions.TIME_UPDATE));
      expect(dispatch).toBeCalledWith(notify.ok(timeActions.TIME_UPDATE, {
        ...timeEntry,
        spent_on: moment(changes.spent_on).format('YYYY-MM-DD'),
        comments: changes.comments,
        hours: changes.hours,
        activity: changes.activity
      }));
    });

    it('should pass the error further with dispatch', async () => {
      const timeEntry = {
        id: 1,
        issue: {
          id: 1
        },
        spent_on: new Date(),
        hours: 1.5,
        activity: {
          id: 1
        },
        comments: 'Hello world',
        user: {
          id: 1
        }
      };
      const response = new Error('Whoops');
      response.status = 500;
      const dispatch = jest.fn();
      axiosMock.onPut(`/time_entries/${timeEntry.id}.json`).replyOnce(() => Promise.reject(response));
      await timeActions.default.update(timeEntry, {})(dispatch);
      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].url).toBe(`${redmineEndpoint}/time_entries/${timeEntry.id}.json`);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(timeActions.TIME_UPDATE));
      expect(dispatch).toBeCalledWith(notify.nok(timeActions.TIME_UPDATE, new Error(`Error ${response.status} (${response.message})`)));
    });
  });

  describe('remove action', () => {
    it('should make request and return the response with correct actions', async () => {
      const response = {};
      const timeEntryId = 1;
      const issueId = 1;

      const dispatch = jest.fn();
      axiosMock.onDelete(`/time_entries/${timeEntryId}.json`).replyOnce(() => Promise.resolve([200, response]));
      await timeActions.default.remove(timeEntryId, issueId)(dispatch);

      expect(axiosMock.history.delete.length).toBe(1);
      expect(axiosMock.history.delete[0].url).toBe(`${redmineEndpoint}/time_entries/${timeEntryId}.json`);
      expect(axiosMock.history.delete[0].headers['X-Redmine-API-Key']).toBe(token);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(timeActions.TIME_DELETE));
      expect(dispatch).toBeCalledWith(notify.ok(timeActions.TIME_DELETE, { timeEntryId, issueId }));
    });

    it('should pass the error further with dispatch', async () => {
      const response = new Error('Whoops');
      response.status = 500;
      const timeEntryId = 1;
      const issueId = 1;

      const dispatch = jest.fn();
      axiosMock.onDelete(`/time_entries/${timeEntryId}.json`).replyOnce(() => Promise.reject(response));
      await timeActions.default.remove(timeEntryId, issueId)(dispatch);
      expect(axiosMock.history.delete.length).toBe(1);
      expect(axiosMock.history.delete[0].url).toBe(`${redmineEndpoint}/time_entries/${timeEntryId}.json`);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(timeActions.TIME_DELETE));
      expect(dispatch).toBeCalledWith(notify.nok(timeActions.TIME_DELETE, new Error(`Error ${response.status} (${response.message})`)));
    });
  });

  describe('getAll action', () => {
    it('should make request and return the response with correct actions', async () => {
      const response = {
        time_entries: []
      };

      const issueId = 1;
      const projectId = 1;
      const offset = 1;
      const limit = 1;

      const dispatch = jest.fn();
      axiosMock.onGet('/time_entries.json').replyOnce(() => Promise.resolve([200, response]));
      await timeActions.default.getAll(issueId, projectId, offset, limit)(dispatch);

      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/time_entries.json`);
      expect(axiosMock.history.get[0].params).toEqual({
        offset,
        limit,
        project_id: projectId,
        issue_id: issueId
      });
      expect(axiosMock.history.get[0].headers['X-Redmine-API-Key']).toBe(token);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(timeActions.TIME_GET_ALL));
      expect(dispatch).toBeCalledWith(notify.ok(timeActions.TIME_GET_ALL, response));
    });

    it('should pass the error further with dispatch', async () => {
      const response = new Error('Whoops');
      response.status = 500;
      const dispatch = jest.fn();
      axiosMock.onGet('/time_entries.json').replyOnce(() => Promise.reject(response));
      await timeActions.default.getAll(1, 2, 3, 4)(dispatch);
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/time_entries.json`);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(timeActions.TIME_GET_ALL));
      expect(dispatch).toBeCalledWith(notify.nok(timeActions.TIME_GET_ALL, new Error(`Error ${response.status} (${response.message})`)));
    });
  });
});
