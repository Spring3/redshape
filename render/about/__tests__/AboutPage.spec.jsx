import React from 'react';
import renderer from 'react-test-renderer';
import toJSON from 'enzyme-to-json';
import { mount } from 'enzyme';
import { ThemeProvider } from 'styled-components';

import AboutPage from '../AboutPage';
import theme from '../../theme';

describe('About page', () => {
  it('should match the snapshot [tab1]', () => {
    expect(renderer.create(
      <ThemeProvider theme={theme}>
        <AboutPage />
      </ThemeProvider>
    ).toJSON()).toMatchSnapshot();
  });

  it('should match the snapshot [tab2]', () => {
    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <AboutPage />
      </ThemeProvider>
    );
    wrapper.find('Tab').at(1).simulate('click');
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
});
