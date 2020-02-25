import React from 'react';
import { render, cleanup } from 'react-testing-library';
import { mount } from 'enzyme';


import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Link from '../Link';
import utils from '../../../common/utils';

const mockStore = configureStore([thunk]);

jest.mock('electron');

afterEach(cleanup);

describe('Link Component', () => {
  const state = {
    session: {
      statusBar: ''
    }
  };
  // const tree = renderer.create(<Copyrights />).toJSON();
  const store = mockStore(state);

  it('should render an hyperlink', () => {
    const { getByText } = render(
      <Provider store={store}>
        <Link href="https://google.com">Google</Link>
      </Provider>
    );
    const item = getByText('Google');
    expect(item)
      .toBeTruthy();
    expect(item.getAttribute('href'))
      .toBe('https://google.com');
    expect(item.innerHTML)
      .toBe('Google');
  });

  it('should handle click event', () => {
    const click = jest.fn();
    let parent = mount(
      <Provider store={store}>
        <Link href="https://google.com" onClick={click} />
      </Provider>
    );
    let wrapper = parent.find(Link);

    wrapper.simulate('click');
    expect(click)
      .toHaveBeenCalled();

    const shellSpy = jest.spyOn(utils, 'openExternalUrl')
      .mockImplementationOnce(() => Promise.resolve());

    parent = mount(
      <Provider store={store}>
        <Link href="https://google.com" type="external" />
      </Provider>
    );
    wrapper = parent.find(Link);

    wrapper.simulate('click');
    expect(shellSpy)
      .toHaveBeenCalledWith(wrapper.prop('href'));
  });
});
