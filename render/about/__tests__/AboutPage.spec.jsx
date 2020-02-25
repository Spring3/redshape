import React from 'react';
import renderer from 'react-test-renderer';
import toJSON from 'enzyme-to-json';
import { mount } from 'enzyme';
import { ThemeProvider } from 'styled-components';


import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import theme from '../../theme';
import AboutPage from '../AboutPage';

const mockStore = configureStore([thunk]);


describe('About page', () => {
  const state = {
    session: {
      statusBar: ''
    }
  };
  const store = mockStore(state);

  it('should match the snapshot [tab1]', () => {
    expect(renderer.create(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <AboutPage />
        </Provider>
      </ThemeProvider>
    )
      .toJSON())
      .toMatchSnapshot();
  });

  it('should match the snapshot [tab2]', () => {
    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <AboutPage />
        </Provider>
      </ThemeProvider>
    );
    wrapper.find('Tab')
      .at(1)
      .simulate('click');
    expect(toJSON(wrapper))
      .toMatchSnapshot();
  });
});
