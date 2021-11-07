import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import moment from 'moment';
import styled, { css, useTheme } from 'styled-components';

import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon';

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
import { animationSlideRight } from '../../animations';

import { GhostButton } from '../../components/Button';

import actions from '../../actions';
import { useOvermindState } from '../../store';

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

const SmallNotice = styled.p`
  font-size: 12px;
  margin-top: 0px;
  color: ${(props) => props.theme.minorText};

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
    ${({ theme }) => css`
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

const Subtasks = styled.div`
  display: inline-block;
`;

const Subtask = styled.div`
  padding: 10px 5px;
  margin-right: 1rem;
  margin-bottom: .75rem;
  box-shadow: 0px 0px 5px ${(props) => props.theme.shadow};
  border-radius: 3px;
`;

const CustomFields = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

const FlexWrapper = styled(Wrapper)`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const IssueDetailsPage = ({
  match, fetchIssueDetails, resetSelectedIssue, selectedIssueState, projects, history, postComments
}: any) => {
  const [activities, setActivities] = useState([]);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState();
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  useEffect(() => {
    fetchIssueDetails(match.params.id);

    return () => {
      resetSelectedIssue();
    };
  }, []);

  const state = useOvermindState();
  const theme = useTheme();

  const triggerTimeEntryModal = (timeEntry: any) => {
    const selectedIssue = selectedIssueState.data;
    const newSelectedTimeEntry = timeEntry || {
      user: {
        id: state.users.currentUser?.id,
        name: `${state.users.currentUser?.firstName} ${state.users.currentUser?.lastName}`
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
    newSelectedTimeEntry.issue.name = selectedIssue.subject;
    const existingActivities = _.get(projects[selectedIssue.project.id], 'activities', []);
    setActivities(existingActivities.map(({ id, name }: { id: string, name: string }) => ({ value: id, label: name })));
    setSelectedTimeEntry(newSelectedTimeEntry);
    setShowTimeEntryModal(true);
    setShowIssueModal(false);
  };

  const closeTimeEntryModal = () => {
    setActivities([]);
    setSelectedTimeEntry(undefined);
    setShowTimeEntryModal(false);
    setShowIssueModal(false);
  };

  const closeIssueModal = () => {
    setShowIssueModal(false);
  };

  const openIssueModal = () => {
    setShowIssueModal(true);
  };

  const getIssueComments = () => selectedIssueState.data.journals.filter((entry: any) => entry.notes);

  const selectedIssue = selectedIssueState.data;
  const cfields = selectedIssue.custom_fields;
  // eslint-disable-next-line react/prop-types
  const subtasks = selectedIssue.children;
  return selectedIssue.id
    ? (
      <Section>
        <Flex>
          <IssueDetails>
            <Buttons className="buttons">
              { /* eslint-disable-next-line react/jsx-no-bind */ }
              <BackButton onClick={history.goBack.bind(this)}>
                <ArrowLeftIcon size={30} />
              </BackButton>
            </Buttons>
            <h2>
              <span>
                #
                {selectedIssue.id}
&nbsp;
              </span>
              <span>{selectedIssue.subject}</span>
              <IconButton onClick={openIssueModal}>
                <EditIcon size={20} style={{ marginLeft: '.5rem', verticalAlign: 'bottom' }} />
              </IconButton>
            </h2>
            <SmallNotice>
              Created by&nbsp;
              <Link href="#">{selectedIssue.author.name}</Link>
              <DateComponent date={selectedIssue.created_on} />
            </SmallNotice>
            {selectedIssue.closed_on && (
            <SmallNotice>
              Closed
              <DateComponent date={selectedIssue.closed_on} />
            </SmallNotice>
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
                      className={undefined}
                      id={undefined}
                      height={5}
                      percent={selectedIssue.done_ratio}
                      background={(theme as any).main}
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
                  <div>
                    {
                        selectedIssue.estimated_hours
                          ? `${selectedIssue.estimated_hours.toFixed(2)} h`
                          : undefined
                      }
                    {
                        (
                          selectedIssue.total_estimated_hours !== selectedIssue.estimated_hours
                          && selectedIssue.total_estimated_hours >= 0
                        ) && (
                          <span>
                            {' '}
                            (Total:
                            {selectedIssue.total_estimated_hours.toFixed(2)}
                            {' '}
                            h)
                          </span>
                        )
                      }
                  </div>
                </li>
                <li>
                  <div>Time spent: </div>
                  <div>
                    {selectedIssue.spent_hours ? `${selectedIssue.spent_hours.toFixed(2)} h` : undefined}
                    {
                        (
                          selectedIssue.total_spent_hours !== selectedIssue.spent_hours
                          && selectedIssue.total_spent_hours >= 0
                        ) && (
                          <span>
                            {' '}
                            (Total:
                            {selectedIssue.total_spent_hours.toFixed(2)}
                            {' '}
                            h)
                          </span>
                        )
                      }
                  </div>
                </li>
                <li>
                  <div>Time cap: </div>
                  <div>
                    <Progressbar
                      className={undefined}
                      id={undefined}
                      height={5}
                      percent={selectedIssue.total_spent_hours / selectedIssue.total_estimated_hours * 100}
                      background={(theme as any).main}
                    />
                  </div>
                </li>
              </ColumnList>
            </Wrapper>
            <FlexWrapper>
              { subtasks && subtasks.length && (
              <ColumnList>
                <h3>Subtasks:</h3>
                <Subtasks>
                  {
                        subtasks.map((subtask: any, i: number) => (
                          <Subtask>
                            <Link
                              href="#"
                              key={i}
                              onClick={() => history.push(`/app/issue/${subtask.id}/`)}
                            >
                              {`#${subtask.id} - ${subtask.subject}`}
                            </Link>
                          </Subtask>
                        ))
                      }
                </Subtasks>
              </ColumnList>
              )}
              {cfields && cfields.length && (
              <ColumnList>
                <h3>Custom Fields:</h3>
                <CustomFields>
                  {cfields.map((el: any, i: number) => (
                    <li key={i}>
                      <div>
                        {el.name}
                        :
                        {' '}
                      </div>
                      <div>{el.value}</div>
                    </li>
                  ))}
                </CustomFields>
              </ColumnList>
              )}
            </FlexWrapper>
            <div>
              <h3>Description</h3>
              <MarkdownText markdownText={selectedIssue.description} />
            </div>
          </IssueDetails>
          <TimeEntries
            showTimeEntryModal={triggerTimeEntryModal}
          />
        </Flex>
        <CommentsSection
          journalEntries={getIssueComments()}
          publishComments={postComments}
          issueId={selectedIssue.id}
        />
        { selectedTimeEntry && (
        <TimeEntryModal
          isOpen={showTimeEntryModal}
          isEditable={(selectedTimeEntry as any).user.id === state.users.currentUser?.id}
          activities={activities}
          isUserAuthor={(selectedTimeEntry as any).user.id === state.users.currentUser?.id}
          timeEntry={selectedTimeEntry}
          onClose={closeTimeEntryModal}
        />
        )}
        {selectedIssue && (
          <IssueModal
            isOpen={showIssueModal}
            isEditable={selectedIssue.assigned_to.id === state.users.currentUser?.id}
            isUserAuthor={selectedIssue.author.id === state.users.currentUser?.id}
            issueEntry={selectedIssue}
            onClose={closeIssueModal}
          />
        )}
      </Section>
    )
    : (
      <OverlayProcessIndicator>
        <span>Please wait...</span>
      </OverlayProcessIndicator>
    );
};

IssueDetailsPage.propTypes = {
  selectedIssueState: PropTypes.shape({
    data: PropTypes.shape({
      children: PropTypes.array,
      created_on: PropTypes.string,
      closed_on: PropTypes.string,
      estimated_hours: PropTypes.number,
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
  fetchIssueDetails: PropTypes.func.isRequired,
  postComments: PropTypes.func.isRequired,
  resetSelectedIssue: PropTypes.func.isRequired,
  match: PropTypes.object,
  projects: PropTypes.object,
  history: PropTypes.object
};

const mapStateToProps = (state: any) => ({
  projects: state.projects.data,
  selectedIssueState: state.issues.selected
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchIssueDetails: (issueId: any) => dispatch(actions.issues.get(issueId)),
  postComments: (issueId: any, comments: any) => dispatch(actions.issues.sendComments(issueId, comments)),
  resetSelectedIssue: () => dispatch(actions.issues.resetSelected())
});

export default connect(mapStateToProps, mapDispatchToProps)(IssueDetailsPage);
