import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import InfiniteScroll from '../InfiniteScroll';

describe('InfiniteScroll component', () => {
  afterEach(cleanup);
  it('should set the scroll event handler once initialized', () => {
    const containerMock = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    const { queryByText, rerender } = render(
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

    rerender(
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

    expect(containerMock.addEventListener).toHaveBeenCalled();
    expect(queryByText('Hello')).toBeDefined();
    expect(queryByText('World')).toBeDefined();
  });

  it('should remove the scroll event handle before unmount', () => {
    const containerMock = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    const { rerender, unmount } = render(
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
    rerender(
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
    expect(containerMock.addEventListener).toHaveBeenCalled();
    unmount();
    expect(containerMock.removeEventListener).toHaveBeenCalled();
  });

  it('should remove the scroll handler if hasMore is set to false', () => {
    const containerMock = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    const { rerender } = render(
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
    rerender(
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
    expect(containerMock.removeEventListener).toHaveBeenCalled();
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
      const { queryByText, baseElement } = render(
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
      fireEvent.scroll(baseElement, {});
      setTimeout(() => {
        expect(queryByText('Loading...')).toBeDefined();
        expect(loadFn).toHaveBeenCalled();
        done();
      }, 1);
    });
  });
});
