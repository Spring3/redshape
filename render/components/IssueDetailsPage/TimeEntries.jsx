import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import styled, { css, withTheme } from 'styled-components';

import PlusIcon from 'mdi-react/PlusIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import TimerIcon from 'mdi-react/TimerIcon';

import InfiniteScroll from '../InfiniteScroll';
import ProcessIndicator, { OverlayProcessIndicator } from '../ProcessIndicator';
import Button, { GhostButton } from '../Button';
import DateComponent from '../Date';
import Dialog from '../Dialog';
import actions from '../../actions';

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 3px;

  h2 {
    display: inline-block;
    margin-left: 15px;
    margin-right: 15px;
  }

  & > div {
    margin-right: 15px;
    padding: 0px 5px;
    border-radius: 3px;

    button {
      background: ${props => props.theme.bg};
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
  max-height: 550px;
  min-width: 350px;
`;

const TimeEntriesList = styled.ul`
  position: relative;
  list-style-type: none;
  padding: 0px 10px 10px 10px;
  border-radius: 3px;
  margin: 0;
  overflow-y: scroll;
  max-height: 500px;
  background: ${props => props.theme.bgDark};
  box-shadow: inset 0px 0px 10px 0px ${props => props.theme.bgDark};

  li {
    cursor: pointer;
    display: block;
    padding: 10px;
    margin: 10px auto 0px auto;
    border-radius: 3px;
    border: 2px solid transparent;
    background: ${props => props.theme.bg};

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
    }

    &:hover {
      div:first-child {
        a {
          visibility: visible;
        }
      }
    }
  }
`;

const ProcessIndicatorWrapper = styled.li`
  position: relative;
  div {
    position: absolute;
    left: 24%;
    bottom: 0;

    span {
      position: relative;
      bottom: 5px;
      left: 60px;
    }
  }
`;

class TimeEntries extends Component {
  constructor(props) {
    super(props);
    this.listRef = React.createRef();
  }
  componentWillMount() {
    const { fetchIssueTimeEntries, selectedIssue } = this.props;
    fetchIssueTimeEntries(selectedIssue.id, 0);
  }

  componentDidUpdate(oldProps) {
    if (oldProps.selectedIssue.id !== this.props.selectedIssue.id) {
      this.props.fetchIssueTimeEntries(this.props.selectedIssue.id, 0);
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

  loadSpentTime = () => {
    const { spentTime, selectedIssue } = this.props;
    const { page } = spentTime;
    this.props.fetchIssueTimeEntries(selectedIssue.id, page + 1);
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
        <TimeEntriesList ref={this.listRef}>
          <InfiniteScroll
            load={this.loadSpentTime}
            isEnd={spentTime.data.length === spentTime.totalCount}
            hasMore={!spentTime.isFetching && !spentTime.error && spentTime.data.length < spentTime.totalCount}
            loadIndicator={<ProcessIndicatorWrapper><ProcessIndicator /></ProcessIndicatorWrapper>}
            container={this.listRef.current}
            immediate={true}
          >
            {spentTime.data.map(timeEntry => (
              <li key={timeEntry.id} onClick={this.openModal(timeEntry)}>
                <div>
                  <div>
                    <span className="username">{timeEntry.user.name}</span>
                    <span className="time">{timeEntry.hours} hours</span>
                    <DateComponent className="date" date={timeEntry.spent_on} />
                  </div>
                  {
                    userId === timeEntry.user.id && (
                      <Dialog title="Please Confirm" message="Are you sure you want to delete this time entry?">
                        {
                          requestConfirmation => (
                            <GhostButton
                              onClick={requestConfirmation(this.removeTimeEntry(timeEntry.id))}
                            >
                              <CloseIcon color={theme.normalText} />
                            </GhostButton>
                          )
                        }
                      </Dialog>
                    )
                  }
                </div>
                <p>{timeEntry.comments}</p>
              </li>
            ))}
            </InfiniteScroll>
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
  userName: state.user.name,
  spentTime: state.issues.selected.spentTime,
  selectedIssue: state.issues.selected.data,
  isTimerEnabled: state.tracking.isEnabled,
  trackedIssueId: state.tracking.issue.id
});

const mapDispatchToProps = dispatch => ({
  fetchIssueTimeEntries: (issueId, page) => dispatch(actions.issues.getTimeEntriesPage(issueId, undefined, page)),
  startTimeTracking: selectedIssue => dispatch(actions.tracking.trackingStart(selectedIssue)),
  removeTimeEntry: (timeEntryId, issueId) => dispatch(actions.timeEntry.remove(timeEntryId, issueId))
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(TimeEntries));
