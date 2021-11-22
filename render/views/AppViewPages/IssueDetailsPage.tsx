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

import { GhostButton } from '../../components/GhostButton';

import reduxActions from '../../actions';
import { useOvermindActions, useOvermindState } from '../../store';

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
  match, history, postComments
}: any) => {
  const [activities, setActivities] = useState([]);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState();
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  const state = useOvermindState();
  const actions = useOvermindActions();
  const theme = useTheme();
  const issueId = match.params.id;
  const projects = state.projects.list;

  useEffect(() => {
    actions.issues.getOne({ id: issueId });
  }, [issueId]);

  const currentIssue = state.issues.byId[issueId];

  const triggerTimeEntryModal = (timeEntry: any) => {
    const newSelectedTimeEntry = timeEntry || {
      user: {
        id: state.users.currentUser?.id,
        name: `${state.users.currentUser?.firstName} ${state.users.currentUser?.lastName}`
      },
      issue: {
        id: currentIssue.id
      },
      activity: {},
      project: {
        id: currentIssue.project.id,
        name: currentIssue.project.name
      },
      hours: undefined,
      duration: '',
      spent_on: moment().format('YYYY-MM-DD')
    };
    newSelectedTimeEntry.issue.name = currentIssue.subject;
    const existingActivities = _.get(projects[currentIssue.project.id], 'activities', []);
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

  const getIssueComments = () => currentIssue.journals?.filter((entry: any) => entry.notes);

  const cfields = currentIssue.customFields;
  // eslint-disable-next-line react/prop-types
  const subtasks = currentIssue.subTasks || [];
  return currentIssue.id
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
                {currentIssue.id}
&nbsp;
              </span>
              <span>{currentIssue.subject}</span>
              <IconButton onClick={openIssueModal}>
                <EditIcon size={20} style={{ marginLeft: '.5rem', verticalAlign: 'bottom' }} />
              </IconButton>
            </h2>
            <SmallNotice>
              Created by&nbsp;
              <Link href="#">{currentIssue.author.name}</Link>
              <DateComponent date={currentIssue.createdOn} />
            </SmallNotice>
            {currentIssue.createdOn && (
            <SmallNotice>
              Closed
              <DateComponent date={currentIssue.createdOn} />
            </SmallNotice>
            )}
            <Wrapper>
              <ColumnList>
                <li>
                  <div>Tracker: </div>
                  <div>{currentIssue.tracker.name}</div>
                </li>
                <li>
                  <div>Status:</div>
                  <div>{currentIssue.status.name}</div>
                </li>
                <li>
                  <div>Priority: </div>
                  <div>{currentIssue.priority.name}</div>
                </li>
                <li>
                  <div>Assignee: </div>
                  <div>{currentIssue.assignee.name}</div>
                </li>
                <li>
                  <div>Project: </div>
                  <div>{_.get(currentIssue, 'project.name')}</div>
                </li>
                <li>
                  <div>Progress: </div>
                  <div>
                    <Progressbar
                      className={undefined}
                      id={undefined}
                      height={5}
                      percent={currentIssue.doneRatio}
                      background={(theme as any).main}
                    />
                  </div>
                </li>
              </ColumnList>
              <ColumnList>
                <li>
                  <div>Target version: </div>
                  <div>{_.get(currentIssue, 'fixed_version.name')}</div>
                </li>
                <li>
                  <div>Start date: </div>
                  <DateComponent date={currentIssue.startDate} />
                </li>
                <li>
                  <div>Due date: </div>
                  <DateComponent date={currentIssue.dueDate} />
                </li>
                <li>
                  <div>Estimation: </div>
                  <div>
                    {
                        currentIssue.estimatedHours
                          ? `${currentIssue.estimatedHours.toFixed(2)} h`
                          : undefined
                      }
                    {
                        (
                          currentIssue.totalEstimatedHours && currentIssue.totalEstimatedHours !== currentIssue.estimatedHours
                          && currentIssue.totalEstimatedHours >= 0
                        ) && (
                          <span>
                            {' '}
                            (Total:
                            {currentIssue.totalEstimatedHours.toFixed(2)}
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
                    {currentIssue.spentHours ? `${currentIssue.spentHours.toFixed(2)} h` : undefined}
                    {
                        (
                          currentIssue.totalSpentHours && currentIssue.totalSpentHours !== currentIssue.spentHours
                          && currentIssue.totalSpentHours >= 0
                        ) && (
                          <span>
                            {' '}
                            (Total:
                            {currentIssue.totalSpentHours.toFixed(2)}
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
                      percent={currentIssue.totalSpentHours && currentIssue.totalEstimatedHours ? currentIssue.totalSpentHours / currentIssue.totalEstimatedHours * 100 : 0}
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
              <MarkdownText markdownText={currentIssue.description} />
            </div>
          </IssueDetails>
          <TimeEntries
            showTimeEntryModal={triggerTimeEntryModal}
          />
        </Flex>
        <CommentsSection
          journalEntries={getIssueComments()}
          publishComments={postComments}
          issueId={currentIssue.id}
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
        {currentIssue && (
          <IssueModal
            isOpen={showIssueModal}
            isEditable={currentIssue.assignee.id === state.users.currentUser?.id}
            isUserAuthor={currentIssue.author.id === state.users.currentUser?.id}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            issueEntry={currentIssue}
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
  postComments: PropTypes.func.isRequired,
  match: PropTypes.object,
  history: PropTypes.object
};

const mapDispatchToProps = (dispatch: any) => ({
  postComments: (issueId: any, comments: any) => dispatch(reduxActions.issues.sendComments(issueId, comments)),
});

export default connect(() => ({}), mapDispatchToProps)(IssueDetailsPage);
