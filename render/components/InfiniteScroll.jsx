import React, { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';

class InfiniteScroll extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false
    };

    this.throttledScrollHandler = throttle(this.onScroll, 200);
  }

  // eslint-disable-next-line
  UNSAFE_componentWillMount() {
    const { container, immediate } = this.props;
    if (container && immediate) {
      this.throttledScrollHandler();
    }
  }

  componentDidUpdate(oldProps, oldState) {
    const {
      isEnd,
      hasMore,
      container,
      immediate
    } = this.props;
    const { isLoading } = this.state;
    if (oldProps.isEnd !== isEnd && isEnd) {
      // eslint-disable-next-line
      this.setState({
        isLoading: false
      });
    }

    if (oldProps.hasMore !== hasMore && !hasMore) {
      if (container) {
        container.removeEventListener('scroll', this.throttledScrollHandler);
      }
    }

    if (oldState.isLoading !== isLoading && !isLoading) {
      if (container && this.shouldLoad()) {
        this.throttledScrollHandler();
      }
    }

    if (oldProps.hasMore !== hasMore && hasMore) {
      if (isLoading) {
        // eslint-disable-next-line
        this.setState({
          isLoading: false
        });
      }
      if (container) {
        container.addEventListener('scroll', this.throttledScrollHandler);
        if (immediate && this.shouldLoad()) {
          this.throttledScrollHandler();
        }
      }
    }
  }

  componentWillUnmount() {
    const { container } = this.props;
    if (container) {
      container.removeEventListener('scroll', this.throttledScrollHandler);
    }
  }

  shouldLoad = () => {
    const { container } = this.props;
    if (container === window) {
      return (container.innerHeight + container.scrollY) <= document.body.scrollHeight;
    }
    return container.scrollTop <= container.scrollHeight;
  }

  onScroll = (event = {}) => {
    const {
      load, threshold, hasMore, container
    } = this.props;
    const { isLoading } = this.state;
    const target = event.target || container;
    const scrolledToBottom = container === window
      ? (window.innerHeight + window.scrollY) >= document.body.scrollHeight
      : Math.ceil(target.scrollTop + target.clientHeight) >= target.scrollHeight;
    // if does not have an overflow, or scrolled to bottom
    if (!isLoading && scrolledToBottom && hasMore) {
      if (this.shouldLoad() || (target.scrollTop % target.scrollHeight) >= threshold) {
        this.setState({
          isLoading: true
        }, () => load());
      }
    }
  };

  render() {
    const { children, loadIndicator } = this.props;
    const { isLoading } = this.state;
    return (
      <>
        {children}
        {isLoading && loadIndicator}
      </>
    );
  }
}

InfiniteScroll.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.arrayOf(PropTypes.element).isRequired
  ]).isRequired,
  hasMore: PropTypes.bool.isRequired,
  isEnd: PropTypes.bool.isRequired,
  load: PropTypes.func.isRequired,
  container: PropTypes.object,
  loadIndicator: PropTypes.node,
  threshold: PropTypes.number,
  immediate: PropTypes.bool
};

InfiniteScroll.defaultProps = {
  loadIndicator: null,
  container: null,
  threshold: 250,
  immediate: false
};

export default InfiniteScroll;
