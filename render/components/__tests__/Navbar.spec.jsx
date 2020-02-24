import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { HashRouter, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { USER_LOGOUT } from '../../actions/user.actions';
import Navbar from '../Navbar';

const mockStore = configureStore([thunk]);

describe('Navbar component', () => {
  afterEach(cleanup);
  it('should match the snapshot', () => {
    const state = {
      user: {
        id: 1,
        name: 'Anonymous',
        api_key: 1
      }
    };
    const store = mockStore(state);
    const { getByText } = render(
      <Provider store={store}>
        <HashRouter>
          <Route path="/" component={(props) => <Navbar {...props} />} />
        </HashRouter>
      </Provider>
    );
    const summary = getByText('Summary');
    expect(summary).toBeDefined();
    expect(summary).toHaveAttribute('href', '#/app/summary');
    const user = getByText(state.user.name);
    expect(user).toBeDefined();
    expect(user).toHaveAttribute('href', '#/app/summary');
    expect(getByText('Sign out')).toBeDefined();
  });

  it('should fire a logout action when the signout button is clicked', () => {
    const store = mockStore({
      user: {
        id: 1,
        name: 'Anonymous',
        api_key: 1
      }
    });
    render(
      <Provider store={store}>
        <HashRouter>
          <Route path="/" component={(props) => <Navbar {...props} />} />
        </HashRouter>
      </Provider>
    );


    const signoutBtn = document.querySelector('#signout');
    expect(signoutBtn).toBeDefined();
    fireEvent.click(signoutBtn);
    expect(store.getActions().length).toBe(2);
    expect(store.getActions().pop()).toEqual({
      type: USER_LOGOUT
    });
  });
});
