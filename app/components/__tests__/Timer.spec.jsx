import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

// using mount instead of shallow due to https://github.com/airbnb/enzyme/issues/1908

import Timer from '../Timer';

const mockStore = configureStore([thunk]);

const waitSeconds = (n = 1) => new Promise(resolve => setTimeout(() => resolve(), n * 1000));

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
      }
    };
    const store = mockStore(state);
    const tree = renderer.create(
      <Provider store={store}>
        <Timer
          trackedDuration={4000}
        />
      </Provider>,
      { context: { store } }
    ).toJSON();
    expect(tree).toMatchSnapshot();
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
        issue: {
          id: '123abc',
          subject: 'Test issue'
        }
      }
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
      }
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
      }
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

    const cleanupSpy = jest.spyOn(timer, 'cleanup');

    expect(timer.interval).toBeDefined();
    await waitSeconds(1);
    expect(timer.state.value).toBe(5000);
    wrapper.unmount();

    expect(cleanupSpy).toHaveBeenCalled();
    expect(onPause).toHaveBeenCalledWith(5000, state.tracking.issue);
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
      }
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

    expect(onPause).toHaveBeenCalledWith(1000, state.tracking.issue);
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
      }
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
      }
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

    expect(onStop).toHaveBeenCalledWith(1000, state.tracking.issue);
    expect(timer.interval).not.toBeDefined();

    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
