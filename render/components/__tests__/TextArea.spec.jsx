import React from 'react';
import { shallow, mount } from 'enzyme';
import renderer from 'react-test-renderer';
import TextArea from '../TextArea';

describe('TextArea component', () => {
  it('should match the snapshot', () => {
    const tree = renderer.create(<TextArea onChange={() => {}} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should react to the onChange event', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <TextArea onChange={onChange} />
    );

    const event = {
      target: {
        value: '123test'
      },
      persist: () => {}
    };

    wrapper.simulate('change', event);
    wrapper.update();

    expect(onChange).toHaveBeenCalledWith(event);
  });
});
