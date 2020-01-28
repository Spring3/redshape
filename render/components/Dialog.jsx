import React, { Component, Fragment } from 'react';
import styled, { withTheme } from 'styled-components';
import PropTypes from 'prop-types';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Button from './Button';

const PaddedButton = styled(Button)`
  padding: 5px;
  margin-right: 10px;
  margin-top: 10px;
`;

class Dialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onConfirm: null
    };
  }

  confirm = closeModal => (event) => {
    this.state.onConfirm();
    closeModal();
  }

  cancel = closeModal => (event) => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
    closeModal();
  }

  renderDialog = () => {
    const { title, message, theme } = this.props;
    confirmAlert({
      customUI: ({ onClose }) => (
        <div>
          <h1>{title}</h1>
          <p>{message}</p>
          <PaddedButton
            theme={theme}
            palette="danger"
            onClick={this.cancel(onClose)}
          >
          Cancel
          </PaddedButton>
          <PaddedButton
            theme={theme}
            palette="success"
            onClick={this.confirm(onClose)}
          >
          Confirm
          </PaddedButton>
        </div>
      )
    });
  }

  displayDialog = onConfirm => (event) => {
    event.preventDefault();
    event.stopPropagation();
    const eventClone = {
      ...event,
      preventDefault: () => {},
      stopPropagation: () => {},
      target: { ...event.target, value: event.target.value }
    };

    this.setState({
      onConfirm: () => onConfirm(eventClone)
    }, () => this.renderDialog());
  }

  render() {
    return (
      <Fragment>
        {this.props.children(this.displayDialog)}
      </Fragment>
    );
  }
}

Dialog.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func
};

Dialog.defaultProps = {
  title: 'Confirmation',
  message: 'Are you sure you want to proceed?',
  onClose: undefined
};

export default withTheme(Dialog);
