import React, { Fragment, Component } from 'react';
import ModalWindow from 'react-responsive-modal';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components';
import CloseIcon from 'mdi-react/CloseIcon';
import Dialog from './Dialog';
import { GhostButton } from './Button';

const GhostButtonRight = styled(GhostButton)`
  float: right;
`;

class Modal extends Component {
  constructor(props) {
    super(props);

    this.childRef = React.createRef();

    const { width, theme } = this.props;
    const bgColorHex = theme.bg.slice(1); // get rid of diez (#)
    const intColors = bgColorHex.split(/(?=(?:..)*$)/).map(str => parseInt(str, 16));
    const rgb = intColors.join(',');
    this.state = {};
    this.modalStyles = {
      overlay: {
        background: `rgba(${rgb}, 0.9)`,
        zIndex: '98' // react-confirm-alert is 99
      },
      modal: {
        boxShadow: `0px 0px 20px ${theme.shadow}`,
        background: theme.bg,
        borderRadius: 3,
        ...(width ? { width } : {})
      }
    };
  }

  componentDidMount() {
    if (this.props.open) {
      const root = document.getElementById('root');
      if (root) {
        root.classList.add('react-confirm-alert-blur');
      }
    }
  }

  componentWillUnmount() {
    const root = document.getElementById('root');
    if (root) {
      root.classList.remove('react-confirm-alert-blur');
    }
  }

  onCloseProxy = () => {
    const root = document.getElementById('root');
    if (root) {
      root.classList.remove('react-confirm-alert-blur');
    }
    this.props.onClose();
  }

  onConfirm = (ev) => {
    this.onCloseProxy();
  }

  keyEscMaybeConfirm() {
    const { needConfirm } = this.props;
    if (needConfirm) {
      const childRef = this.childRef.current;
      if (childRef) {
        // REFACTOR: Maybe someone with better React skills can refactor the whole Esc/Exit/Confirm behavior
        // Also, the Dialog components looks quite weird/messy. All these workarounds comes because
        // I try to re-use the same components as the original author (Dialog, GhostButton, Modal, etc).
        childRef.props.onClick({ stopPropagation() {}, preventDefault() {}, target: { value: null } });
      }
    } else {
      this.onConfirm();
    }
  }

  render() {
    const { children, theme, needConfirm } = this.props;
    return (
      <ModalWindow
        {...this.props}
        styles={this.modalStyles}
        showCloseIcon={false}
        onClose={() => {}}
        onEscKeyDown={() => this.keyEscMaybeConfirm()}
      >
        <Dialog title="Please Confirm" message="Are you sure you want to close?">
          {
            requestConfirmation => (
              <GhostButtonRight
                ref={this.childRef}
                onClick={needConfirm ? requestConfirmation(this.onConfirm) : () => this.onConfirm()}
              >
                <CloseIcon color={theme.normalText} />
              </GhostButtonRight>
            )
          }
        </Dialog>
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
