import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import toJSON from 'enzyme-to-json';
import thunk from 'redux-thunk';

// using mount instead of shallow due to https://github.com/airbnb/enzyme/issues/1908

import Timer from '../Timer';

const mockStore = configureStore([thunk]);

const stateSettings = {
  idleBehavior: 0,
  discardIdleTime: true,
  advancedTimerControls: false,
  progressWithStep1: false,
};

const waitSeconds = (n = 1) => new Promise((resolve) => setTimeout(() => resolve(), n * 1000));

describe('Timer component', () => {
  it('should match the snapshot', () => {
    const state = {
      tracking: {
        isEnabled: true,
        isPaused: true,
        duration: 0,
        issue: {
          id: '123abc',
          subject: 'Test issue'
        }
      },
      settings: stateSettings,
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Timer
          trackedDuration={4000}
        />
      </Provider>,
      { context: { store } }
    );
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  it('should automatically resume timer if trackedTime prop was provided', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const state = {
      tracking: {
        isEnabled: true,
        isPaused: false,
        duration: 4000,
        comments: '',
        issue: {
          id: '123abc',
          subject: 'Test issue'
        }
      },
      settings: stateSettings,
    };

    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <Timer
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    const timer = wrapper.find('Timer').instance();
    expect(timer).toBeTruthy();
    expect(timer.interval).toBeDefined();
    await waitSeconds(1);
    expect(timer.state.value).toBe(5000);
    expect(wrapper.find('.buttons').children().length).toBe(2);
    expect(wrapper.find('.buttons').childAt(1).exists('PauseIcon')).toBe(true);
    wrapper.find('.buttons').childAt(1).find('GhostButton').simulate('click');
    wrapper.update();
    expect(timer.interval).not.toBeDefined();
  });

  it('should start the counter from the initialValue if given', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const state = {
      tracking: {
        isEnabled: true,
        isPaused: false,
        duration: 0,
        issue: {
          id: '123abc',
          subject: 'Test issue'
        }
      },
      settings: stateSettings,
    };

    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <Timer
          initialValue={3000}
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    const timer = wrapper.find('Timer').instance();
    expect(timer).toBeTruthy();

    expect(timer.interval).toBeDefined();
    expect(timer.state.value).toBe(3000);
    await waitSeconds(1);
    expect(timer.state.value).toBe(4000);
    wrapper.unmount();
  });

  it('should automatically save the progress before unmount', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const state = {
      tracking: {
        isEnabled: true,
        isPaused: false,
        duration: 4000,
        issue: {
          id: '123abc',
          subject: 'Test issue'
        }
      },
      settings: stateSettings,
    };

    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <Timer
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    const timer = wrapper.find('Timer').instance();
    expect(timer).toBeTruthy();

    // const cleanupSpy = jest.spyOn(timer, 'cleanup');
    const saveStateSpy = jest.spyOn(timer, 'saveState');

    expect(timer.interval).toBeDefined();
    await waitSeconds(1);
    expect(timer.state.value).toBe(5000);
    wrapper.unmount();

    expect(saveStateSpy).toHaveBeenCalled();
    // we do not call onPause if we unmount
    // expect(onPause).toHaveBeenCalledWith(5000, state.tracking.issue);
    expect(store.getActions()).toEqual([{ type: 'TRACKING_SAVE', data: { duration: 5000, comments: '' } }]);
  });

  it('should automatically save the progress and stop before unload', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const state = {
      tracking: {
        isEnabled: true,
        isPaused: false,
        duration: 4000,
        issue: {
          id: '123abc',
          subject: 'Test issue'
        }
      },
      settings: stateSettings,
    };

    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <Timer
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    const timer = wrapper.find('Timer').instance();
    expect(timer).toBeTruthy();

    expect(timer.interval).toBeDefined();
    await waitSeconds(1);
    timer.cleanup();
    expect(timer.state.value).toBe(5000);
    // TODO: fire a window 'unload' event. Now we just call cleanup here
    // const unloadEv = new Event('unload');
    // wrapper.first().getDOMNode().dispatchEvent(unloadEv);
    // expect(cleanupSpy).toHaveBeenCalled();

    expect(onPause).toHaveBeenCalledWith(state.tracking.issue, 5000, '');
  });

  it('should allow to pause the timer', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const state = {
      tracking: {
        isEnabled: true,
        isPaused: false,
        duration: 0,
        issue: {
          id: '123abc',
          subject: 'Test issue'
        }
      },
      settings: stateSettings,
    };

    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <Timer
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    const timer = wrapper.find('Timer').instance();
    expect(timer).toBeTruthy();
    expect(timer.interval).toBeDefined();

    await waitSeconds(1);
    expect(wrapper.exists('.buttons')).toBe(true);
    expect(wrapper.find('.buttons').children().length).toBe(2);
    expect(wrapper.find('.buttons').childAt(1).exists('PauseIcon')).toBe(true);

    wrapper.find('.buttons').childAt(1).find('GhostButton').simulate('click');
    wrapper.update();

    expect(onPause).toHaveBeenCalledWith(state.tracking.issue, 1000, '');
  });

  it('should allow to resume the paused timer', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const state = {
      tracking: {
        isEnabled: true,
        isPaused: true,
        duration: 0,
        issue: {
          id: '123abc',
          subject: 'Test issue'
        }
      },
      settings: stateSettings,
    };

    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <Timer
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    const timer = wrapper.find('Timer').instance();
    expect(timer).toBeTruthy();

    const timerTick = jest.spyOn(timer, 'tick');
    expect(timer.interval).not.toBeDefined();

    expect(wrapper.exists('.buttons')).toBe(true);
    expect(wrapper.find('.buttons').children().length).toBe(2);
    expect(wrapper.find('.buttons').childAt(1).exists('PlayIcon')).toBe(true);

    wrapper.find('.buttons').childAt(1).find('GhostButton').simulate('click');
    await waitSeconds(1);
    wrapper.update();
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(timerTick).toHaveBeenCalledTimes(1);
    expect(timer.state.value).toBe(1000);
    expect(timer.interval).toBeDefined();
    wrapper.unmount();
  });

  it('should be able to stop time timer', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const state = {
      tracking: {
        isEnabled: true,
        isPaused: false,
        duration: 0,
        issue: {
          id: '123abc',
          subject: 'Test issue'
        }
      },
      settings: stateSettings,
    };

    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <Timer
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    const timer = wrapper.find('Timer').instance();
    expect(timer).toBeTruthy();

    expect(timer.interval).toBeDefined();
    expect(wrapper.exists('.buttons')).toBe(true);
    expect(wrapper.find('.buttons').children().length).toBe(2);
    expect(wrapper.find('.buttons').childAt(0).exists('StopIcon')).toBe(true);

    await waitSeconds(1);
    wrapper.find('.buttons').childAt(0).find('GhostButton').simulate('click');
    wrapper.update();

    expect(onStop).toHaveBeenCalledWith(state.tracking.issue, 1000, '');
    expect(timer.interval).not.toBeDefined();

    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('should redirect when the name of the tracked issue is clicked', () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const state = {
      tracking: {
        isEnabled: true,
        isPaused: true,
        duration: 0,
        issue: {
          id: '123abc',
          subject: 'Test issue'
        }
      },
      settings: stateSettings,
    };

    const store = mockStore(state);
    const history = {
      push: jest.fn()
    };

    const wrapper = mount(
      <Provider store={store}>
        <Timer
          history={history}
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    wrapper.find('.issueName').childAt(0).simulate('click');
    expect(history.push).toHaveBeenCalledWith(`/app/issue/${state.tracking.issue.id}`);
  });
});
