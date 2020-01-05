import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { report } from '../../common/reporter';

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
    report(this.props.error);
  }

  render() {
    const { error } = this.props;
    return (
      <Fragment>
        <NotifyButton onClick={this.reportError} />
        <p>
          {error.message}
        </p>
      </Fragment>
    );
  }
};

Notification.propTypes = {
  error: PropTypes.instanceOf(Error).isRequired
};

export default Notification;
