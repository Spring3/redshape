import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';

class InfiniteScroll extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false
    };

    this.throttledScrollHandler = throttle(this.onScroll, 100);
  }

  componentWillUnmount() {
    if (this.props.container) {
      this.props.container.removeEventListener('scroll', this.throttledScrollHandler);
    }
  }

  componentDidUpdate(oldProps, oldState) {
    if (oldProps.isEnd !== this.props.isEnd && this.props.isEnd) {
      this.setState({
        isLoading: false
      });
    }

    if (oldProps.hasMore !== this.props.hasMore && !this.props.hasMore) {
      if (this.props.container) {
        this.props.container.removeEventListener('scroll', this.throttledScrollHandler);
      }
    }

    if (oldState.isLoading !== this.state.isLoading && !this.state.isLoading) {
      if (this.props.container && this.props.container.scrollTop <= this.props.container.scrollHeight) {
        this.throttledScrollHandler()
      }
    }

    if (oldProps.hasMore !== this.props.hasMore && this.props.hasMore) {
      if (this.state.isLoading) {
        this.setState({
          isLoading: false
        });
      }
      if (this.props.container) {
        this.props.container.addEventListener('scroll', this.throttledScrollHandler);
        if (this.props.immediate && this.props.container.scrollTop <= this.props.container.scrollHeight) {
          this.throttledScrollHandler();
        }
      }
    }
  }

  onScroll = (event = {}) => {
    const { load, threshold, hasMore, container } = this.props;
    const { isLoading } = this.state;
    const target = event.target || container;
    const scrolledToBottom = Math.ceil(target.scrollTop + target.clientHeight) >= target.scrollHeight;

    if (!isLoading && scrolledToBottom && hasMore) {
      if (target.scrollTop <= target.scrollHeight || (target.scrollTop % target.scrollHeight) >= threshold) {
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
      <Fragment>
        {children}
        {isLoading && loadIndicator}
      </Fragment>
    );
  }
};

InfiniteScroll.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.arrayOf(PropTypes.element).isRequired
  ]).isRequired,
  hasMore: PropTypes.bool.isRequired,
  isEnd: PropTypes.bool.isRequired,
  load: PropTypes.func.isRequired,
  container: PropTypes.element,
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
