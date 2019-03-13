import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, fireEvent, cleanup, wait } from 'react-testing-library';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

import SummaryPage from '../../AppViewPages/SummaryPage';

const mockStore = configureStore([thunk]);

describe('AppView -> Summary Page', () => {
  afterEach(() => {
    cleanup();
    fetch.resetMocks();
  });

  it('should match the snapshot', () => {
    const store = mockStore({
      user: {
        id: 1,
        firstname: 'firstname',
        lastname: 'lastname',
        redmineEndpoint: 'https://redmine.domain',
        api_key: '123abc'
      },
      issues: {
        all: {
          data: []
        }
      }
    });
    const tree = renderer.create(
      <Provider store={store}>
        <HashRouter><SummaryPage /></HashRouter>
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe('[integration] - App View -> Summary Page', () => {
    it('render issues in the table', () => {
    });

    it('should be able to search the items in the issues table', () => {

    });

    it('should be able to include closed tasks in the table', () => {

    });

    it('should be able to select table columns', () => {

    });
  });
});
