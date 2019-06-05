import React from 'react';
import { shallow } from 'enzyme';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage component', () => {
  it('should not dispay it by default', () => {
    const wrapper = shallow(<ErrorMessage>Error</ErrorMessage>);
    expect(wrapper.find(ErrorMessage).exists()).toBe(false);
  });

  it('should be displayed if show property is set to true', () => {
    const wrapper = shallow(<ErrorMessage show={true}>Error</ErrorMessage>);
    expect(wrapper.exists()).toBe(true);
  });
});
