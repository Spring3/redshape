import * as trackingActions from '../tracking.actions';

describe('Time tracking actions', () => {
  it('should expose all the necessary actions', () => {
    expect(trackingActions).toBeTruthy();
    expect(trackingActions.TRACKING_START).toBeTruthy();
    expect(trackingActions.TRACKING_STOP).toBeTruthy();
    expect(trackingActions.TRACKING_PAUSE).toBeTruthy();
    expect(trackingActions.TRACKING_CONTINUE).toBeTruthy();

    expect(trackingActions.default.trackingStart).toBeTruthy();
    expect(trackingActions.default.trackingStop).toBeTruthy();
    expect(trackingActions.default.trackingPause).toBeTruthy();
    expect(trackingActions.default.trackingContinue).toBeTruthy();

    expect(trackingActions.default.trackingStart({})).toEqual({
      type: trackingActions.TRACKING_START,
      data: {
        issue: {}
      }
    });

    expect(trackingActions.default.trackingStop(100)).toEqual({
      type: trackingActions.TRACKING_STOP,
      data: {
        duration: 100
      }
    });

    expect(trackingActions.default.trackingPause(100)).toEqual({
      type: trackingActions.TRACKING_PAUSE,
      data: {
        duration: 100
      }
    });

    expect(trackingActions.default.trackingContinue()).toEqual({
      type: trackingActions.TRACKING_CONTINUE
    });
  });
});
