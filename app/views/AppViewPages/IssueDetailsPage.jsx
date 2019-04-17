import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import styled, { css, withTheme } from 'styled-components';

import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon';
import PlusIcon from 'mdi-react/PlusIcon';
import CloseIcon from 'mdi-react/CloseIcon';

import Link from '../../components/Link';
import Button, { GhostButton } from '../../components/Button';
import actions from '../../actions';
import Progressbar from '../../components/Progressbar';
import MarkdownEditor, { MarkdownText } from '../../components/MarkdownEditor';
import TimeEntryModal from '../../components/TimeEntryModal';
import DateComponent from '../../components/Date';
import { animationSlideRight } from '../../animations';

import { platform } from '../../../modules/config';

const Flex = styled.div`
  display: flex;
  padding: 20px;
`;

const Section = styled.section`
  background: white;
  padding: 20px;
`;

const ColumnList = styled.ul`
  list-style-type: none;
  font-weight: 500;
  margin: 0;
  padding: 0;
  width: auto;
  float: left;
  padding-right: 20px;
  border-radius: 3px;

  li {
    columns: 2;
    margin-bottom: 10px;
    padding: 5px 0px 5px 0px;
    display: flex;
    align-items: center;
  }

  li div {
    width: 150px;
  }

  li div:first-child {
    font-weight: bold;
  }
`;

const SmallNotice = styled.p`
  font-size: 12px;
  margin-top: 0px;
  color: ${props => props.theme.minorText};

  a {
    font-size: inherit !important;
    margin-right: 5px;
  }
`;

const Wrapper = styled.div`
  display: inline-block;
  width: 100%;
  margin-top: 10px;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;

  h2 {
    display: inline-block;
    margin-right: 10px;
  }

  h2.padded {
    margin-left: 15px;
  }
`;

const IconButton = styled(GhostButton)`
  svg {
    border-radius: 3px;
    ${({theme}) => css`
      color: ${theme.main};
      border: 2px solid transparent;
      transition: all ease ${theme.transitionTime};

      &:hover {
        color: ${theme.main};
        border: 2px solid ${theme.main};
      }
    `}
  }
`;

const BackButton = styled(IconButton)`
  svg {
    animation: ${animationSlideRight} 2s ease-in infinite;
    &:hover {
      animation-play-state: paused;
    }
  }
`;

const Comments = styled.ul`
  list-style-type: none;
  padding: 0;
  
  li {
    background: ${props => props.theme.bgLight};
    display: block;
    border-radius: 3px;
    margin-bottom: 20px;

    div.commentsHeader {
      display: flex;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 2px solid ${props => props.theme.bg};

      ${({theme}) => css`
        span:first-child {
          font-weight: bold;
          color: ${theme.normalText};
        }

        span:last-child {
          font-weight: bold;
          color: ${theme.minorText};
          transition: color ease ${theme.transitionTime};
          text-align: center;

          &:hover {
            color: ${theme.normalText};
          }
        }
      `}

    }

    iframe {
      padding: 5px 20px 0px 20px;
    }
  }
`;

const CommentsForm = styled.div`
  padding: 20px;
  border-radius: 3px;
  border: 2px solid ${props => props.theme.bgLight};
`;

const IssueDetails = styled.div`
  flex-grow: 1;
`;

const TimeEntriesContainer = styled.div`
  background: white;
  padding-top: 35px;
`;

const TimeEntriesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  padding: 5px;
  overflow-y: scroll;
  max-height: 600px;

  li {
    cursor: pointer;
    display: block;
    padding: 10px;
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
        span.date {
          margin-right: 5px;
          color: ${props => props.theme.minorText};
        }

        span.username,
        span.time {
          margin-right: 5px;
          font-weight: bold;
          color: ${props => props.theme.normalText};
        }
      }
    }

    p {
      margin-bottom: 0px;
      min-width: 100%;
      width: 0;
      min-width: 320px;
    }

    &:hover {
      background: ${props => props.theme.bgLight};

      div:first-child {
        a {
          visibility: visible;
        }
      }
    }
  }

  li:not(:first-child) {
    margin: 20px auto;
  }
`;

class IssueDetailsPage extends Component { 
  constructor(props) {
    super(props);
    this.state = {
      selectedTimeEntry: undefined,
      showTimeEntryModal: false
    };
  }

  componentWillMount() {
    const { match, fetchIssueDetails, fetchIssueTimeEntries } = this.props;
    fetchIssueDetails(match.params.id);
    fetchIssueTimeEntries(match.params.id);
  }

  publishComment = (comments) => {
    if (comments) {
      const { match, sendComments } = this.props;
      sendComments(match.params.id, comments);
    }
  }

  startTimeTracking = () => {
    const { selectedIssue, startTimeTracking } = this.props;
    startTimeTracking(selectedIssue);
  }

  showTimeEntryModal = (timeEntry) => () => {
    if (timeEntry) {
      timeEntry.issue.name = this.props.selectedIssue.subject;
    }
    this.setState({
      selectedTimeEntry: timeEntry,
      showTimeEntryModal: true
    });
  }

  closeTimeEntryModal = () => {
    this.setState({
      selectedTimeEntry: undefined,
      showTimeEntryModal: false
    });
  }

  removeTimeEntry = (timeEntryId) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { selectedIssue } = this.props;
    this.props.removeTimeEntry(timeEntryId, selectedIssue.id);
  }

  render() {
    const { spentTime, selectedIssue, history, user, timeTracking, theme } = this.props;
    const { selectedTimeEntry, showTimeEntryModal } = this.state;
    console.log(selectedIssue);
    console.log(platform);
    return selectedIssue.id
      ? (
        <Section>
          <Flex>
            <IssueDetails>
              <BackButton onClick={history.goBack.bind(this)}>
                <ArrowLeftIcon size={30} />
              </BackButton>
              <HeaderContainer>
                <h2>
                  <span>#{selectedIssue.id}&nbsp;</span>
                  <span>{selectedIssue.subject}</span>
                </h2>
                {!timeTracking.isTracking || timeTracking.issue.id !== selectedIssue.id
                  ? (
                    <Button onClick={this.startTimeTracking}>Track Time</Button>
                  )
                  : null
                }
              </HeaderContainer>
              <SmallNotice>
                Created by&nbsp;
                  <Link>{selectedIssue.author.name}</Link>
                <DateComponent date={selectedIssue.created_on} />
              </SmallNotice>
              {selectedIssue.closed_on && (
                <SmallNotice>Closed <DateComponent date={selectedIssue.closed_on} /></SmallNotice>
              )}
              <Wrapper>
                <ColumnList>
                  <li>
                    <div>Tracker: </div>
                    <div>{selectedIssue.tracker.name}</div>
                  </li>
                  <li>
                    <div>Status:</div>
                    <div>{selectedIssue.status.name}</div>
                  </li>
                  <li>
                    <div>Priority: </div>
                    <div>{selectedIssue.priority.name}</div>
                  </li>
                  <li>
                    <div>Assignee: </div>
                    <div>{selectedIssue.assigned_to.name}</div>
                  </li>
                  <li>
                    <div>Project: </div>
                    <div>{_.get(selectedIssue, 'project.name')}</div>
                  </li>
                  <li>
                    <div>Progress: </div>
                    <div>
                      <Progressbar
                        percent={selectedIssue.done_ratio}
                        background={theme.main}
                      />
                    </div>
                  </li>
                </ColumnList>
                <ColumnList>
                  <li>
                    <div>Target version: </div>
                    <div>{_.get(selectedIssue, 'fixed_version.name')}</div>
                  </li>
                  <li>
                    <div>Start date: </div>
                    <DateComponent date={selectedIssue.start_date} />
                  </li>
                  <li>
                    <div>Due date: </div>
                    <DateComponent date={selectedIssue.due_date} />
                  </li>
                  <li>
                    <div>Estimation: </div>
                    <div>{selectedIssue.total_estimated_hours ? `${selectedIssue.total_estimated_hours} hours` : undefined}</div>
                  </li>
                  <li>
                    <div>Time spent: </div>
                    <div>{selectedIssue.spent_hours.toFixed(2)} hours</div>
                  </li>
                  <li>
                    <div>Time cap: </div>
                    <div>
                      <Progressbar
                        percent={selectedIssue.total_spent_hours / selectedIssue.total_estimated_hours * 100}
                        background={theme.main}
                      />
                    </div>
                  </li>
                </ColumnList>
              </Wrapper>
              <div>
                <h3>Description</h3>
                <MarkdownText markdownText={selectedIssue.description} />
              </div>
              <div>
                <h3>Comments</h3>
                <Comments>
                  {selectedIssue.journals.filter(entry => entry.notes).map(entry => (
                    <li key={entry.id}>
                      <div className="commentsHeader">
                        <span className="username">{entry.user.name}</span>
                        <DateComponent className="date" date={entry.created_on} />
                      </div>
                      <MarkdownText markdownText={entry.notes} />
                    </li>
                  ))}
                </Comments>
                <CommentsForm>
                  <MarkdownEditor
                    onSubmit={this.publishComment}
                  />
                  <p>
                    <SmallNotice>
                      Press
                      {
                        platform === 'darwin'
                        ? (<Link> Cmd + Enter</Link>)
                        : (<Link> Ctrl + Enter</Link>)
                      }
                      to send
                    </SmallNotice>
                  </p>
                </CommentsForm>
              </div>
            </IssueDetails>
            <TimeEntriesContainer>
              <HeaderContainer>
                <h2 className="padded">Time spent</h2>
                <IconButton onClick={this.showTimeEntryModal()}>
                  <PlusIcon size={27} />
                </IconButton>
              </HeaderContainer>
              <TimeEntriesList>
                {spentTime.map(timeEntry => (
                  <li key={timeEntry.id} onClick={this.showTimeEntryModal(timeEntry)}>
                    <div>
                      <div>
                        <span className="username">{timeEntry.user.name}</span>
                        <span className="time">{timeEntry.hours} hours</span>
                        <DateComponent className="date" date={timeEntry.spent_on} />
                      </div>
                      {
                        user.id === timeEntry.user.id && (
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
          </Flex>
          <TimeEntryModal
            isOpen={showTimeEntryModal}
            isEditable={true}
            timeEntry={selectedTimeEntry}
            onClose={this.closeTimeEntryModal}
          />
        </Section>
      )
      : null;
  }
}

IssueDetailsPage.propTypes = {
  selectedIssue: PropTypes.object.isRequired,
  spentTime: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: PropTypes.object.isRequired,
  fetchIssueDetails: PropTypes.func.isRequired,
  fetchIssueTimeEntries: PropTypes.func.isRequired,
  startTimeTracking: PropTypes.func.isRequired,
  sendComments: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  user: state.user,
  selectedIssue: state.issues.selected.data,
  spentTime: state.issues.selected.spentTime.data,
  timeTracking: state.tracking
});

const mapDispatchToProps = dispatch => ({
  fetchIssueDetails: issueId => dispatch(actions.issues.get(issueId)),
  fetchIssueTimeEntries: (issueId) => dispatch(actions.time.getAll(issueId)),
  startTimeTracking: selectedIssue => dispatch(actions.tracking.trackingStart(selectedIssue)),
  sendComments: (issueId, comments) => dispatch(actions.issues.sendComments(issueId, comments)),
  removeTimeEntry: (timeEntryId, issueId) => dispatch(actions.time.remove(timeEntryId, issueId))
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(IssueDetailsPage));
