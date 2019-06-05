import * as trackingActions from '../tracking.actions';

describe('Time tracking actions', () => {
  it('should expose all the necessary actions', () => {
    expect(trackingActions).toBeTruthy();
    expect(trackingActions.TRACKING_START).toBeTruthy();
    expect(trackingActions.TRACKING_STOP).toBeTruthy();
    expect(trackingActions.TRACKING_PAUSE).toBeTruthy();
    expect(trackingActions.TRACKING_CONTINUE).toBeTruthy();
    expect(trackingActions.TRACKING_RESET).toBeTruthy();

    expect(trackingActions.default.trackingStart).toBeTruthy();
    expect(trackingActions.default.trackingStop).toBeTruthy();
    expect(trackingActions.default.trackingPause).toBeTruthy();
    expect(trackingActions.default.trackingContinue).toBeTruthy();
    expect(trackingActions.default.trackingReset).toBeTruthy();
  });

  it('TRACKING_START action', () => {
    expect(trackingActions.default.trackingStart({})).toEqual({
      type: trackingActions.TRACKING_START,
      data: {
        issue: {}
      }
    });
  });

  it('TRACKING_STOP action', () => {
    expect(trackingActions.default.trackingStop(100)).toEqual({
      type: trackingActions.TRACKING_STOP,
      data: {
        duration: 100
      }
    });
  });

  it('TRACKING_PAUSE action', () => {
    expect(trackingActions.default.trackingPause(100)).toEqual({
      type: trackingActions.TRACKING_PAUSE,
      data: {
        duration: 100
      }
    });
  });

  it('TRACKING_CONTINUE action', () => {
    expect(trackingActions.default.trackingContinue()).toEqual({
      type: trackingActions.TRACKING_CONTINUE
    });
  });

  it('TRACKING_RESET action', () => {
    expect(trackingActions.default.trackingReset()).toEqual({
      type: trackingActions.TRACKING_RESET
    });
  });
});
