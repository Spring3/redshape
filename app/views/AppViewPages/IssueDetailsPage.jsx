import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import styled from 'styled-components';
import moment from 'moment';
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon';
import SendIcon from 'mdi-react/SendIcon';

import Button, { GhostButton } from '../../components/Button';
import actions from '../../actions';
import Progressbar from '../../components/Progressbar';
import MarkdownEditor from '../../components/MarkdownEditor';
import TimeEntryModal from '../../components/TimeEntryModal';

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
`;

const MainSection = styled(Section)`
  grid-column: span 8;
  grid-row: span 6;
`;

const TimeSpentSection = styled(Section)`
  width: 350px;
`;

const ColumnList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  width: auto;
  float: left;
  padding-right: 20px;

  li {
    columns: 2;
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
`;

const Wrapper = styled.div`
  display: inline-block;
  width: 100%;
`;

const IssueHeader = styled.h2`
  min-width: 1;
  width: auto;
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

const List = styled.ul`
  list-style-type: none;
  padding: 0;

  li {
    display: block;
  }
`;

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
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

  // const { dispatch, user } = this.props;
  // const queryFilter = new IssueFilter()
  //   .assignee(user.id)
  //   .status({ open: true})
  //   .build();
  // console.log(queryFilter);
  // dispatch(actions.issues.getAll(queryFilter))
  // .then(() => {
  //   this.setState({
  //     issues: this.props.issues
  //   });
  // });
  // redmineApi.issues.getAll(queryFilter)
  //   .then(({ data }) => {
  //     const { issues } = data;
  //     console.log(issues);
  //     if (Array.isArray(issues) && issues.length) {
  //       this.setState({
  //         issues: [...issues]
  //       });
  //       // storage.set(`${userId}.issuesAssignedToMe`, issues);
  //     }
  //   });

  render() {
    const { spentTime, selectedIssue, history } = this.props;
    const { selectedTimeEntry, showTimeEntryModal } = this.state;
    console.log(selectedIssue);
    return selectedIssue.id
      ? (
        <Grid>
          <MainSection>
            <FlexRow>
              <div>
                <GhostButton onClick={history.goBack.bind(this)}>
                  <ArrowLeftIcon />
                </GhostButton>
                <IssueHeader>
                  <span>#{selectedIssue.id}&nbsp;</span>
                  <span>{selectedIssue.subject}</span>
                  &nbsp;
                  <Button
                    onClick={this.startTimeTracking}
                  >
                    Track Time
                  </Button>
                </IssueHeader>
                <SmallNotice>
                  Created by&nbsp;
                  <a href="#">{selectedIssue.author.name}</a>
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
                          background="grey"
                          color="white"
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
                          background="grey"
                          color="white"
                        />
                      </div>
                    </li>
                  </ColumnList>
                </Wrapper>
              </div>
              <TimeSpentSection>
                <h2>Time spent</h2>
                <Button onClick={this.showTimeEntryModal()}>Add</Button>
                <List>
                  {spentTime.map(timeEntry => (
                    <li key={timeEntry.id} onClick={this.showTimeEntryModal(timeEntry)}>
                      <div>{timeEntry.comments}</div>
                      <div>{timeEntry.hours} hours</div>
                      <div>{timeEntry.user.name}</div>
                      <div>{timeEntry.spent_on}</div>
                      <Button onClick={this.removeTimeEntry}>Remove</Button>
                    </li>
                  ))}
                </List>
              </TimeSpentSection>
            </FlexRow>
            <div>
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
                      <div>{entry.user.name} <span>({`${moment().diff(entry.created_on, 'days')} day(s) ago`})</span></div>
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
                {/* <TextArea
                  name="comment"
                  value={this.state.comment}
                  onChange={this.onCommentChange}
                  rows="5"
                /> */}
                {/* <!-- <Button><SendIcon /></Button> --> */}
              </div>
            </div>
          </MainSection>
          <TimeEntryModal
            isOpen={showTimeEntryModal}
            isEditable={true}
            timeEntry={selectedTimeEntry}
            onClose={this.closeTimeEntryModal}
          />
          {/* { showAddNewEntryModal && (
            <TimeEntryModal
              user={issueDetails.author}
              issue={{
                id: issueDetails.id,
                name: issueDetails.subject
              }}
              projectId={issueDetails.project.id}
              show={showAddNewEntryModal}
              onCancel={this.toggleAddNewEntryModal}
              onAdd={this.handleTimeEntryAdd}
            />
          )} */}
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
  fetchIssueTimeEntries: (userId, issueId) => dispatch(actions.tracking.getAll(userId, issueId)),
  startTimeTracking: selectedIssue => dispatch(actions.tracking.trackingStart(selectedIssue)),
  sendComments: (issueId, comments) => dispatch(actions.issues.sendComments(issueId, comments))
});

export default connect(mapStateToProps, mapDispatchToProps)(IssueDetailsPage);
