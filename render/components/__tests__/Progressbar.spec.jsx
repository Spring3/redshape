import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import Progressbar from '../Progressbar';
import theme from '../../theme';

describe('Progressbar component', () => {
  it('should match the snapshot', () => {
    const tree = renderer.create(
      <Progressbar percent={25} background="yellow" height={10} />
    );
    expect(tree).toMatchSnapshot();
  });

  it('should fallback in case infinite number was given as percentage', () => {
    const wrapper = shallow(
      <div>
        <Progressbar theme={theme} percent={Infinity} />
        <Progressbar theme={theme} percent={NaN} />
      </div>
    );

    wrapper.find(Progressbar).forEach(node => expect(node.dive().childAt(0).childAt(0).prop('percent')).toBe(0));
  });

  it('should allow the height and background to be customized', () => {
    const wrapper = shallow(
      <Progressbar theme={theme} height={20} background="salmon" />
    );
    expect(wrapper.dive().childAt(0).prop('height')).toBe(20);
    expect(wrapper.dive().childAt(0).childAt(0).prop('background')).toBe('salmon');
    expect(wrapper.dive().childAt(0).childAt(0).prop('height')).toBe(20);
  });
});
