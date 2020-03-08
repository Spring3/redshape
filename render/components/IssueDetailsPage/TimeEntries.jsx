import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled, { css, withTheme } from 'styled-components';

import PlusIcon from 'mdi-react/PlusIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import TimerIcon from 'mdi-react/TimerIcon';

import InfiniteScroll from '../InfiniteScroll';
import ProcessIndicator from '../ProcessIndicator';
import Button, { GhostButton } from '../Button';
import DateComponent from '../Date';
import Dialog from '../Dialog';
import actions from '../../actions';

const date = () => moment().format('YYYY-MM-DD HH:mm:ss');

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

const FlexButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  ${props => css`
    background: ${props.theme.mainLight};
  `}
`;

const TimeEntriesContainer = styled.div`
  background: white;
  max-height: 550px;
  min-width: 350px;
  @media (min-width: 1600px) {
    min-width: 500px;
  }
`;

const TimeEntriesList = styled.ul`
  position: relative;
  list-style-type: none;
  border-radius: 3px;
  margin: 0;
  overflow-y: scroll;
  max-height: 500px;
  background: ${props => props.theme.bgDark};
  box-shadow: inset 0px 0px 10px 0px ${props => props.theme.bgDark};
  ${props => (props.isEnhanced ? css`
  padding: 0px 15px 0px 10px;
  border: 10px solid ${props.theme.bgDark};
  border-width: 15px 0px 15px 10px;
  ` : css`
  padding: 0px 10px 10px 10px;
  `)}

  li {
    cursor: pointer;
    display: block;
    padding: 10px;
    border-radius: 3px;
    border: 1px solid ${props => props.theme.bgDarker};
    background: ${props => props.theme.bg};
    ${props => (props.isEnhanced ? css`
    margin-top: 7px;
    margin-bottom: 5px;
    ` : css`
    margin: 10px auto 0px auto;
    `)}

    div.status {
      display: flex;
      align-items: center;
      justify-content: space-between;

      a {
        margin-left: 10px;
        visibility: hidden;
        ${props => props.isEnhanced && css`
        position: absolute;
        // right: 0;
        right: 3px;
        background: white;
        border-radius: 50%;
        border: 1px solid lightgray;
        // margin-top: -16px;
        margin-top: -13px;
        `}
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
          ${props => props.isEnhanced && css`
          width: 150px;
          @media (min-width: 1600px) {
            width: 220px;
          }
          `}
        }
      }
    }

    div.extra {
      display: grid;
      justify-content: space-between;
      grid-template-columns: 1fr auto;
      grid-auto-flow: row;
      grid-column-gap: 1rem;

      grid-row-gap: 3px;
      align-items: end;

      &:not(:empty) {
        margin-top: 0.5rem;
      }

      span {
        font-size: 12px;
        color: ${props => props.theme.minorText};
        &:nth-child(even){
          text-align: right;
        }
      }
    }

    p {
      margin-bottom: 0px;
      min-width: 100%;
      width: 0;
      line-height: ${props => (props.isEnhanced ? 1.5 : 2)};
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

const Comment = styled.p`
  word-break: break-word;
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

  onRefresh = () => {
    const { fetchIssueTimeEntries, selectedIssue } = this.props;
    fetchIssueTimeEntries(selectedIssue.id, 0);
  }

  render() {
    const {
      spentTime, userId, theme, isTimerEnabled, trackedIssueId, selectedIssue, uiStyle, disabled
    } = this.props;
    const isEnhanced = uiStyle === 'enhanced';
    return (
      <TimeEntriesContainer>
        <HeaderContainer>
          <h2 className="padded">Time spent</h2>
          <div>
            <FlexButton disabled={disabled} onClick={this.openModal()}>
              <PlusIcon size={22} />
              <span>&nbsp;Add</span>
            </FlexButton>
            <FlexButton
              disabled={disabled || isTimerEnabled || trackedIssueId === selectedIssue.id}
              onClick={this.startTimeTracking}
            >
              <TimerIcon size={22} />
              <span>&nbsp;Track</span>
            </FlexButton>
          </div>
        </HeaderContainer>
        <TimeEntriesList ref={this.listRef} isEnhanced={isEnhanced}>
          <InfiniteScroll
            load={this.loadSpentTime}
            isEnd={spentTime.data.length === spentTime.totalCount}
            hasMore={!spentTime.isFetching && !spentTime.error && spentTime.data.length < spentTime.totalCount}
            loadIndicator={<ProcessIndicatorWrapper><ProcessIndicator /></ProcessIndicatorWrapper>}
            container={this.listRef.current}
            immediate={true}
          >
            {spentTime.data.map((timeEntry) => {
              let extra;
              if (isEnhanced) {
                const { custom_fields, activity } = timeEntry;
                extra = [
                  ...(activity ? [{ value: activity.name }] : []),
                  ...(custom_fields || [])
                ].filter(el => el.value != null);
              }
              return (
                <li key={timeEntry.id} onClick={this.openModal(timeEntry)}>
                  <div className="status">
                    <div>
                      <span className="username">{timeEntry.user.name}</span>
                      <span className="time">{`${Number(timeEntry.hours.toFixed(2))} hours`}</span>
                      <DateComponent className="date" align={isEnhanced && 'right'} date={timeEntry.spent_on} />
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
                  <Comment>{timeEntry.comments}</Comment>
                  {
                  extra && (
                    <div className="extra">
                      {extra.map((el) => {
                        const { value, multiple } = el;
                        let newValue = value || '';
                        if (multiple && value) {
                          newValue = value.join(', ');
                        }
                        if (newValue.length > 30) {
                          newValue = `${newValue.slice(0, 27)}...`;
                        }
                        return (<span key={el.id || 0}>{newValue}</span>);
                      })}
                    </div>
                  )
                }
                </li>
              );
            })}
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
  spentTime: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    limit: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    totalCount: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
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
    })).isRequired
  }),
  isTimerEnabled: PropTypes.bool.isRequired,
  trackedIssueId: PropTypes.number,
  removeTimeEntry: PropTypes.func.isRequired,
  fetchIssueTimeEntries: PropTypes.func.isRequired,
  showTimeEntryModal: PropTypes.func.isRequired,
  uiStyle: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  userId: state.user.id,
  userName: state.user.name,
  spentTime: state.issues.selected.spentTime,
  selectedIssue: state.issues.selected.data,
  isTimerEnabled: state.tracking.isEnabled,
  trackedIssueId: state.tracking.issue.id,
  uiStyle: state.settings.uiStyle,
});

const mapDispatchToProps = dispatch => ({
  fetchIssueTimeEntries: (issueId, page) => dispatch(actions.issues.getTimeEntriesPage(issueId, undefined, page)),
  startTimeTracking: selectedIssue => dispatch(actions.tracking.trackingStart(selectedIssue, date())),
  removeTimeEntry: (timeEntryId, issueId) => dispatch(actions.timeEntry.remove(timeEntryId, issueId))
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(TimeEntries));
