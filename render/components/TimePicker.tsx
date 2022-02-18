import React, { ChangeEvent, useEffect, useState } from 'react';
import { Input } from './Input';

type TimeData = { hours: string, minutes: string };

type TimePickerProps = {
  id?: string;
  value?: string;
  name?: string;
  disabled?: boolean;
  onChange?: ({ hours, minutes }: TimeData) => void;
}

const TimePicker = ({
  id, value = '00:00', name, disabled = false, onChange
}: TimePickerProps) => {
  const [enteredValue, setEnteredValue] = useState('');
  const [selectedTime, setSelectedTime] = useState<TimeData>({
    hours: '',
    minutes: ''
  });

  useEffect(() => {
    if (!value.includes(':')) {
      setSelectedTime({
        hours: '00',
        minutes: value
      });
    } else {
      const [hours, minutes] = value.split(':');
      setSelectedTime({
        hours,
        minutes
      });
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const modifiedSelection = { ...selectedTime };

    let typedValue = e.target.value;

    if (typedValue === ':' || !new RegExp('^\\d{0,2}:?\\d{0,2}$', 'g').test(typedValue)) {
      return;
    }

    console.log('passed 1');

    // if not ##: then insert : after the first two characters
    if (typedValue.length > 2 && !typedValue.includes(':')) {
      typedValue = `${typedValue.slice(0, 2)}:${typedValue.slice(2)}`;
    }

    console.log('passed 2');

    const [hours = '', minutes = ''] = typedValue.split(':');

    console.log('hours', hours);
    console.log('minutes', minutes);

    const intHoursValue = parseInt(hours, 10) || 0;
    const intMinutesValue = parseInt(minutes, 10) || 0;

    console.log('intHoursValue', intHoursValue);
    console.log('intMinutesValue', intMinutesValue);

    if (intHoursValue <= 23 && intMinutesValue <= 59) {
      modifiedSelection.hours = `${intHoursValue}`;
      modifiedSelection.minutes = `${intMinutesValue}`;
      setEnteredValue(typedValue);
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
      placeholder='00:00'
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
