import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

// using mount instead of shallow due to https://github.com/airbnb/enzyme/issues/1908

import { Timer } from '../Timer';

const mockStore = configureStore([thunk]);

const stateSettings = {
  idleBehavior: 0,
  discardIdleTime: true,
  advancedTimerControls: false,
  progressWithStep1: false,
};

const waitSeconds = (n = 1) => new Promise((resolve) => setTimeout(() => resolve(), n * 1000));

describe('Timer component', () => {
  afterEach(cleanup);
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

    render(
      <Provider store={store}>
        <Timer
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    await waitSeconds(1);
    const buttons = document.querySelector('.buttons');
    expect(buttons.children).toHaveLength(2);
    expect(buttons.lastElementChild).toHaveAttribute('id', 'pause-timer');
    fireEvent.click(buttons.lastElementChild);
    expect(onPause).toHaveBeenCalled();
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
    const initialValue = 3000;

    const { unmount } = render(
      <Provider store={store}>
        <Timer
          initialValue={initialValue}
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    await waitSeconds(1);
    fireEvent.click(document.querySelector('.buttons').lastElementChild);
    unmount();
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

    const { unmount } = render(
      <Provider store={store}>
        <Timer
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    await waitSeconds(1);
    unmount();

    expect(onPause).toHaveBeenCalled();
    expect(store.getActions()).toEqual([{ type: 'TRACKING_PAUSE', data: { duration: 5000, comments: '' } }]);
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

    const { unmount } = render(
      <Provider store={store}>
        <Timer
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    const buttons = document.querySelector('.buttons');
    expect(buttons).toBeDefined();
    expect(buttons.children).toHaveLength(2);
    expect(buttons.lastElementChild).toHaveAttribute('id', 'continue-timer');

    fireEvent.click(buttons.lastElementChild);
    await waitSeconds(1);
    expect(onContinue).toHaveBeenCalledTimes(1);
    unmount();
    expect(store.getActions().pop()).toEqual({ type: 'TRACKING_SAVE', data: { duration: 1000, comments: '' } });
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

    render(
      <Provider store={store}>
        <Timer
          onStop={onStop}
          onPause={onPause}
          onContinue={onContinue}
        />
      </Provider>,
      { context: { store } }
    );

    const buttons = document.querySelector('.buttons');
    expect(buttons).toBeDefined();
    expect(buttons.children).toHaveLength(2);
    expect(buttons.firstElementChild).toHaveAttribute('id', 'stop-timer');

    await waitSeconds(1);
    fireEvent.click(buttons.firstElementChild);

    expect(onStop).toHaveBeenCalledWith(state.tracking.issue, 1000, '');
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

    render(
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

    fireEvent.click(document.querySelector('.issueName').firstElementChild);
    expect(history.push).toHaveBeenCalledWith(`/app/issue/${state.tracking.issue.id}`);
  });
});
