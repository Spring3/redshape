import React, { useCallback, useEffect, useRef } from 'react';
import { css as emotionCss } from '@emotion/react';
import styled, { css, useTheme } from 'styled-components';

import PlusIcon from 'mdi-react/PlusIcon';
import TimerIcon from 'mdi-react/TimerIcon';

import CloseIcon from 'mdi-react/CloseIcon';
import Button from '../Button';
import DateComponent from '../Date';
import { useOvermindActions, useOvermindState } from '../../store';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import { theme as Theme } from '../../theme';
import { TimeTrackingAction } from '../../../types';
import Dialog from '../Dialog';
import { GhostButton } from '../GhostButton';

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 3px;

  h2 {
    display: inline-block;
    margin-left: 15px;
    margin-right: 15px;
  }

  & > div {
    margin-right: 15px;
    padding: 0px 5px;
    border-radius: 3px;

    button {
      background: ${props => props.theme.bg};
      margin: 0px 5px;
    }
  }
`;

const FlexButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  ${props => css`
    background: ${props.theme.mainLight};
  `}
`;

const TimeEntriesContainer = styled.div`
  background: white;
  padding-top: 35px;
  max-height: 550px;
  min-width: 350px;
`;

const TimeEntriesList = styled.ul`
  position: relative;
  list-style-type: none;
  padding: 0px 10px 10px 10px;
  border-radius: 3px;
  margin: 0;
  overflow-y: scroll;
  max-height: 500px;
  background: ${props => props.theme.bgDark};
  box-shadow: inset 0px 0px 10px 0px ${props => props.theme.bgDark};

  li {
    cursor: pointer;
    display: block;
    padding: 10px;
    margin: 10px auto 0px auto;
    border-radius: 3px;
    border: 1px solid ${props => props.theme.bgDarker};
    background: ${props => props.theme.bg};

    div:first-child {
      display: flex;
      align-items: center;
      justify-content: space-between;

      a {
        margin-left: 10px;
        visibility: hidden;
      }

      div {
        flex-grow: 1;
        display: flex;
        justify-content: space-between;
        span.time,
        span.date {
          margin-right: 5px;
          font-size: 12px;
          color: ${props => props.theme.minorText};
        }

        span.username {
          font-weight: bold;
          margin-right: 5px;
          color: ${props => props.theme.normalText};
        }
      }
    }

    p {
      margin-bottom: 0px;
      min-width: 100%;
      width: 0;
      line-height: 2;
    }

    &:hover {
      div:first-child {
        a {
          visibility: visible;
        }
      }
    }
  }
`;

const TimeEntries = ({ issueId }) => {
  const listRef = useRef();

  const state = useOvermindState();
  const actions = useOvermindActions();
  const theme = useTheme();

  const selectedIssue = state.issues.byId[issueId];
  const [lastRecord] = state.timeTracking.records.slice(-1);
  const isTimerEnabled = lastRecord?.action !== TimeTrackingAction.STOP;
  const trackedIssueId = lastRecord?.issueId;

  const requestTimeEntries = useCallback(
    params => actions.timeEntries.getManyTimeEntries({
      filters: {
        issueId: selectedIssue.id,
        projectId: selectedIssue.project.id,
        ...params.filters
      },
      limit: params.limit,
      offset: params.offset
    }),
    [selectedIssue]
  );

  const { items: timeEntries } = usePaginatedFetch({
    containerRef: listRef,
    request: requestTimeEntries
  });

  // openModal = (timeEntry) => () => {
  //   const { showTimeEntryModal } = this.props;
  //   showTimeEntryModal(timeEntry);
  // }

  const startTimeTracking = () => {
    actions.timeTracking.track({ issueId });
  };

  return (
    <TimeEntriesContainer>
      <HeaderContainer>
        <h2 className="padded">Time spent</h2>
        <div>
          <FlexButton
            id="openModal"
            onClick={() => {
              /* openModal */
            }}
          >
            <PlusIcon size={22} />
            <span>&nbsp;Add</span>
          </FlexButton>
          <FlexButton
            id="track"
            disabled={isTimerEnabled || trackedIssueId === selectedIssue.id}
            onClick={startTimeTracking}
          >
            <TimerIcon size={22} />
            <span>&nbsp;Track</span>
          </FlexButton>
        </div>
      </HeaderContainer>
      <TimeEntriesList ref={listRef} data-testId="time-entries">
        {timeEntries.map(timeEntry => (
          // eslint-disable-next-line
          <li
            key={timeEntry.id}
            onClick={() => { /* openModal(timeEntry) */ }}
            data-testId="time-entry"
          >
            <div>
              <div>
                <span className="username">{timeEntry.user.name}</span>
                <span className="time">
                  {timeEntry.hours}
                  {' '}
                  hours
                </span>
                <DateComponent className="date" date={timeEntry.spent_on} />
              </div>
              {
                    state.users.currentUser.id === timeEntry.user.id && (
                      <Dialog onConfirm={() => actions.timeEntries.removeTimeEntry({ id: timeEntry.id })} title="Please Confirm" message="Are you sure you want to delete this time entry?">
                        {
                          (requestConfirmation) => (
                            <GhostButton
                              id="confirmDeletion"
                              onClick={requestConfirmation}
                            >
                              <CloseIcon color={theme.normalText} />
                            </GhostButton>
                          )
                        }
                      </Dialog>
                    )
                  }
            </div>
            <p>{timeEntry.comments}</p>
          </li>
        ))}
      </TimeEntriesList>
    </TimeEntriesContainer>
  );
};
export {
  TimeEntries
};
