import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';

import InfiniteScroll from '../InfiniteScroll';

describe('InfiniteScroll component', () => {
  it('should match the snapshot', () => {
    const tree = renderer.create(
      <InfiniteScroll
        immediate={true}
        hasMore={true}
        isEnd={false}
        load={() => {}}
        loadIndicator={<span>Loading...</span>}
      >
        <div>Hello</div>
        <div>World</div>
      </InfiniteScroll>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should set the scroll event handler once initialized', () => {
    const containerMock = {
      addEventListener: jest.fn()
    };
    const wrapper = shallow(
      <InfiniteScroll
        immediate={true}
        isEnd={false}
        hasMore={false}
        load={() => {}}
        loadIndicator={<span>Loading...</span>}
        container={containerMock}
      >
        <div>Hello</div>
        <div>World</div>
      </InfiniteScroll>
    );
    wrapper.setProps({ hasMore: true });
    expect(containerMock.addEventListener).toHaveBeenCalled();
  });

  it('should remove the scroll event handle before unmount', () => {
    const containerMock = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    const wrapper = shallow(
      <InfiniteScroll
        immediate={true}
        isEnd={false}
        hasMore={false}
        load={() => {}}
        loadIndicator={<span>Loading...</span>}
        container={containerMock}
      >
        <div>Hello</div>
        <div>World</div>
      </InfiniteScroll>
    );
    wrapper.setProps({ hasMore: true });
    expect(containerMock.addEventListener).toHaveBeenCalled();
    wrapper.unmount();
    expect(containerMock.removeEventListener).toHaveBeenCalled();
  });

  it('should set isLoading to false when isEnd is set to true', () => {
    const containerMock = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    const wrapper = shallow(
      <InfiniteScroll
        immediate={true}
        isEnd={false}
        hasMore={true}
        load={() => {}}
        loadIndicator={<span>Loading...</span>}
        container={containerMock}
      >
        <div>Hello</div>
        <div>World</div>
      </InfiniteScroll>
    );
    wrapper.setState({ isLoading: true });
    wrapper.setProps({ isEnd: true });
    expect(wrapper.state('isLoading')).toBe(false);
  });

  it('should remove the scroll handler if hasMore is set to false', () => {
    const containerMock = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    const wrapper = shallow(
      <InfiniteScroll
        immediate={true}
        isEnd={false}
        hasMore={true}
        load={() => {}}
        loadIndicator={<span>Loading...</span>}
        container={containerMock}
      >
        <div>Hello</div>
        <div>World</div>
      </InfiniteScroll>
    );
    wrapper.setProps({ hasMore: false });
    expect(containerMock.removeEventListener).toHaveBeenCalled();
  });

  it('should reset isLoading and add scroll handler if hasMore became true', () => {
    const containerMock = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      scrollTop: 0,
      scrollHeight: 300
    };
    const wrapper = shallow(
      <InfiniteScroll
        immediate={true}
        isEnd={false}
        hasMore={false}
        load={() => {}}
        loadIndicator={<span>Loading...</span>}
        container={containerMock}
      >
        <div>Hello</div>
        <div>World</div>
      </InfiniteScroll>
    );
    wrapper.setState({ isLoading: true });
    wrapper.setProps({ hasMore: true });
    wrapper.setState({ isLoading: false });
  });

  describe('onScroll function', () => {
    it('should set isLoading to true and call load function if scrolled to bottom', (done) => {
      const containerMock = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        scrollTop: 0,
        scrollHeight: 300,
        clientHeight: 300
      };
      const loadFn = jest.fn();
      const wrapper = shallow(
        <InfiniteScroll
          immediate={true}
          isEnd={false}
          hasMore={true}
          load={loadFn}
          loadIndicator={<span>Loading...</span>}
          container={containerMock}
        >
          <div>Hello</div>
          <div>World</div>
        </InfiniteScroll>
      );
      const instance = wrapper.instance();
      instance.onScroll({});
      setTimeout(() => {
        expect(wrapper.state('isLoading')).toBe(true);
        expect(loadFn).toHaveBeenCalled();
        done();
      }, 1);
    });
  });
});
