import React, { ChangeEvent, FocusEventHandler, useEffect, useState } from 'react';
import { Input } from './Input';

type TimeData = { hours: string, minutes: string, seconds: string };

type TimePickerProps = {
  id?: string;
  initialValue?: string;
  name?: string;
  disabled?: boolean;
  onChange?: ({ hours, minutes, seconds }: TimeData) => void;
  onBlur?: FocusEventHandler;
}

const TIME_PATTERN_REGEXP = /^\d{0,2}:?\d{0,2}:?\d{0,2}$/;

const TimePicker = ({
  id, initialValue, name, disabled = false, onChange, onBlur
}: TimePickerProps) => {
  const [enteredValue, setEnteredValue] = useState('');
  const [selectedTime, setSelectedTime] = useState<TimeData>({
    hours: '',
    minutes: '',
    seconds: ''
  });

  useEffect(() => {
    if (!initialValue) {
      return;
    }

    if (!initialValue.includes(':')) {
      setSelectedTime({
        hours: '00',
        minutes: '00',
        seconds: initialValue
      });
    } else if (initialValue.includes(':') && initialValue.indexOf(':') === initialValue.lastIndexOf(':')) {
      const [minutes, seconds] = initialValue.split(':');
      setSelectedTime({
        hours: '00',
        minutes,
        seconds
      });
    } else {
      const [hours, minutes, seconds] = initialValue.split(':');
      setSelectedTime({
        hours,
        minutes,
        seconds
      });
    }
    setEnteredValue(initialValue);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const modifiedSelection = { ...selectedTime };

    let typedValue = e.target.value?.trim();

    if (!typedValue) {
      setEnteredValue('');
      const selectedTimeData = {
        hours: '',
        minutes: '',
        seconds: ''
      };
      setSelectedTime(selectedTimeData);
      if (onChange) {
        onChange(selectedTimeData);
      }
      return;
    }

    if (typedValue === ':' || !TIME_PATTERN_REGEXP.test(typedValue)) {
      return;
    }

    // if not ##: then insert : after the first two characters
    if (typedValue.length > 2 && !typedValue.includes(':')) {
      const hours = parseInt(typedValue.slice(0, 2), 10);
      if (hours < 24) {
        typedValue = `${hours}:${typedValue.slice(2)}`;
      } else {
        typedValue = `${typedValue.charAt(0)}:${typedValue.slice(1)}}`;
      }
    }

    // if not ##:##: then insert : after the first two characters
    if (typedValue.length > 5 && typedValue.split(':').length !== 3) {
      // 3 to 5 because of : at index 2
      const typedPiece = parseInt(typedValue.slice(3, 5), 10);
      if (typedPiece <= 59) {
        typedValue = `${typedValue.slice(0, 5)}:${typedValue.slice(5)}`;
      } else {
        typedValue = `${typedValue.slice(0, 4)}:${typedValue.slice(4)}`;
      }
    }

    if (typedValue.length > 6 && typedValue.split(':').length === 3) {
      const values = typedValue.split(':');
      const seconds = parseInt(values.pop() as string, 10);
      if (seconds > 59) {
        values.push('59');
        typedValue = values.join(':');
      }
    }

    const [hours = '', minutes = '', seconds = ''] = typedValue.split(':');

    const intHoursValue = parseInt(hours, 10);
    const intMinutesValue = parseInt(minutes, 10);
    const intSecondsValue = parseInt(seconds, 10);

    let modified = false;

    if (intHoursValue <= 23) {
      modifiedSelection.hours = `${intHoursValue}`;
      modified = true;
    }

    if (intMinutesValue <= 59) {
      modifiedSelection.minutes = `${intMinutesValue}`;
      modified = true;
    }

    if (intSecondsValue <= 59) {
      modifiedSelection.seconds = `${intSecondsValue}`;
      modified = true;
    }

    if (modified) {
      const mergedTypedValue = [hours, minutes, seconds].filter((string) => !!string).join(':');
      setEnteredValue(mergedTypedValue);
    } else {
      setEnteredValue(enteredValue);
    }

    setSelectedTime(modifiedSelection);
    if (onChange) {
      onChange(modifiedSelection);
    }
  };

  return (
    <Input
      id={id}
      type="text"
      maxWidth="100px"
      placeholder='00:00:00'
      disabled={disabled}
      value={enteredValue}
      name={name}
      onChange={handleChange}
      onBlur={onBlur}
    />
  );
};

export {
  TimePicker
};
