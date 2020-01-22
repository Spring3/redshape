import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';

import {
  SETTINGS_SHOW_ADVANCED_TIMER_CONTROLS,
  SETTINGS_UI_STYLE,
  SETTINGS_IDLE_BEHAVIOR,
  SETTINGS_PROGRESS_SLIDER,
  SETTINGS_IDLE_TIME_DISCARD, SETTINGS_ISSUE_ALWAYS_EDITABLE, SETTINGS_TIMER_CHECKPOINT,
} from '../../../actions/settings.actions';
import OptionsBlock from '../OptionsBlock';
import { getInstance, reset, initialize } from '../../../../common/request';
import theme from '../../../theme';

const redmineEndpoint = 'redmint.test.test';
const token = 'multipass';
const mockStore = configureStore([thunk]);

let axiosMock;

describe('SummaryPage => OptionsBlock component', () => {
  beforeAll(() => {
    initialize(redmineEndpoint, token);
    axiosMock = new MockAdapter(getInstance());
    axiosMock.onAny('.json').reply(() => Promise.resolve([200]));
  });

  afterEach(() => {
    axiosMock.reset();
  });

  afterAll(() => {
    axiosMock.restore();
    reset();
  });

  it('should match the snapshot', () => {
    const state = {
      settings: {
        uiStyle: 'colors',
        showClosedIssues: true
      },
      user: {
        id: 1
      }
    };
    const store = mockStore(state);
    const tree = renderer.create(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <OptionsBlock />
        </ThemeProvider>
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should set use of advanced timer controls when select option is chosen', () => {
    const state = {
      settings: {
        showAdvancedTimerControls: false,
        showClosedIssues: true
      },
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <OptionsBlock />
        </ThemeProvider>
      </Provider>
    );

    wrapper.find('input[type="checkbox"]').at(0).simulate('change', { target: { checked: true } });
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0]).toEqual({
      type: SETTINGS_SHOW_ADVANCED_TIMER_CONTROLS,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        showAdvancedTimerControls: true
      }
    });
  });

  it('should set use of issue always editable when select option is chosen', () => {
    const state = {
      settings: {
        showAdvancedTimerControls: false,
        showClosedIssues: true,
        isIssueAlwaysEditable: false,
      },
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <OptionsBlock />
        </ThemeProvider>
      </Provider>
    );

    wrapper.find('input[type="checkbox"]').at(1).simulate('change', { target: { checked: true } });
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0]).toEqual({
      type: SETTINGS_ISSUE_ALWAYS_EDITABLE,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        isIssueAlwaysEditable: true
      }
    });
  });

  it('should set use of idle behavior when select option is chosen', () => {
    const state = {
      settings: {
        showAdvancedTimerControls: false,
        showClosedIssues: true,
        uiStyle: 'default',
        idleBehavior: 'none',
        idleTimeDiscard: false,
      },
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <OptionsBlock />
        </ThemeProvider>
      </Provider>
    );

    const selects = wrapper.find('Select');
    selects.at(0).instance().selectOption({ value: '15m' });
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0]).toEqual({
      type: SETTINGS_IDLE_BEHAVIOR,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        idleBehavior: '15m'
      }
    });

    wrapper.find('input[type="checkbox"]').at(2).simulate('change', { target: { checked: true } });
    expect(store.getActions().length).toBe(2);
    expect(store.getActions()[1]).toEqual({
      type: SETTINGS_IDLE_TIME_DISCARD,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        idleTimeDiscard: true
      }
    });

    selects.at(0).instance().selectOption({ value: 'none' });
    expect(store.getActions().length).toBe(3);
    expect(store.getActions()[2]).toEqual({
      type: SETTINGS_IDLE_BEHAVIOR,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        idleBehavior: 'none'
      }
    });

    expect(wrapper.find('input[type="checkbox"]').at(2).props().checked).toBe(false);

    selects.at(0).instance().selectOption({ label: 'Pause if idle for 5 minutes', value: '5m' });
    expect(store.getActions().length).toBe(4);
    expect(store.getActions()[3]).toEqual({
      type: SETTINGS_IDLE_BEHAVIOR,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        idleBehavior: '5m'
      }
    });
  });

  it('should set use of timer checkpoint when select option is chosen', () => {
    const state = {
      settings: {
        showAdvancedTimerControls: false,
        showClosedIssues: true,
        uiStyle: 'default',
        idleBehavior: 'none',
        progressSlider: '10%',
        timerCheckpoint: 'none',
      },
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <OptionsBlock />
        </ThemeProvider>
      </Provider>
    );

    const selects = wrapper.find('Select');
    selects.at(1).instance().selectOption({ value: '10m' });
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0]).toEqual({
      type: SETTINGS_TIMER_CHECKPOINT,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        timerCheckpoint: '10m'
      }
    });
  });

  it('should set use of progress slider when select option is chosen', () => {
    const state = {
      settings: {
        showAdvancedTimerControls: false,
        showClosedIssues: true,
        uiStyle: 'default',
        idleBehavior: 'none',
        progressSlider: '10%',
      },
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <OptionsBlock />
        </ThemeProvider>
      </Provider>
    );

    const selects = wrapper.find('Select');
    selects.at(2).instance().selectOption({ value: '1%' });
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0]).toEqual({
      type: SETTINGS_PROGRESS_SLIDER,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        progressSlider: '1%'
      }
    });
  });

  it('should set use of ui style when select option is chosen', () => {
    const state = {
      settings: {
        showAdvancedTimerControls: false,
        showClosedIssues: true,
        uiStyle: 'default',
      },
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <OptionsBlock />
        </ThemeProvider>
      </Provider>
    );

    const selects = wrapper.find('Select');
    selects.at(3).instance().selectOption({ label: 'Default with colors', value: 'colors' });
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0]).toEqual({
      type: SETTINGS_UI_STYLE,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        uiStyle: 'colors'
      }
    });
  });

});
