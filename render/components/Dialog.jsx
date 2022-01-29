import React, { Component } from 'react';
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
  confirm = (closeModal) => () => {
    const { onConfirm } = this.props;
    onConfirm();
    closeModal();
  }

  cancel = (closeModal) => () => {
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel();
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
            id="dialog-cancel"
            onClick={this.cancel(onClose)}
          >
            Cancel
          </PaddedButton>
          <PaddedButton
            theme={theme}
            palette="success"
            id="dialog-confirm"
            onClick={this.confirm(onClose)}
          >
            Confirm
          </PaddedButton>
        </div>
      )
    });
  }

  displayDialog = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.renderDialog();
  }

  render() {
    const { children } = this.props;
    return (
      <>
        {children(this.displayDialog)}
      </>
    );
  }
}

Dialog.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  children: PropTypes.func.isRequired,
  theme: PropTypes.object
};

Dialog.defaultProps = {
  title: 'Confirmation',
  message: 'Are you sure you want to proceed?',
  onCancel: () => { /* noop */ }
};

export default withTheme(Dialog);
