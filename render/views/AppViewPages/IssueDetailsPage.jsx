import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import moment from 'moment';
import styled, { css, withTheme } from 'styled-components';


import EditIcon from 'mdi-react/EditIcon';
import Link from '../../components/Link';
import Progressbar from '../../components/Progressbar';
import { MarkdownText } from '../../components/MarkdownEditor';
import TimeEntryModal from '../../components/TimeEntryModal';
import IssueModal from '../../components/IssueModal';
import TimeEntries from '../../components/IssueDetailsPage/TimeEntries';
import CommentsSection from '../../components/IssueDetailsPage/CommentsSection';
import DateComponent from '../../components/Date';
import { OverlayProcessIndicator } from '../../components/ProcessIndicator';

import {
  IssueId, Priority, Status, Tag, TagContainer
} from '../../components/Issue';


import Button from '../../components/Button';

import actions from '../../actions';
import Tooltip from '../../components/Tooltip';

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

const FlexButton = styled(Button)`
  display: inline-flex;
  align-items: center;
`;

const SmallNotice = styled.div`
  font-size: 12px;
  margin-top: 0px;
  color: ${props => props.theme.minorText};

  margin-block-start: 1em;
  margin-block-end: 1em;

  a {
    font-size: inherit !important;
    margin: 0 5px;
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

  a, span {
    word-break: normal;
  }
  span.subject {
    word-break: break-word;
  }
`;

const TextMain = styled.span`
  margin-right: 0.5rem;
`;
const TextAux = styled.span`
  color: gray;
`;
const TextAuthor = styled.span`
  color: ${props => props.theme.main};
  padding: 0 0.3rem;
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
    ${props => props.isEnhanced && css`
    &:nth-child(even) {
      > a {
        margin-left: -2px;
      }
    }
    `}
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

const FlexWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
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
    this.timeEntries = React.createRef();
    const { state } = props.location;
    if (state && state.action === 'afterTimeEntryAdded') {
      this.openIssueModalIfStrictWorkflow();
    }
  }

  componentWillMount() {
    const { match, fetchIssueDetails } = this.props;
    fetchIssueDetails(match.params.id);
  }

  componentWillUnmount() {
    this.props.resetSelectedIssue();
  }

  showTimeEntryModal = (timeEntry) => {
    const {
      selectedIssueState, userId, userName, projects
    } = this.props;
    const selectedIssue = selectedIssueState.data;
    const selectedTimeEntry = timeEntry || {
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
      duration: '',
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

  closeTimeEntryModal = (added) => {
    this.setState({
      activities: [],
      selectedTimeEntry: undefined,
      showTimeEntryModal: false,
      showIssueModal: false
    });
    if (added) {
      this.openIssueModalIfStrictWorkflow();
    }
  }

  closeIssueModal = (changes) => {
    this.setState({
      showIssueModal: false,
      notification: false
    });
  }

  openIssueModalIfStrictWorkflow() {
    if (this.props.isStrictWorkflow) {
      setTimeout(() => {
        this.setState({ showIssueModal: true, notification: true });
      }, 500);
    }
  }

  openIssueModal = () => () => {
    this.setState({ showIssueModal: true });
  }

  onRefresh = () => {
    const { match, fetchIssueDetails } = this.props;
    fetchIssueDetails(match.params.id);
    const { current } = this.timeEntries;
    if (current) {
      current.onRefresh();
    }
  }

  getIssueComments = () => ({ timestamp: new Date(), entries: this.props.selectedIssueState.data.journals.filter(entry => entry.notes) })

  render() {
    const {
      selectedIssueState, userId, theme, postComments, uiStyle, redmineEndpoint, postUpdateComments, isStrictWorkflow,
    } = this.props;
    const {
      selectedTimeEntry, showTimeEntryModal, showIssueModal, activities, notification
    } = this.state;
    const selectedIssue = selectedIssueState.data;
    const {
      attachments, total_estimated_hours, estimated_hours, total_spent_hours, spent_hours, custom_fields, relations, tags, children, parent, assigned_to, watchers
    } = selectedIssue;
    const extra_fields = [
      ...(attachments && attachments.length) ? [{ name: 'Attachments', value: attachments.length }] : [],
      ...(custom_fields) || [],
    ];
    const isEnhanced = uiStyle === 'enhanced';
    const assignee_id = assigned_to && assigned_to.id;
    const showTotalEstimatedHours = (total_estimated_hours !== estimated_hours && total_estimated_hours >= 0);
    const showTotalSpentHours = (total_spent_hours !== spent_hours && total_spent_hours >= 0);
    const { fixed_version: version, project, author } = selectedIssue;
    return selectedIssue.id
      ? (
        <Section>
          <Flex>
            <IssueDetails>
              <IssueHeader>
                <FlexRow>
                  <Title>
                    {isEnhanced ? (<IssueId value={selectedIssue.id} tracker={selectedIssue.tracker.id} />) : (
                      <span>
                        {`#${selectedIssue.id}`}
&nbsp;
                      </span>
                    )}
                    <span className="subject">{selectedIssue.subject}</span>
                  </Title>
                  <SmallNotice>
Created
                    {isEnhanced ? (<Link clickable={true} type="external" href={`${redmineEndpoint}/issues/${selectedIssue.id}`}>{`#${selectedIssue.id}`}</Link>) : ' '}
                    by
                    {isEnhanced ? (<Link clickable={true} type="external" href={`${redmineEndpoint}/people/${author.id}`}>{`${author.name}`}</Link>) : (<TextAuthor>{author.name}</TextAuthor>) }
                    <DateComponent date={selectedIssue.created_on} />
                  </SmallNotice>
                  {selectedIssue.closed_on && (
                    <SmallNotice>
                      {'Closed '}
                      <DateComponent date={selectedIssue.closed_on} />
                    </SmallNotice>
                  )}
                </FlexRow>
                <Buttons className="buttons">
                  <FlexButton onClick={this.openIssueModal()}>
                    <EditIcon size={22} />
                    <span>&nbsp;Edit</span>
                  </FlexButton>
                </Buttons>
              </IssueHeader>
              <Grid isEnhanced={isEnhanced}>

                <div>Tracker: </div>
                <div>{selectedIssue.tracker.name}</div>

                <div>Target version: </div>
                <div>{ version && isEnhanced ? (<Link clickable={true} type="external" href={`${redmineEndpoint}/versions/${version.id}`}>{version.name}</Link>) : _.get(version, 'name') }</div>

                <div>Status:</div>
                <div>{ isEnhanced ? (<Status value={selectedIssue.status.name} />) : (selectedIssue.status.name) }</div>

                <div>Start date: </div>
                <div><DateComponent date={selectedIssue.start_date} /></div>

                <div>Priority: </div>
                <div>{ isEnhanced ? (<Priority value={selectedIssue.priority.name} />) : (selectedIssue.priority.name) }</div>

                <div>Due date: </div>
                <div><DateComponent date={selectedIssue.due_date} /></div>

                <div>Assignee: </div>
                <div>{ assigned_to && isEnhanced ? (<Link clickable={true} type="external" href={`${redmineEndpoint}/people/${assigned_to.id}`}>{assigned_to.name}</Link>) : _.get(assigned_to, 'name') }</div>

                <div>Estimation: </div>
                <div>
                  {
                    estimated_hours > 0.0 && (
                      <TextMain>{`${estimated_hours.toFixed(2)} h`}</TextMain>
                    )
                  }
                  {
                    showTotalEstimatedHours && (
                      <TextAux>{`(Total: ${total_estimated_hours.toFixed(2)} h)`}</TextAux>
                    )
                  }
                </div>

                <div>Project: </div>
                <div>{ project && isEnhanced ? (<Link clickable={true} type="external" href={`${redmineEndpoint}/projects/${project.id}`}>{project.name}</Link>) : _.get(project, 'name') }</div>

                <div>Time spent: </div>
                <div>
                  {
                    spent_hours > 0.0 && (
                      <TextMain>{`${spent_hours.toFixed(2)} h`}</TextMain>
                    )
                  }
                  {
                    showTotalSpentHours && (
                      <TextAux>{`(Total: ${total_spent_hours.toFixed(2)} h)`}</TextAux>
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
                    percent={total_spent_hours / total_estimated_hours * 100}
                    mode="time-tracking"
                    background={theme.main}
                    width={150}
                    height={7}
                  />
                </div>

                {
                  extra_fields && extra_fields.map(el => (
                    <Fragment key={el.name}>
                      <div>{`${el.name}:`}</div>
                      <div>{el.multiple ? (el.value ? el.value.join(', ') : '') : el.value}</div>
                    </Fragment>
                  ))
                }

                {
                  tags && (
                    <Fragment>
                      <div>Tags:</div>
                      <TagContainer>
                        {tags.map(el => (
                          <Tag key={el} mode={isEnhanced ? 'enhanced' : 'plain'} value={el} />))}
                      </TagContainer>
                    </Fragment>
                  )
                }
                {
                  parent && (
                    <Fragment>
                      <div>Parent issue:</div>
                      <div><IssueId mode={isEnhanced ? 'enhanced' : 'plain'} clickable={true} value={parent.id} tracker={parent.tracker && parent.tracker.id} /></div>
                    </Fragment>
                  )
                }
                {
                  children && (
                    <Fragment>
                      <div>Children issues:</div>
                      <div>{children.map(el => (<IssueId key={el.id} mode={isEnhanced ? 'enhanced' : 'plain'} clickable={true} value={el.id} tracker={el.tracker.id} />))}</div>
                    </Fragment>
                  )
                }
                {
                  relations && (
                    <Fragment>
                      <div>Relations:</div>
                      <FlexWrap>
                        {relations.map((el) => {
                          const rel = el.relation_type;
                          let id; let relId; let
                            toMe = false;
                          if (el.issue_id === selectedIssue.id) {
                            id = el.issue_id;
                            relId = el.issue_to_id;
                          } else {
                            id = el.issue_to_id;
                            relId = el.issue_id;
                            toMe = true;
                          }
                          let delay = '';
                          if (el.delay) {
                            delay = ` (${el.delay} days)`;
                          }
                          let msg = rel;
                          switch (rel) {
                            case 'blocks':
                              msg = toMe ? 'Blocked by' : 'Blocks';
                              break;
                            case 'precedes':
                              msg = toMe ? 'Follows' : 'Precedes';
                              break;
                            case 'copied_to':
                              msg = toMe ? 'Copied from' : 'Copied to';
                              break;
                            case 'duplicates':
                              msg = toMe ? 'Has duplicate' : 'Duplicate of';
                              break;
                            case 'relates':
                              msg = 'Related to';
                              break;
                          }
                          return (<Tooltip text={`${msg}${delay} #${relId}`}><IssueId key={relId} mode={isEnhanced ? 'enhanced' : 'plain'} clickable={true} value={relId} /></Tooltip>);
                        })}
                      </FlexWrap>
                    </Fragment>
                  )
                }
                {
                  watchers && watchers.length > 0 && (
                    <Fragment>
                      <div>Watchers:</div>
                      <div>{watchers.map(el => el.name).join(', ')}</div>
                    </Fragment>
                  )
                }

              </Grid>
              <div>
                <h3>Description</h3>
                <MarkdownText markdownText={selectedIssue.description} isEnhanced={isEnhanced} />
              </div>
            </IssueDetails>
            <TimeEntries
              ref={this.timeEntries}
              disabled={isStrictWorkflow && selectedIssue.status.name === 'New'}
              showTimeEntryModal={this.showTimeEntryModal}
            />
          </Flex>
          <CommentsSection
            journalEntries={this.getIssueComments()}
            publishComments={postComments}
            publishUpdateComments={postUpdateComments}
            issueId={selectedIssue.id}
            volatile={this.props.selectedIssueState.volatile}
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
            notification={notification}
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
      due_date: PropTypes.string,
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
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired
      })),
      relations: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        relation_type: PropTypes.string.isRequired,
        issue_id: PropTypes.number.isRequired,
        issue_to_id: PropTypes.number.isRequired,
        delay: PropTypes.number,
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
      parent: PropTypes.shape({
        id: PropTypes.number.isRequired,
        tracker: PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired
        })
      }),
      children: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        tracker: PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired
        }).isRequired,
        subject: PropTypes.string.isRequired,
      })),
      watchers: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })),
    }),
    isFetching: PropTypes.bool.isRequired,
    error: PropTypes.instanceOf(Error),
    volatile: PropTypes.object
  }).isRequired,
  userId: PropTypes.number.isRequired,
  userName: PropTypes.string.isRequired,
  fetchIssueDetails: PropTypes.func.isRequired,
  postComments: PropTypes.func.isRequired,
  postUpdateComments: PropTypes.func.isRequired,
  resetSelectedIssue: PropTypes.func.isRequired,
  uiStyle: PropTypes.string.isRequired,
  isStrictWorkflow: PropTypes.bool.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    state: PropTypes.object,
    search: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,
  })
};

const mapStateToProps = state => ({
  projects: state.projects.data,
  userId: state.user.id,
  userName: state.user.name,
  selectedIssueState: state.issues.selected,
  uiStyle: state.settings.uiStyle,
  redmineEndpoint: state.user.redmineEndpoint,
  isStrictWorkflow: state.settings.isStrictWorkflow,
});

const mapDispatchToProps = dispatch => ({
  fetchIssueDetails: issueId => dispatch(actions.issues.get(issueId)),
  postComments: (issueId, comments) => dispatch(actions.issues.sendComments(issueId, comments)),
  postUpdateComments: (issueId, commentId, comments, remove) => dispatch(actions.issues.updateComments(issueId, commentId, comments, remove)),
  resetSelectedIssue: () => dispatch(actions.issues.resetSelected())
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(IssueDetailsPage));
