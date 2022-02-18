import { css } from '@emotion/react';
import React, { useState } from 'react';
import { Activity, Issue, User } from '../../types';
import { Button } from './Button';
import { DatePicker } from './DatePicker';
import { Flex } from './Flex';
import { FormField } from './FormField';
import { Modal } from './Modal';
import { Select } from './Select';
import { TextArea } from './TextArea';
import { TimePicker } from './TimePicker';

type TimeEntryData = {
  spentOn?: string;
  hours?: number;
  activityId?: number;
  comments?: string;
}

type CreateTimeEntryModalProps = {
  activities: Activity[];
  issue: Issue;
  user: User;
  onClose: ({ timeEntryData }: { timeEntryData: TimeEntryData | null }) => void;
}

const CreateTimeEntryModal = ({ onClose, activities, issue, user }: CreateTimeEntryModalProps) => {
  const [isOpen, setOpen] = useState(true);
  const [timeEntryData, setTimeEntryData] = useState<TimeEntryData>({});

  const handleCreate = () => {
    onClose({ timeEntryData: null });
    setOpen(false);
  };

  const handleCancel = () => {
    onClose({ timeEntryData: null });
    setOpen(false);
  };

  const handleActivityChange = (e) => {
    const activityName = e.name;
    const activity = activities.find(a => a.name === activityName);
    setTimeEntryData({
      ...timeEntryData,
      activityId: activity?.id as number
    });
  };

  const handleDateChange = (day) => {
    console.log('selected date', day);
  };

  const handleTimeSpentChange = ({ hours, minutes }) => {
    console.log('time spent', `${hours}:${minutes}`);
  };

  const handleCommentsChange = (e) => {
    console.log('comments', e.target.value);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Create new time entry">
      <Flex direction='column'>
        <Flex>
          <FormField css={css`margin-right: 1rem;`} label="Date" htmlFor='spentOn'>
            <DatePicker onChange={handleDateChange} name="spentOn" />
          </FormField>
          <FormField css={css`margin-right: 1rem;`} label="Time Spent" htmlFor="timeSpent">
            <TimePicker id="timeSpent" onChange={handleTimeSpentChange} />
          </FormField>
          <FormField label="Activity" htmlFor='activity'>
            <Select id='activity' options={activities} initialValue={activities[0].name} onChange={handleActivityChange} />
          </FormField>
        </Flex>
        <FormField css={css`width: 100%;`} label="Comments" htmlFor='comments'>
          <TextArea onChange={handleCommentsChange} rows={5} name='comments' />
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
