import { css } from '@emotion/react';
import moment from 'moment';
import React from 'react';
import { Formik } from 'formik';
import Joi from '@hapi/joi';
import { Activity } from '../../types';
import { toHours } from '../helpers/utils';
import { Button } from './Button';
import { DatePicker } from './DatePicker';
import { Flex } from './Flex';
import { FormField } from './FormField';
import { Modal } from './Modal';
import { Select } from './Select';
import { TextArea } from './TextArea';
import { TimePicker } from './TimePicker';
import { ErrorMessage } from './ErrorMessage';

export type TimeEntryData = {
  spentOn: string;
  hours: number;
  activity: Activity;
  comments?: string;
}

type TimeEntryDataState = {
  spentOn?: string;
  timeSpent?: { hours?: string, minutes?: string, seconds?: string },
  activityName?: string;
  comments?: string;
}

type CreateTimeEntryModalProps = {
  isOpen: boolean;
  activities: Activity[];
  onCreate: (timeEntryData: TimeEntryData) => Promise<void>;
  onClose: () => void;
}

const styles = {
  vlaidationError: css`
    margin-top: 5px;
  `,
  formField: css`
    display: flex;
    flex-direction: column;
  `
};

const toTime = ({ hours = '', minutes = '', seconds = '' }: { hours?: string, minutes?: string, seconds?: string } = {}) => {
  const hoursInt = parseInt(hours, 10);
  const minutesInt = parseInt(minutes, 10);
  const secondsInt = parseInt(seconds, 10);

  if (Number.isNaN(hoursInt) || Number.isNaN(minutesInt) || Number.isNaN(secondsInt)) {
    return undefined;
  }

  return `${hours}:${minutes}:${seconds}`;
};

const CreateTimeEntryModal = ({
  isOpen, activities, onCreate, onClose
}: CreateTimeEntryModalProps) => {
  const handleCreate = async (formData: TimeEntryDataState) => {
    const activity = formData.activityName ? activities.find((ac) => ac.name === formData.activityName) : activities[0];
    const timeEntryData = {
      activity: activity as Activity,
      spentOn: formData.spentOn as string,
      hours: toHours(formData.timeSpent),
      comments: formData.comments
    };
    await onCreate(timeEntryData);
  };

  if (!isOpen || !activities.length) {
    return null;
  }

  return (
    <Formik<TimeEntryDataState>
      initialValues={{
        activityName: activities[0].name,
        spentOn: moment().format('YYYY-MM-DD')
      }}
      validate={(values) => {
        const timeSpentRegexp = /^\d{0,2}:?\d{0,2}:?\d{0,2}$/;
        const dateTimeRegexp = /^\d{4}-\d{2}-\d{2}$/;
        const formattedTimeSpent = toTime(values.timeSpent);

        const errors = {
          spentOn: Joi.string().trim().pattern(dateTimeRegexp, { name: '"YYYY-MM-DD"' }).label('date')
            .validate(values.spentOn).error?.message,
          timeSpent: Joi.string().trim().required().pattern(timeSpentRegexp, { name: '"hh:mm:ss"' })
            .label('time')
            .validate(formattedTimeSpent).error?.message,
          activityName: Joi.string().trim().required().label('activity')
            .validate(values.activityName).error?.message,
          comments: Joi.string().trim().allow('').label('comments')
            .validate(values.comments).error?.message
        };

        const hasError = Object.values(errors).find(error => typeof error === 'string');

        return hasError ? errors : undefined;
      }}
      onSubmit={(data) => handleCreate(data)}
    >
      {({
        values, handleSubmit, handleBlur, isSubmitting, isValid, errors, submitCount, touched, setFieldValue, handleReset
      }) => (
        <Modal
          id="create-time-entry"
          isOpen={isOpen}
          onClose={() => {
            handleReset();
            onClose();
          }}
          title="Create new time entry"
        >
          <Flex direction='column'>
            <Flex>
              <FormField css={[css`margin-right: 1rem;`, styles.formField]} label="Date" htmlFor='spentOn'>
                <DatePicker onBlur={handleBlur} initialValue={values.spentOn} onChange={(dateTime: string) => setFieldValue('spentOn', dateTime, true)} name="spentOn" />
                <div>
                  <ErrorMessage css={styles.vlaidationError} show={Boolean(errors.spentOn && (touched.spentOn || submitCount))}>
                    {errors.spentOn}
                  </ErrorMessage>
                </div>
              </FormField>
              <FormField css={[css`margin-right: 1rem;`, styles.formField]} label="Time Spent" htmlFor="timeSpent">
                <TimePicker
                  name='timeSpent'
                  onBlur={handleBlur}
                  initialValue={toTime(values.timeSpent)}
                  id="timeSpent"
                  onChange={(data) => {
                    setFieldValue('timeSpent', data, true);
                  }}
                />
                <div>
                  <ErrorMessage css={styles.vlaidationError} show={Boolean(errors.timeSpent && (touched.timeSpent || submitCount))}>
                    {errors.timeSpent}
                  </ErrorMessage>
                </div>
              </FormField>
              <FormField css={styles.formField} label="Activity" htmlFor='activity'>
                <Select
                  onBlur={handleBlur}
                  id='activity'
                  options={activities}
                  initialValue={values.activityName}
                  onChange={(e) => {
                    setFieldValue('activityName', e.name, true);
                  }}
                />
                <div>
                  <ErrorMessage css={styles.vlaidationError} show={Boolean(errors.activityName && (touched.activityName || submitCount))}>
                    {errors.activityName}
                  </ErrorMessage>
                </div>
              </FormField>
            </Flex>
            <FormField css={[css`width: 100%;`, styles.formField]} label="Comments" htmlFor='comments'>
              <TextArea
                onBlur={handleBlur}
                value={values.comments}
                onChange={(e) => {
                  setFieldValue('comments', e.target.value, true);
                }}
                rows={5}
                name='comments'
              />
              <div>
                <ErrorMessage css={styles.vlaidationError} show={Boolean(errors.comments && (touched.comments || submitCount))}>
                  {errors.comments}
                </ErrorMessage>
              </div>
            </FormField>
          </Flex>
          <Flex justifyContent='flex-end'>
            <Button
              css={css`margin-right: 1rem`}
              palette='mute'
              onClick={() => {
                handleReset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit as any} disabled={isSubmitting || !isValid}>Create</Button>
          </Flex>
        </Modal>
      )}
    </Formik>
  );
};

export {
  CreateTimeEntryModal
};

export type {
  CreateTimeEntryModalProps
};
