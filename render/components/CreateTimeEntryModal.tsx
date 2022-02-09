import { css } from '@emotion/react';
import React, { useState } from 'react';
import { Activity, Issue, User } from '../../types';
import { Button } from './Button';
import { DatePicker } from './DatePicker';
import { Dropdown } from './Dropdown';
import { Flex } from './Flex';
import { Modal } from './Modal';

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

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Create new time entry">
      <Flex>
        <Dropdown>
          {activities.map((activity) => (
            <span key={activity.id}>{activity.name}</span>
          ))}
        </Dropdown>
        <DatePicker name="spentOn" />
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
