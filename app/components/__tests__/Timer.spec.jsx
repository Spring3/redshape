import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';

// using mount instead of shallow due to https://github.com/airbnb/enzyme/issues/1908

import Timer from '../Timer';

const waitSeconds = (n = 1) => new Promise(resolve => setTimeout(() => resolve(), n * 1000));

describe('Timer component', () => {
  it('should match the snapshot', () => {
    const tree = renderer.create(
      <Timer
        isEnabled={true}
        isPaused={true}
        trackedDuration={4000}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should automatically resume timer if trackedTime prop was provided', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const wrapper = shallow(
      <Timer
        isEnabled={true}
        trackedTime={4000}
        onStop={onStop}
        onPause={onPause}
        onContinue={onContinue}
      />
    );

    expect(wrapper.instance().interval).not.toBe(undefined);
    await waitSeconds(1);
    expect(wrapper.state('value')).toBe(5000);
    expect(wrapper.find('.buttons').children().length).toBe(2);
    expect(wrapper.find('.buttons').childAt(1).childAt(0).type().name).toBe('PauseIcon');
    wrapper.find('.buttons').childAt(1).simulate('click');
    wrapper.update();
    expect(wrapper.instance().interval).toBe(undefined);
  });

  it('should start the counter from the initialValue if given', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const wrapper = shallow(
      <Timer
        isEnabled={true}
        initialValue={3000}
        onStop={onStop}
        onPause={onPause}
        onContinue={onContinue}
      />
    );

    expect(wrapper.instance().interval).not.toBe(undefined);
    expect(wrapper.state('value')).toBe(3000);
    await waitSeconds(1);
    expect(wrapper.state('value')).toBe(4000);
    wrapper.unmount();
  });

  it('should automatically save the progress before unmount', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const wrapper = shallow(
      <Timer
        isEnabled={true}
        trackedTime={4000}
        onStop={onStop}
        onPause={onPause}
        onContinue={onContinue}
      />
    );

    const cleanupSpy = jest.spyOn(wrapper.instance(), 'cleanup');

    expect(wrapper.instance().interval).not.toBe(undefined);
    await waitSeconds(1);
    expect(wrapper.state('value')).toBe(5000);
    wrapper.unmount();

    expect(cleanupSpy).toHaveBeenCalled();
    expect(onPause).toHaveBeenCalledWith(5000);
  });

  it('should allow to pause the timer', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const wrapper = shallow(
      <Timer
        isEnabled={true}
        onStop={onStop}
        onPause={onPause}
        onContinue={onContinue}
      />
    );

    const timer = wrapper.instance();
    expect(timer).toBeDefined();
    expect(timer.interval).not.toBe(undefined);

    await waitSeconds(1);
    expect(wrapper.exists('.buttons')).toBe(true);
    expect(wrapper.find('.buttons').children().length).toBe(2);
    expect(wrapper.find('.buttons').childAt(1).childAt(0).type().name).toBe('PauseIcon');

    wrapper.find('.buttons').childAt(1).simulate('click');
    wrapper.setProps({ isPaused: true });
    wrapper.update();

    expect(onPause).toHaveBeenCalledWith(1000);
  });

  it('should allow to resume the paused timer', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const wrapper = shallow(
      <Timer
        isEnabled={true}
        isPaused={true}
        onStop={onStop}
        onPause={onPause}
        onContinue={onContinue}
      />
    );

    const timer = wrapper.instance();
    expect(timer).toBeDefined();

    const instanceTick = jest.spyOn(timer, 'tick');

    expect(wrapper.instance().interval).toBe(undefined);

    expect(wrapper.exists('.buttons')).toBe(true);
    expect(wrapper.find('.buttons').children().length).toBe(2);
    expect(wrapper.find('.buttons').childAt(1).childAt(0).type().name).toBe('PlayIcon');

    wrapper.find('.buttons').childAt(1).simulate('click');
    wrapper.setProps({ isPaused: false });

    await waitSeconds(1);
    wrapper.update();
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(instanceTick).toHaveBeenCalledTimes(1);
    expect(wrapper.state('value')).toBe(1000);
    expect(wrapper.instance().interval).not.toBe(undefined);
    wrapper.unmount();
  });

  it('should be able to stop time timer', async () => {
    const onStop = jest.fn();
    const onPause = jest.fn();
    const onContinue = jest.fn();

    const wrapper = shallow(
      <Timer
        isEnabled={true}
        initialValue={1000}
        onStop={onStop}
        onPause={onPause}
        onContinue={onContinue}
      />
    );

    const timer = wrapper.instance();
    expect(timer).toBeDefined();

    expect(timer.interval).not.toBe(undefined);
    expect(wrapper.exists('.buttons')).toBe(true);
    expect(wrapper.find('.buttons').children().length).toBe(2);
    expect(wrapper.find('.buttons').childAt(0).childAt(0).type().name).toBe('StopIcon');

    wrapper.find('.buttons').childAt(0).simulate('click');
    wrapper.setProps({ isEnabled: false, isPaused: false });

    await waitSeconds(1);
    wrapper.update();

    expect(onStop).toHaveBeenCalledWith(1000);
    expect(wrapper.prop('isEnabled')).toBe(false);
    expect(wrapper.instance().interval).toBe(undefined);

    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
