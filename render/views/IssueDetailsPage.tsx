import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { useTheme } from 'styled-components';
import { css } from '@emotion/react';
import * as Tabs from '@radix-ui/react-tabs';
import CommentsTextOutlineIcon from 'mdi-react/CommentsTextOutlineIcon';
import ClockOutlineIcon from 'mdi-react/ClockOutlineIcon';
import PlusIcon from 'mdi-react/PlusIcon';

import { Link } from '../components/Link';
import { Progressbar } from '../components/Progressbar';
import { MarkdownText } from '../components/MarkdownEditor';
import { TimeEntryModal } from '../components/TimeEntryModal';
import { CommentsSection } from '../components/IssueDetailsPage/CommentsSection';
import { DateComponent } from '../components/Date';
import { OverlayProcessIndicator } from '../components/ProcessIndicator';
import { tabsHeaderList, tabsTrigger, tabsTriggerActive } from '../components/Tabs';

import { useOvermindActions, useOvermindState } from '../store';
import { useNavbar } from '../contexts/NavbarContext';
import { Flex } from '../components/Flex';
import { TimeEntriesSection } from '../components/TimeEntriesSection';
import { GhostButton } from '../components/GhostButton';
import { useModalContext } from '../contexts/ModalContext';

const styles = {
  subTask: css`
    padding: 10px 5px;
    margin-right: 1rem;
    margin-bottom: 0.75rem;
    background: lightgrey;
    border-radius: 3px;
  `,
  pageWrapper: css`
    padding: 1rem 3rem;
    margin: 2rem auto;
  `,
  sidebar: css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    min-width: 30%;
  `,
  sidebarSection: css`
    padding: 1.5rem 2rem;
    border-radius: 3px;
    border: solid 1px lightgrey;
  `,
  sidebarSectionHeader: css`
    margin-top: 10px;
    margin-bottom: 10px;
  `
};

const IssueDetailsPage = () => {
  const [selectedTimeEntry, setSelectedTimeEntry] = useState();
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('comments');

  const modalContext = useModalContext();
  const navbar = useNavbar();
  const state = useOvermindState();
  const actions = useOvermindActions();
  const theme = useTheme();
  const { id: issueId } = useParams();
  const navigate = useNavigate();

  const projects = state.projects.list;
  const currentIssue = state.issues.byId[issueId as string];

  useEffect(() => {
    if (issueId) {
      actions.issues.getOne({ id: +issueId });
      actions.enumerations.fetchActivities();
    }
  }, [issueId]);

  useEffect(() => {
    if (currentIssue) {
      navbar.setTitle(`#${currentIssue.id} ${currentIssue.subject}`);
    }
  }, [currentIssue, navbar]);

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
    setSelectedTimeEntry(newSelectedTimeEntry);
    setShowTimeEntryModal(true);
  };

  const closeTimeEntryModal = () => {
    setSelectedTimeEntry(undefined);
    setShowTimeEntryModal(false);
  };

  const createTimeEntry = async () => {
    const { timeEntryData } = await modalContext.openTimeEntryCreationModal({ activities: state.enumerations.activities });
    console.log('timeEntryData', timeEntryData);
  };

  const cfields = currentIssue.customFields;
  // eslint-disable-next-line react/prop-types
  const subtasks = currentIssue.subTasks || [];
  const activities = state.enumerations.activities;

  if (!currentIssue.id) {
    return (
      <OverlayProcessIndicator>
        <span>Please wait...</span>
      </OverlayProcessIndicator>
    );
  }

  return (
    <div
      css={styles.pageWrapper}
    >
      <Flex justifyContent="space-between">
        <Flex
          css={css`
            margin-right: 2rem;
          `}
          grow="1"
          direction="column"
        >
          <h3>Description</h3>
          <MarkdownText name="description" markdownText={currentIssue.description} />
          {subtasks && subtasks.length ? (
            <>
              <h3>Subtasks:</h3>
              <Flex direction="column">
                {subtasks.map((subtask: any, i: number) => (
                  <div key={subtask.id} css={styles.subTask}>
                    <Link href="#" key={i} onClick={() => navigate(`../${subtask.id}`)}>
                      {`#${subtask.id} - ${subtask.subject}`}
                    </Link>
                  </div>
                ))}
              </Flex>
            </>
          ) : null}
          <Tabs.Root css={tabsHeaderList} value={activeTab} orientation='horizontal' onValueChange={setActiveTab}>
            <Tabs.List aria-label='tabs'>
              <Tabs.Trigger css={activeTab === 'comments' ? [tabsTrigger, tabsTriggerActive] : [tabsTrigger]} value="comments">
                <Flex alignItems='center'>
                  <CommentsTextOutlineIcon size={20} />
                  Comments
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger css={activeTab === 'time entries' ? [tabsTrigger, tabsTriggerActive] : [tabsTrigger]} value="time entries">
                <Flex alignItems='center'>
                  <ClockOutlineIcon size={20} />
                  Time Entries
                  {' '}
                  <GhostButton onClick={createTimeEntry}>
                    <PlusIcon size={20} />
                  </GhostButton>
                </Flex>
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="comments">
              <CommentsSection
                issueId={currentIssue.id}
              />
            </Tabs.Content>
            <Tabs.Content value="time entries">
              <TimeEntriesSection
                issueId={currentIssue.id}
              />
            </Tabs.Content>
          </Tabs.Root>
        </Flex>
        <aside
          css={styles.sidebar}
        >
          <Flex
            css={styles.sidebarSection}
            direction="column"
          >
            <Flex alignItems="center">
              <h4 css={styles.sidebarSectionHeader}>Tracker: </h4>
              <span>{currentIssue.tracker.name}</span>
            </Flex>
            <Flex alignItems="center">
              <h4 css={styles.sidebarSectionHeader}>Assignee: </h4>
              <span>{currentIssue.assignee.name}</span>
            </Flex>
            <Flex alignItems="center">
              <h4 css={styles.sidebarSectionHeader}>Status:</h4>
              <span>{currentIssue.status.name}</span>
            </Flex>
            <Flex alignItems="center">
              <h4 css={styles.sidebarSectionHeader}>Priority: </h4>
              <span>{currentIssue.priority.name}</span>
            </Flex>
            <Flex alignItems="center">
              <h4 css={styles.sidebarSectionHeader}>Due date: </h4>
              <DateComponent date={currentIssue.dueDate} />
            </Flex>
            <Flex alignItems="center">
              <h4 css={styles.sidebarSectionHeader}>Project: </h4>
              <span>{_.get(currentIssue, 'project.name')}</span>
            </Flex>
            <Flex>
              <h4 css={styles.sidebarSectionHeader}>Target version: </h4>
              <span>{_.get(currentIssue, 'fixed_version.name')}</span>
            </Flex>
            <Flex alignItems="center">
              <h4 css={styles.sidebarSectionHeader}>Start date: </h4>
              <DateComponent date={currentIssue.startDate} />
            </Flex>
            <Flex alignItems="center">
              <h4 css={styles.sidebarSectionHeader}>Estimation: </h4>
              <span>
                {currentIssue.estimatedHours
                  ? `${currentIssue.estimatedHours.toFixed(2)} h`
                  : undefined}
                {currentIssue.totalEstimatedHours
                  && currentIssue.totalEstimatedHours !== currentIssue.estimatedHours
                  && currentIssue.totalEstimatedHours >= 0 && (
                    <span>
                      {' '}
                      (Total:
                      {currentIssue.totalEstimatedHours.toFixed(2)}
                      {' '}
                      h)
                    </span>
                )}
              </span>
            </Flex>
            <Flex alignItems="center">
              <h4 css={styles.sidebarSectionHeader}>Time spent: </h4>
              <span>
                {currentIssue.spentHours ? `${currentIssue.spentHours.toFixed(2)} h` : undefined}
                {currentIssue.totalSpentHours
                  && currentIssue.totalSpentHours !== currentIssue.spentHours
                  && currentIssue.totalSpentHours >= 0 && (
                    <span>
                      {' '}
                      (Total:
                      {currentIssue.totalSpentHours.toFixed(2)}
                      {' '}
                      h)
                    </span>
                )}
              </span>
            </Flex>
            <Flex alignItems="center">
              <h4 css={styles.sidebarSectionHeader}>Time cap: </h4>
              <Progressbar
                className={undefined}
                id={undefined}
                height={5}
                percent={
                  currentIssue.totalSpentHours && currentIssue.totalEstimatedHours
                    ? (currentIssue.totalSpentHours / currentIssue.totalEstimatedHours) * 100
                    : 0
                }
                background={(theme as any).main}
              />
            </Flex>
            {cfields && cfields.length && (
              <>
                <h3>Custom Fields:</h3>
                <Flex direction="column">
                  {cfields.map((el: any, i: number) => (
                    <Flex alignItems="center">
                      <h4 css={styles.sidebarSectionHeader}>
                        {el.name}
                        :
                        {' '}
                      </h4>
                      <span>{el.value}</span>
                    </Flex>
                  ))}
                </Flex>
              </>
            )}
          </Flex>
          <Flex direction="column">
            <p css={css`
              font-size: 12px;
              margin-top: 0px;
              color: ${theme.minorText};
            
              a {
                font-size: inherit !important;
                margin-right: 5px;
              }
            `}
            >
              Created on:&nbsp;
              <DateComponent date={currentIssue.createdOn} />
              &nbsp;by&nbsp;
              <Link href="#">{currentIssue.author.name}</Link>
            </p>
            {currentIssue.closedOn && (
              <p css={css`
                font-size: 12px;
                margin-top: 0px;
                color: ${theme.minorText};
              
                a {
                  font-size: inherit !important;
                  margin-right: 5px;
                }
              `}
              >
                Closed on:&nbsp;
                <DateComponent date={currentIssue.closedOn} />
              </p>
            )}
            <Flex alignItems="center">
              <h4 css={styles.sidebarSectionHeader}>Progress:</h4>
              <Progressbar
                className={undefined}
                percent={currentIssue.doneRatio}
              />
            </Flex>
          </Flex>
        </aside>
        {/* <TimeEntries issueId={currentIssue.id} showTimeEntryModal={triggerTimeEntryModal} /> */}
      </Flex>
      {selectedTimeEntry && (
        <TimeEntryModal
          isOpen={showTimeEntryModal}
          activities={activities}
          isUserAuthor={(selectedTimeEntry as any).user.id === state.users.currentUser?.id}
          timeEntry={selectedTimeEntry}
          onClose={closeTimeEntryModal}
        />
      )}
    </div>
  );
};

export {
  IssueDetailsPage
};
