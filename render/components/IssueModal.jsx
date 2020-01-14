import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components';

import { Input, Label } from './Input';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import Modal from './Modal';
import ProcessIndicator from './ProcessIndicator';

import actions from '../actions';

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const OptionButtons = styled.div`
  position: relative;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid ${props => props.theme.bgDark};
  display: flex;
  
  button {
    padding: 8px 15px;
  }

  div {
    margin-left: 20px;
  }
`;

class IssueModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issueEntry: props.issueEntry || {},
      wasModified: false
    };
  }

  componentDidUpdate(oldProps) {
    if (oldProps.isOpen !== this.props.isOpen && this.props.isOpen) {
      const { issueEntry } = this.props;

      if (issueEntry) {
        this.setState({
          issueEntry,
          wasModified: false
        });
      }
    } else if (oldProps.isOpen !== this.props.isOpen && !this.props.isOpen) {
      this.props.resetValidation();
    }
  }

  componentWillUnmount() {
    this.props.resetValidation();
  }

  runValidation() {
    const { validateBeforeUpdate } = this.props;
    const { issueEntry } = this.state;

    validateBeforeUpdate({
      progress: issueEntry.done_ratio,
    });
  }

  onUpdate = () => {
    const { wasModified, issueEntry } = this.state;
    if (wasModified) {
      this.props.updateIssueEntry(issueEntry, {
        progress: issueEntry.done_ratio
      }).then(() => {
        if (!this.props.issue.error) {
          this.props.issueGet(issueEntry.id);
          this.props.onClose()
        }
      });
    } else {
      this.props.onClose();
    }
  }

  onProgressChange = ({ target: { value: progress }}) => {
    this.setState({
      issueEntry: {
        ...this.state.issueEntry,
        done_ratio: progress
      },
      wasModified: true
    });
  }

  getErrorMessage = (error) => {
    if (!error) return null;
    return error.message.replace(new RegExp(error.context.key, 'g'), error.path[0]);
  }

  render() {
    const { isUserAuthor, isOpen, isEditable, onClose, issue } = this.props;
    const { issueEntry, wasModified } = this.state;
    const { done_ratio } = issueEntry;
    const validationErrors = issue.error && issue.error.isJoi
      ? {
        progress: issue.error.details.find(error => error.path[0] === 'progress'),
      }
      : {};
    return (
      <Modal
        open={!!isOpen}
        onClose={onClose}
        needConfirm={wasModified}
        center={true}
      >
        <Fragment>
          <Label htmlFor="assignee" label="Assignee">
            <div name="assignee">{issueEntry.assigned_to.name}</div>
          </Label>
          <Label htmlFor="issue" label="Issue">
            <div name="issue">#{issueEntry.id}&nbsp;{issueEntry.subject}</div>
          </Label>
          <FlexRow>
            <div>
              <Label htmlFor="progress" label="Progress">
                <FlexRow>
                <Input
                  type="number"
                  name="progress"
                  value={done_ratio}
                  onBlur={() => this.runValidation()}
                  disabled={!isEditable || !isUserAuthor}
                  onChange={this.onProgressChange}
                />
                </FlexRow>
              </Label>
              <ErrorMessage show={!!validationErrors.progress}>
                {this.getErrorMessage(validationErrors.progress)}
              </ErrorMessage>
            </div>
          </FlexRow>
          <OptionButtons>
            <Button
              id="btn-update"
              onClick={this.onUpdate}
              disabled={issue.isFetching}
              palette='success'
            >
              Submit
            </Button>
            { issue.isFetching && (<ProcessIndicator />) }
          </OptionButtons>
        </Fragment>
      </Modal>
    );
  }
}

IssueModal.propTypes = {
  isUserAuthor: PropTypes.bool.isRequired,
  issue: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    error: PropTypes.instanceOf(Error)
  }).isRequired,
  issueEntry: PropTypes.shape({
    id: PropTypes.number.isRequired,
    subject: PropTypes.string.isRequired,
    journals: PropTypes.arrayOf(PropTypes.object).isRequired,
    description: PropTypes.string,
    project: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    priority: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    assigned_to: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    done_ratio: PropTypes.number.isRequired,
    start_date: PropTypes.string.isRequired,
    due_date: PropTypes.string.isRequired,
    total_estimated_hours: PropTypes.number,
    spent_hours: PropTypes.number,
    tracker: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    status: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    author: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    custom_fields: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    }))
  }),
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool,
  issueGet: PropTypes.func.isRequired,
  updateIssueEntry: PropTypes.func.isRequired,
  validateBeforeUpdate: PropTypes.func.isRequired,
  resetValidation: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  issue: state.issue
});

const mapDispatchToProps = dispatch => ({
  issueGet: (id) => dispatch(actions.issues.get(id)),
  updateIssueEntry: (issueEntry, changes) => dispatch(actions.issue.update(issueEntry, changes)),
  validateBeforeUpdate: (changes) => dispatch(actions.issue.validateBeforeUpdate(changes)),
  resetValidation: () => dispatch(actions.issue.reset())
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(IssueModal));
