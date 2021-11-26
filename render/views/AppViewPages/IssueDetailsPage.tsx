import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
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
  postComments
}: any) => {
  const [activities, setActivities] = useState([]);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState();
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  const state = useOvermindState();
  const actions = useOvermindActions();
  const theme = useTheme();
  const { id: issueId } = useParams();
  const navigate = useNavigate();

  const projects = state.projects.list;

  useEffect(() => {
    if (issueId) {
      actions.tickets.getOne({ id: issueId });
    }
  }, [issueId]);

  const currentTicket = state.tickets.byId[issueId as string];

  const triggerTimeEntryModal = (timeEntry: any) => {
    const newSelectedTimeEntry = timeEntry || {
      user: {
        id: state.users.currentUser?.id,
        name: `${state.users.currentUser?.firstName} ${state.users.currentUser?.lastName}`
      },
      issue: {
        id: currentTicket.id
      },
      activity: {},
      project: {
        id: currentTicket.project.id,
        name: currentTicket.project.name
      },
      hours: undefined,
      duration: '',
      spent_on: moment().format('YYYY-MM-DD')
    };
    newSelectedTimeEntry.issue.name = currentTicket.subject;
    const existingActivities = _.get(projects[currentTicket.project.id], 'activities', []);
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

  const getIssueComments = () => currentTicket.journals?.filter((entry: any) => entry.notes) ?? [];

  const cfields = currentTicket.customFields;
  // eslint-disable-next-line react/prop-types
  const subtasks = currentTicket.subTasks || [];
  return currentTicket.id
    ? (
      <Section>
        <Flex>
          <IssueDetails>
            <Buttons className="buttons">
              { /* eslint-disable-next-line react/jsx-no-bind */ }
              <BackButton onClick={() => navigate('..')}>
                <ArrowLeftIcon size={30} />
              </BackButton>
            </Buttons>
            <h2>
              <span>
                #
                {currentTicket.id}
&nbsp;
              </span>
              <span>{currentTicket.subject}</span>
              <IconButton onClick={openIssueModal}>
                <EditIcon size={20} style={{ marginLeft: '.5rem', verticalAlign: 'bottom' }} />
              </IconButton>
            </h2>
            <SmallNotice>
              Created by&nbsp;
              <Link href="#">{currentTicket.author.name}</Link>
              <DateComponent date={currentTicket.createdOn} />
            </SmallNotice>
            {currentTicket.createdOn && (
            <SmallNotice>
              Closed
              <DateComponent date={currentTicket.createdOn} />
            </SmallNotice>
            )}
            <Wrapper>
              <ColumnList>
                <li>
                  <div>Tracker: </div>
                  <div>{currentTicket.tracker.name}</div>
                </li>
                <li>
                  <div>Status:</div>
                  <div>{currentTicket.status.name}</div>
                </li>
                <li>
                  <div>Priority: </div>
                  <div>{currentTicket.priority.name}</div>
                </li>
                <li>
                  <div>Assignee: </div>
                  <div>{currentTicket.assignee.name}</div>
                </li>
                <li>
                  <div>Project: </div>
                  <div>{_.get(currentTicket, 'project.name')}</div>
                </li>
                <li>
                  <div>Progress: </div>
                  <div>
                    <Progressbar
                      className={undefined}
                      id={undefined}
                      height={5}
                      percent={currentTicket.doneRatio}
                      background={(theme as any).main}
                    />
                  </div>
                </li>
              </ColumnList>
              <ColumnList>
                <li>
                  <div>Target version: </div>
                  <div>{_.get(currentTicket, 'fixed_version.name')}</div>
                </li>
                <li>
                  <div>Start date: </div>
                  <DateComponent date={currentTicket.startDate} />
                </li>
                <li>
                  <div>Due date: </div>
                  <DateComponent date={currentTicket.dueDate} />
                </li>
                <li>
                  <div>Estimation: </div>
                  <div>
                    {
                        currentTicket.estimatedHours
                          ? `${currentTicket.estimatedHours.toFixed(2)} h`
                          : undefined
                      }
                    {
                        (
                          currentTicket.totalEstimatedHours && currentTicket.totalEstimatedHours !== currentTicket.estimatedHours
                          && currentTicket.totalEstimatedHours >= 0
                        ) && (
                          <span>
                            {' '}
                            (Total:
                            {currentTicket.totalEstimatedHours.toFixed(2)}
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
                    {currentTicket.spentHours ? `${currentTicket.spentHours.toFixed(2)} h` : undefined}
                    {
                        (
                          currentTicket.totalSpentHours && currentTicket.totalSpentHours !== currentTicket.spentHours
                          && currentTicket.totalSpentHours >= 0
                        ) && (
                          <span>
                            {' '}
                            (Total:
                            {currentTicket.totalSpentHours.toFixed(2)}
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
                      percent={currentTicket.totalSpentHours && currentTicket.totalEstimatedHours ? currentTicket.totalSpentHours / currentTicket.totalEstimatedHours * 100 : 0}
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
                              onClick={() => navigate(`../${subtask.id}`)}
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
              <MarkdownText markdownText={currentTicket.description} />
            </div>
          </IssueDetails>
          <TimeEntries
            showTimeEntryModal={triggerTimeEntryModal}
          />
        </Flex>
        <CommentsSection
          journalEntries={getIssueComments()}
          publishComments={postComments}
          issueId={currentTicket.id}
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
        {currentTicket && (
          <IssueModal
            isOpen={showIssueModal}
            isEditable={currentTicket.assignee.id === state.users.currentUser?.id}
            isUserAuthor={currentTicket.author.id === state.users.currentUser?.id}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            issueEntry={currentTicket}
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
};

const mapDispatchToProps = (dispatch: any) => ({
  postComments: (issueId: any, comments: any) => dispatch(reduxActions.issues.sendComments(issueId, comments)),
});

export default connect(() => ({}), mapDispatchToProps)(IssueDetailsPage);
