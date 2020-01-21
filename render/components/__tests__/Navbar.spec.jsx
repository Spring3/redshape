import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { HashRouter, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import userActions, { USER_LOGOUT } from '../../actions/user.actions';
import theme from "../../theme";

import Navbar from '../Navbar';

const mockStore = configureStore([thunk]);

describe('Navbar component', () => {
  it('should match the snapshot', () => {
    const store = mockStore({
      user: {
        id: 1,
        name: 'Anonymous',
        api_key: 1
      },
      settings: {
        uiStyle: 'default'
      }
    });
    const tree = renderer.create(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <Route path="/" component={props => <Navbar {...props}/>} />
          </HashRouter>
        </ThemeProvider>
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
      },
      settings: {
        uiStyle: 'default'
      }
    });
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <Route path="/" component={props => <Navbar {...props}/>} />
          </HashRouter>
        </ThemeProvider>
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
