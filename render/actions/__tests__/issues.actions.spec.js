import MockAdapter from 'axios-mock-adapter';

import { IssueFilter, notify } from '../helper';
import * as issuesActions from '../issues.actions';
import axios from '../../../common/request';

let axiosMock;
const redmineEndpoint = 'https://redmine.test.com';
const token = 'multipass';

describe('Issue actions', () => {
  beforeAll(() => {
    axios.initialize(redmineEndpoint, token);
    axiosMock = new MockAdapter(axios.getInstance());
  });

  afterEach(() => {
    axiosMock.reset();
  });

  afterAll(() => {
    axiosMock.restore();
    axios.reset();
  });

  it('should expose the necessary actions', () => {
    expect(issuesActions).toBeTruthy();
    expect(issuesActions.ISSUES_GET_PAGE).toBeTruthy();
    expect(issuesActions.ISSUES_GET).toBeTruthy();
    expect(issuesActions.ISSUES_COMMENTS_SEND).toBeTruthy();
    expect(issuesActions.ISSUES_RESET_SELECTION).toBeTruthy();
    expect(issuesActions.ISSUES_TIME_ENTRY_GET).toBeTruthy();

    expect(issuesActions.default.getPage).toBeTruthy();
    expect(issuesActions.default.get).toBeTruthy();
    expect(issuesActions.default.getTimeEntriesPage).toBeTruthy();
    expect(issuesActions.default.sendComments).toBeTruthy();
    expect(issuesActions.default.resetSelected).toBeTruthy();
  });

  describe('getPage action', () => {
    it('should make request and return the response with correct actions', async () => {
      const state = {
        issues: {
          all: {
            page: 0,
            limit: 20
          }
        }
      };
      const response = {
        issues: ['1', '2', '3']
      };
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue(state);
      axiosMock.onGet('/issues.json').replyOnce(() => Promise.resolve([200, response]));
      const filter = new IssueFilter().assignee(1).build();
      const page = 1;
      const limit = 10;
      await issuesActions.default.getPage(filter, page, limit)(dispatch, getState);
      expect(getState).toHaveBeenCalled();
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/issues.json`);
      expect(axiosMock.history.get[0].params).toEqual({
        ...filter,
        include: 'attachments,children,relations,journals',
        offset: page * limit,
        limit
      });
      expect(axiosMock.history.get[0].headers['X-Redmine-API-Key']).toBe(token);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(issuesActions.ISSUES_GET_PAGE, { page }));
      expect(dispatch).toBeCalledWith(notify.ok(issuesActions.ISSUES_GET_PAGE, response, { page }));
    });

    it('should pass the error further with dispatch', async () => {
      const state = {
        issues: {
          all: {
            page: 0,
            limit: 20
          }
        }
      };
      const response = new Error('Whoops');
      response.status = 500;
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue(state);
      axiosMock.onGet('/issues.json').replyOnce(() => Promise.reject(response));
      await issuesActions.default.getPage()(dispatch, getState);
      expect(getState).toHaveBeenCalled();
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/issues.json`);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(issuesActions.ISSUES_GET_PAGE, { page: state.issues.all.page }));
      expect(dispatch).toBeCalledWith(
        notify.nok(
          issuesActions.ISSUES_GET_PAGE,
          new Error(`Error ${response.status} (${response.message})`),
          { page: state.issues.all.page }
        )
      );
    });
  });

  describe('get action', () => {
    it('should make request and return the response with correct actions', async () => {
      const id = 1;
      const response = {
        issue: {
          id
        }
      };
      const dispatch = jest.fn();
      axiosMock.onGet(`/issues/${id}.json`).replyOnce(() => Promise.resolve([200, response]));
      await issuesActions.default.get(id)(dispatch);
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/issues/${id}.json`);
      expect(axiosMock.history.get[0].params).toEqual({
        include: 'attachments,children,relations,journals'
      });
      expect(axiosMock.history.get[0].headers['X-Redmine-API-Key']).toBe(token);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(issuesActions.ISSUES_GET));
      expect(dispatch).toBeCalledWith(notify.ok(issuesActions.ISSUES_GET, response));
    });

    it('should pass the error further with dispatch', async () => {
      const response = new Error('Whoops');
      response.status = 500;
      const dispatch = jest.fn();
      const id = 1;
      axiosMock.onGet(`/issues/${id}.json`).replyOnce(() => Promise.reject(response));
      await issuesActions.default.get(id)(dispatch);
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/issues/${id}.json`);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(issuesActions.ISSUES_GET));
      expect(dispatch).toBeCalledWith(
        notify.nok(issuesActions.ISSUES_GET, new Error(`Error ${response.status} (${response.message})`))
      );
    });
  });

  describe('getTimeEntries action', () => {
    it('should make request and return the response with correct actions', async () => {
      const response = {
        time_entries: []
      };
      const state = {
        issues: {
          selected: {
            spentTime: {
              page: 0,
              limit: 20
            }
          }
        }
      };

      const issueId = 1;
      const projectId = 1;
      const page = 1;
      const limit = 1;

      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue(state);
      axiosMock.onGet('/time_entries.json').reply(() => Promise.resolve([200, response]));
      await issuesActions.default.getTimeEntriesPage(issueId, projectId, page, limit)(dispatch, getState);
      expect(getState).toHaveBeenCalled();
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/time_entries.json`);
      expect(axiosMock.history.get[0].params).toEqual({
        offset: page * limit,
        limit,
        project_id: projectId,
        issue_id: issueId
      });
      expect(axiosMock.history.get[0].headers['X-Redmine-API-Key']).toBe(token);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledWith(notify.start(issuesActions.ISSUES_TIME_ENTRY_GET, { page }));
      expect(dispatch).toHaveBeenCalledWith(notify.ok(issuesActions.ISSUES_TIME_ENTRY_GET, response, { page }));
    });

    it('should pass the error further with dispatch', async () => {
      const state = {
        issues: {
          selected: {
            spentTime: {
              page: 0,
              limit: 20
            }
          }
        }
      };
      const page = 3;
      const response = new Error('Whoops');
      response.status = 500;
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue(state);
      axiosMock.onGet('/time_entries.json').reply(() => Promise.reject(response));
      await issuesActions.default.getTimeEntriesPage(1, 2, page, 4)(dispatch, getState);
      expect(getState).toHaveBeenCalled();
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/time_entries.json`);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledWith(notify.start(issuesActions.ISSUES_TIME_ENTRY_GET, { page }));
      expect(dispatch).toHaveBeenCalledWith(
        notify.nok(
          issuesActions.ISSUES_TIME_ENTRY_GET,
          new Error(`Error ${response.status} (${response.message})`),
          { page }
        )
      );
    });
  });

  describe('sendComments action', () => {
    it('should make request and return the response with correct actions', async () => {
      const issueId = 1;
      const comments = 'Ping';
      const state = {
        user: {
          id: 1,
          name: 'Star Butterfly'
        }
      };

      let created_on;
      let commentId;

      const dispatch = jest.fn().mockImplementation((action) => {
        // The comment created_on and id are set after the request is fullfilled. In order to compare
        // the payload, I have to extract it
        if (action.type === issuesActions.ISSUES_COMMENTS_SEND && action.status === 'OK') {
          created_on = action.data.created_on;
          commentId = action.data.id;
        }
      });
      const getState = jest.fn().mockReturnValueOnce(state);
      axiosMock.onPut(`/issues/${issueId}.json`).replyOnce(() => Promise.resolve([200, undefined]));
      await issuesActions.default.sendComments(issueId, comments)(dispatch, getState);
      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].url).toBe(`${redmineEndpoint}/issues/${issueId}.json`);
      expect(axiosMock.history.put[0].data).toEqual(JSON.stringify({
        issue: {
          notes: comments
        }
      }));
      expect(axiosMock.history.put[0].headers['X-Redmine-API-Key']).toBe(token);
      expect(dispatch).toBeCalledTimes(2);
      expect(getState).toHaveBeenCalled();
      expect(dispatch).toBeCalledWith(notify.start(issuesActions.ISSUES_COMMENTS_SEND, { subject: 'comments' }));
      expect(dispatch).toBeCalledWith(notify.ok(
        issuesActions.ISSUES_COMMENTS_SEND,
        {
          created_on,
          details: [],
          id: commentId,
          notes: comments,
          private_notes: false,
          user: state.user
        },
        { subject: 'comments' }
      ));
    });

    it('should pass the error further with dispatch', async () => {
      const response = new Error('Whoops');
      response.status = 500;
      const issueId = 1;
      const comments = 'Ping';
      const state = {
        user: {
          id: 1,
          name: 'Star Butterfly'
        }
      };
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValueOnce(state);
      axiosMock.onPut(`/issues/${issueId}.json`).replyOnce(() => Promise.reject(response));
      await issuesActions.default.sendComments(issueId, comments)(dispatch, getState);
      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].url).toBe(`${redmineEndpoint}/issues/${issueId}.json`);
      expect(dispatch).toBeCalledTimes(2);
      expect(getState).toHaveBeenCalled();
      expect(dispatch).toBeCalledWith(notify.start(issuesActions.ISSUES_COMMENTS_SEND, { subject: 'comments' }));
      expect(dispatch).toBeCalledWith(
        notify.nok(
          issuesActions.ISSUES_COMMENTS_SEND,
          new Error(`Error ${response.status} (${response.message})`),
          { subject: 'comments' }
        )
      );
    });
  });

  describe('resetSelected action', () => {
    expect(issuesActions.default.resetSelected()).toEqual({
      type: issuesActions.ISSUES_RESET_SELECTION
    });
  });
});
