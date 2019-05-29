import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';

import { SETTINGS_SHOW_CLOSED_ISSUES, SETTINGS_USE_COLORS } from '../../../actions/settings.actions';
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
        useColors: true,
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

  it('should toggle closed issues display when checkbox is clicked', () => {
    const state = {
      settings: {
        useColors: true,
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

    wrapper.find('input[type="checkbox"]').at(0).simulate('change', { target: { checked: false } });
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0]).toEqual({
      type: SETTINGS_SHOW_CLOSED_ISSUES,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        showClosed: false
      }
    });
  });

  it('should toggle use of colors when checkbox is clicked', () => {
    const state = {
      settings: {
        useColors: true,
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

    wrapper.find('input[type="checkbox"]').at(1).simulate('change', { target: { checked: false } });
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0]).toEqual({
      type: SETTINGS_USE_COLORS,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        useColors: false
      }
    });
  });
});
