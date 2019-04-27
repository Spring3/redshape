import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import styled, { css, withTheme } from 'styled-components';

import PlusIcon from 'mdi-react/PlusIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import TimerIcon from 'mdi-react/TimerIcon';

import Button, { GhostButton } from '../../components/Button';
import DateComponent from '../../components/Date';
import actions from '../../actions';

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.theme.bgDark};
  border-radius: 3px;

  h2 {
    display: inline-block;
    margin-left: 15px;
    margin-right: 15px;
  }

  & > div {
    margin-right: 15px;
    background: ${props => props.theme.bgDark};
    padding: 0px 5px;
    border-radius: 3px;

    button {
      background: ${props => props.theme.bgDark};
      margin: 0px 5px;
    }
  }
`;

const FlexButton = styled(Button) `
  display: inline-flex;
  align-items: center;
  ${props => css`
    background: ${props.theme.mainLight};
  `}
`;

const TimeEntriesContainer = styled.div`
  background: white;
  padding-top: 35px;
  max-height: 450px;
  min-width: 340px;
`;

const TimeEntriesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  overflow-y: scroll;
  max-height: 400px;

  li {
    cursor: pointer;
    display: block;
    padding: 10px;
    margin: 20px auto 0px auto;
    border-radius: 3px;
    border: 2px solid transparent;

    div:first-child {
      display: flex;
      align-items: center;
      justify-content: space-between;

      a {
        margin-left: 10px;
        visibility: hidden;
      }

      div {
        flex-grow: 1;
        display: flex;
        justify-content: space-between;
        span.time,
        span.date {
          margin-right: 5px;
          font-size: 12px;
          color: ${props => props.theme.minorText};
        }

        span.username {
          font-weight: bold;
          margin-right: 5px;
          color: ${props => props.theme.normalText};
        }
      }
    }

    p {
      margin-bottom: 0px;
      min-width: 100%;
      width: 0;
      line-height: 2;
      min-width: 320px;
    }

    &:hover {
      background: ${props => props.theme.bgDark};

      div:first-child {
        a {
          visibility: visible;
        }
      }
    }
  }
`;

class TimeEntries extends Component {
  componentWillMount() {
    const { fetchIssueTimeEntries, selectedIssue } = this.props;
    fetchIssueTimeEntries(selectedIssue.id);
  }

  componentDidUpdate(oldProps) {
    if (oldProps.selectedIssue.id !== this.props.selectedIssue.id) {
      this.props.fetchIssueTimeEntries(this.props.selectedIssue.id);
    }
  }

  openModal = timeEntry => () => {
    this.props.showTimeEntryModal(timeEntry);
  }

  startTimeTracking = () => {
    const { selectedIssue, startTimeTracking } = this.props;
    startTimeTracking(selectedIssue);
  }

  removeTimeEntry = timeEntryId => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { selectedIssue, removeTimeEntry } = this.props;
    removeTimeEntry(timeEntryId, selectedIssue.id);
  }

  render() {
    const { spentTime, userId, theme, isTimerEnabled, trackedIssueId, selectedIssue } = this.props;
    return (
      <TimeEntriesContainer>
        <HeaderContainer>
          <h2 className="padded">Time spent</h2>
          <div>
            <FlexButton onClick={this.openModal()}>
              <PlusIcon size={22} />
              <span>&nbsp;Add</span>
            </FlexButton>
            <FlexButton
              disabled={isTimerEnabled || trackedIssueId === selectedIssue.id}
              onClick={this.startTimeTracking}>
              <TimerIcon size={22} />
              <span>&nbsp;Track</span>
            </FlexButton>
          </div>
        </HeaderContainer>
        <TimeEntriesList>
          {spentTime.map(timeEntry => (
            <li key={timeEntry.id} onClick={this.openModal(timeEntry)}>
              <div>
                <div>
                  <span className="username">{timeEntry.user.name}</span>
                  <span className="time">{timeEntry.hours} hours</span>
                  <DateComponent className="date" date={timeEntry.spent_on} />
                </div>
                {
                  userId === timeEntry.user.id && (
                    <GhostButton
                      onClick={this.removeTimeEntry(timeEntry.id)}
                    >
                      <CloseIcon color={theme.normalText} />
                    </GhostButton>
                  )
                }
              </div>
              <p>{timeEntry.comments}</p>
            </li>
          ))}
        </TimeEntriesList>
      </TimeEntriesContainer>
    );
  }
}

TimeEntries.propTypes = {
  selectedIssue: PropTypes.shape({
    id: PropTypes.number.isRequired,
    subject: PropTypes.string.isRequired,
    journals: PropTypes.arrayOf(PropTypes.object).isRequired,
    project: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    author: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  userId: PropTypes.number.isRequired,
  userName: PropTypes.string.isRequired,
  spentTime: PropTypes.arrayOf(PropTypes.shape({
    activity: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    comments: PropTypes.string,
    created_on: PropTypes.string.isRequired,
    hours: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
    issue: PropTypes.shape({
      id: PropTypes.number.isRequired
    }).isRequired,
    project: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    spent_on: PropTypes.string.isRequired,
    user: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired
  })).isRequired,
  isTimerEnabled: PropTypes.bool.isRequired,
  trackedIssueId: PropTypes.number,
  removeTimeEntry: PropTypes.func.isRequired,
  fetchIssueTimeEntries: PropTypes.func.isRequired,
  showTimeEntryModal: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  userId: state.user.id,
  usrName: state.user.name,
  spentTime: state.issues.selected.spentTime.data,
  selectedIssue: state.issues.selected.data,
  isTimerEnabled: state.tracking.isEnabled,
  trackedIssueId: state.tracking.issue.id
});

const mapDispatchToProps = dispatch => ({
  fetchIssueTimeEntries: (issueId) => dispatch(actions.timeEntry.getAll(issueId)),
  startTimeTracking: selectedIssue => dispatch(actions.tracking.trackingStart(selectedIssue)),
  removeTimeEntry: (timeEntryId, issueId) => dispatch(actions.timeEntry.remove(timeEntryId, issueId))
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(TimeEntries));
