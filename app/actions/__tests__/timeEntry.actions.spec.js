import MockAdapter from 'axios-mock-adapter';
import moment from 'moment';
import { notify } from '../helper';
import * as timeEntryActions from '../timeEntry.actions';
import * as axios from '../../../modules/request';

const redmineEndpoint = 'redmine.test.com';
const token = 'multipass';
let axiosMock;

describe('Time actions', () => {
  beforeAll(() => {
    axios.initialize(redmineEndpoint, token);
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
    expect(timeEntryActions).toBeTruthy();
    expect(timeEntryActions.TIME_ENTRY_PUBLISH_VALIDATION_PASSED).toBeTruthy();
    expect(timeEntryActions.TIME_ENTRY_PUBLISH_VALIDATION_FAILED).toBeTruthy();
    expect(timeEntryActions.TIME_ENTRY_PUBLISH).toBeTruthy();
    expect(timeEntryActions.TIME_ENTRY_UPDATE_VALIDATION_PASSED).toBeTruthy();
    expect(timeEntryActions.TIME_ENTRY_UPDATE_VALIDATION_FAILED).toBeTruthy();
    expect(timeEntryActions.TIME_ENTRY_UPDATE).toBeTruthy();
    expect(timeEntryActions.TIME_ENTRY_DELETE).toBeTruthy();
    expect(timeEntryActions.TIME_ENTRY_GET_ALL).toBeTruthy();

    expect(timeEntryActions.default.validateBeforePublish).toBeTruthy();
    expect(timeEntryActions.default.publish).toBeTruthy();
    expect(timeEntryActions.default.validateBeforeUpdate).toBeTruthy();
    expect(timeEntryActions.default.update).toBeTruthy();
    expect(timeEntryActions.default.remove).toBeTruthy();
    expect(timeEntryActions.default.getAll).toBeTruthy();
  });

  describe('validateBeforePublish action', () => {
    it('should pass through the validation if the format is correct', () => {
      expect(timeEntryActions.default.validateBeforePublish({
        activity: {
          id: 1
        },
        issue: {
          id: 1
        },
        hours: 15.2,
        comments: 'Yolo',
        spent_on: '2011-01-01'
      })).toEqual({ type: timeEntryActions.TIME_ENTRY_PUBLISH_VALIDATION_PASSED });
    });

    
    it('should fail if activity.id is not a number', () => {
      const validation = timeEntryActions.default.validateBeforePublish({
        activity: {
          id: undefined
        }
      });
      expect(validation.type).toBe(timeEntryActions.TIME_ENTRY_PUBLISH_VALIDATION_FAILED);
      expect(validation.data.details[0].path).toEqual(['activity', 'id']);
    });

    it('should fail if issue.id is not a number', () => {
      const validation = timeEntryActions.default.validateBeforePublish({
        activity: {
          id: 1
        },
        issue: {
          id: undefined
        }
      });
      expect(validation.type).toBe(timeEntryActions.TIME_ENTRY_PUBLISH_VALIDATION_FAILED);
      expect(validation.data.details[0].path).toEqual(['issue', 'id']);
    });

    it('should fail if hours is not a positive number', () => {
      const validation = timeEntryActions.default.validateBeforePublish({
        activity: {
          id: 1
        },
        issue: {
          id: 1
        },
        hours: -15.2
      });
      expect(validation.type).toBe(timeEntryActions.TIME_ENTRY_PUBLISH_VALIDATION_FAILED);
      expect(validation.data.details[0].path).toEqual(['hours']);
    });

    it('should fail if comments is not a string', () => {
      const validation = timeEntryActions.default.validateBeforePublish({
        activity: {
          id: 1
        },
        issue: {
          id: 1
        },
        hours: 15.2,
        comments: undefined
      });
      expect(validation.type).toBe(timeEntryActions.TIME_ENTRY_PUBLISH_VALIDATION_FAILED);
      expect(validation.data.details[0].path).toEqual(['comments']);
    });

    it('should fail if spent_on is not a string', () => {
      const validation = timeEntryActions.default.validateBeforePublish({
        activity: {
          id: 1
        },
        issue: {
          id: 1
        },
        hours: 15.2,
        comments: '',
        spent_on: new Date()
      });
      expect(validation.type).toBe(timeEntryActions.TIME_ENTRY_PUBLISH_VALIDATION_FAILED);
      expect(validation.data.details[0].path).toEqual(['spent_on']);
    });
  });

  describe('publish action', () => {
    it('should not make a request if the validation failed', async () => {
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
      await timeEntryActions.default.publish(timeEntry)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch.mock.calls[0][0].type).toBe(timeEntryActions.TIME_ENTRY_PUBLISH_VALIDATION_FAILED);
    });

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
        spent_on: '2011-01-01',
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
      axiosMock.onPost('/time_entries.json').reply(() => Promise.resolve([200, response]));
      await timeEntryActions.default.publish(timeEntry)(dispatch, getState);

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
      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenCalledWith({
        type: timeEntryActions.TIME_ENTRY_PUBLISH_VALIDATION_PASSED
      });
      expect(dispatch).toHaveBeenCalledWith(notify.start(timeEntryActions.TIME_ENTRY_PUBLISH));
      expect(dispatch).toHaveBeenCalledWith(notify.ok(timeEntryActions.TIME_ENTRY_PUBLISH, response));
    });

    it('should pass the error further with dispatch', async () => {
      const timeEntry = {
        issue: {
          id: 1
        },
        spent_on: '2011-01-01',
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
      axiosMock.onPost('/time_entries.json').reply(() => Promise.reject(response));
      await timeEntryActions.default.publish(timeEntry)(dispatch, getState);
      expect(getState).toHaveBeenCalledTimes(1);
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(`${redmineEndpoint}/time_entries.json`);
      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenCalledWith({
        type: timeEntryActions.TIME_ENTRY_PUBLISH_VALIDATION_PASSED
      });
      expect(dispatch).toHaveBeenCalledWith(notify.start(timeEntryActions.TIME_ENTRY_PUBLISH));
      expect(dispatch).toHaveBeenCalledWith(notify.nok(timeEntryActions.TIME_ENTRY_PUBLISH, new Error(`Error ${response.status} (${response.message})`)));
    });
  });

  describe('validateBeforeUpdate action', () => {
    it('should pass through the validation if the format is correct', () => {
      expect(timeEntryActions.default.validateBeforeUpdate({
        activity: {
          id: 1
        },
        hours: 15.2,
        comments: 'Yolo',
        spent_on: '2011-01-01'
      })).toEqual({ type: timeEntryActions.TIME_ENTRY_UPDATE_VALIDATION_PASSED });
    });

    
    it('should fail if activity.id is not a number', () => {
      const validation = timeEntryActions.default.validateBeforeUpdate({
        activity: {
          id: undefined,
          name: undefined
        }
      });
      expect(validation.type).toBe(timeEntryActions.TIME_ENTRY_UPDATE_VALIDATION_FAILED);
      expect(validation.data.details[0].path).toEqual(['activity', 'id']);
    });

    it('should fail if hours is not a positive number', () => {
      const validation = timeEntryActions.default.validateBeforeUpdate({
        activity: {
          id: 1
        },
        hours: -15.2
      });
      expect(validation.type).toBe(timeEntryActions.TIME_ENTRY_UPDATE_VALIDATION_FAILED);
      expect(validation.data.details[0].path).toEqual(['hours']);
    });

    it('should fail if comments is not a string', () => {
      const validation = timeEntryActions.default.validateBeforeUpdate({
        activity: {
          id: 1
        },
        hours: 15.2,
        comments: undefined
      });
      expect(validation.type).toBe(timeEntryActions.TIME_ENTRY_UPDATE_VALIDATION_FAILED);
      expect(validation.data.details[0].path).toEqual(['comments']);
    });

    it('should fail if spent_on is not a string', () => {
      const validation = timeEntryActions.default.validateBeforeUpdate({
        activity: {
          id: 1
        },
        hours: 15.2,
        comments: '',
        spent_on: new Date()
      });
      expect(validation.type).toBe(timeEntryActions.TIME_ENTRY_UPDATE_VALIDATION_FAILED);
      expect(validation.data.details[0].path).toEqual(['spent_on']);
    });
  });

  describe('update action', () => {
    it('should not make a request if the validation failed', async () => {
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
      await timeEntryActions.default.update(timeEntry, changes)(dispatch);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch.mock.calls[0][0].type).toBe(timeEntryActions.TIME_ENTRY_UPDATE_VALIDATION_FAILED);
    });

    it('should make request and return the response with correct actions', async () => {
      const response = {};

      const timeEntry = {
        id: 1,
        issue: {
          id: 1
        },
        spent_on: '2011-01-01',
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
        spent_on: '2011-01-01'
      };

      const dispatch = jest.fn();
      axiosMock.onPut(`/time_entries/${timeEntry.id}.json`).reply(() => Promise.resolve([200, response]));
      await timeEntryActions.default.update(timeEntry, changes)(dispatch);

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
      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenCalledWith({ type: timeEntryActions.TIME_ENTRY_UPDATE_VALIDATION_PASSED });
      expect(dispatch).toHaveBeenCalledWith(notify.start(timeEntryActions.TIME_ENTRY_UPDATE));
      expect(dispatch).toHaveBeenCalledWith(notify.ok(timeEntryActions.TIME_ENTRY_UPDATE, {
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
        spent_on: '2011-01-01',
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
        spent_on: '2011-01-01'
      };
      const response = new Error('Whoops');
      response.status = 500;
      const dispatch = jest.fn();
      axiosMock.onPut(`/time_entries/${timeEntry.id}.json`).reply(() => Promise.reject(response));
      await timeEntryActions.default.update(timeEntry, changes)(dispatch);
      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].url).toBe(`${redmineEndpoint}/time_entries/${timeEntry.id}.json`);
      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenCalledWith({ type: timeEntryActions.TIME_ENTRY_UPDATE_VALIDATION_PASSED });
      expect(dispatch).toHaveBeenCalledWith(notify.start(timeEntryActions.TIME_ENTRY_UPDATE));
      expect(dispatch).toHaveBeenCalledWith(notify.nok(timeEntryActions.TIME_ENTRY_UPDATE, new Error(`Error ${response.status} (${response.message})`)));
    });
  });

  describe('remove action', () => {
    it('should make request and return the response with correct actions', async () => {
      const response = {};
      const timeEntryId = 1;
      const issueId = 1;

      const dispatch = jest.fn();
      axiosMock.onDelete(`/time_entries/${timeEntryId}.json`).reply(() => Promise.resolve([200, response]));
      await timeEntryActions.default.remove(timeEntryId, issueId)(dispatch);

      expect(axiosMock.history.delete.length).toBe(1);
      expect(axiosMock.history.delete[0].url).toBe(`${redmineEndpoint}/time_entries/${timeEntryId}.json`);
      expect(axiosMock.history.delete[0].headers['X-Redmine-API-Key']).toBe(token);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledWith(notify.start(timeEntryActions.TIME_ENTRY_DELETE));
      expect(dispatch).toHaveBeenCalledWith(notify.ok(timeEntryActions.TIME_ENTRY_DELETE, { timeEntryId, issueId }));
    });

    it('should pass the error further with dispatch', async () => {
      const response = new Error('Whoops');
      response.status = 500;
      const timeEntryId = 1;
      const issueId = 1;

      const dispatch = jest.fn();
      axiosMock.onDelete(`/time_entries/${timeEntryId}.json`).reply(() => Promise.reject(response));
      await timeEntryActions.default.remove(timeEntryId, issueId)(dispatch);
      expect(axiosMock.history.delete.length).toBe(1);
      expect(axiosMock.history.delete[0].url).toBe(`${redmineEndpoint}/time_entries/${timeEntryId}.json`);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledWith(notify.start(timeEntryActions.TIME_ENTRY_DELETE));
      expect(dispatch).toHaveBeenCalledWith(notify.nok(timeEntryActions.TIME_ENTRY_DELETE, new Error(`Error ${response.status} (${response.message})`)));
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
      axiosMock.onGet('/time_entries.json').reply(() => Promise.resolve([200, response]));
      await timeEntryActions.default.getAll(issueId, projectId, offset, limit)(dispatch);

      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/time_entries.json`);
      expect(axiosMock.history.get[0].params).toEqual({
        offset,
        limit,
        project_id: projectId,
        issue_id: issueId
      });
      expect(axiosMock.history.get[0].headers['X-Redmine-API-Key']).toBe(token);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledWith(notify.start(timeEntryActions.TIME_ENTRY_GET_ALL));
      expect(dispatch).toHaveBeenCalledWith(notify.ok(timeEntryActions.TIME_ENTRY_GET_ALL, response));
    });

    it('should pass the error further with dispatch', async () => {
      const response = new Error('Whoops');
      response.status = 500;
      const dispatch = jest.fn();
      axiosMock.onGet('/time_entries.json').reply(() => Promise.reject(response));
      await timeEntryActions.default.getAll(1, 2, 3, 4)(dispatch);
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/time_entries.json`);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledWith(notify.start(timeEntryActions.TIME_ENTRY_GET_ALL));
      expect(dispatch).toHaveBeenCalledWith(notify.nok(timeEntryActions.TIME_ENTRY_GET_ALL, new Error(`Error ${response.status} (${response.message})`)));
    });
  });
});
