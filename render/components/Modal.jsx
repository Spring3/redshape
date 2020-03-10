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

function cleanBlur() {
  const root = document.getElementById('root');
  if (root) {
    root.classList.remove('react-confirm-alert-blur');
  }
}

/**
 * Working on this issue between 2020-03-05 and 2020-03-10
 *
 * Known bug but impossible to reproduce in more than 50 manual tests
 * This is not pretty, but at least, since we established this (timeout),
 * we don't see it again.
 *
 * The bug appeared 2 times along a week of Redshape usage, after ending
 * a tracking session (new time entry) and increasing the progress
 * of that issue (editing the modal due to the strict workflow setting). Then, after
 * submitting, the window was kept blurred (root div with `react-confirm-alert-blur`),
 * although there was no Modal component.
 */
function forceCleanBlur() {
  cleanBlur();
  setTimeout(cleanBlur, 80);
}

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
    forceCleanBlur();
  }

  onCloseProxy = () => {
    forceCleanBlur();
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
