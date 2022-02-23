import React, { ChangeEvent, useEffect, useState } from 'react';
import { Input } from './Input';

type TimeData = { hours: string, minutes: string, seconds: string };

type TimePickerProps = {
  id?: string;
  initialValue?: string;
  name?: string;
  disabled?: boolean;
  onChange?: ({ hours, minutes, seconds }: TimeData) => void;
}

const TimePicker = ({
  id, initialValue, name, disabled = false, onChange
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

    let typedValue = e.target.value;

    if (typedValue === ':' || !new RegExp('^\\d{0,2}:?\\d{0,2}:?\\d{0,2}$', 'g').test(typedValue)) {
      return;
    }

    console.log('passed 1');

    // if not ##: then insert : after the first two characters
    if (typedValue.length > 2 && !typedValue.includes(':')) {
      typedValue = `${typedValue.slice(0, 2)}:${typedValue.slice(2)}`;
    }

    // if not ##:##: then insert : after the first two characters
    if (typedValue.length > 5 && typedValue.split(':').length !== 3) {
      typedValue = `${typedValue.slice(0, 5)}:${typedValue.slice(5)}`;
    }

    console.log('passed 2');

    const [hours = '', minutes = '', seconds = ''] = typedValue.split(':');

    console.log('hours', hours);
    console.log('minutes', minutes);
    console.log('seconds', seconds);

    const intHoursValue = parseInt(hours, 10) || 0;
    const intMinutesValue = parseInt(minutes, 10) || 0;
    const intSecondsValue = parseInt(seconds, 10) || 0;

    console.log('intHoursValue', intHoursValue);
    console.log('intMinutesValue', intMinutesValue);
    console.log('intSecondsValue', intSecondsValue);

    if (intHoursValue <= 23 && intMinutesValue <= 59 && intSecondsValue <= 59) {
      modifiedSelection.hours = `${intHoursValue}`;
      modifiedSelection.minutes = `${intMinutesValue}`;
      modifiedSelection.seconds = `${intSecondsValue}`;
      setEnteredValue(typedValue);
    } else {
      setEnteredValue(enteredValue);
    }

    setSelectedTime(modifiedSelection);
    if (onChange) {
      onChange(selectedTime);
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
    />
  );
};

export {
  TimePicker
};
