import React, {
  ChangeEvent, FocusEventHandler, useEffect, useState
} from 'react';
import TimeField from 'react-simple-timefield';
import { Input } from './Input';

type TimePickerProps = {
  id?: string;
  initialValue?: string;
  name?: string;
  disabled?: boolean;
  onChange?: (time: string) => void;
  onBlur?: FocusEventHandler;
};

const TimePicker = ({
  id,
  initialValue,
  name,
  disabled = false,
  onChange,
  onBlur
}: TimePickerProps) => {
  const [enteredValue, setEnteredValue] = useState('');

  useEffect(() => {
    if (!initialValue) {
      return;
    }

    setEnteredValue(initialValue);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, value: string) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <TimeField
      value={enteredValue}
      onChange={handleChange}
      input={(
        <Input
          id={id}
          type="text"
          maxWidth="100px"
          placeholder="00:00:00"
          disabled={disabled}
          name={name}
          onBlur={onBlur}
        />
      )}
      showSeconds
    />
  );
};

export { TimePicker };
