import { css } from '@emotion/react';
import React, { useState } from 'react';
import { Activity, Issue, User } from '../../types';
import { Button } from './Button';
import { DatePicker } from './DatePicker';
import { Flex } from './Flex';
import { FormField } from './FormField';
import { Input } from './Input';
import { Modal } from './Modal';
import { Select } from './Select';
import { TextArea } from './TextArea';

type TimeEntryData = {
  spentOn: string;
  hours: number;
  activityId: number;
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
  const [timeEntryData, setTimeEntryData] = useState<TimeEntryData>();

  const handleCreate = () => {
    onClose({ timeEntryData: null });
    setOpen(false);
  };

  const handleCancel = () => {
    onClose({ timeEntryData: null });
    setOpen(false);
  };

  const handleActivityChange = (value) => {
    console.log('value', value);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Create new time entry">
      <Flex direction='column'>
        <FormField label="Activity" htmlFor='activity'>
          <Select id='activity' options={activities} initialValue={activities[0].name} onChange={handleActivityChange} />
        </FormField>
        <FormField label="Date" htmlFor='spentOn'>
          <DatePicker name="spentOn" />
        </FormField>
        <FormField label="Time" htmlFor="time">
          <Input name="time" placeholder="Eg: 1:05 for 1h 5m" />
        </FormField>
        <FormField label="Comments" htmlFor='comments'>
          <TextArea rows={5} name='comments' />
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
