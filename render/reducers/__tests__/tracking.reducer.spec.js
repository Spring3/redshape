import _cloneDeep from 'lodash/cloneDeep';

import storage from '../../../common/storage';
import reducer, { initialState } from '../tracking.reducer';
import actions from '../../actions/tracking.actions';

let storageSpy;

describe('Tracking Reducer', () => {
  beforeAll(() => {
    storageSpy = jest.spyOn(storage, 'set');
  });

  afterEach(() => {
    storageSpy.mockReset();
  });

  afterAll(() => {
    storageSpy.mockRestore();
  });

  it('should return the initial state if an unknown action comes in', () => {
    expect(
      reducer(
        _cloneDeep(initialState),
        { type: 'WEIRD' }
      )
    ).toEqual(initialState);
  });

  it('TRACKING_START action', () => {
    const expectedNextState = {
      ...initialState,
      issue: { id: 1 },
      isEnabled: true,
      isPaused: false,
      duration: 0
    };

    expect(
      reducer(
        _cloneDeep(initialState),
        actions.trackingStart({ id: 1 })
      )
    ).toEqual(expectedNextState);
    expect(storageSpy).toHaveBeenCalledWith('time_tracking', expectedNextState);
  });

  it('TRACKING_STOP action', () => {
    const expectedNextState = {
      ...initialState,
      isEnabled: false,
      isPaused: false,
      duration: 1000
    };

    expect(
      reducer(
        _cloneDeep(initialState),
        actions.trackingStop(1000)
      )
    ).toEqual(expectedNextState);
    expect(storageSpy).toHaveBeenCalledWith('time_tracking', expectedNextState);
  });

  it('TRACKING_PAUSE action', () => {
    const expectedNextState = {
      ...initialState,
      isEnabled: true,
      isPaused: true,
      duration: 1000
    };

    expect(
      reducer(
        {
          ..._cloneDeep(initialState),
          isEnabled: true
        },
        actions.trackingPause(1000)
      )
    ).toEqual(expectedNextState);
    expect(storageSpy).toHaveBeenCalledWith('time_tracking', expectedNextState);
  });

  it('TRACKING_CONTINUE action', () => {
    const expectedNextState = {
      ...initialState,
      isEnabled: true,
      isPaused: false,
      duration: 1000
    };

    expect(
      reducer(
        {
          ..._cloneDeep(initialState),
          duration: 1000,
          isEnabled: true,
          isPaused: true
        },
        actions.trackingContinue()
      )
    ).toEqual(expectedNextState);
    expect(storageSpy).toHaveBeenCalledWith('time_tracking', expectedNextState);
  });

  it('TRACKING_RESET action', () => {
    const storageDeleteSpy = jest.spyOn(storage, 'delete');
    expect(
      reducer(
        _cloneDeep(initialState),
        actions.trackingReset()
      )
    ).toEqual(initialState);
    expect(storageDeleteSpy).toHaveBeenCalledWith('time_tracking');
  });
});
