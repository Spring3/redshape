import _cloneDeep from 'lodash/cloneDeep';

import reducer, { initialState } from '../project.reducer';
import { notify } from '../../actions/helper';
import * as actions from '../../actions/project.actions';
import storage from '../../../modules/storage';

describe('Project reducer', () => {
  it('should return the initial state if an unknown action comes in', () => {
    expect(
      reducer(
        _cloneDeep(initialState),
        { type: 'WEIRD' }
      )
    ).toEqual(initialState);
  });

  describe('PROJECT_GET_ALL action', () => {
    it('status START', () => {
      expect(
        reducer(
          _cloneDeep(initialState),
          notify.start(actions.PROJECT_GET_ALL)
        )
      ).toEqual({
        ...initialState,
        isFetching: true
      });
    });

    it('status OK', () => {
      const storageSpy = jest.spyOn(storage, 'set');
      const error = new Error('Whoops');
      const data = [
        {
          projects: [
            {
              id: 1,
              name: 'Project 1',
              time_entry_activities: [
                {
                  id: 1,
                  name: 'Development'
                },
                {
                  id: 2,
                  name: 'Testing'
                },
                {
                  id: 3,
                  name: 'Support'
                }
              ]
            },
            {
              id: 2,
              name: 'Project 2',
              time_entry_activities: [
                {
                  id: 1,
                  name: 'Development'
                },
                {
                  id: 2,
                  name: 'Testing'
                },
                {
                  id: 3,
                  name: 'Support'
                }
              ]
            }
          ]
        }
      ];
      const expectedNextState = {
        ...initialState,
        data: {
          0: {
            id: 0,
            name: 'Project 0',
            activities: [
              { id: 1, name: 'Development' },
              { id: 2, name: 'Testing' },
              { id: 3, name: 'Support' }
            ]
          },
          1: {
            id: 1,
            name: 'Project 1',
            activities: [
              { id: 1, name: 'Development' },
              { id: 2, name: 'Testing' },
              { id: 3, name: 'Support' }
            ]
          },
          2: {
            id: 2,
            name: 'Project 2',
            activities: [
              { id: 1, name: 'Development' },
              { id: 2, name: 'Testing' },
              { id: 3, name: 'Support' }
            ]
          }
        },
        isFetching: false,
        error: undefined
      };
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            data: {
              0: {
                id: 0,
                name: 'Project 0',
                activities: [
                  { id: 1, name: 'Development' },
                  { id: 2, name: 'Testing' },
                  { id: 3, name: 'Support' }
                ]
              }
            },
            isFetching: true,
            error
          },
          notify.ok(actions.PROJECT_GET_ALL, data)
        )
      ).toEqual(expectedNextState);
      expect(storageSpy).toHaveBeenCalledWith('projects', expectedNextState);
      storageSpy.mockRestore();
    });

    it('status NOK', () => {
      const error = new Error('Whoops');
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            data: {
              0: {
                id: 0,
                name: 'Project 0',
                activities: [
                  { id: 1, name: 'Development' },
                  { id: 2, name: 'Testing' },
                  { id: 3, name: 'Support' }
                ]
              }
            },
            isFetching: true
          },
          notify.nok(actions.PROJECT_GET_ALL, error)
        )
      ).toEqual({
        ...initialState,
        data: {
          0: {
            id: 0,
            name: 'Project 0',
            activities: [
              { id: 1, name: 'Development' },
              { id: 2, name: 'Testing' },
              { id: 3, name: 'Support' }
            ]
          }
        },
        isFetching: false,
        error
      });
    });

    it('returns a default state if an action comes in with an unknown status', () => {
      expect(
        reducer(
          _cloneDeep(initialState),
          { type: actions.PROJECT_GET_ALL, status: 'TEST' }
        )
      ).toEqual(initialState);
    });
  });
});
