import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import Progressbar, { Progress } from '../Progressbar';
import theme from '../../theme';

import toJson from "enzyme-to-json";

describe('Progressbar component', () => {
  it('should match the snapshot', () => {
    const tree = renderer.create(
      <Progressbar percent={25} background="yellow" height={10} />
    );
    expect(tree).toMatchSnapshot();
  });

  it('should match the snapshot when using time-tracking mode', () => {
    const treeOver = renderer.create(
      <Progressbar theme={theme} percent={130} background="red" height={10} mode="time-tracking" />
    );
    expect(treeOver).toMatchSnapshot();
    const tree = renderer.create(
      <Progressbar theme={theme} percent={70} background="red" height={10} mode="time-tracking" />
    );
    expect(tree).toMatchSnapshot();
  });

  it('should match the snapshot when using progress-gradient mode', () => {
    const tree = renderer.create(
      <Progressbar theme={theme} percent={70} background="red" height={10} mode="progress-gradient" />
    );
    expect(tree).toMatchSnapshot();
  });

  it('should fallback in case infinite number was given as percentage', () => {
    const wrapper = mount(
      <div>
        <Progressbar theme={theme} percent={Infinity} />
        <Progressbar theme={theme} percent={NaN} />
      </div>
    );

    wrapper.find(Progressbar).forEach(node => expect(node.find(Progress).prop('percent')).toBe(0));
  });

  it('should allow the height and background to be customized', () => {
    const wrapper = mount(
      <Progressbar theme={theme} height={20} background="salmon" />
    );
    expect(wrapper.find(Progress).prop('height')).toBe(20);
    expect(wrapper.find(Progress).prop('background')).toBe('salmon');
  });

  it('should show a gradient of colors when using the progress-gradient', () => {
    const wrapper = mount(
      <div>
        <Progressbar theme={theme} percent={50} background="red" mode="progress-gradient" />
        <Progressbar theme={theme} percent={30} mode="progress-gradient" />
        <Progressbar theme={theme} percent={90} mode="progress-gradient" />
      </div>
    );
    const values = [theme.yellow, theme['yellow-red'], theme.green];
    wrapper.find(Progress).forEach((node, i) => {
      expect(node.childAt(0).prop('background')).toBe(values[i]);
    });
  });

  it('should show two progress bars when using the time-tracking and is overtime', () => {
    const wrapper = mount(
      <div>
        <Progressbar theme={theme} percent={50} background="red" mode="time-tracking" />
        <Progressbar theme={theme} percent={130} mode="time-tracking" />
      </div>
    );
    const childs = wrapper.find(Progressbar);
    expect(childs.at(0).find(Progress).prop('background')).toBe(theme.green);
    const progress = childs.at(1).find(Progress);
    expect(progress.length).toBe(2)
    expect(progress.at(0).prop('background')).toBe(theme['yellow-green']);
    expect(progress.at(1).prop('background')).toBe(theme.red);
  });
});
