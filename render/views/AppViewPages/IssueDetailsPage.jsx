import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import moment from 'moment';
import styled, { css, withTheme } from 'styled-components';

import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon';

import Link from '../../components/Link';
import Progressbar from '../../components/Progressbar';
import { MarkdownText } from '../../components/MarkdownEditor';
import TimeEntryModal from '../../components/TimeEntryModal';
import IssueModal from "../../components/IssueModal";
import TimeEntries from '../../components/IssueDetailsPage/TimeEntries';
import CommentsSection from '../../components/IssueDetailsPage/CommentsSection';
import DateComponent from '../../components/Date';
import { OverlayProcessIndicator } from '../../components/ProcessIndicator';
import { animationSlideRight } from '../../animations';

import EditIcon from 'mdi-react/EditIcon';
import Button, { GhostButton } from "../../components/Button";

import actions from '../../actions';

const Flex = styled.div`
  display: flex;
  padding: 20px;
`;

const Section = styled.section`
  background: white;
  padding: 20px;
  margin-bottom: 60px;
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
    width: 220px;
  }

  li div:first-child {
    font-weight: bold;
    width: 150px;
  }
`;

const FlexButton = styled(Button) `
  display: inline-flex;
  align-items: center;
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

const Buttons = styled.div`
  display: flex;
  align-items: center;
  a:first-child {
    margin-right: 2rem;
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

const IssueDetails = styled.div`
  flex-grow: 1;
`;

class IssueDetailsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activities: [],
      selectedTimeEntry: undefined,
      showTimeEntryModal: false,
      showIssueModal: false
    };
  }

  componentWillMount() {
    const { match, fetchIssueDetails } = this.props;
    fetchIssueDetails(match.params.id);
  }

  componentWillUnmount() {
    this.props.resetSelectedIssue();
  }

  showTimeEntryModal = (timeEntry) => {
    const { selectedIssueState, userId, userName, projects } = this.props;
    const selectedIssue = selectedIssueState.data;
    const selectedTimeEntry = timeEntry
      ? timeEntry
      : {
        user: {
          id: userId,
          name: userName
        },
        issue: {
          id: selectedIssue.id
        },
        activity: {},
        project: {
          id: selectedIssue.project.id,
          name: selectedIssue.project.name
        },
        hours: undefined,
        duration: "",
        spent_on: moment().format('YYYY-MM-DD')
      };
    selectedTimeEntry.issue.name = selectedIssue.subject;
    const activities = _.get(projects[selectedIssue.project.id], 'activities', []);
    this.setState({
      activities: activities.map(({ id, name }) => ({ value: id, label: name })),
      selectedTimeEntry,
      showTimeEntryModal: true,
      showIssueModal: false
    });
  }

  closeTimeEntryModal = () => {
    this.setState({
      activities: [],
      selectedTimeEntry: undefined,
      showTimeEntryModal: false,
      showIssueModal: false
    });
  }

  closeIssueModal = (changes) => {
    this.setState({
      showIssueModal: false
    })
  }

  openIssueModal = () => () => {
    this.setState({ showIssueModal: true })
  }

  getIssueComments = () => this.props.selectedIssueState.data.journals.filter(entry => entry.notes)

  render() {
    const { selectedIssueState, history, userId, theme, postComments } = this.props;
    const { selectedTimeEntry, showTimeEntryModal, showIssueModal, activities } = this.state;
    const selectedIssue = selectedIssueState.data;
    const cfields = selectedIssue.custom_fields;
    const children = selectedIssue.children;
    return selectedIssue.id
      ? (
        <Section>
          <Flex>
            <IssueDetails>
              <Buttons className="buttons">
                <BackButton onClick={history.goBack.bind(this)}>
                  <ArrowLeftIcon size={30} />
                </BackButton>
              </Buttons>
              <h2>
                <span>#{selectedIssue.id}&nbsp;</span>
                <span>{selectedIssue.subject}</span>
                <IconButton onClick={this.openIssueModal()}>
                  <EditIcon size={20} style={{ marginLeft: '.5rem', verticalAlign: 'bottom' }}/>
                </IconButton>
              </h2>
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
                        mode="progress-gradient"
                        background={theme.main}
                      />
                    </div>
                  </li>
                  {
                    children && (
                      <li><div>Children issues:</div><div>{children.map((el) => (<Link onClick={() => this.props.history.push(`/app/issue/${el.id}/`)}>{`#${el.id}`}</Link>))}</div></li>
                    )
                  }
                  {
                    cfields && cfields.map((el, i) => (i % 2 == 0) ? (<li><div>{el.name}:</div><div>{el.value}</div></li>) : undefined)
                  }
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
                    <div>{selectedIssue.estimated_hours ? `${selectedIssue.estimated_hours.toFixed(2)} h` : undefined}
                    {
                      (selectedIssue.total_estimated_hours != selectedIssue.estimated_hours && selectedIssue.total_estimated_hours >= 0) && (
                        <span> (Total: {selectedIssue.total_estimated_hours.toFixed(2)} h)</span>
                      )
                    }
                    </div>
                  </li>
                  <li>
                    <div>Time spent: </div>
                    <div>{selectedIssue.spent_hours ? `${selectedIssue.spent_hours.toFixed(2)} h` : undefined}
                      {
                        (selectedIssue.total_spent_hours != selectedIssue.spent_hours && selectedIssue.total_spent_hours >= 0) && (
                          <span> (Total: {selectedIssue.total_spent_hours.toFixed(2)} h)</span>
                        )
                      }
                    </div>
                  </li>
                  <li>
                    <div>Time cap: </div>
                    <div>
                      <Progressbar
                        percent={selectedIssue.total_spent_hours / selectedIssue.total_estimated_hours * 100}
                        mode="time-tracking"
                        background={theme.main}
                      />
                    </div>
                  </li>
                  {
                    children && (<li></li>)
                  }
                  {
                    cfields && cfields.map((el, i) => (i % 2 != 0) ? (<li><div>{el.name}:</div><div>{el.value}</div></li>) : undefined)
                  }
                </ColumnList>
              </Wrapper>
              <div>
                <h3>Description</h3>
                <MarkdownText markdownText={selectedIssue.description} />
              </div>
            </IssueDetails>
            <TimeEntries
              showTimeEntryModal={this.showTimeEntryModal}
            />
          </Flex>
          <CommentsSection
            journalEntries={this.getIssueComments()}
            publishComments={postComments}
            issueId={selectedIssue.id}
          />
          { selectedTimeEntry && (
            <TimeEntryModal
              isOpen={showTimeEntryModal}
              isEditable={selectedTimeEntry.user.id === userId}
              activities={activities}
              isUserAuthor={selectedTimeEntry.user.id === userId}
              timeEntry={selectedTimeEntry}
              onClose={this.closeTimeEntryModal}
            />
          )}
          {selectedIssue && (
          <IssueModal
            isOpen={showIssueModal}
            isEditable={selectedIssue.assigned_to.id === userId}
            isUserAuthor={selectedIssue.author.id === userId}
            issueEntry={selectedIssue}
            onClose={this.closeIssueModal}
          />
          )}
        </Section>
      )
      : <OverlayProcessIndicator />;
  }
}

IssueDetailsPage.propTypes = {
  selectedIssueState: PropTypes.shape({
    data: PropTypes.shape({
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
      total_spent_hours: PropTypes.number,
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
    isFetching: PropTypes.bool.isRequired,
    error: PropTypes.instanceOf(Error)
  }).isRequired,
  userId: PropTypes.number.isRequired,
  userName: PropTypes.string.isRequired,
  fetchIssueDetails: PropTypes.func.isRequired,
  postComments: PropTypes.func.isRequired,
  resetSelectedIssue: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  projects: state.projects.data,
  userId: state.user.id,
  userName: state.user.name,
  selectedIssueState: state.issues.selected
});

const mapDispatchToProps = dispatch => ({
  fetchIssueDetails: issueId => dispatch(actions.issues.get(issueId)),
  postComments: (issueId, comments) => dispatch(actions.issues.sendComments(issueId, comments)),
  resetSelectedIssue: () => dispatch(actions.issues.resetSelected())
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(IssueDetailsPage));
