import React, {Component, Fragment} from 'react';
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

const Title = styled.h2`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto minmax(auto, 340px) auto 1fr;
  grid-row-gap: 5px;
  grid-column-gap: 30px;
  margin-right: 30px;
  
  > div {
    display: flex;
    align-items: center;
    min-height: 35px;
    &:nth-child(odd) {
      font-weight: bold;
    }
  }
  
  @media (max-width: 1400px) {
    grid-template-columns: auto minmax(auto, 250px) auto 1fr;
    grid-column-gap: 20px;
    margin-right: 20px;
  }
  
  @media (max-width: 1150px) {
    grid-template-columns: auto 1fr;
  }
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
    if (!morefields){
      morefields = [];
    }
    const attachments = selectedIssue.attachments;
    if (attachments && attachments.length){
      morefields.push({ name: 'Attachments', value: attachments.length })
    }
    const tags = selectedIssue.tags;
    const children = selectedIssue.children;
    const isEnhanced = uiStyle === 'enhanced';
    const assigned_to = selectedIssue.assigned_to;
    const assignee_id = assigned_to && assigned_to.id
    return selectedIssue.id
      ? (
        <Section>
          <Flex>
            <IssueDetails>
              <IssueHeader>
                <FlexRow>
                  <Title>
                    {isEnhanced ? (<IssueId value={selectedIssue.id} tracker={selectedIssue.tracker.id}/>) : (<span>#{selectedIssue.id}&nbsp;</span>)}
                    <span>{selectedIssue.subject}</span>
                  </Title>
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
              <Grid>

                <div>Tracker: </div>
                <div>{selectedIssue.tracker.name}</div>

                <div>Target version: </div>
                <div>{_.get(selectedIssue, 'fixed_version.name')}</div>

                <div>Status:</div>
                <div>{ isEnhanced ? (<Status value={selectedIssue.status.name}/>) : (selectedIssue.status.name) }</div>

                <div>Start date: </div>
                <div><DateComponent date={selectedIssue.start_date} /></div>

                <div>Priority: </div>
                <div>{ isEnhanced ? (<Priority value={selectedIssue.priority.name}/>) : (selectedIssue.priority.name) }</div>

                <div>Due date: </div>
                <div><DateComponent date={selectedIssue.due_date} /></div>

                <div>Assignee: </div>
                <div>{assigned_to && assigned_to.name}</div>

                <div>Estimation: </div>
                <div>{selectedIssue.estimated_hours ? `${selectedIssue.estimated_hours.toFixed(2)} h` : undefined}
                  {
                    (selectedIssue.total_estimated_hours != selectedIssue.estimated_hours && selectedIssue.total_estimated_hours >= 0) && (
                      <span> (Total: {selectedIssue.total_estimated_hours.toFixed(2)} h)</span>
                    )
                  }
                </div>

                <div>Project: </div>
                <div>{_.get(selectedIssue, 'project.name')}</div>

                <div>Time spent: </div>
                <div>{selectedIssue.spent_hours ? `${selectedIssue.spent_hours.toFixed(2)} h` : undefined}
                  {
                    (selectedIssue.total_spent_hours != selectedIssue.spent_hours && selectedIssue.total_spent_hours >= 0) && (
                      <span> (Total: {selectedIssue.total_spent_hours.toFixed(2)} h)</span>
                    )
                  }
                </div>

                <div>Progress: </div>
                <div>
                  <Progressbar
                    percent={selectedIssue.done_ratio}
                    mode="progress-gradient"
                    background={theme.main}
                    width={150}
                    height={7}
                  />
                </div>

                <div>Time cap: </div>
                <div>
                  <Progressbar
                    percent={selectedIssue.total_spent_hours / selectedIssue.total_estimated_hours * 100}
                    mode="time-tracking"
                    background={theme.main}
                    width={150}
                    height={7}
                  />
                </div>

                {
                  morefields && morefields.map((el, i) => (<Fragment><div>{el.name}:</div><div>{el.value}</div></Fragment>))
                }

                {
                  tags && (
                    <Fragment>
                      <div>Tags:</div>
                      <TagContainer>{tags.map(el => (
                        <Tag mode={isEnhanced ? 'enhanced' : 'plain'} value={el}/>))}</TagContainer></Fragment>
                  )
                }

                {
                  children && (
                    <Fragment><div>Children issues:</div><div>{children.map((el) => (<IssueId mode={isEnhanced ? 'enhanced' : 'plain'} clickable={true} value={el.id} tracker={el.tracker.id}/>))}</div></Fragment>
                  )
                }

              </Grid>
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
            // publishComments={(issueId, comments) => this.postCurrentComment(issueId, comments)}
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
            isEditable={assignee_id === userId}
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
      }),
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
