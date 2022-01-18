import React, { useState, useEffect, ChangeEvent } from 'react';
import styled, { useTheme } from 'styled-components';
import Joi from '@hapi/joi';

import ClockIcon from 'mdi-react/ClockIcon';
import RawSlider from 'rc-slider';
import { Input } from './Input';
import { FormField } from './FormField';
import Button from './Button';
import { ErrorMessage } from './ErrorMessage';
import { Modal } from './Modal';
import Tooltip from './Tooltip';
import DatePicker from './DatePicker';
import { theme as Theme } from '../theme';

import 'rc-slider/assets/index.css';
import './styles/rc-slider.css';

import { durationToHours, hoursToDuration } from '../datetime';
import { useOvermindState } from '../store';
import { validateIssue } from '../validations';
import { Issue } from '../../types';

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Slider = RawSlider;

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
const FieldAdjacentInfo = styled.div`
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

type IssueModalProps = {
  isOpen?: boolean;
  isEditable?: boolean;
  issueId: number;
  onConfirm: (issue: Issue) => void;
  onClose: () => void;
}

const IssueModal = ({
  isOpen, isEditable, issueId, onConfirm, onClose
}: IssueModalProps) => {
  const state = useOvermindState();
  const [updates, setUpdates] = useState({});
  const [error, setError] = useState<Joi.ValidationError>();

  const currentIssue = state.issues.byId[issueId];

  const wasModified = Object.keys(updates).length;

  const isCurrentUserIssueAuthor = currentIssue.author.id === state.users.currentUser?.id;
  const estimatedDuration = hoursToDuration(currentIssue.estimatedHours);
  const theme = useTheme() as typeof Theme;

  useEffect(() => {
    setUpdates({});
    setError(undefined);
  }, [isOpen]);

  const runValidation = (checkFields: string[]) => {
    validateIssue({ issue: { ...currentIssue, ...updates }, checkFields });
  };

  const onUpdate = () => {
    if (wasModified) {
      onConfirm({ ...currentIssue, ...updates });
    } else {
      onClose();
    }
  };

  const onDueDateChange = (date: Date) => {
    setUpdates({
      ...updates,
      dueDate: date != null ? date.toISOString().split('T')[0] : null
    });
  };

  const onProgressChange = (progress: number) => {
    setUpdates({
      ...updates,
      progress
    });
  };

  const onEstimatedDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const duration = `${value}`;
    setUpdates({
      ...updates,
      estimatedDuration: duration.replace(',', '.')
    });
  };

  const getErrorMessage = (validationError?: Joi.ValidationErrorItem) => {
    if (!validationError) return null;

    return validationError.message.replace(
      new RegExp(validationError.context?.key as string, 'g'),
      validationError.path[0] as string
    );
  };

  let validationErrors: Partial<Record<'progress' | 'estimatedDuration' | 'dueDate', Joi.ValidationErrorItem | undefined>> = {};

  if (error?.isJoi) {
    validationErrors = {
      progress: error.details.find(errorDetails => errorDetails.path[0] === 'progress'),
      estimatedDuration: error.details.find(
        errorDetails => errorDetails.path[0] === 'estimatedDuration'
      ),
      dueDate: error.details.find(errorDetails => errorDetails.path[0] === 'dueDate')
    };
  }

  let estimatedDurationInfo = '';
  if (estimatedDuration) {
    const hours = durationToHours(estimatedDuration) as number;
    if (hours > 0) {
      estimatedDurationInfo = `${Number(hours.toFixed(2))} hours`;
    }
  }
  const progressInfo = `${currentIssue.doneRatio.toFixed(0)}%`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeIcon>
      <FormField htmlFor="assignee" label="Assignee">
        <div id="assignee">{currentIssue.assignee.name}</div>
      </FormField>
      <FormField htmlFor="issue" label="Issue">
        <div id="issue">
          #
          {currentIssue.id}
          {currentIssue.subject}
        </div>
      </FormField>
      <FlexRow>
        <DurationField>
          <FormField htmlFor="estimated_duration" label="Estimation">
            <FlexRow>
              <Input
                type="text"
                id="estimatedDuration"
                value={estimatedDuration}
                onBlur={() => runValidation(['estimatedDuration'])}
                disabled={!isEditable || !isCurrentUserIssueAuthor}
                onChange={onEstimatedDurationChange}
              />
              <FieldAdjacentInfo>{estimatedDurationInfo}</FieldAdjacentInfo>
            </FlexRow>
            <LabelIcon>
              <Tooltip text="hours (3.23) or durations (3h 14m, 194 mins)">
                <ClockIconStyled size={14} />
              </Tooltip>
            </LabelIcon>
          </FormField>
          <ErrorMessage show={!!validationErrors.estimatedDuration}>
            {getErrorMessage(validationErrors.estimatedDuration)}
          </ErrorMessage>
        </DurationField>
        {!currentIssue.subTasks && (
          <div>
            <FormField htmlFor="due_date" label="Due date">
              <DatePicker
                key={currentIssue.id}
                id="dueDate"
                value={currentIssue.dueDate}
                isDisabled={!isEditable || !isCurrentUserIssueAuthor}
                onChange={(value: Date) => {
                  onDueDateChange(value);
                  runValidation(['dueDate']);
                }}
              />
            </FormField>
            <ErrorMessage show={!!validationErrors.dueDate}>
              {getErrorMessage(validationErrors.dueDate)}
            </ErrorMessage>
          </div>
        )}
      </FlexRow>
      {!currentIssue.subTasks && (
        <FlexRow>
          <div>
            <FormField htmlFor="progress" label="Progress">
              <FlexRow>
                <Slider
                  style={{ width: 180 }}
                  // bugfix: avoid sloppy dragging (value/onChange) using this key
                  key={currentIssue.id}
                  handleStyle={{ borderColor: theme.green }}
                  onChange={value => setUpdates({ ...updates, doneRatio: value })}
                  trackStyle={{ backgroundColor: theme.green }}
                  min={0}
                  max={100}
                  step={10}
                  defaultValue={currentIssue.doneRatio}
                  disabled={!isEditable || !isCurrentUserIssueAuthor}
                  onAfterChange={(value: number) => {
                    onProgressChange(value);
                    runValidation(['progress']);
                  }}
                />
                <FieldAdjacentInfo>{progressInfo}</FieldAdjacentInfo>
              </FlexRow>
            </FormField>
            <ErrorMessage show={!!validationErrors.progress}>
              {getErrorMessage(validationErrors.progress)}
            </ErrorMessage>
          </div>
        </FlexRow>
      )}
      <OptionButtons>
        <Button id="btn-update" onClick={onUpdate} palette="success">
          Submit
        </Button>
      </OptionButtons>
    </Modal>
  );
};

export {
  IssueModal
};
