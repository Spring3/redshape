import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { HashRouter, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import userActions, { USER_LOGOUT } from '../../actions/user.actions';

import Navbar from '../Navbar';

const mockStore = configureStore([thunk]);

describe('Navbar component', () => {
  it('should match the snapshot', () => {
    const store = mockStore({
      user: {
        id: 1,
        name: 'Anonymous',
        api_key: 1
      }
    });
    const tree = renderer.create(
      <Provider store={store}>
        <HashRouter>
          <Route path="/" component={Navbar} />
        </HashRouter>
      </Provider>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should fire a logout actions when the signout button is clicked', () => {
    const store = mockStore({
      user: {
        id: 1,
        name: 'Anonymous',
        api_key: 1
      }
    });
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter>
          <Route path="/" component={Navbar} />
        </HashRouter>
      </Provider>
    );

    expect(wrapper.exists('#signout')).toBe(true);
    wrapper.find('#signout').hostNodes().simulate('click');
    expect(store.getActions().length).toBe(2);
    expect(store.getActions().pop()).toEqual({
      type: USER_LOGOUT
    });
  });
});
