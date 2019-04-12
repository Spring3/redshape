import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import styled, { css, withTheme } from 'styled-components';
import moment from 'moment';

import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon';
import SendIcon from 'mdi-react/SendIcon';
import PlusIcon from 'mdi-react/PlusIcon';
import CloseIcon from 'mdi-react/CloseIcon';

import Link from '../../components/Link';
import Button, { GhostButton } from '../../components/Button';
import actions from '../../actions';
import Progressbar from '../../components/Progressbar';
import MarkdownEditor from '../../components/MarkdownEditor';
import TimeEntryModal from '../../components/TimeEntryModal';
import { animationSlideRight } from '../../animations';

const Grid = styled.div`
  display: grid;
  padding: 20px;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  grid-auto-rows: minmax(100px, auto);
  grid-auto-flow: dense;
  grid-gap: 20px;
`;

const Section = styled.section`
  background: white;
  padding: 20px;
  border-radius: 5px;
  grid-column: span 8;
  grid-row: span 6;
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

const CloseButton = styled(GhostButton)`
  svg {
    ${({theme}) => css`
      color: ${theme.bgLight};
      transition: color ease ${theme.transitionTime};

      &:hover {
        color: ${theme.main};
      }
    `}
  }
`;

const DescriptionText = styled.pre`
  white-space: pre-wrap;
  font-family: inherit;
  font-size: inherit;
`;

const Comments = styled.ul`
  list-style-type: none;
  padding: 0;
  
  li {
    display: block;

    div:first-child {
      font-weight: bold;
    }

    div:last-child {
      margin: 10px auto;
    }
  }
`;

const FlexRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const TimeEntriesContainer = styled.div`
  background: white;
  padding-top: 35px;
  width: 370px;
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
    margin: 20px auto;
    padding: 10px;
    border-radius: 3px;

    div:first-child {
      display: flex;
      align-items: center;
      justify-content: space-between;

      a {
        visibility: hidden;
      }

      div {
        span {
          margin-right: 5px;
        }
        span:first-child,
        span:last-child {
          font-weight: bold;
        }
      }
    }

    p {
      margin-bottom: 0px;
    }

    &:hover {
      box-shadow: 0px 0px 10px #E0E0E0;

      div:first-child {
        a {
          visibility: visible;
        }
      }
    }
  }
`;

class IssueDetailsPage extends Component { 
  constructor(props) {
    super(props);
    this.state = {
      selectedTimeEntry: undefined,
      showTimeEntryModal: false,
      comments: undefined
    };
  }

  componentWillMount() {
    const { match, user, fetchIssueDetails, fetchIssueTimeEntries } = this.props;
    fetchIssueDetails(match.params.id);
    fetchIssueTimeEntries(user.id, match.params.id);
  }

  publishComment = () => {
    if (this.state.comments) {
      const { match, sendComments } = this.props;
      sendComments(match.params.id, this.state.comments);
    }
  }

  onCommentsChange = comments => this.setState({ comments });

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
    return selectedIssue.id
      ? (
        <Grid>
          <Section>
            <FlexRow>
              <div>
                <BackButton onClick={history.goBack.bind(this)}>
                  <ArrowLeftIcon size={30} />
                </BackButton>
                <HeaderContainer>
                  <h2>
                    <span>#{selectedIssue.id}&nbsp;</span>
                    <span>{selectedIssue.subject}</span>
                  </h2>
                  { !timeTracking.isTracking || timeTracking.issue.id !== selectedIssue.id
                    ? (
                      <Button onClick={this.startTimeTracking}>Track Time</Button>
                    )
                    : null
                  }
                </HeaderContainer>
                <SmallNotice>
                  Created by&nbsp;
                  <Link>{selectedIssue.author.name}</Link>
                  <span> {moment().diff(selectedIssue.created_on, 'days')} day(s) ago</span>
                </SmallNotice>
                {selectedIssue.closed_on && (
                  <SmallNotice>Closed on <span>{selectedIssue.closed_on}</span></SmallNotice> 
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
                      <div>Target version: </div>
                      <div>{_.get(selectedIssue, 'fixed_version.name')}</div>
                    </li>
                    <li>
                      <div>Progress: </div>
                      <div>
                        <Progressbar
                          percent={selectedIssue.done_ratio}
                          background={theme.green}
                        />
                      </div>
                    </li>
                  </ColumnList>
                  <ColumnList>
                    <li>
                      <div>Start Date: </div>
                      <div>{selectedIssue.start_date}</div>
                    </li>
                    <li>
                      <div>Due Date: </div>
                      <div>{selectedIssue.due_date}</div>
                    </li>
                    <li>
                      <div>Estimated hours: </div>
                      <div>{selectedIssue.total_estimated_hours}</div>
                    </li>
                    <li>
                      <div>Total time spent: </div>
                      <div>{selectedIssue.total_spent_hours.toFixed(2)}</div>
                    </li>
                    <li>
                      <div>Time spent by me: </div>
                      <div>{selectedIssue.spent_hours.toFixed(2)}</div>
                    </li>
                    <li>
                      <div>Time cap: </div>
                      <div>
                        <Progressbar
                          percent={selectedIssue.total_spent_hours / selectedIssue.total_estimated_hours * 100}
                          background={theme.yellow}
                        />
                      </div>
                    </li>
                  </ColumnList>
                </Wrapper>
                <div>
                  <h3>Description</h3>
                  <DescriptionText>
                    {selectedIssue.description}
                  </DescriptionText>
                </div>
                <div>
                  <h3>Comments</h3>
                  <Comments>
                    {selectedIssue.journals.filter(entry => entry.notes).map(entry => (
                      <li key={entry.id}>
                        <div>{entry.user.name}<span>({`${moment().diff(entry.created_on, 'days')} day(s) ago`})</span></div>
                        <DescriptionText>{entry.notes}</DescriptionText>
                      </li>
                    ))}
                  </Comments>
                  <MarkdownEditor
                    onChange={this.onCommentsChange}
                    preview={true}
                  />
                  <Button
                    type="button"
                    onClick={this.publishComment}
                  >
                    Publish <SendIcon />
                  </Button>
                </div>
              </div>
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
                          <span>{timeEntry.user.name}</span>
                          <span>{timeEntry.spent_on}</span>
                          <span>{timeEntry.hours} hours</span>
                        </div>
                        {
                          user.id === timeEntry.user.id && (
                            <CloseButton
                              onClick={this.removeTimeEntry(timeEntry.id)}
                            >
                              <CloseIcon />
                            </CloseButton>
                          )
                        }
                      </div>
                      <p>{timeEntry.comments}</p>
                    </li>
                  ))}
                </TimeEntriesList>
              </TimeEntriesContainer>
            </FlexRow>
          </Section>
          <TimeEntryModal
            isOpen={showTimeEntryModal}
            isEditable={true}
            timeEntry={selectedTimeEntry}
            onClose={this.closeTimeEntryModal}
          />
        </Grid>
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
  fetchIssueTimeEntries: (userId, issueId) => dispatch(actions.time.getAll(userId, issueId)),
  startTimeTracking: selectedIssue => dispatch(actions.tracking.trackingStart(selectedIssue)),
  sendComments: (issueId, comments) => dispatch(actions.issues.sendComments(issueId, comments)),
  removeTimeEntry: (timeEntryId, issueId) => dispatch(actions.time.remove(timeEntryId, issueId))
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(IssueDetailsPage));
