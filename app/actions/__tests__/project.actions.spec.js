import MockAdapter from 'axios-mock-adapter';
import * as projectActions from '../project.actions';
import { notify } from '../helper';
import * as axios from '../../../modules/request';

const redmineEndpoint = 'redmine.test.com';
const token = 'multipass';
let axiosMock;

describe('Project actions', () => {
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
    expect(projectActions).toBeTruthy();
    expect(projectActions.PROJECT_GET_ALL).toBeTruthy();

    expect(projectActions.default.getAll).toBeTruthy();
  });

  describe('get all action', () => {
    it('should make request and return the response with correct actions', async () => {
      const response = {
        projects: []
      };

      const dispatch = jest.fn();
      axiosMock.onGet('/projects.json').replyOnce(() => Promise.resolve([200, response]));
      await projectActions.default.getAll()(dispatch);

      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/projects.json`);
      expect(axiosMock.history.get[0].params).toEqual({
        include: 'time_entry_activities',
        offset: 0
      });
      expect(axiosMock.history.get[0].headers['X-Redmine-API-Key']).toBe(token);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(projectActions.PROJECT_GET_ALL));
      expect(dispatch).toBeCalledWith(notify.ok(projectActions.PROJECT_GET_ALL, [response]));
    });

    it('should pass the error further with dispatch', async () => {
      const response = new Error('Whoops');
      response.status = 500;
      const dispatch = jest.fn();
      axiosMock.onGet('/projects.json').replyOnce(() => Promise.reject(response));
      await projectActions.default.getAll()(dispatch);
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/projects.json`);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(projectActions.PROJECT_GET_ALL));
      expect(dispatch).toBeCalledWith(notify.nok(projectActions.PROJECT_GET_ALL, new Error(`Error ${response.status} (${response.message})`)));
    });
  });
});
