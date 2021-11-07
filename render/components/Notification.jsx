import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const NotifyButton = styled.button`
  position: absolute;
  width: 92%;
  height: 100%;
  top: 0;
  left: 0;
  background: transparent;
  border: none;
  outline: none;
`;

class Notification extends Component {
  reportError = () => {
    const { error } = this.props;
    // report(error);
  }

  render() {
    const { error } = this.props;
    return (
      <>
        <NotifyButton onClick={this.reportError} />
        <p>
          {error.message}
        </p>
      </>
    );
  }
}

Notification.propTypes = {
  error: PropTypes.instanceOf(Error).isRequired
};

export default Notification;
