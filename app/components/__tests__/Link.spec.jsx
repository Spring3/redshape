import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { render, cleanup } from 'react-testing-library';
import { mount } from 'enzyme';

import Link from '../Link';
import utils from '../../../modules/utils';
import * as axios from '../../../modules/request';

jest.mock('electron');


let axiosMock;

beforeAll(() => {
  axiosMock = new MockAdapter(axios.default);
});

afterEach(() => {
  cleanup();
  axiosMock.reset();
});

afterAll(() => {
  axiosMock.restore();
});

describe('Link Component', () => {
  it('should render an hyperlink', () => {
    const { getByText } = render(<Link href="https://google.com">Google</Link>);
    const item = getByText('Google');
    expect(item).toBeTruthy();
    expect(item.getAttribute('href')).toBe('https://google.com');
    expect(item.innerHTML).toBe('Google');
  });

  it('should handle click event', () => {
    const click = jest.fn();
    let wrapper = mount(
      <Link href="https://google.com" onClick={click} />
    );

    wrapper.simulate('click');
    expect(click).toHaveBeenCalled();

    axiosMock.onHead('google.com').replyOnce(() => Promise.resolve([204, {}]));

    const shellSpy = jest.spyOn(utils, 'openExternalUrl');

    wrapper = mount(
      <Link href="https://google.com" type="external" />
    );
    wrapper.simulate('click');
    expect(shellSpy).toHaveBeenCalledWith(wrapper.prop('href'));
    console.log(axiosMock.history);
    expect(axiosMock.history.head.length).toBe(1);
  });
});
