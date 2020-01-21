import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {connect} from 'react-redux';
import moment from 'moment';
import styled, {css, withTheme} from 'styled-components';


import Link from '../../components/Link';
import Progressbar from '../../components/Progressbar';
import {MarkdownText} from '../../components/MarkdownEditor';
import TimeEntryModal from '../../components/TimeEntryModal';
import IssueModal from "../../components/IssueModal";
import TimeEntries from '../../components/IssueDetailsPage/TimeEntries';
import CommentsSection from '../../components/IssueDetailsPage/CommentsSection';
import DateComponent from '../../components/Date';
import {OverlayProcessIndicator} from '../../components/ProcessIndicator';

import {IssueId, Priority, Status, Tag, TagContainer} from "../../components/Issue";

import EditIcon from 'mdi-react/EditIcon';

import Button, {StyledLink} from "../../components/Button";

import actions from '../../actions';

const IssueHeader = styled.div`
  display: flex;
  margin-bottom: 20px;
`;
const FlexRow = styled.div`
  width: 100%;
`;

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
  border-radius: 3px;

  li {
    columns: 2;
    margin-bottom: 10px;
    padding: 5px 0px 5px 0px;
    display: flex;
    align-items: center;
    min-height: 20px;
  }
  
  ${props => props.isEnhanced ? css`
  padding-right: 80px;
  
  li div {
    display: flex;
    max-width: 350px;
  }
  
  li div.fixed {
    width: 220px;
  }

  li div:first-child {
    font-weight: bold;
    width: 180px;
  }
  
  @media (max-width: 1600px) {
    padding-right: 30px;
    
    li div {
      max-width: 280px;
    }
    
    li div:first-child {
      width: 150px;
    }
  }
  
  @media (max-width: 1240px) {
    padding-right: 20px;
    
    li div {
      max-width: 100%;
    }
    
    
    li div:first-child {
      width: 120px;
    }
  }
  ` : css`
  padding-right: 20px;
  
  li div {
    display: flex;
    width: 250px;
  }
  
  li div.fixed {
    width: 220px;
  }

  li div:first-child {
    font-weight: bold;
    width: 180px;
  }
  `}
  
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
`;

const Buttons = styled.div`
  display: block;
  align-items: center;
  margin: 0.95rem 1rem 0 1rem;
  a:first-child {
    margin-right: 2rem;
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
    const { selectedIssueState, history, userId, theme, postComments, uiStyle, redmineEndpoint } = this.props;
    const { selectedTimeEntry, showTimeEntryModal, showIssueModal, activities } = this.state;
    const selectedIssue = selectedIssueState.data;
    let morefields = selectedIssue.custom_fields;
    morefields = [{name: 'Initial estimated time', value: '10.24'}]
    if (!morefields){
      morefields = [];
    }
    const attachments = selectedIssue.attachments;
    if (attachments && attachments.length){
      morefields.push({ name: 'Attachments', value: attachments.length })
    }
    const tags = selectedIssue.tags;
    // const children = selectedIssue.children;
    const children = [{id: 23, tracker: {id: 2}}, {id: 25, tracker: {id: 3}}]
    const isEnhanced = uiStyle === 'enhanced';
    return selectedIssue.id
      ? (
        <Section>
          <Flex>
            <IssueDetails>
              <IssueHeader>
                <FlexRow>
                  <h2>
                    {isEnhanced ? (<IssueId value={selectedIssue.id} tracker={selectedIssue.tracker.id}/>) : (<span>#{selectedIssue.id}&nbsp;</span>)}
                    <span>{selectedIssue.subject}</span>
                  </h2>
                  <SmallNotice>
                    Created {isEnhanced && (<Link clickable={true} type="external" href={`${redmineEndpoint}/issues/${selectedIssue.id}`}>{`#${selectedIssue.id}`}</Link>)}by&nbsp;
                    <Link>{selectedIssue.author.name}</Link>
                    <DateComponent date={selectedIssue.created_on} />
                  </SmallNotice>
                  {selectedIssue.closed_on && (
                    <SmallNotice>Closed <DateComponent date={selectedIssue.closed_on} /></SmallNotice>
                  )}
                </FlexRow>
              <Buttons className="buttons">
                <FlexButton onClick={this.openIssueModal()}>
                  <EditIcon size={22} />
                  <span>&nbsp;Edit</span>
                </FlexButton>
              </Buttons>
              </IssueHeader>
              <Wrapper>
                <ColumnList isEnhanced={isEnhanced}>
                  <li>
                    <div>Tracker: </div>
                    <div>{selectedIssue.tracker.name}</div>
                  </li>
                  <li>
                    <div>Status:</div>
                    <div>{ isEnhanced ? (<Status value={selectedIssue.status.name}/>) : (selectedIssue.status.name) }</div>
                  </li>
                  <li>
                    <div>Priority: </div>
                    <div>{ isEnhanced ? (<Priority value={selectedIssue.priority.name}/>) : (selectedIssue.priority.name) }</div>
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
                    morefields && morefields.map((el, i) => (i % 2 == 0) ? (<li><div>{el.name}:</div><div>{el.value}</div></li>) : undefined)
                  }
                  {
                    tags ? (
                      <li><div>Tags:</div><TagContainer>{tags.map(el => (<Tag mode={isEnhanced ? 'enhanced' : 'plain'} value={el}/>))}</TagContainer></li>
                    ) : children ? (
                      <li><div>Children issues:</div><div>{children.map((el) => (<IssueId mode={isEnhanced ? 'enhanced' : 'plain'} clickable={true} value={el.id} tracker={el.tracker.id}/>))}</div></li>
                    ) : undefined
                  }
                </ColumnList>
                <ColumnList isEnhanced={isEnhanced}>
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
                    <div class="fixed">
                      <Progressbar
                        percent={selectedIssue.total_spent_hours / selectedIssue.total_estimated_hours * 100}
                        mode="time-tracking"
                        background={theme.main}
                      />
                    </div>
                  </li>
                  {
                    morefields && morefields.map((el, i) => (i % 2 != 0) ? (<li><div>{el.name}:</div><div>{el.value}</div></li>) : undefined)
                  }
                  {
                    morefields && morefields.length % 2 === 1 && (<li></li>)
                  }
                  {
                    tags && children && (
                      <li><div>Children issues:</div><div>{children.map((el) => (<IssueId mode={isEnhanced ? 'enhanced' : 'plain'} clickable={true} value={el.id} tracker={el.tracker.id}/>))}</div></li>
                    )
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
      })),
      tags: PropTypes.arrayOf(PropTypes.string.isRequired),
      transitions: PropTypes.shape({
        status: PropTypes.arrayOf(PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          position: PropTypes.number.isRequired,
        })),
      }),
      attachments: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
      })),
      created_on: PropTypes.string.isRequired,
      updated_on: PropTypes.string.isRequired,
    }),
    isFetching: PropTypes.bool.isRequired,
    error: PropTypes.instanceOf(Error)
  }).isRequired,
  userId: PropTypes.number.isRequired,
  userName: PropTypes.string.isRequired,
  fetchIssueDetails: PropTypes.func.isRequired,
  postComments: PropTypes.func.isRequired,
  resetSelectedIssue: PropTypes.func.isRequired,
  uiStyle: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  projects: state.projects.data,
  userId: state.user.id,
  userName: state.user.name,
  selectedIssueState: state.issues.selected,
  uiStyle: state.settings.uiStyle,
  redmineEndpoint: state.user.redmineEndpoint,
});

const mapDispatchToProps = dispatch => ({
  fetchIssueDetails: issueId => dispatch(actions.issues.get(issueId)),
  postComments: (issueId, comments) => dispatch(actions.issues.sendComments(issueId, comments)),
  resetSelectedIssue: () => dispatch(actions.issues.resetSelected())
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(IssueDetailsPage));
