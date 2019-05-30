import React, { Component } from 'react';
import ModalWindow from 'react-responsive-modal';
import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';

class Modal extends Component {
  constructor(props) {
    super(props);

    const { theme } = this.props;
    const bgColorHex = theme.bg.slice(1); // get rid of diez (#)
    const intColors = bgColorHex.split(/(?=(?:..)*$)/).map(str => parseInt(str, 16));
    const rgb = intColors.join(',');
    this.modalStyles = {
      overlay: {
        background: `rgba(${rgb}, 0.9)`,
      },
      modal: {
        boxShadow: `0px 0px 20px ${theme.shadow}`,
        background: theme.bg,
        borderRadius: 3
      }
    };
  }

  componentDidMount() {
    if (this.props.open) {
      document.body.children[0].classList.add('react-confirm-alert-blur');
    }
  }

  componentWillUnmount() {
    document.body.children[0].classList.remove('react-confirm-alert-blur');
  }

  onCloseProxy = () => {
    document.body.children[0].classList.remove('react-confirm-alert-blur');
    this.props.onClose();
  }

  render() {
    const { children } = this.props;
    return (
      <ModalWindow
        {...this.props}
        styles={this.modalStyles}
        onClose={this.onCloseProxy}
      >
        {children}
      </ModalWindow>
    );
  }
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  children: PropTypes.node,
  theme: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default withTheme(Modal);
