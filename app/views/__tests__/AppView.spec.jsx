import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, fireEvent, cleanup, wait } from 'react-testing-library';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

import AppView from '../AppView';

const mockStore = configureStore([thunk]);

describe('AppView', () => {
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
        <HashRouter><AppView /></HashRouter>
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
