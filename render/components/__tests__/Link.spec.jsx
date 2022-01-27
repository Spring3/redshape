import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { mount } from 'enzyme';

import utils from '../../../main/utils';
import Link from '../Link';

jest.mock('electron');

afterEach(cleanup);

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

    const shellSpy = jest.spyOn(utils, 'openExternalUrl').mockImplementationOnce(() => Promise.resolve());

    wrapper = mount(
      <Link href="https://google.com" type="external" />
    );
    wrapper.simulate('click');
    expect(shellSpy).toHaveBeenCalledWith(wrapper.prop('href'));
  });
});
