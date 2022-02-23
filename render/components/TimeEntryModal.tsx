import _debounce from 'lodash/debounce';
import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { css } from '@emotion/react';

import ClockIcon from 'mdi-react/ClockIcon';
import { Input } from './Input';
import { FormField } from './FormField';
import { Button } from './Button';
import { MarkdownEditor } from './MarkdownEditor';
import { ErrorMessage } from './ErrorMessage';
import { DatePicker } from './DatePicker';
import { Modal } from './Modal';
import { ProcessIndicator } from './ProcessIndicator';
import { Tooltip } from './Tooltip';

import { useOvermindActions, useOvermindState } from '../store';
import { TimeEntry } from '../../types';

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const OptionButtons = styled.div`
  position: relative;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid ${props => props.theme.bgDark};
  display: flex;

  button {
    padding: 8px 15px;
  }

  div {
    margin-left: 20px;
  }
`;

const DurationField = styled.div`
  max-width: 350px;
`;
const DurationInfo = styled.div`
  align-self: center;
  color: gray;
  margin-left: 0.5rem;
  min-width: 10rem;
`;

const ClockIconStyled = styled(ClockIcon)`
  padding-bottom: 1px;
`;
const LabelIcon = styled.span`
  margin-left: 0.2rem;
`;
const DurationIcon = (
  <LabelIcon>
    <Tooltip text="hours (3.23) or durations (3h 14m, 194 mins)">
      <ClockIconStyled size={14} />
    </Tooltip>
  </LabelIcon>
);

const styles = {
  processIndicatorText: css`
    white-space: nowrap;
    padding-left: 20px;
    vertical-align: middle;
  `
};

const selectStyles = {
  container: (base: Record<string, any>) => ({ ...base })
};

type TimeEntryModalProps = {
  timeEntry?: TimeEntry | null;
  onClose: () => void;
  isOpen: boolean;
}

const TimeEntryModal = ({
  timeEntry,
  validateBeforePublish,
  validateBeforeUpdate,
  onClose,
  isOpen,
  activities,
}: TimeEntryModalProps) => {
  const [updates, setUpdates] = useState({});

  const wasModified = Object.keys(updates).length;

  const actions = useOvermindActions();
  const state = useOvermindState();

  const theme = useTheme();

  useEffect(() => {
    setUpdates({});
  }, [isOpen]);

  const runValidation = (checkFields: Record<string, any>) => {
    if (timeEntry.id) {
      validateBeforeUpdate(
        {
          comments: timeEntry.comments,
          hours: timeEntry.hours,
          duration: timeEntry.duration,
          spentOn: timeEntry.spent_on,
          activity: timeEntry.activity
        },
        checkFields
      );
    } else {
      validateBeforePublish(
        {
          activity: timeEntry.activity,
          comments: timeEntry.comments,
          hours: timeEntry.hours,
          duration: timeEntry.duration,
          issue: timeEntry.issue,
          spentOn: timeEntry.spent_on
        },
        checkFields
      );
    }
  };

  const onDateChange = (date: Date) => {
    setUpdates({
      ...updates,
      spentOn: date != null ? date.toISOString().split('T')[0] : null
    });
  };

  const onDurationChange = ({ target: { value } }) => {
    const durationValue = `${value}`.replace(',', '.');
    setUpdates({
      ...updates,
      duration: durationValue
    });

    onDurationConversionChange(value);
  };

  const onDurationConversionChange = _debounce((value) => {
    setUpdates({
      ...updates,
      hours: durationToHours(value)
    });
  }, 300);

  const debouncedCommentsChange = _debounce((comments) => {
    setUpdates({
      ...updates,
      comments
    });
  }, 300);

  const onActivityChange = (activity) => {
    setUpdates({
      ...updates,
      activity: { id: activity.value, name: activity.label }
    });
  };

  const onAdd = async () => {
    const response = await actions.timeEntries.publish({
      ...timeEntry,
      ...updates
    });

    if (response.success) {
      onClose();
    }
  };

  const onUpdate = async () => {
    if (wasModified) {
      const response = await actions.timeEntries.update({
        ...timeEntry,
        ...updates
      });

      if (response.success) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getErrorMessage = (error: Error) => {
    if (!error) return null;
    return error.message.replace(new RegExp(error.context.key, 'g'), error.path[0]);
  };

  if (!timeEntry) {
    return null;
  }

  const isUserAuthor = timeEntry.user.id === state.users.currentUser?.id;
  const selectedActivity = { id: timeEntry.activity.id, label: timeEntry.activity.name };
  const validationErrors = timeEntry.error && timeEntry.error.isJoi
    ? {
      comments: timeEntry.error.details.find(error => error.path[0] === 'comments'),
      activity: timeEntry.error.details.find(error => error.path[0] === 'activity'),
      hours: timeEntry.error.details.find(error => error.path[0] === 'hours'),
      duration: timeEntry.error.details.find(error => error.path[0] === 'duration'),
      spentOn: timeEntry.error.details.find(error => error.path[0] === 'spent_on')
    }
    : {};

  let durationInfo = '';
  if (timeEntry.hours > 0) {
    durationInfo = `${Number(timeEntry.hours.toFixed(2))} hours`;
  }
  return (
    <Modal isOpen={!!isOpen} onClose={onClose} closeIcon>
      <>
        <FormField htmlFor="author" label="Author">
          <div name="author">{timeEntry.user.name}</div>
        </FormField>
        <FormField htmlFor="issue" label="Issue">
          <div name="issue" data-testId="time-entry-modal-title">
            #{timeEntry.issue.id}
            {timeEntry.issue.name}
          </div>
        </FormField>
        <FormField htmlFor="activity" label="Activity">
          <Select
            name="activity"
            options={activities}
            styles={selectStyles}
            value={selectedActivity}
            isDisabled={!isUserAuthor}
            onBlur={() => runValidation('activity')}
            onChange={onActivityChange}
            isClearable={false}
            theme={defaultTheme => ({
              ...defaultTheme,
              borderRadius: 3,
              colors: {
                ...defaultTheme.colors,
                primary: theme.main
              }
            })}
          />
        </FormField>
        <ErrorMessage show={!!validationErrors.activity}>
          {getErrorMessage(validationErrors.activity)}
        </ErrorMessage>
        <FlexRow>
          <DurationField>
            <FormField htmlFor="duration" label="Duration" rightOfLabel={DurationIcon}>
              <FlexRow>
                <Input
                  type="text"
                  name="duration"
                  value={timeEntry.duration}
                  onBlur={() => runValidation(['duration', 'hours'])}
                  disabled={!isUserAuthor}
                  onChange={onDurationChange}
                />
                <DurationInfo>{durationInfo}</DurationInfo>
              </FlexRow>
            </FormField>
            <ErrorMessage show={!!validationErrors.duration || validationErrors.hours}>
              {getErrorMessage(validationErrors.duration || validationErrors.hours)}
            </ErrorMessage>
          </DurationField>
          <div>
            <FormField htmlFor="spent_on" label="Date">
              <DatePicker
                name="date"
                value={new Date(timeEntry.spentOn)}
                isDisabled={!isUserAuthor}
                onBlur={() => runValidation('spent_on')}
                onChange={onDateChange}
              />
            </FormField>
            <ErrorMessage show={!!validationErrors.spentOn}>
              {getErrorMessage(validationErrors.spentOn)}
            </ErrorMessage>
          </div>
        </FlexRow>
        <FormField label="Comments" htmlFor="comments">
          <MarkdownEditor
            isDisabled={!isUserAuthor}
            onChange={debouncedCommentsChange}
            onBlur={() => runValidation('comments')}
            initialValue={timeEntry.comments}
            maxLength={255}
          />
        </FormField>
        <ErrorMessage show={!!validationErrors.comments}>
          {getErrorMessage(validationErrors.comments)}
        </ErrorMessage>
        {timeEntry.id ? (
          <OptionButtons>
            <Button id="btn-update" onClick={onUpdate} disabled={timeEntry.isFetching} palette="success">
              Submit
            </Button>
            {timeEntry.isFetching && (
              <ProcessIndicator>
                <span css={styles.processIndicatorText}>Please wait...</span>
              </ProcessIndicator>
            )}
          </OptionButtons>
        ) : (
          <OptionButtons>
            <Button
              id="btn-add"
              disabled={!wasModified || timeEntry.isFetching}
              onClick={onAdd}
              palette="success">
              Submit
            </Button>
            {timeEntry.isFetching && (
              <ProcessIndicator>
                <span css={styles.processIndicatorText}>Please wait...</span>
              </ProcessIndicator>
            )}
          </OptionButtons>
        )}
      </>
    </Modal>
  );
};

export {
  TimeEntryModal
};
