import React, { useState } from 'react';
import { css } from '@emotion/react';

const styles = {
  button: css`
    position: absolute;
    width: 92%;
    height: 100%;
    top: 0;
    left: 0;
    background: transparent;
    border: none;
    outline: none;
  `
};

type NotificationProps = {
  title: string;
  message: string;
  error: Error;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
};

const Notification = ({ title, message, onCancel, onConfirm, error }: NotificationProps) => {
  const [isShown, setShown] = useState(true);

  const reportError = () => {
    if (error) {
      // report(error);
    }
  };

  const cancel = () => {
    if (onCancel) {
      onCancel();
      setShown(false);
    }
  };

  const confirm = async () => {
    const result = await onConfirm();
    setShown(false);
  };

  if (!isShown) {
    return null;
  }

  return (
    <div>
      <div>
        <h1>{title}</h1>
        <h2>{message}</h2>
        <p>{error.message}</p>
        <button
          type="button"
          css={styles.button}
          aria-label='Cancel'
          id="dialog-cancel"
          onClick={cancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          css={styles.button}
          aria-label='Confirm'
          id="dialog-confirm"
          onClick={confirm}
        >
          Confirm
        </button>
      </div>
      <button type="button" aria-label="Report error" css={styles.button} onClick={reportError} />
    </div>
  );
};

export { Notification };
