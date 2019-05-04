import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

class Dialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onConfirm: null
    };
  }

  confirm = closeModal => event => {
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
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className='custom-ui'>
          <h1>{this.props.title}</h1>
          <p>{this.props.message}</p>
          <button onClick={this.cancel(onClose)}>Cancel</button>
          <button onClick={this.confirm(onClose)}>Confirm</button>
        </div>
      )
    });
  }

  displayDialog = onConfirm => event => {
    event.preventDefault();
    event.stopPropagation();
    const eventClone = {
      ...event,
      preventDefault: () => {},
      stopPropagation: () => {},
      target: { ...event.target, value: event.target.value }
    }

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

export default Dialog;
