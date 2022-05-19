import React, { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from 'styled-components';
import { css } from '@emotion/react';
import * as Tabs from '@radix-ui/react-tabs';
import CommentsTextOutlineIcon from 'mdi-react/CommentsTextOutlineIcon';
import ClockOutlineIcon from 'mdi-react/ClockOutlineIcon';
import PlayIcon from 'mdi-react/PlayIcon';
import StopIcon from 'mdi-react/StopIcon';
import PlusIcon from 'mdi-react/PlusIcon';
import PauseIcon from 'mdi-react/PauseIcon';

import ReactTimeAgo from 'react-time-ago';
import { Link } from '../components/Link';
import { Progressbar } from '../components/Progressbar';
import { MarkdownText } from '../components/MarkdownEditor';
import { CommentsSection } from '../components/IssueDetailsPage/CommentsSection';
import { OverlayProcessIndicator } from '../components/ProcessIndicator';
import { tabsHeaderList, tabsTrigger, tabsTriggerActive } from '../components/Tabs';

import { useOvermindActions, useOvermindState } from '../store';
import { useNavbar } from '../contexts/NavbarContext';
import { Flex } from '../components/Flex';
import { TimeEntriesSection } from '../components/TimeEntriesSection';
import { GhostButton } from '../components/GhostButton';
import { TimeEntry, User } from '../../types';
import { useModalContext } from '../contexts/ModalContext';
import { Button } from '../components/Button';
import { useTimeTracking } from '../contexts/TimerContext';
import { toTimerFormat } from '../helpers/utils';
import { ButtonGroup } from '../components/ButtonGroup';

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
  const [activeTab, setActiveTab] = useState<string>('comments');

  const navbar = useNavbar();
  const state = useOvermindState();
  const actions = useOvermindActions();
  const theme = useTheme();
  const { id: issueId } = useParams();
  const navigate = useNavigate();
  const modals = useModalContext();

  const timeTrackingContext = useTimeTracking();

  console.log(timeTrackingContext);

  const currentIssue = state.issues.byId[issueId as string];
  const cfields = currentIssue.customFields;
  const subtasks = currentIssue.subTasks || [];
  const activities = state.enumerations.activities;
  const user = state.users.currentUser as User;
  const project = state.projects.byId[currentIssue.project.id];

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

  const handleCreateTimeEntry = useCallback(async () => {
    const { timeEntryData, confirmed } = await modals.openCreateTimeEntryModal({ activities });

    if (confirmed && timeEntryData) {
      await actions.timeEntries.create({
        activity: {
          id: timeEntryData.activity.id,
          name: timeEntryData.activity.name
        },
        issue: {
          id: currentIssue.id
        },
        comments: timeEntryData.comments || '',
        spentOn: timeEntryData.spentOn,
        hours: timeEntryData.hours,
        project: {
          id: project.id,
          name: project.name
        },
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`
        }
      });
    }
  }, [user, currentIssue, project, modals.openCreateTimeEntryModal, activities]);

  const handleUpdateTimeEntry = useCallback(
    async (timeEntry: TimeEntry) => {
      const { timeEntryData, confirmed } = await modals.openUpdateTimeEntryModal({
        activities,
        timeEntry
      });

      if (confirmed && timeEntryData) {
        await actions.timeEntries.update({
          ...timeEntry,
          activity: {
            id: timeEntryData.activity.id,
            name: timeEntryData.activity.name
          },
          issue: {
            id: currentIssue.id
          },
          comments: timeEntryData.comments || '',
          spentOn: timeEntryData.spentOn,
          hours: timeEntryData.hours,
          project: {
            id: project.id,
            name: project.name
          },
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`
          }
        });
      }
    },
    [user, currentIssue, project, actions.timeEntries.update, activities]
  );

  if (!currentIssue.id) {
    return (
      <OverlayProcessIndicator>
        <span>Please wait...</span>
      </OverlayProcessIndicator>
    );
  }

  return (
    <div css={styles.pageWrapper}>
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
          <Tabs.Root
            css={tabsHeaderList}
            value={activeTab}
            orientation="horizontal"
            onValueChange={setActiveTab}
          >
            <Tabs.List aria-label="tabs">
              <Tabs.Trigger
                css={activeTab === 'comments' ? [tabsTrigger, tabsTriggerActive] : [tabsTrigger]}
                value="comments"
              >
                <Flex alignItems="center">
                  <CommentsTextOutlineIcon size={20} />
                  Comments
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger
                css={
                  activeTab === 'time entries' ? [tabsTrigger, tabsTriggerActive] : [tabsTrigger]
                }
                value="time entries"
              >
                <Flex alignItems="center">
                  <ClockOutlineIcon size={20} />
                  Time Entries
                  {' '}
                  <GhostButton onClick={handleCreateTimeEntry}>
                    <PlusIcon size={20} />
                  </GhostButton>
                </Flex>
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="comments">
              <CommentsSection issueId={currentIssue.id} />
            </Tabs.Content>
            <Tabs.Content value="time entries">
              <TimeEntriesSection
                issueId={currentIssue.id}
                timeEntries={state.timeEntries.listByIssueId[currentIssue.id] || []}
                onTimeEntryUpdate={handleUpdateTimeEntry}
              />
            </Tabs.Content>
          </Tabs.Root>
        </Flex>
        <aside css={styles.sidebar}>
          <Flex
            css={css`
              margin-bottom: 1rem;
            `}
            alignItems="center"
            justifyContent="center"
          >
            <h3
              css={css`
                margin-right: 1rem;
              `}
            >
              Time spent:
            </h3>
            <ButtonGroup label={toTimerFormat(timeTrackingContext.trackedTimeMs)}>
              {(timeTrackingContext.isPaused || timeTrackingContext.isStopped) && (
                <Button
                  onClick={() => {
                    if (timeTrackingContext.isStopped) {
                      timeTrackingContext.track(currentIssue.id);
                    } else if (timeTrackingContext.isTracking) {
                      timeTrackingContext.stop();
                    } else if (timeTrackingContext.isPaused) {
                      timeTrackingContext.unpause();
                    }
                  }}
                >
                  <PlayIcon />
                </Button>
              )}
              {(timeTrackingContext.isTracking) && (
                <Button
                  onClick={() => {
                    timeTrackingContext.pause();
                  }}
                >
                  <PauseIcon />
                </Button>
              )}
              {!timeTrackingContext.isStopped && (
                <Button onClick={() => timeTrackingContext.stop()}>
                  <StopIcon />
                </Button>
              )}
            </ButtonGroup>
          </Flex>
          <Flex css={styles.sidebarSection} direction="column">
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
              {currentIssue.dueDate ? <ReactTimeAgo date={new Date(currentIssue.dueDate)} /> : null}
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
              {currentIssue.startDate ? (
                <ReactTimeAgo date={new Date(currentIssue.startDate)} />
              ) : null}
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
            <p
              css={css`
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
              <ReactTimeAgo date={new Date(currentIssue.createdOn)} />
              &nbsp;by&nbsp;
              <Link href="#">{currentIssue.author.name}</Link>
            </p>
            {currentIssue.closedOn && (
              <p
                css={css`
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
                <ReactTimeAgo date={new Date(currentIssue.closedOn)} />
              </p>
            )}
            <Flex alignItems="center">
              <h4 css={styles.sidebarSectionHeader}>Progress:</h4>
              <Progressbar className={undefined} percent={currentIssue.doneRatio} />
            </Flex>
          </Flex>
        </aside>
      </Flex>
    </div>
  );
};

export { IssueDetailsPage };
