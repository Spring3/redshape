import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import Select from 'react-select';
import Modal from 'react-responsive-modal';
import styled from 'styled-components';
import moment from 'moment';
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon';
import SendIcon from 'mdi-react/SendIcon';

import Button, { GhostButton } from '../../components/Button';
import actions from '../../actions';
import Progressbar from '../../components/Progressbar';
import MarkdownEditor from '../../components/MarkdownEditor';

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
      comment: undefined
    };
  }

  componentWillMount() {
    const { dispatch, match, user } = this.props;
    dispatch(actions.issues.get(match.params.id));
    dispatch(actions.tracking.getAll(user.id, match.params.id));
  }

  onCommentChange = comment => this.setState({ comment });

  publishComment = () => {

  }

  toggleTracking = () => {
    const { dispatch, issueDetails } = this.props;
    dispatch(actions.tracking.trackingStart(issueDetails));
  }

  showTimeEntryModal = (timeEntry) => () => {
    console.log(timeEntry);
    this.setState({
      selectedTimeEntry: timeEntry
    });
  }

  handleTimeEntryModalClose = () => {
    this.setState({
      selectedTimeEntry: undefined
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
    const { issueDetails, issueTime, history, user, projects } = this.props;
    const { selectedTimeEntry } = this.state;
    const selectedEntryProject = selectedTimeEntry ? projects[selectedTimeEntry.project.id] : undefined;
    let selectOptions = [];
    if (selectedEntryProject) {
      selectOptions = selectedEntryProject.activities.map(({ id, name }) => ({ value: id, label: name }));
    }
    console.log(projects);
    console.log(selectOptions);
    console.log(issueDetails);
    return issueDetails.id
      ? (
        <Grid>
          <MainSection>
            <FlexRow>
              <div>
                <GhostButton onClick={history.goBack.bind(this)}>
                  <ArrowLeftIcon />
                </GhostButton>
                <IssueHeader>
                  <span>#{issueDetails.id}&nbsp;</span>
                  <span>{issueDetails.subject}</span>
                  &nbsp;
                  <Button
                    onClick={this.toggleTracking}
                  >
                    Track Time
                  </Button>
                </IssueHeader>
                <SmallNotice>
                  Created by&nbsp;
                  <a href="#">{issueDetails.author.name}</a>
                  <span> {moment().diff(issueDetails.created_on, 'days')} day(s) ago</span>
                </SmallNotice>
                {issueDetails.closed_on && (
                <SmallNotice>Closed on <span>{issueDetails.closed_on}</span></SmallNotice> 
                )}
                <Wrapper>
                  <ColumnList>
                    <li>
                      <div>Tracker: </div>
                      <div>{issueDetails.tracker.name}</div>
                    </li>
                    <li>
                      <div>Status:</div>
                      <div>{issueDetails.status.name}</div>
                    </li>
                    <li>
                      <div>Priority: </div>
                      <div>{issueDetails.priority.name}</div>
                    </li>
                    <li>
                      <div>Assignee: </div>
                      <div>{issueDetails.assigned_to.name}</div>
                    </li>
                    <li>
                      <div>Target version: </div>
                      <div>{_.get(issueDetails, 'fixed_version.name')}</div>
                    </li>
                    <li>
                      <div>Progress: </div>
                      <div>
                        <Progressbar
                          percent={issueDetails.done_ratio}
                          background="grey"
                          color="white"
                        />
                      </div>
                    </li>
                  </ColumnList>
                  <ColumnList>
                    <li>
                      <div>Start Date: </div>
                      <div>{issueDetails.start_date}</div>
                    </li>
                    <li>
                      <div>Due Date: </div>
                      <div>{issueDetails.due_date}</div>
                    </li>
                    <li>
                      <div>Estimated hours: </div>
                      <div>{issueDetails.total_estimated_hours}</div>
                    </li>
                    <li>
                      <div>Total time spent: </div>
                      <div>{issueDetails.total_spent_hours.toFixed(2)}</div>
                    </li>
                    <li>
                      <div>Time spent by me: </div>
                      <div>{issueDetails.spent_hours.toFixed(2)}</div>
                    </li>
                    <li>
                      <div>Time cap: </div>
                      <div>
                        <Progressbar
                          percent={issueDetails.total_spent_hours / issueDetails.total_estimated_hours * 100}
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
                <Button onClick={this.addTime}>Add</Button>
                <List>
                  {issueTime.map(timeEntry => (
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
                  {issueDetails.description}
                </DescriptionText>
              </div>
              <div>
                <h3>Comments</h3>
                <Comments>
                  {issueDetails.journals.filter(entry => entry.notes).map(entry => (
                    <li key={entry.id}>
                      <div>{entry.user.name} <span>({`${moment().diff(entry.created_on, 'days')} day(s) ago`})</span></div>
                      <DescriptionText>{entry.notes}</DescriptionText>
                    </li>
                  ))}
                </Comments>
                <MarkdownEditor
                  onChange={this.onCommentChange}
                  preview={true}
                />
                <Button
                  type="button"
                  onClick={this.postComment}
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
          { !!selectedTimeEntry && (
            <Modal
              open={!!selectedTimeEntry}
              onClose={this.handleTimeEntryModalClose}
              center={true}
            >
              <div>
                <div>Author: {selectedTimeEntry.user.name}</div>
                <div>Project: {selectedTimeEntry.project.name}</div>
                <div>Activity</div>
                <Select
                  options={selectOptions}
                  defaultValue={selectOptions.find(option => option.value === selectedTimeEntry.activity.id)}
                />
                <div>Time: {selectedTimeEntry.hours} hours</div>
                <div>Date: {selectedTimeEntry.spent_on}</div>
                <h3>Comment</h3>
                <MarkdownEditor
                  onChange={this.onCommentChange}
                  value={selectedTimeEntry.comments}
                  preview={true}
                />
                { selectedTimeEntry.user.id === user.id && (
                  <div>
                    <Button onClick={() => {}}>Submit</Button>
                    <Button onclick={() => {}}>Delete</Button>
                  </div>
                )}
              </div>
            </Modal>
          )}
        </Grid>
      )
      : null;
  }
}

IssueDetailsPage.propTypes = {
  issueDetails: PropTypes.object.isRequired,
  issueTime: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: PropTypes.object.isRequired,
  projects: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  user: state.user,
  issueDetails: state.issues.current.data,
  issueTime: state.issues.time.data,
  projects: state.projects.data
});

const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(IssueDetailsPage);
