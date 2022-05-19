import { css } from '@emotion/react';
import moment from 'moment';
import React, { useState } from 'react';
import { Formik } from 'formik';
import Joi from '@hapi/joi';
import { Activity, TimeEntry } from '../../types';
import { timeSpentToHours, hoursToTimeSpent } from '../helpers/utils';
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
  timeSpent?: string,
  activityName?: string;
  comments?: string;
}

type TimeEntryModalProps = {
  timeEntry?: TimeEntry;
  activities: Activity[];
  onSubmit: (timeEntryData: TimeEntryData) => void;
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

const TimeEntryModal = ({
  timeEntry, activities, onSubmit, onClose
}: TimeEntryModalProps) => {
  const [isOpen, setOpen] = useState(true);

  const doSubmit = async (formData: TimeEntryDataState) => {
    const activity = formData.activityName ? activities.find((ac) => ac.name === formData.activityName) : activities[0];
    const timeEntryData = {
      activity: activity as Activity,
      spentOn: formData.spentOn as string,
      hours: timeSpentToHours(formData.timeSpent),
      comments: formData.comments
    };
    onSubmit(timeEntryData);
  };

  if (!isOpen || !activities.length) {
    return null;
  }

  return (
    <Formik<TimeEntryDataState>
      initialValues={{
        activityName: timeEntry?.activity.name ?? activities[0].name,
        spentOn: timeEntry?.spentOn ?? moment().format('YYYY-MM-DD'),
        timeSpent: hoursToTimeSpent(timeEntry?.hours),
        comments: timeEntry?.comments,
      }}
      validate={(values) => {
        const timeSpentRegexp = /^\d{0,2}:?\d{0,2}:?\d{0,2}$/;
        const dateTimeRegexp = /^\d{4}-\d{2}-\d{2}$/;
        const formattedTimeSpent = values.timeSpent;

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
      onSubmit={(data) => {
        doSubmit(data);
        setOpen(false);
      }}
    >
      {({
        values, handleSubmit, handleBlur, isSubmitting, isValid, errors, submitCount, touched, setFieldValue, handleReset
      }) => (
        <Modal
          id="create-time-entry"
          isOpen={isOpen}
          onClose={() => {
            handleReset();
            setOpen(false);
            onClose();
          }}
          title={timeEntry ? 'Update time entry' : 'Create new time entry'}
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
                  initialValue={values.timeSpent}
                  id="timeSpent"
                  onChange={(time) => {
                    setFieldValue('timeSpent', time, true);
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
                setOpen(false);
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit as any} disabled={isSubmitting || !isValid}>{timeEntry ? 'Update' : 'Create'}</Button>
          </Flex>
        </Modal>
      )}
    </Formik>
  );
};

export {
  TimeEntryModal
};

export type {
  TimeEntryModalProps
};
