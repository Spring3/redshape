import React, { useState } from 'react';
import { css } from '@emotion/react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Flex } from './Flex';

type ConfirmationModalProps = {
  title: string;
  description?: string;
  onClose: ({ confirmed }: { confirmed: boolean }) => void;
}

const ConfirmationModal = ({ title, description, onClose } : ConfirmationModalProps) => {
  const [isOpen, setOpen] = useState(true);

  const handleConfirm = () => {
    onClose({ confirmed: true });
    setOpen(false);
  };

  const handleCancel = () => {
    onClose({ confirmed: false });
    setOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} description={description} title={title}>
      <Flex justifyContent='flex-end'>
        <Button css={css`margin-right: 1rem`} palette='mute' onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleConfirm}>Confirm</Button>
      </Flex>
    </Modal>
  );
};

export {
  ConfirmationModal
};

export type {
  ConfirmationModalProps
};
