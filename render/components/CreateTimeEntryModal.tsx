import { css } from '@emotion/react';
import moment from 'moment';
import React, { useState } from 'react';
import { Activity, Issue, User } from '../../types';
import { toHours } from '../helpers/utils';
import { Button } from './Button';
import { DatePicker } from './DatePicker';
import { Flex } from './Flex';
import { FormField } from './FormField';
import { Modal } from './Modal';
import { Select } from './Select';
import { TextArea } from './TextArea';
import { TimePicker } from './TimePicker';

export type TimeEntryData = {
  spentOn: string;
  hours: number;
  activity: Activity;
  comments?: string;
}

type TimeEntryDataState = {
  spentOn?: Date;
  time?: { hours?: string, minutes?: string, seconds?: string },
  activityName?: string;
  comments?: string;
}

type CreateTimeEntryModalProps = {
  activities: Activity[];
  onCreate: (timeEntryData: TimeEntryData) => Promise<void>;
}

const toTime = (time: { hours?: string, minutes?: string, seconds?: string } = {}) => {
  const hours = time.hours ?? '0';
  const minutes = time.minutes ?? '0';
  const seconds = time.seconds ?? '0';

  const res = `${hours}:${minutes}:${seconds}`;

  if (res === '0:0:0') {
    return undefined;
  }

  return res;
};

const CreateTimeEntryModal = ({ activities, onCreate }: CreateTimeEntryModalProps) => {
  const [isOpen, setOpen] = useState(true);
  const [state, setState] = useState<TimeEntryDataState>({});

  const handleCreate = async () => {
    console.log(activities);
    const activity = state.activityName ? activities.find((ac) => ac.name === state.activityName) : activities[0];
    const timeEntryData = {
      activity: activity as Activity,
      spentOn: moment(state.spentOn).format('YYYY-MM-DD'),
      hours: toHours(state.time),
      comments: state.comments
    };
    console.log('timeEntryData', timeEntryData);
    await onCreate(timeEntryData);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleActivityChange = (e) => {
    const activityName = e.name;
    setState({
      ...state,
      activityName
    });
  };

  const handleDateChange = (date: Date) => {
    setState({
      ...state,
      spentOn: date
    });
  };

  const handleTimeSpentChange = ({ hours, minutes, seconds }: { hours?: string, minutes?: string, seconds?: string }) => {
    setState({
      ...state,
      time: { hours, minutes, seconds }
    });
  };

  const handleCommentsChange = (e) => {
    setState({
      ...state,
      comments: e.target.value
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Create new time entry">
      <Flex direction='column'>
        <Flex>
          <FormField css={css`margin-right: 1rem;`} label="Date" htmlFor='spentOn'>
            <DatePicker value={state.spentOn} onChange={handleDateChange} name="spentOn" />
          </FormField>
          <FormField css={css`margin-right: 1rem;`} label="Time Spent" htmlFor="timeSpent">
            <TimePicker initialValue={toTime(state.time)} id="timeSpent" onChange={handleTimeSpentChange} />
          </FormField>
          <FormField label="Activity" htmlFor='activity'>
            <Select id='activity' options={activities} initialValue={activities[0].name} onChange={handleActivityChange} />
          </FormField>
        </Flex>
        <FormField css={css`width: 100%;`} label="Comments" htmlFor='comments'>
          <TextArea value={state.comments} onChange={handleCommentsChange} rows={5} name='comments' />
        </FormField>
      </Flex>
      <Flex justifyContent='flex-end'>
        <Button css={css`margin-right: 1rem`} palette='mute' onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleCreate}>Create</Button>
      </Flex>
    </Modal>
  );
};

export {
  CreateTimeEntryModal
};

export type {
  CreateTimeEntryModalProps
};
